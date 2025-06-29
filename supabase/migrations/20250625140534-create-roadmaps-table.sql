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

-- Enable Row Level Security
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_nodes ENABLE ROW LEVEL SECURITY;

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