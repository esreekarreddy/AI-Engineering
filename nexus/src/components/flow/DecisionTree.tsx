"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import type { TraceStep } from "@/lib/mcp/types";

// Custom node component
function StepNode({ data }: { data: { step: TraceStep; isActive: boolean } }) {
  const { step, isActive } = data;
  
  const config: Record<TraceStep["type"], { bg: string; border: string; label: string; icon: string }> = {
    user: { bg: "bg-blue-500/20", border: "border-blue-500", label: "Query", icon: "💬" },
    planning: { bg: "bg-purple-500/20", border: "border-purple-500", label: "Thinking", icon: "🧠" },
    tool_call: { bg: "bg-cyan-500/20", border: "border-cyan-500", label: "Tool", icon: "🔧" },
    tool_result: { bg: "bg-emerald-500/20", border: "border-emerald-500", label: "Result", icon: "📦" },
    response: { bg: "bg-white/20", border: "border-white", label: "Response", icon: "✨" },
    error: { bg: "bg-red-500/20", border: "border-red-500", label: "Error", icon: "❌" },
  };

  const c = config[step.type];

  return (
    <div
      className={`
        px-4 py-3 rounded-xl border-2 min-w-[180px] max-w-[280px]
        ${c.bg} ${c.border}
        ${isActive ? "animate-pulse-glow shadow-lg" : ""}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{c.icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {c.label}
        </span>
      </div>
      
      {step.toolName && (
        <code className="text-xs text-[var(--accent-cyan)] font-mono block mb-1">
          {step.toolName}()
        </code>
      )}
      
      <p className="text-sm text-[var(--text-primary)] line-clamp-2">
        {step.type === "user" ? step.content : 
         step.type === "response" ? step.content.slice(0, 100) + (step.content.length > 100 ? "..." : "") :
         step.type === "tool_call" ? `Calling ${step.toolName}` :
         step.type === "tool_result" ? "Data received" :
         step.type === "planning" ? "Processing..." :
         step.content}
      </p>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  step: StepNode,
};

interface DecisionTreeProps {
  steps: TraceStep[];
  isRunning: boolean;
  onNodeClick?: (stepId: string) => void;
  selectedStepId?: string | null;
}

export function DecisionTree({ steps, isRunning, onNodeClick, selectedStepId }: DecisionTreeProps) {
  // Convert steps to nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const nodeWidth = 220;
    const nodeHeight = 100;
    const verticalGap = 60;
    
    steps.forEach((step, index) => {
      // Position nodes vertically
      const x = 100;
      const y = index * (nodeHeight + verticalGap);
      
      nodes.push({
        id: step.id,
        type: "step",
        position: { x, y },
        data: { 
          step, 
          isActive: isRunning && index === steps.length - 1 
        },
        selected: step.id === selectedStepId,
      });

      // Add edge from previous node
      if (index > 0) {
        edges.push({
          id: `e-${steps[index - 1].id}-${step.id}`,
          source: steps[index - 1].id,
          target: step.id,
          type: "smoothstep",
          animated: isRunning && index === steps.length - 1,
          style: { 
            stroke: step.type === "error" ? "#ef4444" : "#7c3aed",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: step.type === "error" ? "#ef4444" : "#7c3aed",
          },
        });
      }
    });

    return { nodes, edges };
  }, [steps, isRunning, selectedStepId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when steps change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = (() => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      
      const nodeHeight = 100;
      const verticalGap = 60;
      
      steps.forEach((step, index) => {
        const x = 100;
        const y = index * (nodeHeight + verticalGap);
        
        nodes.push({
          id: step.id,
          type: "step",
          position: { x, y },
          data: { 
            step, 
            isActive: isRunning && index === steps.length - 1 
          },
          selected: step.id === selectedStepId,
        });

        if (index > 0) {
          edges.push({
            id: `e-${steps[index - 1].id}-${step.id}`,
            source: steps[index - 1].id,
            target: step.id,
            type: "smoothstep",
            animated: isRunning && index === steps.length - 1,
            style: { 
              stroke: step.type === "error" ? "#ef4444" : "#7c3aed",
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: step.type === "error" ? "#ef4444" : "#7c3aed",
            },
          });
        }
      });

      return { nodes, edges };
    })();

    setNodes(newNodes);
    setEdges(newEdges);
  }, [steps, isRunning, selectedStepId, setNodes, setEdges]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls 
          className="!bg-[var(--bg-tertiary)] !border-[var(--border-subtle)] !rounded-lg"
        />
        <MiniMap
          className="!bg-[var(--bg-secondary)] !border-[var(--border-subtle)] !rounded-lg"
          nodeColor={(node) => {
            const step = node.data?.step as TraceStep | undefined;
            if (!step) return "#7c3aed";
            const colors: Record<TraceStep["type"], string> = {
              user: "#3b82f6",
              planning: "#8b5cf6",
              tool_call: "#06b6d4",
              tool_result: "#10b981",
              response: "#ffffff",
              error: "#ef4444",
            };
            return colors[step.type] || "#7c3aed";
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
