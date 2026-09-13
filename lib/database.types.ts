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
      account_onboarding_requests: {
        Row: {
          account_kind: string
          completed_at: string
          created_at: string
          organization_id: number
          organization_name: string
          profile_name: string
          user_id: string
        }
        Insert: {
          account_kind: string
          completed_at: string
          created_at?: string
          organization_id: number
          organization_name: string
          profile_name: string
          user_id: string
        }
        Update: {
          account_kind?: string
          completed_at?: string
          created_at?: string
          organization_id?: number
          organization_name?: string
          profile_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_onboarding_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_public_id: string | null
          entity_type: string
          id: number
          organization_id: number | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_public_id?: string | null
          entity_type: string
          id?: never
          organization_id?: number | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_public_id?: string | null
          entity_type?: string
          id?: never
          organization_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creatives: {
        Row: {
          campaign_id: number
          created_at: string
          creative_id: number
          is_primary: boolean
        }
        Insert: {
          campaign_id: number
          created_at?: string
          creative_id: number
          is_primary?: boolean
        }
        Update: {
          campaign_id?: number
          created_at?: string
          creative_id?: number
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creatives_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_daily_stats: {
        Row: {
          campaign_id: number
          estimated_reach: number
          online_minutes: number
          plays: number
          screen_id: number
          stat_date: string
          updated_at: string
        }
        Insert: {
          campaign_id: number
          estimated_reach?: number
          online_minutes?: number
          plays?: number
          screen_id: number
          stat_date: string
          updated_at?: string
        }
        Update: {
          campaign_id?: number
          estimated_reach?: number
          online_minutes?: number
          plays?: number
          screen_id?: number
          stat_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_daily_stats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_daily_stats_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_screens: {
        Row: {
          campaign_id: number
          contracted_plays: number
          created_at: string
          id: number
          plays_per_hour: number
          screen_id: number
          unit_price: number
        }
        Insert: {
          campaign_id: number
          contracted_plays?: number
          created_at?: string
          id?: never
          plays_per_hour: number
          screen_id: number
          unit_price?: number
        }
        Update: {
          campaign_id?: number
          contracted_plays?: number
          created_at?: string
          id?: never
          plays_per_hour?: number
          screen_id?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_screens_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_screens_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_organization_id: number
          approved_at: string | null
          budget_amount: number
          created_at: string
          created_by: string | null
          currency: string
          end_date: string
          id: number
          name: string
          objective: string
          paid_at: string | null
          public_id: string
          start_date: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          advertiser_organization_id: number
          approved_at?: string | null
          budget_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date: string
          id?: never
          name: string
          objective: string
          paid_at?: string | null
          public_id?: string
          start_date: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          advertiser_organization_id?: number
          approved_at?: string | null
          budget_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          end_date?: string
          id?: never
          name?: string
          objective?: string
          paid_at?: string | null
          public_id?: string
          start_date?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_organization_id_fkey"
            columns: ["advertiser_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          advertiser_organization_id: number
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          file_size_bytes: number
          height: number | null
          id: number
          media_type: string
          mime_type: string
          moderation_status: string
          name: string
          public_id: string
          rejection_reason: string | null
          storage_path: string
          updated_at: string
          width: number | null
        }
        Insert: {
          advertiser_organization_id: number
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          file_size_bytes: number
          height?: number | null
          id?: never
          media_type: string
          mime_type: string
          moderation_status?: string
          name: string
          public_id?: string
          rejection_reason?: string | null
          storage_path: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          advertiser_organization_id?: number
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number
          height?: number | null
          id?: never
          media_type?: string
          mime_type?: string
          moderation_status?: string
          name?: string
          public_id?: string
          rejection_reason?: string | null
          storage_path?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_advertiser_organization_id_fkey"
            columns: ["advertiser_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_heartbeats: {
        Row: {
          downloaded_content_count: number
          free_storage_bytes: number | null
          id: number
          is_online: boolean
          metadata: Json
          player_version: string | null
          received_at: string
          screen_id: number
        }
        Insert: {
          downloaded_content_count?: number
          free_storage_bytes?: number | null
          id?: never
          is_online: boolean
          metadata?: Json
          player_version?: string | null
          received_at?: string
          screen_id: number
        }
        Update: {
          downloaded_content_count?: number
          free_storage_bytes?: number | null
          id?: never
          is_online?: boolean
          metadata?: Json
          player_version?: string | null
          received_at?: string
          screen_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "device_heartbeats_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reviews: {
        Row: {
          created_at: string
          creative_id: number
          decision: string
          id: number
          notes: string | null
          reviewer_id: string | null
        }
        Insert: {
          created_at?: string
          creative_id: number
          decision: string
          id?: never
          notes?: string | null
          reviewer_id?: string | null
        }
        Update: {
          created_at?: string
          creative_id?: number
          decision?: string
          id?: never
          notes?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_reviews_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: number
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: number
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          document: string | null
          id: number
          kind: string
          name: string
          public_id: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          id?: never
          kind: string
          name: string
          public_id?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          id?: never
          kind?: string
          name?: string
          public_id?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      partner_statements: {
        Row: {
          created_at: string
          gross_media_revenue: number
          id: number
          paid_at: string | null
          partner_organization_id: number
          partner_share_amount: number
          period_end: string
          period_start: string
          public_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gross_media_revenue?: number
          id?: never
          paid_at?: string | null
          partner_organization_id: number
          partner_share_amount?: number
          period_end: string
          period_start: string
          public_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gross_media_revenue?: number
          id?: never
          paid_at?: string | null
          partner_organization_id?: number
          partner_share_amount?: number
          period_end?: string
          period_start?: string
          public_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_statements_partner_organization_id_fkey"
            columns: ["partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          advertiser_organization_id: number
          amount: number
          campaign_id: number | null
          created_at: string
          currency: string
          id: number
          paid_at: string | null
          provider: string
          provider_reference: string | null
          public_id: string
          status: string
          updated_at: string
        }
        Insert: {
          advertiser_organization_id: number
          amount: number
          campaign_id?: number | null
          created_at?: string
          currency?: string
          id?: never
          paid_at?: string | null
          provider: string
          provider_reference?: string | null
          public_id?: string
          status: string
          updated_at?: string
        }
        Update: {
          advertiser_organization_id?: number
          amount?: number
          campaign_id?: number | null
          created_at?: string
          currency?: string
          id?: never
          paid_at?: string | null
          provider?: string
          provider_reference?: string | null
          public_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_advertiser_organization_id_fkey"
            columns: ["advertiser_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      play_events: {
        Row: {
          campaign_id: number
          creative_id: number
          duration_seconds: number
          event_id: string
          id: number
          played_at: string
          proof_hash: string | null
          received_at: string
          screen_id: number
        }
        Insert: {
          campaign_id: number
          creative_id: number
          duration_seconds: number
          event_id?: string
          id?: never
          played_at: string
          proof_hash?: string | null
          received_at?: string
          screen_id: number
        }
        Update: {
          campaign_id?: number
          creative_id?: number
          duration_seconds?: number
          event_id?: string
          id?: never
          played_at?: string
          proof_hash?: string | null
          received_at?: string
          screen_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "play_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_events_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_events_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          full_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          full_name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screens: {
        Row: {
          ad_slots_per_hour: number
          created_at: string
          device_code: string
          id: number
          last_seen_at: string | null
          last_sync_at: string | null
          name: string
          operating_hours_per_day: number
          orientation: string
          player_version: string | null
          public_id: string
          resolution_height: number
          resolution_width: number
          status: string
          updated_at: string
          venue_id: number
        }
        Insert: {
          ad_slots_per_hour?: number
          created_at?: string
          device_code: string
          id?: never
          last_seen_at?: string | null
          last_sync_at?: string | null
          name: string
          operating_hours_per_day?: number
          orientation?: string
          player_version?: string | null
          public_id?: string
          resolution_height?: number
          resolution_width?: number
          status?: string
          updated_at?: string
          venue_id: number
        }
        Update: {
          ad_slots_per_hour?: number
          created_at?: string
          device_code?: string
          id?: never
          last_seen_at?: string | null
          last_sync_at?: string | null
          name?: string
          operating_hours_per_day?: number
          orientation?: string
          player_version?: string | null
          public_id?: string
          resolution_height?: number
          resolution_width?: number
          status?: string
          updated_at?: string
          venue_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "screens_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          id: number
          opened_by: string | null
          organization_id: number
          priority: string
          public_id: string
          resolved_at: string | null
          screen_id: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: never
          opened_by?: string | null
          organization_id: number
          priority?: string
          public_id?: string
          resolved_at?: string | null
          screen_id?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: never
          opened_by?: string | null
          organization_id?: number
          priority?: string
          public_id?: string
          resolved_at?: string | null
          screen_id?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_screen_id_fkey"
            columns: ["screen_id"]
            isOneToOne: false
            referencedRelation: "screens"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address_line: string
          approval_status: string
          category: string
          city: string
          created_at: string
          daily_flow_estimate: number
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string
          partner_organization_id: number
          postal_code: string | null
          public_id: string
          state_code: string
          updated_at: string
          weekday_close: string | null
          weekday_open: string | null
        }
        Insert: {
          address_line: string
          approval_status?: string
          category: string
          city: string
          created_at?: string
          daily_flow_estimate?: number
          id?: never
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood: string
          partner_organization_id: number
          postal_code?: string | null
          public_id?: string
          state_code: string
          updated_at?: string
          weekday_close?: string | null
          weekday_open?: string | null
        }
        Update: {
          address_line?: string
          approval_status?: string
          category?: string
          city?: string
          created_at?: string
          daily_flow_estimate?: number
          id?: never
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string
          partner_organization_id?: number
          postal_code?: string | null
          public_id?: string
          state_code?: string
          updated_at?: string
          weekday_close?: string | null
          weekday_open?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_partner_organization_id_fkey"
            columns: ["partner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
    Enums: {},
  },
} as const

