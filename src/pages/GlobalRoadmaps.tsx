import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Eye, Calendar, User, BookOpen } from 'lucide-react';
import { fetchAllPublicRoadmaps, debugRoadmapsTable } from '@/integrations/supabase/roadmapApi';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  profiles?: {
    id: string;
    name: string;
    avatar: string;
  } | null;
}

const GlobalRoadmaps = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    // Filter roadmaps based on search term
    const filtered = roadmaps.filter(roadmap =>
      roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoadmaps(filtered);
  }, [roadmaps, searchTerm]);

  const fetchRoadmaps = async () => {
    try {
      // First, let's debug what's in the roadmaps table
      console.log('Debugging roadmaps table...');
      const debugData = await debugRoadmapsTable();
      console.log('Debug data:', debugData);
      
      const data = await fetchAllPublicRoadmaps();
      console.log('Fetched public roadmaps:', data);
      
      if (data && data.length > 0) {
        setRoadmaps(data);
        setFilteredRoadmaps(data);
      } else {
        console.log('No roadmaps found');
        setRoadmaps([]);
        setFilteredRoadmaps([]);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: "Error",
        description: "Failed to load roadmaps. Please check the console for details.",
        variant: "destructive",
      });
      // Set empty arrays to show the empty state
      setRoadmaps([]);
      setFilteredRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAuthorName = (roadmap: RoadmapData) => {
    if (roadmap.profiles?.name) {
      return roadmap.profiles.name;
    }
    // Fallback to email or user ID if name is not available
    return `User ${roadmap.owner_id.slice(0, 8)}`;
  };

  const getAuthorAvatar = (roadmap: RoadmapData) => {
    return roadmap.profiles?.avatar || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{fontFamily: 'Inter, Rubik, sans-serif'}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Explore Roadmaps</h1>
            <p className="text-gray-500">Discover learning roadmaps created by the community</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
          <Input
            placeholder="Search roadmaps by title, description, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-blue-200 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Roadmaps List */}
      {filteredRoadmaps.length === 0 ? (
        <Card className="card-base text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
                  {searchTerm ? 'No roadmaps found' : 'No public roadmaps yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms or browse all roadmaps'
                    : 'Be the first to create a public roadmap for the community'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/roadmap-builder')} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create First Roadmap
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="card-base hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-blue-700">{roadmap.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-gray-500">
                      {roadmap.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-700">Public</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={getAuthorAvatar(roadmap)} />
                    <AvatarFallback className="text-xs">
                      {getAuthorName(roadmap).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-500">
                    by {getAuthorName(roadmap)}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    {formatDate(roadmap.created_at)}
                  </div>
                </div>
                
                {/* Action Button */}
                <Button
                  variant="outline"
                  onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Roadmap
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredRoadmaps.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredRoadmaps.length} of {roadmaps.length} public roadmaps
        </div>
      )}
    </div>
  );
};

export default GlobalRoadmaps; 