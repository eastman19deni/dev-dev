import { http } from './http'
import type {
  User,
  StreamerItem,
  StreamerProfile,
  StreamerListResponse,
  StreamerFilters,
  AlertSettings,
  AlertSettingsBody,
  StopWord,
  StopWordBody,
  PassiveIncomeSettings,
  PassiveIncomeBody,
  BalanceResponse,
  TopupResponse,
  TopupBody,
  DonationBody,
  DonationCreateResponse,
  DonationHistoryResponse,
  SessionStats,
  StreamStartBody,
  StreamStartResponse,
  StreamStopResponse,
  StreamStatusResponse,
  AuthResponse,
  UserRoleBody,
} from '../app/types'

// API_BASE уже настроен в http.ts через axios baseURL
// Больше не нужен отдельный импорт config-api

/**
 * Auth API
 */
export const authApi = {
  async login(initData: string): Promise<AuthResponse> {
    return http.post('/auth/telegram', { init_data: initData })
  },
}

/**
 * User API
 */
export const userApi = {
  async getMe(): Promise<User> {
    return http.get('/users/me')
  },

  async setRole(role: 'streamer' | 'viewer'): Promise<User> {
    return http.patch('/users/me/role', { role })
  },

  async updateProfile(data: { display_name?: string; description?: string }): Promise<User> {
    return http.patch('/users/me', data)
  },
}

/**
 * Streamers API
 */
export const streamerApi = {
  async getAll(filters?: StreamerFilters): Promise<StreamerListResponse> {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.offset) params.append('offset', String(filters.offset))
    if (filters?.search) params.append('search', filters.search)
    
    const query = params.toString() ? `?${params}` : ''
    return http.get(`/streamers${query}`)  // ← streamers (множественное число с 'er')
  },

  async getById(userId: number): Promise<StreamerProfile> {
    return http.get(`/streamers/${userId}`)
  },
}

/**
 * Stream API (управление стримом)
 */
export const streamApi = {
  async start(body?: StreamStartBody): Promise<StreamStartResponse> {
    return http.post('/stream/start', body || {})
  },

  async stop(): Promise<StreamStopResponse> {
    return http.post('/stream/stop')
  },

  async getStatus(): Promise<StreamStatusResponse> {
    return http.get('/stream/status')
  },
}

/**
 * Balance API
 */
export const balanceApi = {
  async get(): Promise<BalanceResponse> {
    return http.get('/balance')
  },

  async topup(amount: number): Promise<TopupResponse> {
    return http.post('/balance/topup', { amount })
  },
}

/**
 * Donation API
 */
export const donationApi = {
  async send(donation: DonationBody): Promise<DonationCreateResponse> {
    return http.post('/donations', donation)
  },

  async getSessionStats(): Promise<SessionStats> {
    return http.get('/donations/session')
  },

  async getHistory(params?: { 
    limit?: number
    offset?: number
    type?: 'sent' | 'received'
  }): Promise<DonationHistoryResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.offset) searchParams.append('offset', String(params.offset))
    if (params?.type) searchParams.append('type', params.type)
    
    const query = searchParams.toString() ? `?${searchParams}` : ''
    return http.get(`/donations/history${query}`)
  },
}

/**
 * Alert Settings API
 */
export const alertApi = {
  async getSettings(): Promise<AlertSettings> {
    return http.get('/settings/alert')
  },

  async updateSettings(settings: AlertSettingsBody): Promise<AlertSettings> {
    return http.patch('/settings/alert', settings)
  },
}

/**
 * Stop Words API
 */
export const stopWordsApi = {
  async getAll(): Promise<StopWord[]> {
    return http.get('/settings/stopwords')
  },

  async add(word: string): Promise<StopWord> {
    return http.post('/settings/stopwords', { word })
  },

  async remove(wordId: number): Promise<void> {
    return http.delete(`/settings/stopwords/${wordId}`)
  },
}

/**
 * Passive Income API
 */
export const passiveIncomeApi = {
  async getSettings(): Promise<PassiveIncomeSettings> {
    return http.get('/settings/passive-income')
  },

  async updateSettings(settings: PassiveIncomeBody): Promise<PassiveIncomeSettings> {
    return http.patch('/settings/passive-income', settings)
  },
}

/**
 * Health API (публичный, без авторизации)
 */
export const healthApi = {
  async check(): Promise<{ status: string }> {
    return http.get('/health', { headers: { Authorization: '' } })
  },
}