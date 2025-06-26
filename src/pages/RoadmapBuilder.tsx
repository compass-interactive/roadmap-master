import React, { useEffect, useState } from 'react';
import RoadmapCanvas from '../components/RoadmapCanvas';
import RoadmapNodeForm from '../components/RoadmapNodeForm';
import { RoadmapNodeData, RoadmapNodeType } from '@/types/roadmap';
import { useNodesState, useEdgesState, addEdge, Node, Edge, Connection } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  fetchRoadmap,
  fetchRoadmapNodes,
  createRoadmapNode,
  updateRoadmapNode,
  deleteRoadmapNode,
  fetchRoadmapEdges,
  createRoadmapEdge,
  deleteRoadmapEdge,
} from '@/integrations/supabase/roadmapApi';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useParams } from 'react-router-dom';
import { exportRoadmapToPDF } from '@/lib/utils';

const RoadmapBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rawEdges, setRawEdges] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<Node | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get current user (replace with your auth context if needed)
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const params = useParams();

  const allowedTypes = ['video', 'article', 'quiz', 'other'];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // On mount, set selectedRoadmapId from URL param, navigation state, or fallback
  useEffect(() => {
    if (params.roadmapId) {
      setSelectedRoadmapId(params.roadmapId);
    } else if (location.state && location.state.roadmapId) {
      setSelectedRoadmapId(location.state.roadmapId);
    }
  }, [params.roadmapId, location.state]);

  // Fetch all roadmaps for the user
  useEffect(() => {
    if (!user) return;
    async function loadRoadmaps() {
      setLoading(true);
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('owner_id', user.id);
      if (!error) {
        setRoadmaps(data);
      }
      setLoading(false);
    }
    loadRoadmaps();
  }, [user]);

  // Fetch nodes for selected roadmap
  useEffect(() => {
    if (!selectedRoadmapId) return;
    setLoading(true);
    fetchRoadmapNodes(selectedRoadmapId)
      .then(fetchedNodes => setNodes(fetchedNodes.map(n => ({
        id: n.id,
        type: 'mindmap',
        position: {
          x: typeof n.position_x === 'number' ? n.position_x : 100,
          y: typeof n.position_y === 'number' ? n.position_y : 100,
        },
        data: {
          title: n.title || 'Untitled',
          description: n.description || '',
          resource: n.resource || '',
          bgColor: n.bgcolor || '#ffffff',
          fontColor: n.fontcolor || '#222222',
          type: n.type,
        }
      }))))
      .finally(() => setLoading(false));
  }, [selectedRoadmapId, setNodes]);

  // Fetch edges for selected roadmap
  useEffect(() => {
    if (!selectedRoadmapId) return;
    fetchRoadmapEdges(selectedRoadmapId)
      .then(fetchedEdges => {
        setRawEdges(fetchedEdges);
        setEdges(fetchedEdges.map((e: any) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
        })));
      });
  }, [selectedRoadmapId, setEdges]);

  const handleAddNode = () => {
    setEditNode(null);
    setModalOpen(true);
  };

  const handleNodeSubmit = async (data: { title: string; description: string; resource: string; type: string; bgColor?: string; fontColor?: string }) => {
    if (!selectedRoadmapId) return;
    const safeType = allowedTypes.includes(data.type) ? data.type : 'other';
    if (editNode) {
      const { bgColor, fontColor, title, description, resource } = data;
      await updateRoadmapNode(editNode.id, {
        title,
        description,
        resource,
        type: safeType,
        bgcolor: bgColor,
        fontcolor: fontColor,
      });
      setNodes(nodes => nodes.map(n => n.id === editNode.id ? {
        ...n,
        type: 'mindmap',
        data: {
          ...n.data,
          title,
          description,
          resource,
          bgColor,
          fontColor,
          type: safeType,
        }
      } : n));
    } else {
      const nodeToInsert = {
        title: data.title || 'Untitled',
        type: safeType,
        roadmap_id: selectedRoadmapId,
        position_x: Math.random() * 400 + 100,
        position_y: Math.random() * 300 + 100,
        description: data.description || '',
        resource: data.resource || '',
        bgcolor: data.bgColor,
        fontcolor: data.fontColor,
      };
      try {
        const newNode = await createRoadmapNode(nodeToInsert);
        setNodes(nodes => [...nodes, {
          id: newNode.id,
          type: 'mindmap',
          position: {
            x: typeof newNode.position_x === 'number' ? newNode.position_x : 100,
            y: typeof newNode.position_y === 'number' ? newNode.position_y : 100,
          },
          data: {
            title: newNode.title || 'Untitled',
            description: newNode.description || '',
            resource: newNode.resource || '',
            bgColor: newNode.bgcolor || '#ffffff',
            fontColor: newNode.fontcolor || '#222222',
            type: allowedTypes.includes(newNode.type) ? newNode.type : 'other',
          }
        }]);
      } catch (err) {
        alert('Failed to create node: ' + (err as Error).message);
      }
    }
    setModalOpen(false);
    setEditNode(null);
  };

  const handleNodeRightClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId) || null;
    setEditNode(node);
    setModalOpen(!!node);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleDeleteNode = async () => {
    if (selectedNodeId) {
      await deleteRoadmapNode(selectedNodeId);
      setNodes(nodes => nodes.filter(n => n.id !== selectedNodeId));
      setEdges(edges => edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  // React Flow edge add
  const handleConnect = (params: Edge | Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  // Add a Save button and handler
  const handleSave = async () => {
    if (!selectedRoadmapId) return;
    try {
      // Save all node positions
      for (const node of nodes) {
        const safeType = allowedTypes.includes(node.data.type) ? node.data.type : 'other';
        try {
          await updateRoadmapNode(node.id, {
            position_x: node.position.x,
            position_y: node.position.y,
            title: node.data.title,
            description: node.data.description,
            resource: node.data.resource,
            type: safeType,
            bgcolor: node.data.bgColor,
            fontcolor: node.data.fontColor,
          });
        } catch (err) {
          console.error('Failed to update node', node.id, err);
          alert('Failed to update node ' + node.id + ': ' + (err as Error).message);
        }
      }
      // Save all edges: delete all and re-create
      await fetchRoadmapEdges(selectedRoadmapId).then(async (existingEdges) => {
        for (const edge of existingEdges) {
          await deleteRoadmapEdge(edge.id);
        }
        for (const edge of edges) {
          await createRoadmapEdge({
            roadmap_id: selectedRoadmapId,
            source_node_id: edge.source,
            target_node_id: edge.target,
          });
        }
      });
      alert('Roadmap saved!');
    } catch (err) {
      console.error('Failed to save roadmap', err);
      alert('Failed to save roadmap: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {(!user && !loading) && (
        <div className="p-4 text-center text-red-500 font-bold">
          You are not logged in. Please log in to use the Roadmap Builder.
        </div>
      )}
      {(roadmaps.length === 0 && user && !loading) && (
        <div className="p-4 text-center text-gray-500">
          No roadmaps found. Please create a roadmap in your dashboard first.
        </div>
      )}
      <header className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Roadmap Builder</h1>
        </div>
        <div className="flex gap-2">
          <button
            className="px-5 py-2 bg-blue-600 flex justify-center items-center gap-2 text-sm text-semibold text-white rounded-full hover:bg-blue-700"
            onClick={handleAddNode}
            disabled={!selectedRoadmapId}
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
          <button
            className="px-5 py-2 bg-green-600 flex justify-center items-center gap-2 text-sm text-semibold text-white rounded-full hover:bg-green-700"
            onClick={handleSave}
            disabled={!selectedRoadmapId}
          >
            Save
          </button>
          <button
            className="px-5 py-2 bg-gray-700 flex justify-center items-center gap-2 text-sm text-semibold text-white rounded-full hover:bg-gray-800"
            onClick={() => {
              if (!selectedRoadmapId) return;
              const roadmap = roadmaps.find(rm => rm.id === selectedRoadmapId);
              exportRoadmapToPDF({
                title: roadmap?.title || 'Untitled Roadmap',
                description: roadmap?.description || '',
                nodes: nodes.map(n => ({
                  ...n.data,
                  id: n.id,
                  bgcolor: n.data.bgColor,
                  fontcolor: n.data.fontColor
                })),
                edges: rawEdges
              });
            }}
            disabled={!selectedRoadmapId || nodes.length === 0}
          >
            Download as PDF
          </button>
        </div>
      </header>
      <main className="flex-1 relative">
        {/* Roadmap Title */}
        {selectedRoadmapId && (
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold">
              {roadmaps.find(rm => rm.id === selectedRoadmapId)?.title || 'Untitled Roadmap'}
            </h2>
            {roadmaps.find(rm => rm.id === selectedRoadmapId)?.description && (
              <p className="text-gray-500 max-w-2xl mx-auto mt-1">
                {roadmaps.find(rm => rm.id === selectedRoadmapId)?.description}
              </p>
            )}
          </div>
        )}
        <RoadmapCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
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
          initialNode={editNode ? {
            title: editNode.data.title,
            description: editNode.data.description,
            resource: editNode.data.resource,
            type: (editNode.type as RoadmapNodeType),
            bgColor: editNode.data.bgColor,
            fontColor: editNode.data.fontColor,
          } : undefined}
          disableCloseOnOutsideClick={true}
        />
      </main>
    </div>
  );
};

export default RoadmapBuilder; 