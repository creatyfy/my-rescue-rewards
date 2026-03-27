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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message: string
          status: string
          store_id: string | null
          title: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message: string
          status?: string
          store_id?: string | null
          title: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
          store_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "establishments"
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
      establishments: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          qr_code_token: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          qr_code_token: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          qr_code_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          arquivada: boolean | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          tipo: string | null
          title: string
          user_id: string
        }
        Insert: {
          arquivada?: boolean | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          tipo?: string | null
          title: string
          user_id: string
        }
        Update: {
          arquivada?: boolean | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          tipo?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          ledger_type: Database["public"]["Enums"]["ledger_type"]
          receipt_id: string | null
          redemption_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          ledger_type: Database["public"]["Enums"]["ledger_type"]
          receipt_id?: string | null
          redemption_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          ledger_type?: Database["public"]["Enums"]["ledger_type"]
          receipt_id?: string | null
          redemption_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_calculated: number | null
          points_cost: number
          points_manual_edit: boolean | null
          prize_value_reais: number | null
          stock: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_calculated?: number | null
          points_cost: number
          points_manual_edit?: boolean | null
          prize_value_reais?: number | null
          stock?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_calculated?: number | null
          points_cost?: number
          points_manual_edit?: boolean | null
          prize_value_reais?: number | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          establishment_id: string
          id: string
          image_path: string | null
          points_earned: number
          protocol_number: string
          purchase_value: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["receipt_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          establishment_id: string
          id?: string
          image_path?: string | null
          points_earned: number
          protocol_number: string
          purchase_value: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          establishment_id?: string
          id?: string
          image_path?: string | null
          points_earned?: number
          protocol_number?: string
          purchase_value?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["receipt_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_cep: string | null
          delivery_city: string | null
          delivery_neighborhood: string | null
          delivery_number: string | null
          delivery_state: string | null
          id: string
          points_spent: number
          product_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_cep?: string | null
          delivery_city?: string | null
          delivery_neighborhood?: string | null
          delivery_number?: string | null
          delivery_state?: string | null
          id?: string
          points_spent: number
          product_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_cep?: string | null
          delivery_city?: string | null
          delivery_neighborhood?: string | null
          delivery_number?: string | null
          delivery_state?: string | null
          id?: string
          points_spent?: number
          product_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          cpf_hash: string
          created_at: string
          email_hash: string
          id: string
          points_granted: boolean
          referred_user_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          cpf_hash: string
          created_at?: string
          email_hash: string
          id?: string
          points_granted?: boolean
          referred_user_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          cpf_hash?: string
          created_at?: string
          email_hash?: string
          id?: string
          points_granted?: boolean
          referred_user_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      referral_welcome_shown: {
        Row: {
          shown_at: string
          user_id: string
        }
        Insert: {
          shown_at?: string
          user_id: string
        }
        Update: {
          shown_at?: string
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
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: { p_user_id: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      demote_admin_to_user: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: undefined
      }
      get_pending_points: { Args: { p_user_id: string }; Returns: number }
      get_referral_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_points_earned: number
          total_referred: number
        }[]
      }
      get_store_by_qr_value: {
        Args: { p_qr_value: string }
        Returns: {
          store_id: string
          store_name: string
        }[]
      }
      get_user_balance: { Args: { p_user_id: string }; Returns: number }
      get_user_ledger: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          amount: number
          created_at: string
          establishment_name: string
          ledger_id: string
          ledger_type: Database["public"]["Enums"]["ledger_type"]
          product_name: string
          protocol_number: string
          receipt_status: Database["public"]["Enums"]["receipt_status"]
          redemption_status: Database["public"]["Enums"]["redemption_status"]
        }[]
      }
      has_referral_welcome_been_shown: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_unique_field_available: {
        Args: { field_type: string; field_value: string }
        Returns: boolean
      }
      list_profiles_for_admin: {
        Args: never
        Returns: {
          avatar_url: string
          cpf: string
          created_at: string
          full_name: string
          phone: string
          user_id: string
        }[]
      }
      list_users_for_admin: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          role: string
          user_id: string
        }[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_target_id?: string
          p_target_table?: string
        }
        Returns: string
      }
      mark_referral_welcome_shown: {
        Args: { p_user_id: string }
        Returns: undefined
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
      process_referral_bonus: {
        Args: {
          p_cpf_hash: string
          p_email_hash: string
          p_referred_user_id: string
          p_referrer_id: string
        }
        Returns: Json
      }
      promote_user_to_admin: {
        Args: { p_target_user_id: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_product:
        | {
            Args: { p_product_id: string }
            Returns: {
              points_spent: number
              product_id: string
              product_name: string
              redemption_id: string
              remaining_balance: number
              status: Database["public"]["Enums"]["redemption_status"]
              stock_remaining: number
            }[]
          }
        | {
            Args: {
              p_delivery_address?: string
              p_delivery_cep?: string
              p_delivery_city?: string
              p_delivery_neighborhood?: string
              p_delivery_number?: string
              p_delivery_state?: string
              p_product_id: string
            }
            Returns: {
              points_spent: number
              product_id: string
              product_name: string
              redemption_id: string
              remaining_balance: number
              status: Database["public"]["Enums"]["redemption_status"]
              stock_remaining: number
            }[]
          }
      submit_receipt: {
        Args: {
          p_image_path: string
          p_purchase_value: number
          p_qr_code_token: string
        }
        Returns: {
          points_earned: number
          protocol_number: string
          receipt_id: string
          status: Database["public"]["Enums"]["receipt_status"]
        }[]
      }
      update_redemption_status_admin: {
        Args: { p_new_status: string; p_redemption_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ledger_type: "earn" | "redeem" | "expire" | "adjustment"
      receipt_status: "pending" | "approved" | "rejected"
      redemption_status: "pending" | "completed" | "cancelled"
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
      ledger_type: ["earn", "redeem", "expire", "adjustment"],
      receipt_status: ["pending", "approved", "rejected"],
      redemption_status: ["pending", "completed", "cancelled"],
    },
  },
} as const
