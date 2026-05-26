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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      households: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          invite_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at?: string;
        };
        Update: {
          role?: "owner" | "member";
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          type: "expense";
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          type?: "expense";
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: "expense";
          icon?: string | null;
          color?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      shared_transactions: {
        Row: {
          id: string;
          household_id: string;
          created_by: string;
          paid_by: string;
          type: "contribution" | "expense" | "saving_contribution";
          amount: number;
          category_id: string | null;
          saving_goal_id: string | null;
          description: string | null;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          created_by: string;
          paid_by: string;
          type: "contribution" | "expense" | "saving_contribution";
          amount: number;
          category_id?: string | null;
          saving_goal_id?: string | null;
          description?: string | null;
          transaction_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          paid_by?: string;
          type?: "contribution" | "expense" | "saving_contribution";
          amount?: number;
          category_id?: string | null;
          saving_goal_id?: string | null;
          description?: string | null;
          transaction_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_transactions_saving_goal_id_fkey";
            columns: ["saving_goal_id"];
            isOneToOne: false;
            referencedRelation: "saving_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      monthly_budgets: {
        Row: {
          id: string;
          household_id: string;
          month: number;
          year: number;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          month: number;
          year: number;
          amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          month?: number;
          year?: number;
          amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      recurring_transactions: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          amount: number;
          category_id: string | null;
          type: "expense" | "contribution" | "saving_contribution";
          frequency: "monthly";
          due_day: number;
          is_active: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          amount: number;
          category_id?: string | null;
          type: "expense" | "contribution" | "saving_contribution";
          frequency?: "monthly";
          due_day: number;
          is_active?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          amount?: number;
          category_id?: string | null;
          type?: "expense" | "contribution" | "saving_contribution";
          frequency?: "monthly";
          due_day?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_transaction_logs: {
        Row: {
          id: string;
          recurring_transaction_id: string;
          household_id: string;
          month: number;
          year: number;
          status: "paid" | "skipped";
          transaction_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recurring_transaction_id: string;
          household_id: string;
          month: number;
          year: number;
          status: "paid" | "skipped";
          transaction_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          status?: "paid" | "skipped";
          transaction_id?: string | null;
        };
        Relationships: [];
      };
      saving_goals: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          target_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          target_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          target_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification_settings: {
        Row: {
          id: string;
          household_id: string;
          channel: string | null;
          webhook_url: string | null;
          daily_alert_enabled: boolean;
          monthly_alert_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          channel?: string | null;
          webhook_url?: string | null;
          daily_alert_enabled?: boolean;
          monthly_alert_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          channel?: string | null;
          webhook_url?: string | null;
          daily_alert_enabled?: boolean;
          monthly_alert_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_household_member: {
        Args: { target_household_id: string };
        Returns: boolean;
      };
      seed_default_categories: {
        Args: { target_household_id: string };
        Returns: undefined;
      };
      join_household_by_invite_code: {
        Args: { target_invite_code: string };
        Returns: string;
      };
      mark_recurring_paid: {
        Args: {
          target_recurring_transaction_id: string;
          target_month: number;
          target_year: number;
        };
        Returns: string;
      };
      skip_recurring_for_month: {
        Args: {
          target_recurring_transaction_id: string;
          target_month: number;
          target_year: number;
        };
        Returns: string;
      };
      add_saving_contribution: {
        Args: {
          target_saving_goal_id: string;
          contribution_amount: number;
          paid_by_user_id: string;
          contribution_date: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
