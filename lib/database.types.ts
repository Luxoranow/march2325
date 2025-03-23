export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string
          event_type: string
          card_id: string
          user_id: string | null
          visitor_id: string
          timestamp: string
          referrer: string | null
          interaction_type: string | null
          element_id: string | null
          element_value: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          event_type: string
          card_id: string
          user_id?: string | null
          visitor_id: string
          timestamp?: string
          referrer?: string | null
          interaction_type?: string | null
          element_id?: string | null
          element_value?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          card_id?: string
          user_id?: string | null
          visitor_id?: string
          timestamp?: string
          referrer?: string | null
          interaction_type?: string | null
          element_id?: string | null
          element_value?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_card_id_fkey"
            columns: ["card_id"]
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cards: {
        Row: {
          id: string
          user_id: string
          name: string
          data: Json
          is_template: boolean
          created_at: string
          updated_at: string
          views_count: number
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          data: Json
          is_template?: boolean
          created_at?: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          data?: Json
          is_template?: boolean
          created_at?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "cards_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_end: string | null
          quantity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_end?: string | null
          quantity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_end?: string | null
          quantity?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_card_views: {
        Args: { card_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 