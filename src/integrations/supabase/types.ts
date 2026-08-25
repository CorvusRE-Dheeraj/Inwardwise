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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      avatar_answers: {
        Row: {
          answer_text: string
          dimension_number: number
          id: string
          question_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_text?: string
          dimension_number: number
          id?: string
          question_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_text?: string
          dimension_number?: number
          id?: string
          question_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avatar_dimensions: {
        Row: {
          dimension_number: number
          id: string
          progress_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          dimension_number: number
          id?: string
          progress_pct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          dimension_number?: number
          id?: string
          progress_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avatar_profiles: {
        Row: {
          created_at: string
          last_active_at: string
          phone_number: string | null
          pin_hash: string | null
          pin_salt: string | null
          scheduled_call_at: string | null
          session_minutes: number
          timezone: string | null
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          created_at?: string
          last_active_at?: string
          phone_number?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          scheduled_call_at?: string | null
          session_minutes?: number
          timezone?: string | null
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          created_at?: string
          last_active_at?: string
          phone_number?: string | null
          pin_hash?: string | null
          pin_salt?: string | null
          scheduled_call_at?: string | null
          session_minutes?: number
          timezone?: string | null
          user_id?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      connect_group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          pseudonym: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          pseudonym?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          pseudonym?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "connect_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_groups: {
        Row: {
          category: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          max_members: number
          moderation_status: string
          starts_at: string | null
          status: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_members?: number
          moderation_status?: string
          starts_at?: string | null
          status?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_members?: number
          moderation_status?: string
          starts_at?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      connect_insights: {
        Row: {
          aggregate_insight: string | null
          created_at: string
          id: string
          prompt_id: string
          reading_body: string | null
          reading_title: string | null
          reflection: string
          user_id: string
        }
        Insert: {
          aggregate_insight?: string | null
          created_at?: string
          id?: string
          prompt_id: string
          reading_body?: string | null
          reading_title?: string | null
          reflection: string
          user_id: string
        }
        Update: {
          aggregate_insight?: string | null
          created_at?: string
          id?: string
          prompt_id?: string
          reading_body?: string | null
          reading_title?: string | null
          reflection?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_insights_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "connect_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_prompts: {
        Row: {
          category: string | null
          created_at: string
          id: string
          prompt_text: string
          risk_flag: string | null
          status: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          prompt_text: string
          risk_flag?: string | null
          status?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          prompt_text?: string
          risk_flag?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      connect_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_user_id: string
          status: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      connect_stories: {
        Row: {
          action_taken: string | null
          advice: string | null
          audio_url: string | null
          category: string
          created_at: string
          fear: string | null
          id: string
          is_published: boolean
          lesson: string | null
          moderation_status: string
          outcome: string | null
          owner_user_id: string | null
          pseudonym: string
          situation: string
        }
        Insert: {
          action_taken?: string | null
          advice?: string | null
          audio_url?: string | null
          category: string
          created_at?: string
          fear?: string | null
          id?: string
          is_published?: boolean
          lesson?: string | null
          moderation_status?: string
          outcome?: string | null
          owner_user_id?: string | null
          pseudonym?: string
          situation: string
        }
        Update: {
          action_taken?: string | null
          advice?: string | null
          audio_url?: string | null
          category?: string
          created_at?: string
          fear?: string | null
          id?: string
          is_published?: boolean
          lesson?: string | null
          moderation_status?: string
          outcome?: string | null
          owner_user_id?: string | null
          pseudonym?: string
          situation?: string
        }
        Relationships: []
      }
      connect_story_calls: {
        Row: {
          category: string
          created_at: string
          id: string
          last_call_at: string | null
          last_error: string | null
          phone_number: string
          provider_call_id: string | null
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number: string
          provider_call_id?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string
          provider_call_id?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          author_name: string | null
          created_at: string
          id: string
          improved: string | null
          paid: string | null
          recommend: string | null
          suggestions: string | null
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          id?: string
          improved?: string | null
          paid?: string | null
          recommend?: string | null
          suggestions?: string | null
        }
        Update: {
          author_name?: string | null
          created_at?: string
          id?: string
          improved?: string | null
          paid?: string | null
          recommend?: string | null
          suggestions?: string | null
        }
        Relationships: []
      }
      meditation_settings: {
        Row: {
          call_token: string
          created_at: string
          duration_minutes: number
          id: string
          last_call_at: string | null
          last_error: string | null
          phone_number: string | null
          scheduled_at: string | null
          script: Json | null
          status: string
          timezone: string
          updated_at: string
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          call_token?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          scheduled_at?: string | null
          script?: Json | null
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          call_token?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          scheduled_at?: string | null
          script?: Json | null
          status?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
        }
        Relationships: []
      }
      private_dimensions: {
        Row: {
          enemy: string
          shadow: string
          updated_at: string
          user_id: string
        }
        Insert: {
          enemy?: string
          shadow?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          enemy?: string
          shadow?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_feedback: {
        Row: {
          created_at: string | null
          id: string | null
          improved: string | null
          paid: string | null
          recommend: string | null
          suggestions: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          improved?: string | null
          paid?: string | null
          recommend?: string | null
          suggestions?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          improved?: string | null
          paid?: string | null
          recommend?: string | null
          suggestions?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
