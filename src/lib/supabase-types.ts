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
      access_requests: {
        Row: {
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requester_id: string
          status: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      affiliate_settings: {
        Row: {
          active: boolean
          created_at: string
          id: string
          platform: string
          settings: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          platform: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          platform?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      group_purchase_contributions: {
        Row: {
          amount: number
          contributor_id: string
          created_at: string
          id: string
          item_id: string
          show_email: boolean
          show_phone: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          contributor_id: string
          created_at?: string
          id?: string
          item_id: string
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          contributor_id?: string
          created_at?: string
          id?: string
          item_id?: string
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_purchase_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_purchase_contributions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          item_url: string | null
          name: string
          occasion_id: string | null
          price: number | null
          purchased: boolean
          purchased_at: string | null
          purchased_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          item_url?: string | null
          name: string
          occasion_id?: string | null
          price?: number | null
          purchased?: boolean
          purchased_at?: string | null
          purchased_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          item_url?: string | null
          name?: string
          occasion_id?: string | null
          price?: number | null
          purchased?: boolean
          purchased_at?: string | null
          purchased_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_occasion_id_fkey"
            columns: ["occasion_id"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_purchased_by_fkey"
            columns: ["purchased_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          related_item_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          related_item_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          related_item_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_related_item_id_fkey"
            columns: ["related_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      occasions: {
        Row: {
          created_at: string
          date: string | null
          id: string
          is_default: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          is_default?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "occasions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          country: string
          created_at: string
          date_of_birth: string
          email: string
          email_notifications: boolean
          first_name: string
          id: string
          last_name: string
          premium_expiry: string | null
          premium_member: boolean
          profile_image_url: string | null
          reported: boolean
          suspended: boolean
          telephone: string
          terms_accepted: boolean
          updated_at: string
          username: string
          verified: boolean
        }
        Insert: {
          country: string
          created_at?: string
          date_of_birth: string
          email: string
          email_notifications?: boolean
          first_name: string
          id: string
          last_name: string
          premium_expiry?: string | null
          premium_member?: boolean
          profile_image_url?: string | null
          reported?: boolean
          suspended?: boolean
          telephone: string
          terms_accepted?: boolean
          updated_at?: string
          username: string
          verified?: boolean
        }
        Update: {
          country?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          email_notifications?: boolean
          first_name?: string
          id?: string
          last_name?: string
          premium_expiry?: string | null
          premium_member?: boolean
          profile_image_url?: string | null
          reported?: boolean
          suspended?: boolean
          telephone?: string
          terms_accepted?: boolean
          updated_at?: string
          username?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_notifications: {
        Row: {
          created_at: string
          id: string
          inform_owner: boolean
          item_id: string
          purchaser_id: string
          reveal_identity: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          inform_owner?: boolean
          item_id: string
          purchaser_id: string
          reveal_identity?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          inform_owner?: boolean
          item_id?: string
          purchaser_id?: string
          reveal_identity?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "purchase_notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_notifications_purchaser_id_fkey"
            columns: ["purchaser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          favorite_user_id: string
          favorite_username: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_user_id: string
          favorite_username: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_user_id?: string
          favorite_username?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_favorite_user_id_fkey"
            columns: ["favorite_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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