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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          body: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          employee_id: string | null
          id: string
          lead_id: string | null
          occurred_at: string
          opportunity_id: string | null
          subject: string
        }
        Insert: {
          activity_type?: string
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          lead_id?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          subject: string
        }
        Update: {
          activity_type?: string
          body?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          lead_id?: string | null
          occurred_at?: string
          opportunity_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
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
      admin_notifications: {
        Row: {
          body: string | null
          created_at: string
          employee_id: string
          id: string
          link: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          employee_id: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          category: string
          id: string
          key: string
          label: string
        }
        Insert: {
          category: string
          id?: string
          key: string
          label: string
        }
        Update: {
          category?: string
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "admin_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
        }
        Relationships: []
      }
      admin_saved_views: {
        Row: {
          created_at: string
          employee_id: string
          filters: Json
          id: string
          module: string
          name: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          filters?: Json
          id?: string
          module: string
          name: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          filters?: Json
          id?: string
          module?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_saved_views_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          created_at: string
          employee_id: string | null
          id: string
          metadata: Json
          module: string
          record_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          metadata?: Json
          module: string
          record_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          metadata?: Json
          module?: string
          record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      avatar_consult_calls: {
        Row: {
          call_attempts: number
          created_at: string
          duration_minutes: number
          focus: string
          id: string
          last_call_at: string | null
          last_error: string | null
          phone_number: string | null
          provider_call_id: string | null
          scheduled_at: string | null
          status: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          call_attempts?: number
          created_at?: string
          duration_minutes?: number
          focus?: string
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          provider_call_id?: string | null
          scheduled_at?: string | null
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          call_attempts?: number
          created_at?: string
          duration_minutes?: number
          focus?: string
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          provider_call_id?: string | null
          scheduled_at?: string | null
          status?: string
          timezone?: string
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
      campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          owner_employee_id: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          owner_employee_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          owner_employee_id?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_owner_employee_id_fkey"
            columns: ["owner_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          assigned_employee_id: string | null
          company_size: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_employee_id?: string | null
          company_size?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_employee_id?: string | null
          company_size?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      contacts: {
        Row: {
          assigned_employee_id: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          lead_source: string | null
          notes: string | null
          phone: string | null
          position: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      employees: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          is_super_admin: boolean
          joining_date: string | null
          name: string
          phone: string | null
          role_id: string | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          is_super_admin?: boolean
          joining_date?: string | null
          name: string
          phone?: string | null
          role_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean
          joining_date?: string | null
          name?: string
          phone?: string | null
          role_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
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
      journey_books: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          license_status: string
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          license_status?: string
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          license_status?: string
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      journey_chapters: {
        Row: {
          book_id: string
          created_at: string
          id: string
          number: number
          sequence: number
          title: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          number: number
          sequence?: number
          title: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          number?: number
          sequence?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "journey_books"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          item_id: string | null
          metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          item_id?: string | null
          metadata?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          item_id?: string | null
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "journey_items"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_items: {
        Row: {
          completed_at: string | null
          confidence: number
          created_at: string
          id: string
          last_reminder_at: string | null
          reason_codes: string[]
          relevance_note: string | null
          reminder_count: number
          section_id: string
          sent_at: string | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence?: number
          created_at?: string
          id?: string
          last_reminder_at?: string | null
          reason_codes?: string[]
          relevance_note?: string | null
          reminder_count?: number
          section_id: string
          sent_at?: string | null
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confidence?: number
          created_at?: string
          id?: string
          last_reminder_at?: string | null
          reason_codes?: string[]
          relevance_note?: string | null
          reminder_count?: number
          section_id?: string
          sent_at?: string | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "journey_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_preferences: {
        Row: {
          channels: Json
          created_at: string
          frequency: string
          paused: boolean
          personalization_enabled: boolean
          topics: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: Json
          created_at?: string
          frequency?: string
          paused?: boolean
          personalization_enabled?: boolean
          topics?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: Json
          created_at?: string
          frequency?: string
          paused?: boolean
          personalization_enabled?: boolean
          topics?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journey_sections: {
        Row: {
          book_id: string
          chapter_id: string
          content: string
          created_at: string
          estimated_minutes: number
          has_audio: boolean
          id: string
          is_approved: boolean
          number: number
          sequence: number
          source_locator: string | null
          tags: string[]
          theme: string | null
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          book_id: string
          chapter_id: string
          content: string
          created_at?: string
          estimated_minutes?: number
          has_audio?: boolean
          id?: string
          is_approved?: boolean
          number: number
          sequence?: number
          source_locator?: string | null
          tags?: string[]
          theme?: string | null
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          book_id?: string
          chapter_id?: string
          content?: string
          created_at?: string
          estimated_minutes?: number
          has_audio?: boolean
          id?: string
          is_approved?: boolean
          number?: number
          sequence?: number
          source_locator?: string | null
          tags?: string[]
          theme?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_sections_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "journey_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_sections_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "journey_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_signals: {
        Row: {
          confidence: number
          created_at: string
          evidence: Json
          frequency: number
          id: string
          last_observed_at: string
          signal_key: string
          signal_type: string
          signal_value: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          evidence?: Json
          frequency?: number
          id?: string
          last_observed_at?: string
          signal_key: string
          signal_type: string
          signal_value?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          evidence?: Json
          frequency?: number
          id?: string
          last_observed_at?: string
          signal_key?: string
          signal_type?: string
          signal_value?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_employee_id: string | null
          campaign_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          last_activity_at: string | null
          name: string
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          priority: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          campaign_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          campaign_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_leads: {
        Row: {
          assigned_employee_id: string | null
          campaign_id: string | null
          converted: boolean
          created_at: string
          id: string
          lead_id: string | null
          medium: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          campaign_id?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          lead_id?: string | null
          medium?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          campaign_id?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          lead_id?: string | null
          medium?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_leads_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation_settings: {
        Row: {
          call_attempts: number
          call_token: string
          created_at: string
          duration_minutes: number
          id: string
          last_call_at: string | null
          last_error: string | null
          phone_number: string | null
          provider_call_id: string | null
          scheduled_at: string | null
          script: Json | null
          status: string
          timezone: string
          updated_at: string
          user_id: string
          voice_enabled: boolean
        }
        Insert: {
          call_attempts?: number
          call_token?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          provider_call_id?: string | null
          scheduled_at?: string | null
          script?: Json | null
          status?: string
          timezone?: string
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
        }
        Update: {
          call_attempts?: number
          call_token?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          phone_number?: string | null
          provider_call_id?: string | null
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
      opportunities: {
        Row: {
          assigned_employee_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          lead_id: string | null
          name: string
          notes: string | null
          probability: number
          stage: string
          updated_at: string
          value: number
        }
        Insert: {
          assigned_employee_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          name: string
          notes?: string | null
          probability?: number
          stage?: string
          updated_at?: string
          value?: number
        }
        Update: {
          assigned_employee_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          notes?: string | null
          probability?: number
          stage?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
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
      tasks: {
        Row: {
          assigned_employee_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          opportunity_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
    }
    Functions: {
      admin_has_perm: {
        Args: { _perm: string; _user: string }
        Returns: boolean
      }
      claim_super_admin_if_none: { Args: never; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_public_feedback: {
        Args: { _limit?: number }
        Returns: {
          created_at: string
          id: string
          improved: string
          paid: string
          recommend: string
          suggestions: string
        }[]
      }
      get_published_stories: {
        Args: never
        Returns: {
          action_taken: string
          advice: string
          audio_url: string
          category: string
          created_at: string
          fear: string
          id: string
          is_published: boolean
          lesson: string
          moderation_status: string
          outcome: string
          pseudonym: string
          situation: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_staff: { Args: { _user: string }; Returns: boolean }
      is_super_admin: { Args: { _user: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      my_admin_context: { Args: never; Returns: Json }
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
      employee_status: "active" | "inactive"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      employee_status: ["active", "inactive"],
    },
  },
} as const
