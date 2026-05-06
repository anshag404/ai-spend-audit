/**
 * types/database.ts
 * Supabase database type scaffold.
 * Replace this with the auto-generated types from:
 *   npx supabase gen types typescript --project-id <your-project-id>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Placeholder — will be replaced by `supabase gen types` on Day 2+
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
