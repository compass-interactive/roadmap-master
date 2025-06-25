export type RoadmapNodeType = 'video' | 'article' | 'quiz' | 'other';

export interface RoadmapNodeData {
  title: string;
  description: string;
  resource: string;
  bgColor?: string;
  fontColor?: string;
}

export interface RoadmapNode {
  id: string;
  type: RoadmapNodeType;
  position: { x: number; y: number };
  data: RoadmapNodeData;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
} 