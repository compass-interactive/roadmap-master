export type RoadmapNodeType = 'video' | 'article' | 'quiz' | 'other';

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  type: RoadmapNodeType;
  resource: string;
  position: { x: number; y: number };
  bgColor?: string;
  fontColor?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
} 