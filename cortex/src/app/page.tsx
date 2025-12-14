'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useCouncilStore } from '@/lib/store';
import { ollamaClient } from '@/lib/ollama/client';
import { CouncilOrchestrator } from '@/lib/agents/orchestrator';
import { AGENTS, AgentRole } from '@/lib/agents/types';
import { Play, RotateCcw, HelpCircle, Loader2, Menu, X, FileText } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { CouncilChat } from '@/components/council/CouncilChat';
import { VerdictPanel } from '@/components/council/VerdictPanel';
import { AgentCard } from '@/components/council/AgentCard';
import { HelpModal } from '@/components/ui/HelpModal';
import { AccessModal, useAccessCheck } from '@/components/ui/AccessGate';

export default function Home() {
  const { 
    isConnected, setConnected, code, isRunning, setRunning,
    session, updateSession, resetSession
  } = useCouncilStore();
  
  const [speakingAgent, setSpeakingAgent] = useState<AgentRole | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const { isUnlocked } = useAccessCheck();

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(420);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft.current) {
        const newWidth = Math.min(Math.max(200, e.clientX), 400);
        setLeftWidth(newWidth);
      }
      if (isResizingRight.current) {
        const newWidth = Math.min(Math.max(300, window.innerWidth - e.clientX), 600);
        setRightWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizeLeft = () => {
    isResizingLeft.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizeRight = () => {
    isResizingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const check = async () => {
      const connected = await ollamaClient.checkConnection();
      setConnected(connected, []);
    };
    check();
  }, [setConnected]);

  const handleReviewClick = useCallback(() => {
    if (!code.trim()) return;
    if (isUnlocked()) {
      runCouncil();
    } else {
      setShowAccessModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isUnlocked]);

  const runCouncil = useCallback(async () => {
    if (!code.trim() || isRunning) return;
    setRunning(true);
    
    const orchestrator = new CouncilOrchestrator(
      `session-${Date.now()}`,
      (update) => {
        updateSession(update);
        if (update.messages?.length) {
          const lastMsg = update.messages[update.messages.length - 1];
          setSpeakingAgent(lastMsg.agentRole as AgentRole);
        }
      }
    );
    
    try {
      await orchestrator.runCouncil(code);
    } catch (err) {
      console.error('Council failed:', err);
    } finally {
      setRunning(false);
      setSpeakingAgent(null);
    }
  }, [code, isRunning, setRunning, updateSession]);

  const handleAccessSuccess = () => {
    setShowAccessModal(false);
    runCouncil();
  };

  const agents = Object.entries(AGENTS);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header 
        className="h-16 flex items-center justify-between px-5 border-b shrink-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Menu size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div className="flex items-center gap-3">
            <Image 
              src="/projects/cortex/logo.png" 
              alt="Cortex" 
              width={36} 
              height={36} 
              className="rounded-lg"
            />
            <div>
              <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Cortex
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                AI Code Review
              </p>
            </div>
          </div>
        </div>



        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div 
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              isConnected ? "text-[var(--success)]" : "text-[var(--danger)]"
            )}
            style={{ background: isConnected ? 'var(--success-muted)' : 'var(--danger-muted)' }}
          >
            <span className={clsx(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-[var(--success)]" : "bg-[var(--danger)] animate-pulse"
            )} />
            {isConnected ? 'Online' : 'Offline'}
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <HelpCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>About</span>
          </button>

          {/* Mobile Results Button - only shown on smaller screens */}
          <button
            onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <FileText size={18} style={{ color: 'var(--text-muted)' }} />
            {session?.findings?.length ? (
              <span 
                className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                {session.findings.length}
              </span>
            ) : null}
          </button>

          <button
            onClick={resetSession}
            disabled={isRunning}
            className="p-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40"
          >
            <RotateCcw size={18} style={{ color: 'var(--text-muted)' }} />
          </button>

          <button
            onClick={handleReviewClick}
            disabled={!isConnected || !code.trim() || isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 2px 8px var(--accent-glow)' }}
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Reviewing…</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Review</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside 
          className={clsx(
            "shrink-0 flex flex-col",
            "lg:relative lg:translate-x-0",
            "fixed inset-y-16 left-0 z-40 transition-transform",
            leftDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          style={{ width: leftWidth, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
        >
          <div className="h-14 px-4 flex items-center justify-between border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Agents
            </span>
            <button 
              onClick={() => setLeftDrawerOpen(false)}
              className="lg:hidden p-1.5 rounded hover:bg-[var(--bg-hover)]"
            >
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {agents.map(([role]) => (
                <AgentCard 
                  key={role}
                  role={role as AgentRole}
                  isActive={isRunning}
                  isSpeaking={speakingAgent === role}
                />
              ))}
            </div>
          </div>

          <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {Object.keys(AGENTS).length} agents ready
            </p>
          </div>
        </aside>

        {/* Left Resize Handle */}
        <div 
          className="resize-handle hidden lg:block"
          onMouseDown={startResizeLeft}
        />

        {/* Mobile Overlay */}
        {leftDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setLeftDrawerOpen(false)} />
        )}

        {/* Center - Editor */}
        <main className="flex-1 flex flex-col min-w-0">
          <div 
            className="h-14 flex items-center justify-between px-5 border-b shrink-0"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                Code Input
              </span>
              {code.trim() && (
                <span 
                  className="px-2.5 py-1 rounded-md text-sm font-mono"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  {code.split('\n').length} lines
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => useCouncilStore.getState().setCode('')}
                disabled={!code.trim() || isRunning}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}
              >
                Clear
              </button>
              <button
                onClick={() => useCouncilStore.getState().setCode(SAMPLE_CODE)}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg text-sm font-medium"
                style={{ color: 'var(--accent)', background: 'var(--accent-muted)' }}
              >
                Load Sample
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4" style={{ background: 'var(--bg-base)' }}>
            <div 
              className="h-full rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <CodeEditor />
            </div>
          </div>
        </main>

        {/* Right Resize Handle */}
        <div 
          className="resize-handle hidden lg:block"
          onMouseDown={startResizeRight}
        />

        {/* Mobile Results Overlay */}
        {rightDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setRightDrawerOpen(false)} />
        )}

        {/* Right - Results (Desktop: always visible, Mobile: drawer) */}
        <aside 
          className={clsx(
            "shrink-0 flex flex-col",
            "lg:relative lg:translate-x-0",
            "fixed inset-y-16 right-0 z-40 transition-transform",
            rightDrawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
          style={{ 
            width: rightWidth, 
            maxWidth: 500,
            minWidth: 320,
            background: 'var(--bg-surface)', 
            borderLeft: '1px solid var(--border-subtle)' 
          }}
        >
          <div 
            className="h-14 flex items-center justify-between px-5 border-b shrink-0"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Results
            </span>
            <div className="flex items-center gap-2">
              {session?.findings?.length ? (
                <span className="px-2.5 py-1 rounded-md text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {session.findings.length} findings
                </span>
              ) : session?.messages?.length ? (
                <span className="px-2.5 py-1 rounded-md text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  {session.messages.length} messages
                </span>
              ) : null}
              <button 
                onClick={() => setRightDrawerOpen(false)}
                className="lg:hidden p-1.5 rounded hover:bg-[var(--bg-hover)]"
              >
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Auto-switch: Show findings if available and not running, otherwise show chat */}
            {session?.findings?.length && !isRunning ? <VerdictPanel /> : <CouncilChat />}
          </div>
        </aside>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <AccessModal isOpen={showAccessModal} onClose={() => setShowAccessModal(false)} onSuccess={handleAccessSuccess} />
    </div>
  );
}



const SAMPLE_CODE = `async function fetchUserData(userId: string) {
  const response = await fetch('/api/users/' + userId);
  const data = response.json();
  return data;
}

function processPayment(amount: number, cardNumber: string) {
  console.log('Processing payment for card: ' + cardNumber);
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
