export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          exam_type: "JAMB" | "WAEC" | "NECO" | null;
          selected_subjects: string[] | null;
          target_score: number | null;
          exam_date: string | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          exam_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          exam_type: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          subject_id: string;
          exam_type: string;
          year: number | null;
          topic: string | null;
          prompt: string;
          options: Json;
          correct_answer: string;
          explanation: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["questions"]["Row"]> & {
          subject_id: string;
          prompt: string;
          options: Json;
          correct_answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["questions"]["Row"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: "practice" | "mock";
          score: number | null;
          total_questions: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sessions"]["Row"]> & {
          user_id: string;
          mode: "practice" | "mock";
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
        Relationships: [];
      };
      answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_answer: string | null;
          is_correct: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["answers"]["Row"]> & {
          session_id: string;
          question_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["answers"]["Row"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro";
          status: "active" | "past_due" | "cancelled";
          current_period_end: string | null;
          referral_partner_id: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["subscriptions"]["Row"]
        > & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      partners: {
        Row: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          commission_percent: number | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
        Relationships: [];
      };
      referral_codes: {
        Row: {
          id: string;
          partner_id: string;
          code: string;
          label: string | null;
          is_active: boolean;
          expires_at: string | null;
          max_uses: number | null;
          use_count: number;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["referral_codes"]["Row"]
        > & {
          partner_id: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["referral_codes"]["Row"]>;
        Relationships: [];
      };
      user_referrals: {
        Row: {
          user_id: string;
          partner_id: string;
          code: string;
          applied_at: string;
        };
        Insert: Database["public"]["Tables"]["user_referrals"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_referrals"]["Row"]>;
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_count: number;
          longest_count: number;
          last_activity_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["streaks"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      partner_referral_stats: {
        Row: {
          partner_id: string;
          partner_name: string;
          slug: string;
          signups: number;
          pro_conversions: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      apply_referral_code: {
        Args: { p_code: string };
        Returns: Json;
      };
    };
    Enums: {
      exam_type: "JAMB" | "WAEC" | "NECO";
      session_mode: "practice" | "mock";
      subscription_plan: "free" | "pro";
      subscription_status: "active" | "past_due" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
