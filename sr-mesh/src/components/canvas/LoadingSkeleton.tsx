"use client";

import { motion } from "framer-motion";

/**
 * Loading skeleton shown while 3D canvas initializes
 * Creates an animated particle effect to indicate loading
 */
export function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 bg-[#030308] flex items-center justify-center">
      <div className="relative">
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `hsl(${i * 45}, 70%, 60%)`,
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * Math.PI / 4) * 40, 0],
              y: [0, Math.sin(i * Math.PI / 4) * 40, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Center pulsing dot */}
        <motion.div
          className="w-6 h-6 rounded-full bg-blue-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* Loading text */}
      <motion.p
        className="absolute bottom-1/3 text-zinc-500 text-sm"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Initializing neural mesh...
      </motion.p>
    </div>
  );
}
