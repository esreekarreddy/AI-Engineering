// Council Orchestrator - Manages the multi-agent review workflow

import { ollamaClient } from '@/lib/ollama/client';
import { PROMPTS } from './prompts';
import { AgentRole, AGENTS, Finding, AgentMessage, CouncilSession } from './types';

type SessionUpdateCallback = (session: Partial<CouncilSession>) => void;

export class CouncilOrchestrator {
  private session: CouncilSession;
  private onUpdate: SessionUpdateCallback;
  private modelMap: Map<AgentRole, string> = new Map();

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

  private async resolveModels(): Promise<boolean> {
    const connected = await ollamaClient.checkConnection();
    if (!connected) return false;

    // Assign best available model to each agent
    for (const [role, config] of Object.entries(AGENTS)) {
      const model = ollamaClient.findBestModel(config.defaultModel, config.fallbackModels);
      if (model) {
        this.modelMap.set(role as AgentRole, model);
      }
    }

    return this.modelMap.size > 0;
  }

  private async callAgent(role: AgentRole, userPrompt: string): Promise<string> {
    const model = this.modelMap.get(role);
    if (!model) throw new Error(`No model available for ${role}`);

    const systemPrompt = PROMPTS[role];
    
    let response = '';
    await ollamaClient.chat({
      model,
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

    return response;
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

    // Check connection and resolve models
    const modelsReady = await this.resolveModels();
    if (!modelsReady) {
      this.addMessage('moderator', '❌ Cannot connect to Ollama. Please ensure it is running on localhost:11434.', 'intake');
      this.session.status = 'idle';
      this.onUpdate({ status: 'idle' });
      return this.session;
    }

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

    // PHASE 1: Review - All agents analyze in parallel
    this.session.status = 'reviewing';
    this.onUpdate({ status: 'reviewing' });
    
    this.addMessage('moderator', '📋 Dispatching review agents...', 'review');

    const reviewAgents: AgentRole[] = ['architect', 'sentinel', 'optimizer', 'maintainer'];
    const reviewPrompt = `Analyze this code and provide findings:\n\n\`\`\`\n${code}\n\`\`\``;

    // Run reviews (sequentially for now, can parallelize if Ollama supports)
    for (const agent of reviewAgents) {
      this.addMessage(agent, `🔎 Analyzing...`, 'review');
      const response = await this.callAgent(agent, reviewPrompt);
      const findings = this.parseFindings(response, agent);
      this.session.findings.push(...findings);
      this.onUpdate({ findings: [...this.session.findings] });
    }

    // PHASE 2: Debate (Simplified for now)
    this.session.status = 'debating';
    this.onUpdate({ status: 'debating' });
    
    this.addMessage('moderator', '⚔️ Cross-examining findings...', 'debate');

    // Have verifier check the findings
    const findingsSummary = this.session.findings
      .map(f => `[${f.id}] ${f.claim} (${f.severity})`)
      .join('\n');
    
    const verifierPrompt = `CODE:\n\`\`\`\n${code}\n\`\`\`\n\nFINDINGS TO VERIFY:\n${findingsSummary}`;
    await this.callAgent('verifier', verifierPrompt);

    // PHASE 3: Verdict
    this.session.status = 'complete';
    this.onUpdate({ status: 'complete' });

    const verdictPrompt = `PHASE 3 (Verdict). Based on these findings, produce the final Council Verdict:

CODE MAP:
${this.session.codeMap}

FINDINGS:
${JSON.stringify(this.session.findings, null, 2)}

Produce: Ranked Actions, Patch Suggestions, Risk Table, Next Steps.`;

    this.addMessage('moderator', '📜 Producing final verdict...', 'verdict');
    await this.callAgent('moderator', verdictPrompt);

    this.session.completedAt = Date.now();
    this.onUpdate({ completedAt: this.session.completedAt });

    return this.session;
  }
}
