import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Bookmark, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import { UserActivity } from '@/types/user';

interface UserDashboardProps {
  activities: UserActivity[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ activities }) => {
  const recentRoadmaps = activities.filter(a => a.type === 'viewed_roadmap').slice(0, 5);
  const savedNodes = activities.filter(a => a.type === 'saved_node').slice(0, 5);
  const forumReplies = activities.filter(a => a.type === 'forum_reply').slice(0, 5);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'viewed_roadmap': return <Eye className="h-4 w-4" />;
      case 'saved_node': return <Bookmark className="h-4 w-4" />;
      case 'forum_reply': return <MessageSquare className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const ActivityCard: React.FC<{ 
    title: string; 
    items: UserActivity[]; 
    icon: React.ReactNode; 
    emptyMessage: string;
  }> = ({ title, items, icon, emptyMessage }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getActivityIcon(item.type)}
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" style={{fontFamily: 'Inter, Rubik, sans-serif'}}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-blue-700">Dashboard</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
            <TrendingUp className="h-3 w-3" />
            {activities.length} Activities
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActivityCard
          title="Recent Roadmaps"
          items={recentRoadmaps}
          icon={<BookOpen className="h-5 w-5 text-blue-400" />}
          emptyMessage="No roadmaps viewed yet"
        />
        
        <ActivityCard
          title="Saved Nodes"
          items={savedNodes}
          icon={<Bookmark className="h-5 w-5 text-blue-400" />}
          emptyMessage="No nodes saved yet"
        />
        
        <ActivityCard
          title="Forum Replies"
          items={forumReplies}
          icon={<MessageSquare className="h-5 w-5 text-blue-400" />}
          emptyMessage="No forum activity yet"
        />
      </div>

      {/* Quick Stats */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calendar className="h-5 w-5 text-blue-400" />
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {recentRoadmaps.length}
              </p>
              <p className="text-sm text-gray-500">Roadmaps Viewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {savedNodes.length}
              </p>
              <p className="text-sm text-gray-500">Nodes Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {forumReplies.length}
              </p>
              <p className="text-sm text-gray-500">Forum Replies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
