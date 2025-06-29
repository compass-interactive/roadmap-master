import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/components/UserProfile';
import { UserDashboard } from '@/components/UserDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile as UserProfileType, UserActivity } from '@/types/user';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

// Mock activities for now
const mockActivities: UserActivity[] = [
  {
    id: '1',
    type: 'viewed_roadmap',
    title: 'React Development Roadmap',
    timestamp: new Date('2024-06-20'),
  },
  {
    id: '2',
    type: 'saved_node',
    title: 'JavaScript Fundamentals',
    timestamp: new Date('2024-06-19'),
  },
  {
    id: '3',
    type: 'forum_reply',
    title: 'Help with React Hooks',
    timestamp: new Date('2024-06-18'),
  },
];

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Create a basic profile from user data if none exists
        const basicProfile: UserProfileType = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url,
          role: 'learner',
          joinedAt: new Date(user.created_at),
        };
        setUserProfile(basicProfile);
      } else {
        const profile: UserProfileType = {
          id: data.id,
          name: data.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: data.email || user.email || '',
          avatar: data.avatar || user.user_metadata?.avatar_url,
          bio: data.bio,
          role: data.role as 'learner' | 'creator' | 'mentor',
          joinedAt: new Date(data.created_at),
        };
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (updatedUser: Partial<UserProfileType>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          bio: updatedUser.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(prev => prev ? { ...prev, ...updatedUser } : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
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
        {/* Home/Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <UserDashboard activities={mockActivities} />
          </TabsContent>
          
          <TabsContent value="profile" className="flex justify-center">
            {userProfile && (
              <UserProfile 
                user={userProfile} 
                isEditable={true}
                onSave={handleProfileSave}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
