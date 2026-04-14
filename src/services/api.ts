import {
  type User,
  type Streamer,
  type Donation,
  type StreamerSession,
  type AlertSettings,
  type PassiveIncomeSettings,
  type Transaction,
  type BalanceResponse,
  type TopupResponse,
  type DonationBody,
  type DonationCreateResponse,
  type DonationHistoryResponse,
  type SessionStats,
  type StreamerListResponse,
  type StreamerFilters,
  type UserRoleBody,
  type StreamStartBody,
  type StreamStartResponse,
  type StreamStopResponse,
  type StreamStatusResponse,
} from '../app/types'
import { API_BASE } from '../config/config-api'


// Вспомогательная функция для выполнения fetch запросов с авторизацией
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const url = `${API_BASE}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Auth API
 * @see auth
 */
export const authApi = {
  /**
   * Авторизация через Telegram
   * @param authData - initData от Telegram или mock token для локальной разработки
   * @returns JWT токен и данные пользователя
   */
  async login(authData: string): Promise<{ access_token: string; user: User }> {
    const response = await fetch(`${API_BASE}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ init_data: authData }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Auth failed' }))
      throw new Error(error.message || 'Authorization failed')
    }

    return response.json()
  },
}

/**
 * User API
 * @see user
 */
export const userApi = {

  async getMe(): Promise<User> {
    return fetchWithAuth<User>('/users/me')
  },

 
  async setRole(role: 'streamer' | 'viewer'): Promise<User> {
    return fetchWithAuth<User>('/users/me/role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  },


  async updateProfile(data: { display_name?: string; description?: string }): Promise<User> {
    return fetchWithAuth<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

/**
 * Balance API
 * @see balance
 */
export const balanceApi = {

  async get(): Promise<BalanceResponse> {
    return fetchWithAuth<BalanceResponse>('/balance')
  },


  async topup(amount: number): Promise<TopupResponse> {
    return fetchWithAuth<TopupResponse>('/balance/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  },
}

/**
 * Donation API
 * @see donations
 */
export const donationApi = {

  async send(donation: DonationBody): Promise<DonationCreateResponse> {
    return fetchWithAuth<DonationCreateResponse>('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    })
  },

  async getSessionStats(): Promise<SessionStats> {
    return fetchWithAuth<SessionStats>('/donations/session')
  },


  async getHistory(limit?: number, offset?: number): Promise<DonationHistoryResponse> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    const endpoint = `/donations/history${params.toString() ? `?${params.toString()}` : ''}`
    return fetchWithAuth<DonationHistoryResponse>(endpoint)
  },
}

/**
 * Streamer API
 * @see streamers
 */
export const streamerApi = {

  async getAll(filters?: StreamerFilters): Promise<StreamerListResponse> {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())
    if (filters?.search) params.append('search', filters.search)

    const endpoint = `/streamers${params.toString() ? `?${params.toString()}` : ''}`
    return fetchWithAuth<StreamerListResponse>(endpoint)
  },


  async getById(id: string): Promise<Streamer> {
    return fetchWithAuth<Streamer>(`/streamers/${id}`)
  },


  async search(query: string): Promise<StreamerListResponse> {
    return fetchWithAuth<StreamerListResponse>(`/streamers/search?q=${encodeURIComponent(query)}`)
  },


  async updateSettings(
    id: string,
    settings: Partial<Pick<Streamer, 'alertSettings' | 'stopWords' | 'passiveIncome'>>
  ): Promise<Streamer> {
    return fetchWithAuth<Streamer>(`/streamers/${id}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },
}

/**
 * Session API
 * @see sessions
 */
export const sessionApi = {

  async start(streamerId: string, options?: StreamStartBody): Promise<StreamStartResponse> {
    return fetchWithAuth<StreamStartResponse>(`/streamers/${streamerId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    })
  },


  async end(sessionId: string): Promise<StreamStopResponse> {
    return fetchWithAuth<StreamStopResponse>(`/sessions/${sessionId}/end`, {
      method: 'PATCH',
    })
  },

  async getCurrent(streamerId: string): Promise<StreamerSession | null> {
    try {
      return await fetchWithAuth<StreamerSession>(`/streamers/${streamerId}/sessions/current`)
    } catch (error: any) {
      if (error.message?.includes('404')) return null
      throw error
    }
  },


  async getStatus(sessionId: string): Promise<SessionStats> {
    return fetchWithAuth<SessionStats>(`/sessions/${sessionId}/status`)
  },
}

/**
 * Transaction API
 * @see transactions
 */
export const transactionApi = {

  async getHistory(userId: string): Promise<Transaction[]> {
    return fetchWithAuth<Transaction[]>(`/users/${userId}/transactions`)
  },


  async deposit(userId: string, amount: number, paymentMethod?: string): Promise<Transaction> {
    return fetchWithAuth<Transaction>(`/users/${userId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        payment_method: paymentMethod,
      }),
    })
  },
}

/**
 * Alert API
 * @see alerts
 */
export const alertApi = {

  async getSettings(streamerId: string): Promise<AlertSettings> {
    return fetchWithAuth<AlertSettings>(`/streamers/${streamerId}/alerts`)
  },


  async updateSettings(streamerId: string, settings: Partial<AlertSettings>): Promise<AlertSettings> {
    return fetchWithAuth<AlertSettings>(`/streamers/${streamerId}/alerts`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },
}

/**
 * Stop Words API
 * @see stop-words
 */
export const stopWordsApi = {

  async getAll(streamerId: string): Promise<string[]> {
    return fetchWithAuth<string[]>(`/streamers/${streamerId}/stop-words`)
  },

  async add(streamerId: string, word: string): Promise<string[]> {
    return fetchWithAuth<string[]>(`/streamers/${streamerId}/stop-words`, {
      method: 'POST',
      body: JSON.stringify({ word }),
    })
  },


  async remove(streamerId: string, word: string): Promise<void> {
    return fetchWithAuth<void>(`/streamers/${streamerId}/stop-word/${encodeURIComponent(word)}`, {
      method: 'DELETE',
    })
  },
}

/**
 * Passive Income API
 * @see passive-income
 */
export const passiveIncomeApi = {

  async getSettings(streamerId: string): Promise<PassiveIncomeSettings> {
    return fetchWithAuth<PassiveIncomeSettings>(`/streamers/${streamerId}/passive-income`)
  },


  async updateSettings(
    streamerId: string,
    settings: Partial<PassiveIncomeSettings>
  ): Promise<PassiveIncomeSettings> {
    return fetchWithAuth<PassiveIncomeSettings>(`/streamers/${streamerId}/passive-income`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },
}

/**
 * Health API
 * @see health
 */
export const healthApi = {

  async check(): Promise<{ status: string }> {
    return fetchWithAuth<{ status: string }>('/health')
  },
}

/**
 * Metrics API
 * @see metrics
 */
export const metricsApi = {

  async get(): Promise<Record<string, unknown>> {
    return fetchWithAuth<Record<string, unknown>>('/metrics')
  },
}