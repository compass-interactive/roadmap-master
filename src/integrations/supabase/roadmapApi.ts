import { supabase } from "./client";
import type { Database } from "./types";
import type { RoadmapEdge, RoadmapEdgeInsert } from './types';

// Types
type Roadmap = Database["public"]["Tables"]["roadmaps"]["Row"];
type RoadmapNode = Database["public"]["Tables"]["roadmap_nodes"]["Row"];
type RoadmapInsert = Database["public"]["Tables"]["roadmaps"]["Insert"];
type RoadmapNodeInsert = Database["public"]["Tables"]["roadmap_nodes"]["Insert"];

// Fetch a roadmap by ID
export async function fetchRoadmap(roadmapId: string) {
  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .single();
  if (error) throw error;
  return data;
}

// Fetch all nodes for a roadmap
export async function fetchRoadmapNodes(roadmapId: string) {
  const { data, error } = await supabase
    .from("roadmap_nodes")
    .select("*")
    .eq("roadmap_id", roadmapId);
  if (error) throw error;
  return data;
}

// Create a new roadmap
export async function createRoadmap(roadmap: RoadmapInsert) {
  const { data, error } = await supabase
    .from("roadmaps")
    .insert([roadmap])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Add a node to a roadmap
export async function createRoadmapNode(node: RoadmapNodeInsert) {
  const { data, error } = await supabase
    .from("roadmap_nodes")
    .insert([node])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update a roadmap
export async function updateRoadmap(id: string, updates: Partial<Roadmap>) {
  const { data, error } = await supabase
    .from("roadmaps")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update a node
export async function updateRoadmapNode(id: string, updates: Partial<RoadmapNode>) {
  const { data, error } = await supabase
    .from("roadmap_nodes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete a roadmap (and optionally its nodes)
export async function deleteRoadmap(id: string) {
  // Optionally, delete nodes first (if not using ON DELETE CASCADE)
  await supabase.from("roadmap_nodes").delete().eq("roadmap_id", id);
  const { error } = await supabase.from("roadmaps").delete().eq("id", id);
  if (error) throw error;
}

// Delete a node
export async function deleteRoadmapNode(id: string) {
  const { error } = await supabase.from("roadmap_nodes").delete().eq("id", id);
  if (error) throw error;
}

// Fetch all roadmaps for a user
export async function fetchUserRoadmaps(userId: string) {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Fetch all public roadmaps from all users
export async function fetchAllPublicRoadmaps() {
  try {
    // Simple approach: just fetch all roadmaps that are public
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching public roadmaps:', error);
      // If there's an error, try fetching all roadmaps without the public filter
      const { data: allData, error: allError } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) {
        console.error('Error fetching all roadmaps:', allError);
        throw allError;
      }
      
      console.log('Fetched all roadmaps (no public filter):', allData);
      return allData || [];
    }
    
    console.log('Fetched public roadmaps:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllPublicRoadmaps:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Debug function to check if roadmaps table exists and has data
export async function debugRoadmapsTable() {
  try {
    // Check if we can fetch any roadmaps at all
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .limit(5);
    
    console.log('Debug - All roadmaps:', data);
    console.log('Debug - Error:', error);
    
    if (error) {
      console.error('Error accessing roadmaps table:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Debug - Exception:', error);
    return null;
  }
}

// Fetch all edges for a roadmap
export async function fetchRoadmapEdges(roadmapId: string) {
  const { data, error } = await supabase
    .from('roadmap_edges')
    .select('*')
    .eq('roadmap_id', roadmapId);
  if (error) throw error;
  return data;
}

// Create a new edge
export async function createRoadmapEdge(edge: RoadmapEdgeInsert) {
  const { data, error } = await supabase
    .from('roadmap_edges')
    .insert([edge])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete an edge
export async function deleteRoadmapEdge(id: string) {
  const { error } = await supabase
    .from('roadmap_edges')
    .delete()
    .eq('id', id);
  if (error) throw error;
}