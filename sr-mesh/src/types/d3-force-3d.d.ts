// Type definitions for d3-force-3d
declare module 'd3-force-3d' {
  export interface SimulationNode {
    id?: string;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLink {
    source: SimulationNode | string;
    target: SimulationNode | string;
    weight?: number;
  }

  export interface Force {
    (alpha: number): void;
  }

  export interface Simulation {
    nodes(): SimulationNode[];
    nodes(nodes: SimulationNode[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force | undefined;
    force(name: string, force: Force | null): this;
    tick(iterations?: number): this;
    restart(): this;
    stop(): this;
    on(type: string, listener: null | ((this: this) => void)): this;
    numDimensions(): number;
    numDimensions(n: 1 | 2 | 3): this;
  }

  export function forceSimulation(nodes?: SimulationNode[]): Simulation;
  
  export function forceLink(links?: SimulationLink[]): {
    (alpha: number): void;
    links(): SimulationLink[];
    links(links: SimulationLink[]): ReturnType<typeof forceLink>;
    id(): (node: SimulationNode) => string;
    id(fn: (node: SimulationNode) => string): ReturnType<typeof forceLink>;
    distance(): number | ((link: SimulationLink) => number);
    distance(d: number | ((link: SimulationLink) => number)): ReturnType<typeof forceLink>;
    strength(): number | ((link: SimulationLink) => number);
    strength(s: number | ((link: SimulationLink) => number)): ReturnType<typeof forceLink>;
  };

  export function forceManyBody(): {
    (alpha: number): void;
    strength(): number | ((node: SimulationNode) => number);
    strength(s: number | ((node: SimulationNode) => number)): ReturnType<typeof forceManyBody>;
    theta(): number;
    theta(t: number): ReturnType<typeof forceManyBody>;
    distanceMin(): number;
    distanceMin(d: number): ReturnType<typeof forceManyBody>;
    distanceMax(): number;
    distanceMax(d: number): ReturnType<typeof forceManyBody>;
  };

  export function forceCenter(x?: number, y?: number, z?: number): {
    (alpha: number): void;
    x(): number;
    x(x: number): ReturnType<typeof forceCenter>;
    y(): number;
    y(y: number): ReturnType<typeof forceCenter>;
    z(): number;
    z(z: number): ReturnType<typeof forceCenter>;
    strength(): number;
    strength(s: number): ReturnType<typeof forceCenter>;
  };
}
