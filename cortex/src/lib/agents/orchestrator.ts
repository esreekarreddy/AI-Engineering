// Council Orchestrator - Manages the multi-agent review workflow

import { ollamaClient } from '@/lib/ollama/client';
import { PROMPTS } from './prompts';
import { AgentRole, AGENTS, Finding, AgentMessage, CouncilSession } from './types';

type SessionUpdateCallback = (session: Partial<CouncilSession>) => void;

// Error types for better handling
export class CloudError extends Error {
  constructor(
    message: string,
    public readonly code: 'RATE_LIMIT' | 'AUTH_ERROR' | 'MODEL_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN',
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'CloudError';
  }
}

export class CouncilOrchestrator {
  private session: CouncilSession;
  private onUpdate: SessionUpdateCallback;
  private retryCount: Map<AgentRole, number> = new Map();
  private maxRetries = 2;

  constructor(sessionId: string, onUpdate: SessionUpdateCallback) {
    this.session = {
      id: sessionId,
      code: '',
      findings: [],
      messages: [],
      status: 'idle',
      startedAt: Date.now()
    };
    this.onUpdate = onUpdate;
  }

  private addMessage(role: AgentRole, content: string, phase: AgentMessage['phase']) {
    const message: AgentMessage = {
      id: `${role}-${Date.now()}`,
      agentRole: role,
      content,
      timestamp: Date.now(),
      phase
    };
    this.session.messages.push(message);
    this.onUpdate({ messages: [...this.session.messages] });
  }

  private async callAgent(role: AgentRole, userPrompt: string): Promise<string> {
    const config = AGENTS[role];
    const systemPrompt = PROMPTS[role];
    
    let response = '';
    const retries = this.retryCount.get(role) || 0;
    
    try {
      await ollamaClient.chat({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        onToken: (token) => {
          response += token;
          // Update UI with streaming content
          this.addMessage(role, response, this.session.status as AgentMessage['phase']);
        }
      });

      // Reset retry count on success
      this.retryCount.set(role, 0);
      return response;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle rate limit errors
      if (errorMsg.includes('Rate limit') || errorMsg.includes('429')) {
        this.addMessage(role, `⚠️ Rate limit hit. Waiting before retry...`, this.session.status as AgentMessage['phase']);
        
        if (retries < this.maxRetries) {
          this.retryCount.set(role, retries + 1);
          // Wait with exponential backoff
          await new Promise(r => setTimeout(r, (retries + 1) * 3000));
          return this.callAgent(role, userPrompt);
        }
        
        throw new CloudError('Cloud API rate limit exceeded. Try again later.', 'RATE_LIMIT', true);
      }
      
      // Handle auth errors
      if (errorMsg.includes('401') || errorMsg.includes('403')) {
        throw new CloudError('API authentication failed. Check your API key.', 'AUTH_ERROR', false);
      }
      
      // Handle model errors
      if (errorMsg.includes('model') || errorMsg.includes('404')) {
        throw new CloudError(`Model ${config.model} not available. Try a different model.`, 'MODEL_ERROR', false);
      }
      
      // Network errors - retryable
      if (retries < this.maxRetries) {
        this.retryCount.set(role, retries + 1);
        this.addMessage(role, `⚠️ Connection issue, retrying (${retries + 1}/${this.maxRetries})...`, this.session.status as AgentMessage['phase']);
        await new Promise(r => setTimeout(r, 2000));
        return this.callAgent(role, userPrompt);
      }
      
      throw new CloudError(`Cloud API error: ${errorMsg}`, 'UNKNOWN', false);
    }
  }

