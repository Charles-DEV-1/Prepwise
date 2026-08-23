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
          exam_type: "jamb" | "waec" | null;
          exam_goals: ("jamb" | "waec")[] | null;
          selected_subjects: string[] | null;
          target_score: number | null;
          exam_date: string | null;
          onboarding_completed: boolean;
          plan: "free" | "pro";
          is_pro: boolean;
          subscription_started_at: string | null;
          subscription_expires_at: string | null;
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
          exam_type: "jamb" | "waec";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          exam_type: "jamb" | "waec";
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
          source: string;
          source_question_id: string | null;
          source_question_order: number | null;
          media_url: string | null;
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
          exam_type: "jamb" | "waec";
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
          exam_type: "jamb" | "waec";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["answers"]["Row"]> & {
          session_id: string;
          question_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["answers"]["Row"]>;
        Relationships: [];
      };
      ai_explanation_usage: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          usage_count: number;
        };
        Insert: Partial<
          Database["public"]["Tables"]["ai_explanation_usage"]["Row"]
        > & {
          user_id: string;
          date: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ai_explanation_usage"]["Row"]
        >;
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
          subscription_started_at: string | null;
          subscription_expires_at: string | null;
          provider: string | null;
          provider_subscription_id: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["subscriptions"]["Row"]
        > & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          tx_ref: string;
          provider: string;
          plan_key: string;
          amount: number;
          currency: string;
          status: "pending" | "successful" | "failed" | "cancelled";
          flutterwave_transaction_id: number | null;
          flutterwave_flw_ref: string | null;
          checkout_url: string | null;
          customer_email: string | null;
          metadata: Json;
          provider_response: Json | null;
          verification_attempts: number;
          verified_at: string | null;
          processed_at: string | null;
          failure_reason: string | null;
          idempotency_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          user_id: string;
          tx_ref: string;
          plan_key: string;
          amount: number;
          idempotency_key: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      payment_webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_key: string;
          tx_ref: string | null;
          flutterwave_transaction_id: number | null;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["payment_webhook_events"]["Row"]
        > & {
          event_key: string;
          payload: Json;
        };
        Update: Partial<
          Database["public"]["Tables"]["payment_webhook_events"]["Row"]
        >;
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
          bulk_pro_active: boolean;
          bulk_pro_expires_at: string | null;
          wholesale_price_naira: number | null;
          student_price_naira: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["partners"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["partners"]["Row"]>;
        Relationships: [];
      };
      partner_accounts: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          business_name: string | null;
          city: string | null;
          partner_type: string | null;
          referral_code: string | null;
          status: string | null;
          commission_per_sale: number | null;
          total_earned: number | null;
          total_withdrawn: number | null;
          pending_balance: number | null;
          reserved_balance: number | null;
          minimum_withdrawal: number | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          bank_code: string | null;
          password_hash: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["partner_accounts"]["Row"]
        > & { email: string; full_name: string; phone: string };
        Update: Partial<
          Database["public"]["Tables"]["partner_accounts"]["Row"]
        >;
        Relationships: [];
      };
      partner_referral_conversions: {
        Row: {
          id: string;
          partner_id: string;
          user_id: string;
          user_email: string;
          user_name: string;
          signed_up_at: string;
          converted_to_pro: boolean | null;
          converted_at: string | null;
          commission_amount: number | null;
          commission_status: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["partner_referral_conversions"]["Row"]
        > & {
          partner_id: string;
          user_id: string;
          user_email: string;
          user_name: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["partner_referral_conversions"]["Row"]
        >;
        Relationships: [];
      };
      partner_withdrawals: {
        Row: {
          id: string;
          partner_id: string;
          amount: number;
          bank_name: string;
          account_number: string;
          account_name: string;
          bank_code: string;
          status: string | null;
          requested_at: string | null;
          completed_at: string | null;
          failure_reason: string | null;
          flutterwave_transfer_id: string | null;
          flutterwave_reference: string | null;
          flutterwave_status: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["partner_withdrawals"]["Row"]
        > & {
          partner_id: string;
          amount: number;
          bank_name: string;
          account_number: string;
          account_name: string;
          bank_code: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["partner_withdrawals"]["Row"]
        >;
        Relationships: [];
      };
      partner_sessions: {
        Row: {
          id: string;
          partner_id: string;
          token: string;
          expires_at: string;
          created_at: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["partner_sessions"]["Row"]
        > & { partner_id: string; token: string; expires_at: string };
        Update: Partial<
          Database["public"]["Tables"]["partner_sessions"]["Row"]
        >;
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
      user_referral_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_batch: number;
          pro_granted: boolean;
          pro_granted_at: string | null;
          cash_claimed: boolean;
          cash_claim_requested_at: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          admin_paid: boolean;
          admin_paid_at: string | null;
          notification_sent: boolean;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["user_referral_rewards"]["Row"]
        > & { user_id: string };
        Update: Partial<
          Database["public"]["Tables"]["user_referral_rewards"]["Row"]
        >;
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_count: number;
          longest_count: number;
          last_activity_date: string | null;
          last_activity_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["streaks"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["streaks"]["Row"]>;
        Relationships: [];
      };
      weekly_quizzes: {
        Row: {
          id: string;
          week_start: string;
          week_end: string;
          question_ids: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["weekly_quizzes"]["Row"]
        > & {
          week_start: string;
          week_end: string;
          question_ids: string[];
        };
        Update: Partial<Database["public"]["Tables"]["weekly_quizzes"]["Row"]>;
        Relationships: [];
      };
      weekly_quiz_entries: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          total_questions: number;
          answers: Json;
          completed_at: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["weekly_quiz_entries"]["Row"]
        > & {
          quiz_id: string;
          user_id: string;
          score: number;
          total_questions: number;
          answers: Json;
          completed_at: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["weekly_quiz_entries"]["Row"]
        >;
        Relationships: [];
      };
      user_points: {
        Row: {
          user_id: string;
          total_points: number;
          rank: string;
          sessions_completed: number;
          quizzes_completed: number;
          updated_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_points"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_points"]["Row"]>;
        Relationships: [];
      };
      daily_usage: {
        Row: {
          user_id: string;
          date: string;
          mock_exams_taken: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["daily_usage"]["Row"]> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_usage"]["Row"]>;
        Relationships: [];
      };
      question_reports: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          reason: string;
          details: string | null;
          status: "pending" | "reviewed" | "resolved" | "dismissed";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["question_reports"]["Row"]
        > & {
          question_id: string;
          user_id: string;
          reason: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["question_reports"]["Row"]
        >;
        Relationships: [];
      };
      flashcards: {
        Row: {
          id: string;
          front: string;
          back: string;
          is_premium: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["flashcards"]["Row"]> & {
          front: string;
          back: string;
        };
        Update: Partial<Database["public"]["Tables"]["flashcards"]["Row"]>;
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
      add_user_points: {
        Args: {
          p_user_id: string;
          p_points: number;
          p_session_type: "practice" | "mock" | "quiz" | "streak";
        };
        Returns: undefined;
      };
      increment_mock_exam_usage: {
        Args: { p_user_id: string; p_date: string };
        Returns: undefined;
      };
      process_successful_payment: {
        Args: {
          p_tx_ref: string;
          p_flutterwave_transaction_id: number;
          p_provider_response: Json;
          p_verified_at?: string;
        };
        Returns: Json;
      };
      award_partner_commission_for_payment: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      reserve_partner_withdrawal: {
        Args: {
          p_partner_id: string;
          p_amount: number;
          p_bank_name: string;
          p_account_number: string;
          p_account_name: string;
          p_bank_code: string;
        };
        Returns: string;
      };
      fail_partner_withdrawal: {
        Args: {
          p_withdrawal_id: string;
          p_reason: string;
          p_response?: Json | null;
        };
        Returns: undefined;
      };
      complete_partner_withdrawal: {
        Args: {
          p_withdrawal_id: string;
          p_transfer_id: string;
          p_response: Json;
        };
        Returns: undefined;
      };
      get_random_questions: {
        Args: { p_subject_id: string; p_limit: number };
        Returns: Array<{
          id: string;
          prompt: string;
          options: Json;
          correct_answer: string;
          explanation: string | null;
          topic: string | null;
          year: number | null;
          subject_id: string;
        }>;
      };
      get_available_years: {
        Args: { p_subject_id: string; p_exam_type: string };
        Returns: Array<{ year: number } | number>;
      };
      get_subjects_by_exam_type: {
        Args: { p_exam_type: string };
        Returns: Array<{
          id: string;
          name: string;
          exam_type: "jamb" | "waec";
          question_count: number;
        }>;
      };
    };
    Enums: {
      exam_type: "jamb" | "waec";
      session_mode: "practice" | "mock";
      subscription_plan: "free" | "pro";
      subscription_status: "active" | "past_due" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
