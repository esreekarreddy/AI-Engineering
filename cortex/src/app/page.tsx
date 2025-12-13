'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCouncilStore } from '@/lib/store';
import { ollamaClient } from '@/lib/ollama/client';
import { CouncilOrchestrator } from '@/lib/agents/orchestrator';
import { AGENTS, AgentRole } from '@/lib/agents/types';
import { Play, RotateCcw, HelpCircle, Wifi, WifiOff, MessageSquare, ClipboardList, Sparkles } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

// Components
import { CodeEditor } from '@/components/editor/CodeEditor';
import { CouncilChat } from '@/components/council/CouncilChat';
import { VerdictPanel } from '@/components/council/VerdictPanel';
import { AgentCard } from '@/components/council/AgentCard';
import { HelpModal } from '@/components/ui/HelpModal';

export default function Home() {
  const { 
    isConnected, 
    setConnected, 
    code,
    isRunning, 
    setRunning,
    session,
    updateSession,
    activePanel,
    setActivePanel,
    resetSession
  } = useCouncilStore();
  
  const [speakingAgent, setSpeakingAgent] = useState<AgentRole | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await ollamaClient.checkConnection();
      setConnected(connected, ollamaClient.getAvailableModels());
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [setConnected]);

  const handleRunCouncil = useCallback(async () => {
    if (!code.trim() || isRunning) return;
    
    setRunning(true);
    setActivePanel('chat');
    
    const orchestrator = new CouncilOrchestrator(
      `session-${Date.now()}`,
      (update) => {
        updateSession(update);
        if (update.messages && update.messages.length > 0) {
          const lastMsg = update.messages[update.messages.length - 1];
          setSpeakingAgent(lastMsg.agentRole as AgentRole);
        }
      }
    );
    
    try {
      await orchestrator.runCouncil(code);
      setActivePanel('verdict');
    } catch (err) {
      console.error('Council failed:', err);
    } finally {
      setRunning(false);
      setSpeakingAgent(null);
    }
  }, [code, isRunning, setRunning, updateSession, setActivePanel]);

  const modelCount = ollamaClient.getAvailableModels().length;

  return (
    <div className="h-screen flex flex-col surface-base">
      {/* ═══════════════════════════════════════════════════════════════════
          TOP BAR — 56px, clean single row
          ═══════════════════════════════════════════════════════════════════ */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-subtle)]">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="" fill className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-title text-white leading-none">CORTEX</h1>
            <span className="text-[10px] text-[rgb(var(--text-muted))] tracking-wide">AI Code Council</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-meta text-[rgb(var(--text-secondary))] hover:text-white hover:bg-[rgb(var(--bg-elevated))] transition-colors focus-ring"
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">How it works</span>
          </button>

          {/* Connection Status */}
          <div className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium",
            isConnected 
              ? "text-[rgb(var(--text-secondary))]" 
              : "text-[rgb(var(--danger))] bg-[rgb(var(--danger)/0.1)]"
          )}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isConnected ? `${modelCount} models` : 'Offline'}</span>
          </div>

          <div className="w-px h-5 bg-[var(--border-subtle)] mx-1" />

          {/* Reset */}
          <button
            onClick={resetSession}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-meta text-[rgb(var(--text-secondary))] hover:text-white hover:bg-[rgb(var(--bg-elevated))] transition-colors disabled:opacity-40 focus-ring"
          >
            <RotateCcw size={14} />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Primary CTA */}
          <button
            onClick={handleRunCouncil}
            disabled={!isConnected || !code.trim() || isRunning}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all focus-ring",
              "bg-[rgb(var(--accent))] text-white",
              "hover:brightness-110 active:scale-[0.98]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
            )}
          >
            {isRunning ? (
              <>
                <Sparkles size={14} className="animate-pulse" />
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Review Code</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT — Three columns
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR — Council (280px) */}
        <aside className="w-[280px] shrink-0 flex flex-col border-r border-[var(--border-subtle)] surface-1">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="text-section">Council</span>
            <span className="text-meta">{modelCount} ready</span>
          </div>

          {/* Agent List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {Object.keys(AGENTS).map((role) => (
              <AgentCard 
                key={role}
                role={role as AgentRole}
                isActive={isRunning}
                isSpeaking={speakingAgent === role}
              />
            ))}
          </div>

          {/* Footer Status */}
          <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
            <div className={clsx(
              "flex items-center gap-2 text-[11px]",
              isConnected ? "text-[rgb(var(--text-muted))]" : "text-[rgb(var(--danger))]"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-[rgb(var(--success))]" : "bg-[rgb(var(--danger))] animate-pulse-dot"
              )} />
              {isConnected ? 'Ollama connected' : 'Ollama offline — run `ollama serve`'}
            </div>
          </div>
        </aside>

        {/* CENTER — Editor */}
        <main className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] surface-1">
            <div className="flex items-center gap-3">
              <span className="text-section">Input</span>
              <span className="text-meta">{code.split('\n').length} lines</span>
            </div>
            <button 
              onClick={() => useCouncilStore.getState().setCode(SAMPLE_CODE)}
              className="text-[11px] text-[rgb(var(--accent))] hover:underline"
            >
              Paste sample
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor />
          </div>
        </main>

        {/* RIGHT — Council Chamber (380px) */}
        <aside className="w-[380px] shrink-0 flex flex-col surface-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-subtle)]">
            <TabButton 
              active={activePanel === 'chat'} 
              onClick={() => setActivePanel('chat')}
              icon={<MessageSquare size={14} />}
              label="Chat"
              count={session?.messages?.length}
            />
            <TabButton 
              active={activePanel === 'verdict'} 
              onClick={() => setActivePanel('verdict')}
              icon={<ClipboardList size={14} />}
              label="Verdict"
              count={session?.findings?.length}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'chat' ? <CouncilChat /> : <VerdictPanel />}
          </div>
        </aside>
      </div>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tab Button Component
// ═══════════════════════════════════════════════════════════════════════════

function TabButton({ active, onClick, icon, label, count }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors focus-ring",
        active 
          ? "bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent))]" 
          : "text-[rgb(var(--text-secondary))] hover:text-white hover:bg-[rgb(var(--bg-elevated))]"
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className={clsx(
          "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
          active ? "bg-[rgb(var(--accent)/0.2)]" : "bg-[rgb(var(--bg-elevated))]"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sample Code for Demo
// ═══════════════════════════════════════════════════════════════════════════

const SAMPLE_CODE = `async function fetchUserData(userId: string) {
  const response = await fetch('/api/users/' + userId);
  const data = response.json();
  return data;
}

function processPayment(amount: number, cardNumber: string) {
  console.log('Processing payment for card: ' + cardNumber);
  // TODO: Add validation
  return { success: true, amount };
}

export function UserDashboard({ user }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchUserData(user.id).then(setData);
  }, []);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: user.bio }} />
  );
}`;
