import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
// import { RoadmapNode } from '@/types/roadmap';

// Custom MindMapNode: label is only displayed, not editable inline
const MindMapNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div
    className={`rounded shadow p-2 min-w-[140px] border-2 ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`}
    style={{ background: data.bgColor || '#ffffff', color: data.fontColor || '#222222' }}
  >
    <div className="w-full font-bold text-center" style={{ color: data.fontColor || '#222222' }}>
      {data.title}
    </div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// Make sure this is outside the component (top-level)
const nodeTypes = { mindmap: MindMapNode };

interface RoadmapCanvasProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodeClick?: (nodeId: string) => void;
  onNodeRightClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
  onNodesChange?: (changes: any) => void;
  onEdgesChange?: (changes: any) => void;
  onConnect?: (params: Edge | Connection) => void;
}

const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({ nodes, setNodes, edges, setEdges, onNodeClick, onNodeRightClick, selectedNodeId, onNodesChange, onEdgesChange, onConnect }) => {
  // Only allow selection if node is not just created (avoid auto-select on add)
  const handleNodeClick = (_: any, node: Node) => {
    if (node.position.x !== 0 && node.position.y !== 0) {
      onNodeClick?.(node.id);
    }
  };
  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    onNodeRightClick?.(node.id);
  };

  return (
    <div className="roadmap-canvas-container" style={{ width: '100%', height: '80vh' }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          type: 'mindmap',
          data: {
            ...node.data,
            title: node.data?.title || 'Untitled',
            bgColor: node.data?.bgColor || '#ffffff',
            fontColor: node.data?.fontColor || '#222222',
            type: node.data?.type,
          },
          selected: selectedNodeId === node.id,
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        fitView
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        proOptions={{
          hideAttribution:true
        }}
        onSelectionChange={(params) => {
          if (params.nodes && params.nodes.length > 0) {
            onNodeClick?.(params.nodes[0].id);
          } else {
            onNodeClick?.(null);
          }
        }}
      >
        <Controls position="top-right" />
        <MiniMap position="top-left" style={{ marginTop: 56 }} />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default RoadmapCanvas; 