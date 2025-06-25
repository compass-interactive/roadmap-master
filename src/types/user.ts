
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'learner' | 'creator' | 'mentor';
  joinedAt: Date;
}

export interface UserActivity {
  id: string;
  type: 'viewed_roadmap' | 'saved_node' | 'forum_reply';
  title: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
