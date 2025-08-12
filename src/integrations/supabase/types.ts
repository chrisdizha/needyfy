export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          cost_usd: number | null
          created_at: string
          feature_type: string
          id: string
          input_data: Json | null
          output_data: Json | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          feature_type: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          feature_type?: string
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          base_price: number | null
          created_at: string
          end_date: string
          equipment_id: string
          equipment_title: string | null
          escrow_status: string | null
          hold_amount: number | null
          id: string
          owner_id: string
          payment_method: string | null
          platform_fee: number | null
          provider_fee: number | null
          release_schedule: string | null
          released_amount: number | null
          renter_fee: number | null
          scheduled_releases: Json | null
          start_date: string
          status: string
          stripe_connect_account_id: string | null
          stripe_session_id: string | null
          total_price: number
          user_id: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          end_date: string
          equipment_id: string
          equipment_title?: string | null
          escrow_status?: string | null
          hold_amount?: number | null
          id?: string
          owner_id: string
          payment_method?: string | null
          platform_fee?: number | null
          provider_fee?: number | null
          release_schedule?: string | null
          released_amount?: number | null
          renter_fee?: number | null
          scheduled_releases?: Json | null
          start_date: string
          status?: string
          stripe_connect_account_id?: string | null
          stripe_session_id?: string | null
          total_price: number
          user_id: string
        }
        Update: {
          base_price?: number | null
          created_at?: string
          end_date?: string
          equipment_id?: string
          equipment_title?: string | null
          escrow_status?: string | null
          hold_amount?: number | null
          id?: string
          owner_id?: string
          payment_method?: string | null
          platform_fee?: number | null
          provider_fee?: number | null
          release_schedule?: string | null
          released_amount?: number | null
          renter_fee?: number | null
          scheduled_releases?: Json | null
          start_date?: string
          status?: string
          stripe_connect_account_id?: string | null
          stripe_session_id?: string | null
          total_price?: number
          user_id?: string
        }
        Relationships: []
      }
      condition_verification_forms: {
        Row: {
          booking_id: string
          completed: boolean
          condition_notes: string | null
          condition_rating: number
          created_at: string
          damages_reported: string[] | null
          equipment_id: string
          equipment_title: string | null
          handover_type: string
          id: string
          photos: string[] | null
          provider_name: string | null
          provider_signature: string | null
          provider_signed_at: string | null
          renter_name: string
          renter_signature: string | null
          renter_signed_at: string | null
        }
        Insert: {
          booking_id: string
          completed?: boolean
          condition_notes?: string | null
          condition_rating: number
          created_at?: string
          damages_reported?: string[] | null
          equipment_id: string
          equipment_title?: string | null
          handover_type: string
          id?: string
          photos?: string[] | null
          provider_name?: string | null
          provider_signature?: string | null
          provider_signed_at?: string | null
          renter_name: string
          renter_signature?: string | null
          renter_signed_at?: string | null
        }
        Update: {
          booking_id?: string
          completed?: boolean
          condition_notes?: string | null
          condition_rating?: number
          created_at?: string
          damages_reported?: string[] | null
          equipment_id?: string
          equipment_title?: string | null
          handover_type?: string
          id?: string
          photos?: string[] | null
          provider_name?: string | null
          provider_signature?: string | null
          provider_signed_at?: string | null
          renter_name?: string
          renter_signature?: string | null
          renter_signed_at?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          against_user_id: string
          booking_id: string | null
          created_at: string
          id: string
          opened_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          against_user_id: string
          booking_id?: string | null
          created_at?: string
          id?: string
          opened_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          against_user_id?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          opened_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_documents: {
        Row: {
          date_uploaded: string
          doc_type: string
          equipment_id: string
          expiry_date: string | null
          file_name: string
          file_path: string
          id: string
          uploaded_by: string
        }
        Insert: {
          date_uploaded?: string
          doc_type: string
          equipment_id: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          id?: string
          uploaded_by: string
        }
        Update: {
          date_uploaded?: string
          doc_type?: string
          equipment_id?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      equipment_listings: {
        Row: {
          ai_generated_description: boolean | null
          ai_suggested_price: boolean | null
          availability_calendar: Json | null
          category: string
          created_at: string
          description: string
          id: string
          is_verified: boolean | null
          location: string
          owner_id: string
          photos: string[] | null
          price: number
          price_unit: string
          rating: number | null
          status: string
          terms_and_conditions: string | null
          title: string
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          ai_generated_description?: boolean | null
          ai_suggested_price?: boolean | null
          availability_calendar?: Json | null
          category: string
          created_at?: string
          description: string
          id?: string
          is_verified?: boolean | null
          location: string
          owner_id: string
          photos?: string[] | null
          price: number
          price_unit?: string
          rating?: number | null
          status?: string
          terms_and_conditions?: string | null
          title: string
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          ai_generated_description?: boolean | null
          ai_suggested_price?: boolean | null
          availability_calendar?: Json | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_verified?: boolean | null
          location?: string
          owner_id?: string
          photos?: string[] | null
          price?: number
          price_unit?: string
          rating?: number | null
          status?: string
          terms_and_conditions?: string | null
          title?: string
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      escrow_releases: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          failure_reason: string | null
          id: string
          metadata: Json | null
          release_type: string
          released_at: string | null
          scheduled_for: string | null
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          release_type: string
          released_at?: string | null
          scheduled_for?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          release_type?: string
          released_at?: string | null
          scheduled_for?: string | null
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_releases_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          category: string
          context: string | null
          created_at: string
          feedback: string
          id: string
          rating: number
          resolved: boolean | null
          resolved_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          category: string
          context?: string | null
          created_at?: string
          feedback: string
          id?: string
          rating: number
          resolved?: boolean | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          context?: string | null
          created_at?: string
          feedback?: string
          id?: string
          rating?: number
          resolved?: boolean | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_audit_log: {
        Row: {
          action: string
          amount: number | null
          booking_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          payment_method: string | null
          stripe_session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          payment_method?: string | null
          stripe_session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          amount?: number | null
          booking_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          payment_method?: string | null
          stripe_session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          booking_ids: string[] | null
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          metadata: Json | null
          payout_method: string
          processed_at: string | null
          provider_id: string
          status: string
          visa_card_last_four: string | null
          visa_transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_ids?: string[] | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payout_method?: string
          processed_at?: string | null
          provider_id: string
          status?: string
          visa_card_last_four?: string | null
          visa_transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_ids?: string[] | null
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          payout_method?: string
          processed_at?: string | null
          provider_id?: string
          status?: string
          visa_card_last_four?: string | null
          visa_transaction_id?: string | null
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          points: number
          reason: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          points: number
          reason: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          points?: number
          reason?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          minimum_payout_amount: number | null
          payout_method: string | null
          payout_schedule: string | null
          phone: string | null
          suspended: boolean
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string | null
          visa_card_holder_name: string | null
          visa_card_last_four: string | null
          visa_card_number_encrypted: string | null
          visa_card_verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          minimum_payout_amount?: number | null
          payout_method?: string | null
          payout_schedule?: string | null
          phone?: string | null
          suspended?: boolean
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          visa_card_holder_name?: string | null
          visa_card_last_four?: string | null
          visa_card_number_encrypted?: string | null
          visa_card_verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          minimum_payout_amount?: number | null
          payout_method?: string | null
          payout_schedule?: string | null
          phone?: string | null
          suspended?: boolean
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          visa_card_holder_name?: string | null
          visa_card_last_four?: string | null
          visa_card_number_encrypted?: string | null
          visa_card_verified?: boolean | null
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_granted: boolean
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_granted?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_granted?: boolean
          status?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reported_listing_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reported_listing_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          content: string
          context: string | null
          created_at: string
          equipment_id: string | null
          id: string
          is_featured: boolean | null
          rating: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          context?: string | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_featured?: boolean | null
          rating: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          context?: string | null
          created_at?: string
          equipment_id?: string | null
          id?: string
          is_featured?: boolean | null
          rating?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          risk_level: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      terms_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          template_content: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          template_content: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          template_content?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_profile: {
        Args: { target_user_id: string }
        Returns: {
          id: string
          full_name: string
          phone: string
          avatar_url: string
          suspended: boolean
          suspension_reason: string
          suspended_at: string
          visa_card_verified: boolean
          minimum_payout_amount: number
          payout_method: string
          payout_schedule: string
          updated_at: string
          visa_card_number_encrypted: string
          visa_card_last_four: string
          visa_card_holder_name: string
        }[]
      }
      award_points: {
        Args: {
          p_user_id: string
          p_points: number
          p_reason: string
          p_source?: string
        }
        Returns: string
      }
      calculate_escrow_schedule: {
        Args: {
          p_booking_id: string
          p_total_amount: number
          p_start_date: string
          p_end_date: string
        }
        Returns: Json
      }
      create_automatic_payout: {
        Args: { provider_user_id: string }
        Returns: string
      }
      create_test_notification: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_feedback_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          full_name: string
          phone: string
          avatar_url: string
          suspended: boolean
          suspension_reason: string
          suspended_at: string
          visa_card_verified: boolean
          minimum_payout_amount: number
          payout_method: string
          payout_schedule: string
          updated_at: string
        }[]
      }
      get_provider_escrow_balance: {
        Args: { provider_user_id: string }
        Returns: {
          total_held: number
          pending_releases: number
          available_for_payout: number
        }[]
      }
      get_provider_pending_earnings: {
        Args: { provider_user_id: string }
        Returns: number
      }
      get_referrer_by_code: {
        Args: { p_code: string }
        Returns: string
      }
      get_secure_user_profile_summary: {
        Args: { target_user_id?: string }
        Returns: {
          id: string
          full_name: string
          phone: string
          suspended: boolean
          suspension_reason: string
          suspended_at: string
        }[]
      }
      get_unread_count: {
        Args: { p_user_id?: string }
        Returns: number
      }
      get_user_points_total: {
        Args: { _user_id?: string }
        Returns: number
      }
      get_user_roles: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_table_name?: string
          p_record_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      log_payment_action: {
        Args: {
          p_user_id: string
          p_booking_id: string
          p_action: string
          p_amount?: number
          p_payment_method?: string
          p_stripe_session_id?: string
          p_metadata?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_risk_level?: string
        }
        Returns: string
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type?: string
          p_data?: Json
          p_expires_at?: string
        }
        Returns: string
      }
      setup_escrow_releases: {
        Args: { p_booking_id: string }
        Returns: undefined
      }
      validate_admin_action: {
        Args: { action_type: string; target_user_id?: string }
        Returns: boolean
      }
      validate_payment_operation: {
        Args: { p_user_id: string; p_operation: string; p_amount?: number }
        Returns: boolean
      }
      validate_security_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          details: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
