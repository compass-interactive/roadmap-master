import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Activity, DollarSign, ArrowRight, Star, Zap, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserRoadmaps, createRoadmap, deleteRoadmap } from '@/integrations/supabase/roadmapApi';
import { supabase } from '@/integrations/supabase/client';

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
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-8">
          {/* Roadmap Builder Button & Create Roadmap */}
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
            <h2 className="text-xl font-bold mb-2">Your Roadmaps</h2>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : roadmaps.length === 0 ? (
              <div className="text-gray-500">No roadmaps found. Create your first roadmap!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roadmaps.map(rm => (
                  <Card key={rm.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{rm.title}</CardTitle>
                      <CardDescription>{rm.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => navigate(`/roadmap-builder/${rm.id}`)}>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to your Dashboard
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your application today.
            </p>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      {stat.change}
                    </Badge>
                    <span>from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-16 -translate-y-16" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <CardTitle>Quick Actions</CardTitle>
                </div>
                <CardDescription>
                  Get started with common tasks and workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between" variant="outline">
                  Create New Project
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  Invite Team Members
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  View Analytics
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full transform translate-x-16 -translate-y-16" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Recent Activity</CardTitle>
                </div>
                <CardDescription>
                  Latest updates and notifications from your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Project updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">System maintenance</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Getting Started Section */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Complete these steps to set up your application and start building amazing features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Set up your profile</p>
                    <p className="text-sm text-muted-foreground">Complete your account information</p>
                  </div>
                  <Badge variant="secondary">Complete</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Connect your integrations</p>
                    <p className="text-sm text-muted-foreground">Link your favorite tools and services</p>
                  </div>
                  <Button size="sm">
                    Set up
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Invite your team</p>
                    <p className="text-sm text-muted-foreground">Collaborate with your colleagues</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Invite
                  </Button>
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