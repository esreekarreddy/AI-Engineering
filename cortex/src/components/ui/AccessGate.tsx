'use client';

import { useState } from 'react';
import { Lock, Unlock, AlertCircle, X } from 'lucide-react';
import { ollamaClient } from '@/lib/ollama/client';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AccessModal({ isOpen, onClose, onSuccess }: AccessModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const isValid = await ollamaClient.verifyAccessCode(code);
      
      if (isValid) {
        sessionStorage.setItem('cortex-unlocked', 'true');
        onSuccess();
      } else {
        setError('Invalid access code');
      }
    } catch {
      setError('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative w-full max-w-sm rounded-xl p-6 animate-scale-in"
        style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
        >
          <X size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'var(--accent-muted)' }}
        >
          <Lock size={24} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Title */}
        <h2 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Access Required
        </h2>
        <p 
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          Enter your access code to run AI-powered code reviews.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ 
                background: 'var(--bg-elevated)',
                border: error ? '1px solid var(--danger)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
          </div>

          {error && (
            <div 
              className="flex items-center gap-2 text-sm"
              style={{ color: 'var(--danger)' }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !code}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ 
              background: 'var(--accent)',
              color: 'white'
            }}
          >
            {isVerifying ? (
              <>
                <div 
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
                Verifying…
              </>
            ) : (
              <>
                <Unlock size={14} />
                Unlock
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function useAccessCheck() {
  const isUnlocked = () => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('cortex-unlocked') === 'true';
  };
  
  return { isUnlocked };
}
