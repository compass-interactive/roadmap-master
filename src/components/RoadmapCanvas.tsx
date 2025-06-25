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
import { RoadmapNode } from '@/types/roadmap';

// Custom MindMapNode: label is only displayed, not editable inline
const MindMapNode: React.FC<NodeProps> = ({ data, selected }) => (
  <div
    className={`rounded shadow p-2 min-w-[140px] border-2 ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`}
    style={{ background: data.bgColor || '#ffffff', color: data.fontColor || '#222222' }}
  >
    <div className="w-full font-bold text-center" style={{ color: data.fontColor || '#222222' }}>
      {data.label}
    </div>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { mindmap: MindMapNode };

interface RoadmapCanvasProps {
  nodes: RoadmapNode[];
  setNodes: React.Dispatch<React.SetStateAction<RoadmapNode[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodeClick?: (nodeId: string) => void;
  onNodeRightClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

const RoadmapCanvas: React.FC<RoadmapCanvasProps> = ({ nodes, setNodes, edges, setEdges, onNodeClick, onNodeRightClick, selectedNodeId }) => {
  // Use React Flow's state hooks for smooth UX
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Sync rfNodes with parent nodes prop (for color changes from modal)
  React.useEffect(() => {
    setRfNodes(
      nodes.map((node) => ({
        id: node.id,
        position: node.position,
        data: {
          label: node.title,
          bgColor: node.bgColor || '#ffffff',
          fontColor: node.fontColor || '#222222',
        },
        type: 'mindmap',
        selected: node.id === selectedNodeId,
      }))
    );
    // eslint-disable-next-line
  }, [nodes, selectedNodeId]);

  React.useEffect(() => {
    // Sync parent state when edges change
    setEdges(rfEdges);
    // eslint-disable-next-line
  }, [rfEdges]);

  const onConnect = useCallback((params: Edge | Connection) => setRfEdges((eds) => addEdge(params, eds)), [setRfEdges]);

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
    <div style={{ width: '100%', height: '80vh' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        fitView
        proOptions={{
          hideAttribution:true
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