  private parseFindings(response: string, agentRole: AgentRole): Finding[] {
    try {
      // Try to extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((f: Partial<Finding>, idx: number) => ({
        ...f,
        id: `${agentRole.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
        agentRole
      }));
    } catch {
      console.error(`Failed to parse findings from ${agentRole}`);
      return [];
    }
  }

  async runCouncil(code: string): Promise<CouncilSession> {
    this.session.code = code;
    this.session.startedAt = Date.now();
    this.onUpdate({ code, status: 'intake' });

    // Check cloud connection
    const connected = await ollamaClient.checkConnection();
    if (!connected) {
      this.addMessage('moderator', '❌ Cannot connect to Ollama Cloud. Please check your API configuration.', 'intake');
      this.session.status = 'idle';
      this.onUpdate({ status: 'idle' });
      return this.session;
    }

    try {
      // PHASE 0: Intake - Moderator creates Code Map
      this.session.status = 'intake';
      this.onUpdate({ status: 'intake' });
      
      this.addMessage('moderator', '🔍 Analyzing code structure...', 'intake');
      
      const codeMapResponse = await this.callAgent(
        'moderator',
        `PHASE 0 (Intake). Create a Code Map for this code:\n\n\`\`\`\n${code}\n\`\`\``
      );
      this.session.codeMap = codeMapResponse;
      this.onUpdate({ codeMap: codeMapResponse });

      // PHASE 1: Review - All agents analyze sequentially
      this.session.status = 'reviewing';
      this.onUpdate({ status: 'reviewing' });
      
      this.addMessage('moderator', '📋 Dispatching review agents...', 'review');

      const reviewAgents: AgentRole[] = ['architect', 'sentinel', 'optimizer', 'maintainer'];
      const reviewPrompt = `Analyze this code and provide findings:\n\n\`\`\`\n${code}\n\`\`\``;

      for (const agent of reviewAgents) {
        try {
          this.addMessage(agent, `🔎 Analyzing...`, 'review');
          const response = await this.callAgent(agent, reviewPrompt);
          const findings = this.parseFindings(response, agent);
          this.session.findings.push(...findings);
          this.onUpdate({ findings: [...this.session.findings] });
        } catch (error) {
          // Log error but continue with other agents
          const errMsg = error instanceof Error ? error.message : 'Agent failed';
          this.addMessage(agent, `⚠️ ${errMsg} - Continuing with next agent...`, 'review');
          console.error(`Agent ${agent} failed:`, error);
          
          // If it's a rate limit, wait before next agent
          if (error instanceof CloudError && error.code === 'RATE_LIMIT') {
            this.addMessage('moderator', '⏳ Waiting for rate limit to reset...', 'review');
            await new Promise(r => setTimeout(r, 10000));
          }
        }
      }

      // Check if we have any findings to verify
      if (this.session.findings.length === 0) {
        this.addMessage('moderator', '⚠️ No findings collected. The review may be incomplete.', 'review');
      }

      // PHASE 2: Debate - Verifier checks findings
      this.session.status = 'debating';
      this.onUpdate({ status: 'debating' });
      
      this.addMessage('moderator', '⚔️ Cross-examining findings...', 'debate');

      try {
        const findingsSummary = this.session.findings
          .map(f => `[${f.id}] ${f.claim} (${f.severity})`)
          .join('\n');
        
        const verifierPrompt = `CODE:\n\`\`\`\n${code}\n\`\`\`\n\nFINDINGS TO VERIFY:\n${findingsSummary}`;
        await this.callAgent('verifier', verifierPrompt);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Verification failed';
        this.addMessage('verifier', `⚠️ ${errMsg} - Skipping verification, using unverified findings.`, 'debate');
      }

      // PHASE 3: Verdict
      this.session.status = 'complete';
      this.onUpdate({ status: 'complete' });

      try {
        const verdictPrompt = `PHASE 3 (Verdict). Based on these findings, produce the final Council Verdict:

CODE MAP:
${this.session.codeMap}

FINDINGS:
${JSON.stringify(this.session.findings, null, 2)}

Produce: Ranked Actions, Patch Suggestions, Risk Table, Next Steps.`;

        this.addMessage('moderator', '📜 Producing final verdict...', 'verdict');
        await this.callAgent('moderator', verdictPrompt);
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Verdict generation failed';
        this.addMessage('moderator', `⚠️ ${errMsg} - Showing raw findings instead.`, 'verdict');
      }

      this.session.completedAt = Date.now();
      this.onUpdate({ completedAt: this.session.completedAt });

    } catch (error) {
      // Critical error - stop the review
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.addMessage('moderator', `❌ Critical error: ${errMsg}`, 'verdict');
      this.session.status = 'complete';
      this.onUpdate({ status: 'complete' });
    }

    return this.session;
  }
}
