/**
 * Just Focus — Database Types
 *
 * Relational, Supabase-ready data models.
 * All entities include: id (UUID), user_id (placeholder for future auth),
 * created_at, and updated_at ISO timestamps.
 */

export interface Session {
  id: string;
  user_id: string | null;
  duration_minutes: number;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: "active" | "completed" | "abandoned";
  strict_mode: boolean;
  blocked_site_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface BlockedSite {
  id: string;
  user_id: string | null;
  domain: string;
  display_name: string;
  category: string;
  icon_url: string | null;
  is_custom: boolean;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string | null;
  default_duration_minutes: number;
  strict_mode_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionStats {
  total_focus_minutes_today: number;
  completed_sessions_today: number;
  total_blocked_sites: number;
  weekly_history: WeeklyEntry[];
}

export interface WeeklyEntry {
  date: string; // ISO date (YYYY-MM-DD)
  focus_minutes: number;
  sessions_completed: number;
}
