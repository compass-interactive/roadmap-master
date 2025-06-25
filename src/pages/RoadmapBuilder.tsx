import React, { useState } from 'react';
import RoadmapCanvas from '../components/RoadmapCanvas';
import { RoadmapNode } from '@/types/roadmap';

const RoadmapBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  // Placeholder for add node logic
  const handleAddNode = () => {
    // Open modal or add a dummy node
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roadmap Builder</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAddNode}
        >
          + Add Node
        </button>
      </header>
      <main className="flex-1">
        <RoadmapCanvas nodes={nodes} setNodes={setNodes} />
      </main>
    </div>
  );
};

export default RoadmapBuilder; 