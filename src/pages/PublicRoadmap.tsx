import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RoadmapCanvas from '../components/RoadmapCanvas';
import { fetchRoadmap, fetchRoadmapNodes, fetchRoadmapEdges } from '@/integrations/supabase/roadmapApi';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportRoadmapToPDF } from '@/lib/utils';

const PublicRoadmap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchRoadmap(id),
      fetchRoadmapNodes(id),
      fetchRoadmapEdges(id)
    ])
      .then(([rm, fetchedNodes, fetchedEdges]) => {
        if (!rm.is_public) {
          setError('This roadmap is private.');
          setLoading(false);
          return;
        }
        setRoadmap(rm);
        setNodes(fetchedNodes.map(n => ({
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
        })));
        setEdges(fetchedEdges.map((e: any) => ({
          id: e.id,
          source: e.source_node_id,
          target: e.target_node_id,
        })));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load roadmap.');
        setLoading(false);
      });
  }, [id]);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg text-gray-500">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-lg text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex flex-col items-center">
      <Card className="w-full max-w-3xl mt-8 mb-4 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{roadmap.title}</CardTitle>
              <CardDescription className="text-lg text-gray-500">{roadmap.description}</CardDescription>
            </div>
            <Button
              className="ml-4 bg-gray-700 text-white hover:bg-gray-800"
              onClick={() => exportRoadmapToPDF({
                title: roadmap.title,
                description: roadmap.description,
                nodes: nodes.map(n => ({
                  ...n.data,
                  id: n.id,
                  bgcolor: n.data.bgColor,
                  fontcolor: n.data.fontColor
                })),
                edges: edges
              })}
              disabled={!nodes.length}
            >
              Download as PDF
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="w-full max-w-5xl relative">
        <RoadmapCanvas
          nodes={nodes}
          setNodes={() => {}}
          edges={edges}
          setEdges={() => {}}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          onConnect={() => {}}
          onNodeClick={setSelectedNodeId}
          onNodeRightClick={() => {}}
          selectedNodeId={selectedNodeId}
        />
        {/* Side panel for node details */}
        {selectedNode && (
          <div className="fixed top-24 right-8 w-80 bg-white rounded-lg shadow-lg border p-6 z-50 animate-in fade-in slide-in-from-right-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{selectedNode.data.title}</h3>
              <Button size="icon" variant="ghost" onClick={() => setSelectedNodeId(null)}>
                ×
              </Button>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-600">Type:</span> <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{selectedNode.data.type}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-600">Description:</span>
              <div className="text-gray-700 mt-1 whitespace-pre-line">{selectedNode.data.description || <span className="italic text-gray-400">No description</span>}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-600">Resource URL:</span>
              {selectedNode.data.resource ? (
                <a href={selectedNode.data.resource} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline break-all mt-1">{selectedNode.data.resource}</a>
              ) : (
                <span className="italic text-gray-400 ml-1">No resource</span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="text-center text-gray-400 mt-4 mb-8">View-only mode. To edit, ask the owner for access.</div>
    </div>
  );
};

export default PublicRoadmap; 