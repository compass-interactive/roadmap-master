import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Activity, DollarSign, ArrowRight, Star, Zap, Plus, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserRoadmaps, createRoadmap, deleteRoadmap, updateRoadmap } from '@/integrations/supabase/roadmapApi';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { exportRoadmapToPDF } from '@/lib/utils';
import { fetchRoadmapNodes } from '@/integrations/supabase/roadmapApi';

const stats = [
  { title: 'Total Users', value: '2,847', change: '+12%', icon: Users, trend: 'up' },
  { title: 'Revenue', value: '$45,231', change: '+8%', icon: DollarSign, trend: 'up' },
  { title: 'Active Sessions', value: '1,423', change: '+23%', icon: Activity, trend: 'up' },
  { title: 'Growth Rate', value: '34.2%', change: '+5%', icon: TrendingUp, trend: 'up' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchUserRoadmaps(user.id)
      .then(setRoadmaps)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle) return;
    setCreating(true);
    try {
      const roadmap = await createRoadmap({
        title: newTitle,
        description: newDescription,
        owner_id: user.id,
        is_public: false,
      });
      setRoadmaps(rms => [roadmap, ...rms]);
      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      alert('Failed to create roadmap: ' + (err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2 mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome{user && user.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Build, organize, and track your learning or project journeys with beautiful, interactive roadmaps.
            </p>
          </div>
          {/* Create Roadmap Button */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-blue-600 hover:to-purple-700"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-5 w-5 mr-2 inline" />
              Create New Roadmap
            </Button>
          </div>
          {/* List of Past Roadmaps */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Roadmaps</h2>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : roadmaps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <img src="/public/placeholder.svg" alt="No roadmaps" className="w-32 h-32 mb-4 opacity-60" />
                <p className="text-lg text-gray-500 mb-2">No roadmaps found.</p>
                <Button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" /> Create your first roadmap
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map(rm => (
                  <Card key={rm.id} className="hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-400 group relative">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <Star className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        {rm.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-gray-500">
                        {rm.description}
                      </CardDescription>
                      {/* 3-dot menu */}
                      <div className="absolute top-4 right-4 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full p-2">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={async () => {
                                if (!rm.is_public) {
                                  try {
                                    await updateRoadmap(rm.id, { is_public: true });
                                    rm.is_public = true;
                                  } catch (err) {
                                    alert('Failed to make roadmap public: ' + (err as Error).message);
                                    return;
                                  }
                                }
                                const publicUrl = `${window.location.origin}/roadmap/${rm.id}`;
                                await navigator.clipboard.writeText(publicUrl);
                                alert('Public link copied to clipboard!\n' + publicUrl);
                              }}
                            >
                              <ArrowRight className="h-4 w-4 mr-2 inline" /> Share public link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => navigate(`/roadmap-builder/${rm.id}`)}>
                          Open in Builder
                        </Button>
                        <Button size="sm" variant="destructive" onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete the roadmap "${rm.title}"? This cannot be undone.`)) {
                            try {
                              await deleteRoadmap(rm.id);
                              setRoadmaps(rms => rms.filter(r => r.id !== rm.id));
                            } catch (err) {
                              alert('Failed to delete roadmap: ' + (err as Error).message);
                            }
                          }
                        }}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        <Button size="sm" className="bg-gray-700 text-white hover:bg-gray-800" disabled={downloadingId === rm.id} onClick={async () => {
                          setDownloadingId(rm.id);
                          try {
                            const nodes = await fetchRoadmapNodes(rm.id);
                            exportRoadmapToPDF({
                              title: rm.title,
                              description: rm.description,
                              nodes: nodes.map(n => ({
                                ...n,
                                bgcolor: n.bgcolor,
                                fontcolor: n.fontcolor
                              })),
                              edges: [] // You may want to fetch edges here if needed
                            });
                          } catch (err) {
                            alert('Failed to export PDF: ' + (err as Error).message);
                          } finally {
                            setDownloadingId(null);
                          }
                        }}>
                          {downloadingId === rm.id ? 'Downloading...' : 'Download as PDF'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/* Getting Started Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                New here? Follow these steps to make the most of your roadmap experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create your first roadmap</p>
                    <p className="text-sm text-muted-foreground">Map out your learning or project journey.</p>
                  </div>
                  <Badge variant="secondary">Start</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Open the Roadmap Builder</p>
                    <p className="text-sm text-muted-foreground">Drag, connect, and customize your nodes.</p>
                  </div>
                  <Badge variant="secondary">Explore</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Track your progress</p>
                    <p className="text-sm text-muted-foreground">Mark nodes as complete and visualize your journey.</p>
                  </div>
                  <Badge variant="secondary">Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        {/* Modal for creating roadmap */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Roadmap</h2>
              <form onSubmit={handleCreateRoadmap} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Title</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard; 