export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Example database types - modify these based on your actual Supabase tables
export interface Database {
  public: {
    Tables: {
      // Define your tables here
      example_table: {
        Row: {
          id: number
          created_at: string
          title: string
          content: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          content?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          content?: string | null
        }
      }
    }
  }
} 