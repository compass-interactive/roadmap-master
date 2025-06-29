-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'learner' CHECK (role IN ('learner', 'creator', 'mentor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create roadmaps table
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  forked_from_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create roadmap_nodes table
CREATE TABLE IF NOT EXISTS public.roadmap_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'other',
  resource TEXT,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  bgcolor TEXT,
  fontcolor TEXT,
  "order" INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create forum_likes table for tracking likes on posts and comments
CREATE TABLE IF NOT EXISTS public.forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Roadmap Edges Table
CREATE TABLE IF NOT EXISTS public.roadmap_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  source_node_id uuid REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  target_node_id uuid REFERENCES public.roadmap_nodes(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security for all tables
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for roadmaps
CREATE POLICY "Users can view public roadmaps" 
  ON public.roadmaps 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can view their own roadmaps" 
  ON public.roadmaps 
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create roadmaps" 
  ON public.roadmaps 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own roadmaps" 
  ON public.roadmaps 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own roadmaps" 
  ON public.roadmaps 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- Create policies for roadmap_nodes
CREATE POLICY "Users can view nodes of public roadmaps" 
  ON public.roadmap_nodes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE roadmaps.id = roadmap_nodes.roadmap_id 
      AND roadmaps.is_public = true
    )
  );

CREATE POLICY "Users can view nodes of their own roadmaps" 
  ON public.roadmap_nodes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE roadmaps.id = roadmap_nodes.roadmap_id 
      AND roadmaps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nodes in their own roadmaps" 
  ON public.roadmap_nodes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE roadmaps.id = roadmap_nodes.roadmap_id 
      AND roadmaps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes in their own roadmaps" 
  ON public.roadmap_nodes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE roadmaps.id = roadmap_nodes.roadmap_id 
      AND roadmaps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes in their own roadmaps" 
  ON public.roadmap_nodes 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.roadmaps 
      WHERE roadmaps.id = roadmap_nodes.roadmap_id 
      AND roadmaps.owner_id = auth.uid()
    )
  );

-- Create policies for forum_posts
CREATE POLICY "Anyone can view forum posts" 
  ON public.forum_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create forum posts" 
  ON public.forum_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum posts" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum posts" 
  ON public.forum_posts 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Create policies for forum_comments
CREATE POLICY "Anyone can view forum comments" 
  ON public.forum_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create forum comments" 
  ON public.forum_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own forum comments" 
  ON public.forum_comments 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own forum comments" 
  ON public.forum_comments 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Create policies for forum_likes
CREATE POLICY "Anyone can view forum likes" 
  ON public.forum_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create forum likes" 
  ON public.forum_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forum likes" 
  ON public.forum_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_id ON public.forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id ON public.forum_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post_id ON public.forum_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment_id ON public.forum_likes(comment_id);
