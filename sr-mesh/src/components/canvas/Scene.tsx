"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Galaxy } from "./Galaxy";
import { CanvasErrorBoundary } from "./ErrorBoundary";
import { Suspense } from "react";
import type { Note, Edge } from "@/lib/db";

interface SceneProps {
  memories: Note[];
  edges: Edge[];
  onNodeClick: (id: string) => void;
}

export function Scene({ memories, edges, onNodeClick }: SceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <CanvasErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 25], fov: 55 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#030308"]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 20, 20]} intensity={1.5} color="#60a5fa" />
          <pointLight position={[-20, -20, -20]} intensity={0.8} color="#8b5cf6" />
          <pointLight position={[0, 20, -20]} intensity={0.6} color="#ec4899" />
          
          <Suspense fallback={null}>
            {/* Background stars */}
            <Stars 
              radius={150} 
              depth={60} 
              count={4000} 
              factor={5} 
              saturation={0.1} 
              fade 
              speed={0.3} 
            />
            
            {/* Main galaxy */}
            <Galaxy 
              memories={memories} 
              edges={edges} 
              onNodeClick={onNodeClick} 
            />
            
            {/* Post-processing for glow effect */}
            <EffectComposer>
              <Bloom 
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
            </EffectComposer>
          </Suspense>

          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.2}
            minDistance={8}
            maxDistance={80}
            zoomSpeed={0.8}
            rotateSpeed={0.5}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
