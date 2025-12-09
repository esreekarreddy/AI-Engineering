import { useModalStore } from '@/lib/modal-store';
import { X, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export default function ModalRenderer() {
  const { isOpen, type, options, closeModal } = useModalStore();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && type === 'prompt') {
      setInputValue(options.defaultValue || '');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, type, options.defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'prompt') {
      options.onConfirm?.(inputValue);
    } else {
      options.onConfirm?.();
    }
    closeModal();
  };

  const handleCancel = () => {
    options.onCancel?.();
    closeModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-[400px] bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] shadow-2xl rounded-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--bg-tertiary)]">
          <span className="font-bold text-xs uppercase tracking-widest text-[var(--accent-orange)]">
            {options.title}
          </span>
          <button onClick={handleCancel} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {options.message && (
            <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed font-mono">
              {options.message}
            </p>
          )}

          {type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] font-mono"
            />
          )}

          {type === 'custom' && options.content}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--bg-tertiary)] flex justify-end gap-2">
          {type !== 'alert' && (
            <button 
              onClick={handleCancel}
              className="px-3 py-1.5 rounded text-xs font-mono hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            >
              CANCEL
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded text-xs font-mono bg-[var(--accent-blue)] text-white hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            disabled={type === 'prompt' && !inputValue.trim()}
          >
            <Check size={12} />
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
