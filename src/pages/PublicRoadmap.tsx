import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RoadmapCanvas from '../components/RoadmapCanvas';
import { fetchRoadmap, fetchRoadmapNodes, fetchRoadmapEdges } from '@/integrations/supabase/roadmapApi';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PublicRoadmap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg text-gray-500">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-lg text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex flex-col items-center">
      <Card className="w-full max-w-3xl mt-8 mb-4 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{roadmap.title}</CardTitle>
          <CardDescription className="text-lg text-gray-500">{roadmap.description}</CardDescription>
        </CardHeader>
      </Card>
      <div className="w-full max-w-5xl">
        <RoadmapCanvas
          nodes={nodes}
          setNodes={() => {}}
          edges={edges}
          setEdges={() => {}}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          onConnect={() => {}}
          onNodeClick={() => {}}
          onNodeRightClick={() => {}}
          selectedNodeId={null}
        />
      </div>
      <div className="text-center text-gray-400 mt-4 mb-8">View-only mode. To edit, ask the owner for access.</div>
    </div>
  );
};

export default PublicRoadmap; 