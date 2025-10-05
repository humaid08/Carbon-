export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assistants: {
        Row: {
          created_at: string | null
          description: string | null
          first_message: string | null
          id: string
          is_active: boolean | null
          model: string | null
          name: string
          owner_id: string | null
          preset_type: Database["public"]["Enums"]["assistant_preset"] | null
          prompt: string | null
          temperature: number | null
          updated_at: string | null
          vapi_assistant_id: string | null
          voice_id: string | null
          voice_provider: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          first_message?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name: string
          owner_id?: string | null
          preset_type?: Database["public"]["Enums"]["assistant_preset"] | null
          prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          vapi_assistant_id?: string | null
          voice_id?: string | null
          voice_provider?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          first_message?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name?: string
          owner_id?: string | null
          preset_type?: Database["public"]["Enums"]["assistant_preset"] | null
          prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          vapi_assistant_id?: string | null
          voice_id?: string | null
          voice_provider?: string | null
        }
        Relationships: []
      }
      call_events: {
        Row: {
          call_id: string | null
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          timestamp: string | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          timestamp?: string | null
        }
        Update: {
          call_id?: string | null
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_events_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          ai_summary: string | null
          assistant_id: string | null
          caller_name: string | null
          cost: number | null
          created_at: string | null
          direction: Database["public"]["Enums"]["call_direction"] | null
          duration: number | null
          end_time: string | null
          id: string
          lead_id: string | null
          owner_id: string | null
          phone_number: string | null
          recording_url: string | null
          sentiment: Database["public"]["Enums"]["sentiment_type"] | null
          start_time: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          transcript: string | null
          updated_at: string | null
          vapi_call_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          assistant_id?: string | null
          caller_name?: string | null
          cost?: number | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration?: number | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          phone_number?: string | null
          recording_url?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          transcript?: string | null
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          assistant_id?: string | null
          caller_name?: string | null
          cost?: number | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration?: number | null
          end_time?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          phone_number?: string | null
          recording_url?: string | null
          sentiment?: Database["public"]["Enums"]["sentiment_type"] | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          transcript?: string | null
          updated_at?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          channel: string | null
          created_at: string | null
          direction: string | null
          id: string
          lead_id: string | null
          message: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          lead_id?: string | null
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          scheduled_at: string | null
          status: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget: string | null
          budget_range: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          interest: string | null
          name: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          source: Database["public"]["Enums"]["lead_source"] | null
          status: string | null
          tags: string[] | null
          timeline: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: string | null
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          source?: Database["public"]["Enums"]["lead_source"] | null
          status?: string | null
          tags?: string[] | null
          timeline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id: string
          name: string
        }
        Insert: {
          email?: string
          id?: string
          name?: string
        }
        Update: {
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      assistant_preset:
        | "sales"
        | "support"
        | "appointment"
        | "survey"
        | "custom"
      call_direction: "inbound" | "outbound"
      call_status:
        | "queued"
        | "ringing"
        | "in-progress"
        | "completed"
        | "failed"
        | "missed"
      lead_priority: "low" | "medium" | "high"
      lead_source: "phone" | "chat" | "email" | "web"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      sentiment_type: "positive" | "neutral" | "negative"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      assistant_preset: ["sales", "support", "appointment", "survey", "custom"],
      call_direction: ["inbound", "outbound"],
      call_status: [
        "queued",
        "ringing",
        "in-progress",
        "completed",
        "failed",
        "missed",
      ],
      lead_priority: ["low", "medium", "high"],
      lead_source: ["phone", "chat", "email", "web"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      sentiment_type: ["positive", "neutral", "negative"],
    },
  },
} as const
