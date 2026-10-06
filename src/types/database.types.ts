export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_own: boolean;
          owner_name: string | null;
          closing_day: number | null;
          due_day: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          is_own?: boolean;
          owner_name?: string | null;
          closing_day?: number | null;
          due_day?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_own?: boolean;
          owner_name?: string | null;
          closing_day?: number | null;
          due_day?: number | null;
          created_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          user_id: string;
          associated_auth_user_id: string | null;
          name: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          associated_auth_user_id?: string | null;
          name: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          associated_auth_user_id?: string | null;
          name?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      recurring_expenses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          estimated_amount: number;
          actual_amount: number | null;
          payment_day: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          category?: string | null;
          estimated_amount: number;
          actual_amount?: number | null;
          payment_day: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string | null;
          estimated_amount?: number;
          actual_amount?: number | null;
          payment_day?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          total_amount: number;
          installments_count: number;
          purchase_date: string;
          first_installment_date: string;
          payment_method_id: string | null;
          beneficiary_person_id: string | null;
          payer_person_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          description: string;
          total_amount: number;
          installments_count?: number;
          purchase_date: string;
          first_installment_date: string;
          payment_method_id?: string | null;
          beneficiary_person_id?: string | null;
          payer_person_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          total_amount?: number;
          installments_count?: number;
          purchase_date?: string;
          first_installment_date?: string;
          payment_method_id?: string | null;
          beneficiary_person_id?: string | null;
          payer_person_id?: string | null;
          created_at?: string;
        };
      };
      installments: {
        Row: {
          id: string;
          transaction_id: string;
          installment_number: number;
          amount: number;
          due_date: string;
          is_paid: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          installment_number: number;
          amount: number;
          due_date: string;
          is_paid?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          installment_number?: number;
          amount?: number;
          due_date?: string;
          is_paid?: boolean;
          created_at?: string;
        };
      };
      personal_loans: {
        Row: {
          id: string;
          user_id: string;
          lender_person_id: string;
          initial_amount: number;
          currency: string;
          loan_date: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          lender_person_id: string;
          initial_amount: number;
          currency?: string;
          loan_date: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lender_person_id?: string;
          initial_amount?: number;
          currency?: string;
          loan_date?: string;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      loan_repayments: {
        Row: {
          id: string;
          loan_id: string;
          amount_paid: number;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          amount_paid: number;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          amount_paid?: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      payments_received: {
        Row: {
          id: string;
          user_id: string;
          person_id: string;
          amount: number;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          person_id: string;
          amount: number;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          person_id?: string;
          amount?: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
