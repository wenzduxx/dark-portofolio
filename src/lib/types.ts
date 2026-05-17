/**
 * Shared database row types used by Back Office editors.
 * These match the Supabase table schemas from schema.sql.
 */

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  client: string;
  role: string;
  hero_image: string;
  description: string;
  background_title: string;
  background_content: string;
  problem_title: string;
  problem_content: string;
  solution_title: string;
  solution_content: string;
  methodology_description: string | null;
  technical_details: string;
  outcomes_description: string | null;
  is_featured: boolean;
  grid_col_span: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  reading_time: string;
  hero_image: string;
  excerpt: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  slug: string;
  role: string;
  company: string;
  period: string;
  location: string;
  short_desc: string;
  long_desc: string;
  hero_image: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: string;
  date: string;
  description: string;
  long_description: string;
  impact: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Academic {
  id: string;
  slug: string;
  degree: string;
  school: string;
  period: string;
  location: string;
  short_desc: string;
  long_desc: string;
  hero_image: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
