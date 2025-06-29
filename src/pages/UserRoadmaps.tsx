import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Eye, Trash2, Calendar, User, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserRoadmaps, deleteRoadmap } from '@/integrations/supabase/roadmapApi';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

const UserRoadmaps = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRoadmaps();
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    if (!user) return;

    try {
      const data = await fetchUserRoadmaps(user.id);
      setRoadmaps(data);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: "Error",
        description: "Failed to load your roadmaps.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRoadmap(roadmapId);
      setRoadmaps(roadmaps.filter(roadmap => roadmap.id !== roadmapId));
      toast({
        title: "Success",
        description: "Roadmap deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to delete roadmap.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Roadmaps</h1>
              <p className="text-muted-foreground">Manage and view all your created roadmaps</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/roadmap-builder')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Roadmap
          </Button>
        </div>

        {/* Roadmaps List */}
        {roadmaps.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No roadmaps yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating your first roadmap to help others learn
                  </p>
                  <Button onClick={() => navigate('/roadmap-builder')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Roadmap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{roadmap.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {roadmap.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant={roadmap.is_public ? "default" : "secondary"}>
                      {roadmap.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(roadmap.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/roadmap-builder/${roadmap.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRoadmap(roadmap.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default UserRoadmaps; 