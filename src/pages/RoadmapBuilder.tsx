import React, { useState } from 'react';
import RoadmapCanvas from '../components/RoadmapCanvas';
import RoadmapNodeForm from '../components/RoadmapNodeForm';
import { RoadmapNode } from '@/types/roadmap';
import type { Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Trash2, Plus } from 'lucide-react';

const RoadmapBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<RoadmapNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleAddNode = () => {
    setEditNode(null);
    setModalOpen(true);
  };

  const handleNodeSubmit = (data: Omit<RoadmapNode, 'id' | 'position'> & { bgColor?: string; fontColor?: string }) => {
    if (editNode) {
      setNodes(nodes => nodes.map(n => n.id === editNode.id ? { ...n, ...data } : n));
    } else {
      setNodes(nodes => [
        ...nodes,
        {
          id: uuidv4(),
          ...data,
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        },
      ]);
    }
    setModalOpen(false);
    setEditNode(null);
  };

  const handleNodeRightClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditNode(node);
      setModalOpen(true);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      setNodes(nodes => nodes.filter(n => n.id !== selectedNodeId));
      setEdges(edges => edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roadmap Builder</h1>
        <button
          className="px-5 py-2 bg-blue-600 flex justify-center items-center gap-2 text-sm text-semibold text-white rounded-full hover:bg-blue-700"
          onClick={handleAddNode}
        >
          <Plus className="h-4 w-4" />
          Add Node
        </button>
      </header>
      <main className="flex-1 relative">
        <RoadmapCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
          selectedNodeId={selectedNodeId}
        />
        {selectedNodeId && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
            <button
              className="px-4 font-bold w-max border-2 border-gray-600 py-2 bg-gray-50 text-black rounded-full shadow hover:bg-gray-200 flex justify-center items-center gap-2 text-sm"
              onClick={() => {
                const node = nodes.find(n => n.id === selectedNodeId);
                if (node) {
                  setEditNode(node);
                  setModalOpen(true);
                }
              }}
            >
              <Pencil className="h-3 w-3" />
              <span> Edit Node </span>
            </button>

            <button
              className="px-4 font-bold border-2 w-max border-red-500 py-2 bg-gray-100 text-red-600 rounded-full shadow hover:bg-red-50 flex justify-center items-center gap-2 text-sm"
              onClick={handleDeleteNode}
            >
              <Trash2 className="h-3 w-3" />
              Delete Node
            </button>
          </div>
        )}
        <RoadmapNodeForm
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditNode(null); }}
          onSubmit={handleNodeSubmit}
          initialNode={editNode || undefined}
          disableCloseOnOutsideClick={true}
        />
      </main>
    </div>
  );
};

export default RoadmapBuilder; 