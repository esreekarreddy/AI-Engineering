'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BootLoader({ onBootComplete }: { onBootComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const bootSequence = [
      "BIOS CHECK... OK",
      "CPU: QUANTUM-3... DETECTED",
      "RAM: 64TB [OK]",
      "LOADING KERNEL... OK",
      "MOUNTING VFS... OK",
      "INITIALIZING GFX ENGINE... OK",
      "LOADING NEURAL ENGINE... [STANDBY]",
      "ESTABLISHING SECURE CONNECTION...",
      "SYSTEM READY."
    ];

    let delay = 0;
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 150 + 100; // Faster boot
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (index === bootSequence.length - 1) {
          setTimeout(onBootComplete, 600);
        }
      }, delay);
    });
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center font-mono text-green-500 text-sm">
      <div className="w-[400px]">
        <div className="mb-8 flex justify-center opacity-80">
             <img src="/projects/terminal/logo.png" alt="SR Terminal" className="w-16 h-16 animate-pulse" />
        </div>
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-green-500 ml-1 translate-y-0.5"
        />
      </div>
    </div>
  );
}
