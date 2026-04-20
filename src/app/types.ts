// ========== Auth ==========
export interface AuthResponse {
  access_token: string;
  token_type: string;
  is_new_user: boolean;
  user: AuthUserResponse;
}

export interface AuthUserResponse {
  id: number;
  telegram_id: number;
  username: string | null;
  role: string | null;
  balance: number;
}

// ========== User ==========
export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: 'streamer' | 'viewer' | null;
  balance: number;
  created_at: string;
}

export interface UserUpdateBody {
  display_name?: string;
  description?: string;
}

export interface UserRoleBody {
  role: 'streamer' | 'viewer';
}

// ========== Streamer ==========
export interface StreamerItem {
  id: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_live: boolean;
  goal: GoalPreview | null;
}

export interface StreamerProfile {
  id: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  description: string | null;
  is_live: boolean;
  goal: GoalPreview | null;
  alert_preview: AlertPreview | null;
}

export interface StreamerListResponse {
  items: StreamerItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface StreamerFilters {
  limit?: number;
  offset?: number;
  search?: string;
}

// ========== Goal ==========
export interface GoalPreview {
  title: string | null;
  target_amount: number;
  current_amount: number;
}

export interface GoalBody {
  title?: string;
  target_amount?: number;
}

// ========== Alert ==========
export interface AlertPreview {
  bg_color: string;
  text_color: string;
  font: string;
  duration_sec: number;
}

export interface AlertSettings {
  bg_color: string;
  text_color: string;
  font: string;
  duration_sec: number;  
  image_enabled: boolean;
  tts_enabled: boolean;
  tts_voice: string;
}

export interface AlertSettingsBody {
  bg_color?: string;
  text_color?: string;
  font?: string;
  duration_sec?: number;
  image_enabled?: boolean;
  tts_enabled?: boolean;
  tts_voice?: string;
}

// ========== Stop Words ==========
export interface StopWord {
  id: number;
  word: string;
}

export interface StopWordBody {
  word: string;
}

// ========== Passive Income ==========
export interface PassiveIncomeSettings {
  enabled: boolean;
  coins_per_interval: number;
  interval_minutes: number;
}

export interface PassiveIncomeBody {
  enabled?: boolean;
  coins_per_interval?: number;
  interval_minutes?: number;
}

// ========== Balance ==========
export interface BalanceResponse {
  balance: number;
  currency: string;
}

export interface TopupBody {
  amount: number;
}

export interface TopupResponse {
  previous_balance: number;
  added_amount: number;
  new_balance: number;
}

// ========== Donation ==========
export interface DonationBody {
  streamer_id: number;
  amount: number;
  message?: string;
}

export interface DonationCreateResponse {
  donation_id: number;
  status: string;
  message: string;
}

export interface DonorResponse {
  id: number;
  username: string | null;
}

export interface DonationHistoryItem {
  id: number;
  amount: number;
  message: string | null;
  status: string;
  from_user: DonorResponse;
  to_streamer: DonorResponse;
  created_at: string;
}

export interface DonationHistoryResponse {
  items: DonationHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopDonator {
  username: string | null;
  total_amount: number;
}

export interface TimelineItem {
  time: string;
  amount: number;
}

export interface SessionStats {
  session_id: number;
  total_collected: number;
  donations_count: number;
  top_donator: TopDonator | null;
  timeline: TimelineItem[];
}

// ========== Stream ==========
export interface StreamStartBody {
  passive_income_enabled?: boolean;
}

export interface StreamStartResponse {
  session_id: number;
  widget_url: string;
  ws_url: string;
  stream_token: string;
  started_at: string;
}

export interface StreamStopResponse {
  session_id: number;
  total_collected: number;
  donations_count: number;
  duration_seconds: number;
  ended_at: string;
}

export interface StreamStatusResponse {
  is_live: boolean;
  session_id: number | null;
  started_at: string | null;
  widget_url: string | null;
}

// ========== Transaction (Legacy) ==========
export interface Transaction {
  id: string;
  type: 'deposit' | 'donation_sent' | 'donation_received' | 'passive_income' | 'withdrawal';
  amount: number;
  timestamp: Date;
  description?: string;
  status: 'completed' | 'pending' | 'failed';
  userId?: string;
  createdAt?: Date;
  paymentMethod?: string;
}

export type Streamer = StreamerProfile
export type Donation = DonationHistoryItem
export type StreamerSession = {
  id: number
  streamerId: number
  startTime: Date
  endTime?: Date
  totalEarned: number
}

export interface StreamStatusResponse {
  is_live: boolean;
  session_id: number | null;
  started_at: string | null;
  widget_url: string | null;
  ws_url: string | null;  
}