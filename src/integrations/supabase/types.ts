export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_edges: {
        Row: {
          created_at: string | null
          id: string
          roadmap_id: string | null
          source_node_id: string | null
          target_node_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          roadmap_id?: string | null
          source_node_id?: string | null
          target_node_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          roadmap_id?: string | null
          source_node_id?: string | null
          target_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_edges_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "roadmap_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "roadmap_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_nodes: {
        Row: {
          bgcolor: string | null
          created_at: string | null
          description: string | null
          fontcolor: string | null
          id: string
          order: number | null
          position_x: number
          position_y: number
          resource: string | null
          roadmap_id: string
          title: string
          type: string
        }
        Insert: {
          bgcolor?: string | null
          created_at?: string | null
          description?: string | null
          fontcolor?: string | null
          id?: string
          order?: number | null
          position_x: number
          position_y: number
          resource?: string | null
          roadmap_id: string
          title: string
          type: string
        }
        Update: {
          bgcolor?: string | null
          created_at?: string | null
          description?: string | null
          fontcolor?: string | null
          id?: string
          order?: number | null
          position_x?: number
          position_y?: number
          resource?: string | null
          roadmap_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_nodes_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string | null
          description: string | null
          forked_from_id: string | null
          id: string
          is_public: boolean
          owner_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          forked_from_id?: string | null
          id?: string
          is_public?: boolean
          owner_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          forked_from_id?: string | null
          id?: string
          is_public?: boolean
          owner_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roadmap_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          node_id: string
          roadmap_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          node_id: string
          roadmap_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          node_id?: string
          roadmap_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roadmap_progress_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "roadmap_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roadmap_progress_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
