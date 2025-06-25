import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { RoadmapNode } from '@/types/roadmap';

interface RoadmapCanvasProps {
  nodes: RoadmapNode[];
  setNodes: React.Dispatch<React.SetStateAction<RoadmapNode[]>>;
}

const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({ nodes }) => {
  // Convert RoadmapNode[] to React Flow nodes
  const flowNodes: Node[] = nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: { label: node.title },
    type: 'default',
  }));

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <ReactFlow nodes={flowNodes} edges={[]} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default RoadmapCanvas; 