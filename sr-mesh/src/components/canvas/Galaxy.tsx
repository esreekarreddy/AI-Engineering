"use client";

import { useRef, useMemo, useState } from "react";
import { Text, Billboard, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Note, Edge } from "@/lib/db";
import { kMeansClustering, determineOptimalK } from "@/lib/clustering";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';

interface NodePoint {
  id: string;
  content: string;
  x: number;
  y: number;
  z: number;
  color: string;
  clusterLabel: string;
}

interface GalaxyProps {
  memories: Note[];
  edges: Edge[];
  onNodeClick: (id: string) => void;
}

/**
 * Compute node positions using force simulation
 * This is a pure function that runs synchronously
 */
function computeNodePositions(
  memories: Note[],
  edges: Edge[],
  clusters: Map<string, { color: string; label: string }>
): NodePoint[] {
  if (memories.length === 0) return [];

  // Create nodes for simulation with deterministic initial positions
  const simNodes = memories.map((m, i) => ({
    id: m.id,
    content: m.content,
    // Use index-based spread for deterministic layout
    x: Math.cos(i * 2.4) * 10,
    y: Math.sin(i * 1.7) * 10,
    z: Math.sin(i * 2.4) * 10,
  }));

  // Create links from edges
  const simLinks = edges.map(e => ({
    source: e.source,
    target: e.target,
    weight: e.weight
  }));

  // Create and run simulation synchronously
  const simulation = forceSimulation(simNodes)
    .numDimensions(3)
    .force('link', forceLink(simLinks)
      .id((d: { id?: string }) => d.id || '')
      .distance(8)
      .strength((l: { weight?: number }) => (l.weight || 0.5) * 0.3)
    )
    .force('charge', forceManyBody().strength(-15))
    .force('center', forceCenter(0, 0, 0).strength(0.05))
    .alphaDecay(0.02)
    .velocityDecay(0.4);

  // Run simulation iterations
  simulation.tick(100);
  simulation.stop();

  // Map to NodePoint with cluster colors
  return simNodes.map(node => {
    const cluster = clusters.get(node.id);
    return {
      id: node.id,
      content: node.content,
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 0,
      color: cluster?.color || '#3b82f6',
      clusterLabel: cluster?.label || 'Unknown'
    };
  });
}

export function Galaxy({ memories, edges, onNodeClick }: GalaxyProps) {
  // Compute clusters - memoized
  const clusters = useMemo(() => {
    if (memories.length === 0) return new Map<string, { color: string; label: string }>();
    const k = determineOptimalK(memories.length);
    return kMeansClustering(memories, k);
  }, [memories]);

  // Compute node positions - memoized, no useState needed
  const nodePositions = useMemo(() => 
    computeNodePositions(memories, edges, clusters),
    [memories, edges, clusters]
  );

  // Create position map for edges - memoized
  const positionMap = useMemo(() => {
    const map = new Map<string, NodePoint>();
    nodePositions.forEach(p => map.set(p.id, p));
    return map;
  }, [nodePositions]);

  // Empty state
  if (nodePositions.length === 0) {
    return (
      <Billboard>
        <Text
          position={[0, 0, 0]}
          fontSize={0.6}
          color="#555"
          anchorX="center"
          anchorY="middle"
        >
          Add your first thought...
        </Text>
      </Billboard>
    );
  }

  return (
    <group>
      {/* Render Edges */}
      {edges.map((edge, i) => {
        const source = positionMap.get(edge.source);
        const target = positionMap.get(edge.target);
        if (!source || !target) return null;
        
        return (
          <EdgeLine 
            key={`edge-${i}`}
            start={[source.x, source.y, source.z]}
            end={[target.x, target.y, target.z]}
            weight={edge.weight}
            color={source.color}
          />
        );
      })}

      {/* Render Nodes */}
      {nodePositions.map((node) => (
        <EnhancedNode 
          key={node.id} 
          node={node}
          onClick={() => onNodeClick(node.id)}
        />
      ))}
    </group>
  );
}

interface EdgeLineProps {
  start: [number, number, number];
  end: [number, number, number];
  weight: number;
  color: string;
}

function EdgeLine({ start, end, weight, color }: EdgeLineProps) {
  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={1}
      transparent
      opacity={weight * 0.5}
    />
  );
}

interface EnhancedNodeProps {
  node: NodePoint;
  onClick: () => void;
}

function EnhancedNode({ node, onClick }: EnhancedNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { x, y, z, color, content, clusterLabel } = node;

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = y + Math.sin(t * 0.8 + x) * 0.15;
      groupRef.current.rotation.y = t * 0.1;
    }
    if (glowRef.current) {
      const scale = hovered ? 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  const nodeColor = useMemo(() => new THREE.Color(color), [color]);
  const glowColor = useMemo(() => nodeColor.clone().multiplyScalar(0.6), [nodeColor]);

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent
          opacity={hovered ? 0.25 : 0.08}
        />
      </mesh>

      {/* Inner core */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[hovered ? 0.6 : 0.45, 24, 24]} />
        <meshStandardMaterial 
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered ? 2.5 : 1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Ring effect on hover */}
      {hovered && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.8, 32]} />
          <meshBasicMaterial 
            color={nodeColor}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Label on hover - Enhanced for better visibility */}
      {hovered && (
        <Billboard>
          <group position={[0, 1.5, 0]}>
            {/* Glow effect behind tooltip */}
            <mesh position={[0, 0.15, -0.03]} renderOrder={0}>
              <planeGeometry args={[6.5, 2.2]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.15} 
                depthTest={false}
              />
            </mesh>
            {/* Border */}
            <mesh position={[0, 0.15, -0.02]} renderOrder={1}>
              <planeGeometry args={[6.2, 1.9]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.4} 
                depthTest={false}
              />
            </mesh>
            {/* Background */}
            <mesh position={[0, 0.15, -0.01]} renderOrder={2}>
              <planeGeometry args={[6.0, 1.7]} />
              <meshBasicMaterial 
                color="#0a0a0f" 
                transparent 
                opacity={0.95} 
                depthTest={false}
              />
            </mesh>
            {/* Content - Main text with larger font */}
            <Text
              position={[0, 0.35, 0]}
              fontSize={0.38}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={5.5}
              renderOrder={3}
              material-depthTest={false}
            >
              {content.length > 60 ? content.slice(0, 60) + "..." : content}
            </Text>
            {/* Cluster label - More prominent */}
            <Text
              position={[0, -0.15, 0]}
              fontSize={0.22}
              color={color}
              anchorX="center"
              anchorY="middle"
              renderOrder={3}
              material-depthTest={false}
            >
              {clusterLabel}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}
