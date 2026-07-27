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
      accounts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          initial_balance: number
          name: string
          owner_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          initial_balance?: number
          name: string
          owner_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          initial_balance?: number
          name?: string
          owner_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: string
          payload: Json
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: string
          payload: Json
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: string
          payload?: Json
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_pressure_logs: {
        Row: {
          created_by: string
          diastolic: number
          id: string
          pulse: number | null
          recorded_at: string
          systolic: number
        }
        Insert: {
          created_by: string
          diastolic: number
          id?: string
          pulse?: number | null
          recorded_at?: string
          systolic: number
        }
        Update: {
          created_by?: string
          diastolic?: number
          id?: string
          pulse?: number | null
          recorded_at?: string
          systolic?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_pressure_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          activity: string
          created_by: string
          duration_minutes: number
          id: string
          recorded_at: string
        }
        Insert: {
          activity: string
          created_by: string
          duration_minutes: number
          id?: string
          recorded_at?: string
        }
        Update: {
          activity?: string
          created_by?: string
          duration_minutes?: number
          id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          arrived_at: string
          is_sharing: boolean
          latitude: number
          longitude: number
          profile_id: string
          speed_mps: number | null
          updated_at: string
        }
        Insert: {
          arrived_at?: string
          is_sharing?: boolean
          latitude: number
          longitude: number
          profile_id: string
          speed_mps?: number | null
          updated_at?: string
        }
        Update: {
          arrived_at?: string
          is_sharing?: boolean
          latitude?: number
          longitude?: number
          profile_id?: string
          speed_mps?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          created_by: string
          id: string
          meal_date: string
          meal_type: string
          menu_description: string
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          meal_date: string
          meal_type: string
          menu_description: string
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          meal_date?: string
          meal_type?: string
          menu_description?: string
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          id: string
          kind: string
          occurs_at: string
          reminder_id: string
          sent_at: string
        }
        Insert: {
          id?: string
          kind?: string
          occurs_at: string
          reminder_id: string
          sent_at?: string
        }
        Update: {
          id?: string
          kind?: string
          occurs_at?: string
          reminder_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_checklist_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_done: boolean
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_checklist_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_emergency_contacts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          phone: string
          role: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          phone: string
          role?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          phone?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_emergency_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_profile: {
        Row: {
          cycle_length_days: number
          id: string
          is_enabled: boolean
          last_period_date: string | null
          pregnancy_start_date: string | null
          tracking_mode: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cycle_length_days?: number
          id?: string
          is_enabled?: boolean
          last_period_date?: string | null
          pregnancy_start_date?: string | null
          tracking_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cycle_length_days?: number
          id?: string
          is_enabled?: boolean
          last_period_date?: string | null
          pregnancy_start_date?: string | null
          tracking_mode?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_profile_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          cigarette_pack_price: number
          cigarettes_per_pack: number
          created_at: string
          daily_water_target_glasses: number
          gender: string | null
          height_cm: number | null
          id: string
          is_smoker: boolean
          marriage_date: string | null
          name: string
          notify_digest: boolean
          notify_urgent: boolean
          push_token: string | null
          weekly_exercise_target_minutes: number
        }
        Insert: {
          birth_date?: string | null
          cigarette_pack_price?: number
          cigarettes_per_pack?: number
          created_at?: string
          daily_water_target_glasses?: number
          gender?: string | null
          height_cm?: number | null
          id: string
          is_smoker?: boolean
          marriage_date?: string | null
          name: string
          notify_digest?: boolean
          notify_urgent?: boolean
          push_token?: string | null
          weekly_exercise_target_minutes?: number
        }
        Update: {
          birth_date?: string | null
          cigarette_pack_price?: number
          cigarettes_per_pack?: number
          created_at?: string
          daily_water_target_glasses?: number
          gender?: string | null
          height_cm?: number | null
          id?: string
          is_smoker?: boolean
          marriage_date?: string | null
          name?: string
          notify_digest?: boolean
          notify_urgent?: boolean
          push_token?: string | null
          weekly_exercise_target_minutes?: number
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          ingredients: string | null
          instructions: string | null
          is_favorite: boolean
          name: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          ingredients?: string | null
          instructions?: string | null
          is_favorite?: boolean
          name: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          ingredients?: string | null
          instructions?: string | null
          is_favorite?: boolean
          name?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          category: string
          created_at: string
          created_by: string
          daily_times: string[] | null
          description: string | null
          id: string
          is_active: boolean
          is_urgent: boolean
          recurrence: string
          start_at: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          daily_times?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          recurrence?: string
          start_at: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          daily_times?: string[] | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_urgent?: boolean
          recurrence?: string
          start_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: string
          latitude: number
          longitude: number
          name: string
          notes: string | null
          photo_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          id?: string
          latitude: number
          longitude: number
          name: string
          notes?: string | null
          photo_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smoking_logs: {
        Row: {
          cigarette_count: number
          created_by: string
          id: string
          recorded_at: string
        }
        Insert: {
          cigarette_count?: number
          created_by: string
          id?: string
          recorded_at?: string
        }
        Update: {
          cigarette_count?: number
          created_by?: string
          id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "smoking_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          recorded_by: string
          transaction_date: string
          type: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          recorded_by: string
          transaction_date?: string
          type: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          recorded_by?: string
          transaction_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_checklist_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_done: boolean
          title: string
          travel_plan_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          title: string
          travel_plan_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_done?: boolean
          title?: string
          travel_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_checklist_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_checklist_items_travel_plan_id_fkey"
            columns: ["travel_plan_id"]
            isOneToOne: false
            referencedRelation: "travel_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_plans: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string
          destination: string
          expense_transaction_id: string | null
          id: string
          notes: string | null
          planned_date: string | null
          status: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by: string
          destination: string
          expense_transaction_id?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          status?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string
          destination?: string
          expense_transaction_id?: string | null
          id?: string
          notes?: string | null
          planned_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_plans_expense_transaction_id_fkey"
            columns: ["expense_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_wishlist: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          place_name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          place_name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          place_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_wishlist_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_logs: {
        Row: {
          amount_glasses: number
          created_by: string
          id: string
          recorded_at: string
        }
        Insert: {
          amount_glasses?: number
          created_by: string
          id?: string
          recorded_at?: string
        }
        Update: {
          amount_glasses?: number
          created_by?: string
          id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          recorded_at: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          recorded_at?: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          recorded_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_current_balance: {
        Row: {
          balance: number | null
          total_pemasukan: number | null
          total_pengeluaran: number | null
        }
        Relationships: []
      }
      v_current_month_expense: {
        Row: {
          total_pengeluaran_bulan_ini: number | null
        }
        Relationships: []
      }
      v_monthly_summary: {
        Row: {
          category: string | null
          jumlah_transaksi: number | null
          month: string | null
          total: number | null
          type: string | null
        }
        Relationships: []
      }
      v_today_meals: {
        Row: {
          id: string | null
          meal_type: string | null
          menu_description: string | null
          recipe_id: string | null
          recipe_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      f_today_reminders: {
        Args: never
        Returns: {
          category: string
          description: string
          is_urgent: boolean
          occurs_at: string
          recurrence: string
          reminder_id: string
          title: string
        }[]
      }
      f_upcoming_reminders: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          category: string
          description: string
          is_urgent: boolean
          occurs_at: string
          recurrence: string
          reminder_id: string
          title: string
        }[]
      }
      seed_default_health_reminder: {
        Args: { p_created_by: string }
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
