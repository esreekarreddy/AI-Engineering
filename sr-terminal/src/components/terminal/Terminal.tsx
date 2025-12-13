'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalComponentProps {
  onTerminalReady?: (terminal: Terminal) => void;
}

export default function TerminalComponent({ onTerminalReady }: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      theme: {
        background: '#0D0E11', // Matches global --terminal-bg
        foreground: '#E6E8EB',
        cursor: '#FF5A1F',     // --accent-orange
        selectionBackground: 'rgba(0, 102, 204, 0.3)', // --accent-blue
        black: '#000000',
        red: '#EF4444',
        green: '#10B981',
        yellow: '#F59E0B',
        blue: '#3B82F6',
        magenta: '#8B5CF6',
        cyan: '#06B6D4',
        white: '#E5E7EB',
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);

    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Notify parent
    if (onTerminalReady) {
      onTerminalReady(terminal);
    }

    // Handle resizing
    const resizeObserver = new ResizeObserver(() => {
        // Debounce slightly or just fit
        requestAnimationFrame(() => fitAddon.fit());
    });
    
    resizeObserver.observe(terminalRef.current);

    // Initial greeting
    terminal.writeln('\x1b[1;38;5;214mSR Terminal\x1b[0m v1.0.0');
    terminal.writeln('Booting kernel...');

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      ref={terminalRef} 
      className="h-full w-full bg-[var(--terminal-bg)] overflow-hidden pl-2 pt-2"
    />
  );
}
