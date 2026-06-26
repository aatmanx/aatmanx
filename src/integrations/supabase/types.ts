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
      businesses: {
        Row: {
          address: string | null
          business_name: string
          category: string
          created_at: string
          description: string | null
          domain_preference: string | null
          email: string | null
          id: string
          phone: string | null
          social_links: Json
          tagline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          category: string
          created_at?: string
          description?: string | null
          domain_preference?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          social_links?: Json
          tagline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string
          created_at?: string
          description?: string | null
          domain_preference?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          social_links?: Json
          tagline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_answers: {
        Row: {
          answer_json: Json
          created_at: string
          id: string
          question_index: number
          question_key: string
          questionnaire_id: string
          section_key: string | null
          updated_at: string
        }
        Insert: {
          answer_json?: Json
          created_at?: string
          id?: string
          question_index?: number
          question_key: string
          questionnaire_id: string
          section_key?: string | null
          updated_at?: string
        }
        Update: {
          answer_json?: Json
          created_at?: string
          id?: string
          question_index?: number
          question_key?: string
          questionnaire_id?: string
          section_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_answers_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_files: {
        Row: {
          created_at: string
          file_category: string | null
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          question_key: string
          questionnaire_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_category?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          question_key: string
          questionnaire_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          file_category?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          question_key?: string
          questionnaire_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_files_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaires: {
        Row: {
          ai_generation_status: Json
          answers_json: Json
          completed_at: string | null
          created_at: string
          current_step_index: number
          generated_json: Json | null
          id: string
          industry: string
          progress_percent: number
          session_id: string
          status: Database["public"]["Enums"]["questionnaire_status"]
          template_category: string | null
          template_selection: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_generation_status?: Json
          answers_json?: Json
          completed_at?: string | null
          created_at?: string
          current_step_index?: number
          generated_json?: Json | null
          id?: string
          industry?: string
          progress_percent?: number
          session_id: string
          status?: Database["public"]["Enums"]["questionnaire_status"]
          template_category?: string | null
          template_selection?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_generation_status?: Json
          answers_json?: Json
          completed_at?: string | null
          created_at?: string
          current_step_index?: number
          generated_json?: Json | null
          id?: string
          industry?: string
          progress_percent?: number
          session_id?: string
          status?: Database["public"]["Enums"]["questionnaire_status"]
          template_category?: string | null
          template_selection?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      websites: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          questionnaire_id: string | null
          slug: string | null
          status: string
          updated_at: string
          user_id: string
          website_json: Json
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          questionnaire_id?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website_json?: Json
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          questionnaire_id?: string | null
          slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "websites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "websites_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "questionnaires"
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
      questionnaire_status:
        | "draft"
        | "in_progress"
        | "completed"
        | "processing"
        | "generated"
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
      questionnaire_status: [
        "draft",
        "in_progress",
        "completed",
        "processing",
        "generated",
      ],
    },
  },
} as const
