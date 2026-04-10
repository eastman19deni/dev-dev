import {apiRequest} from './http'

import {
    type Transaction,
  type User,
  type Streamer,
  type Donation,
  type StreamerSession,
  type AlertSettings,
  type PassiveIncomeSettings,
} from '../types'

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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://dev.api.tipbot.qu1nqqy.ru'}/auth/telegram`, {
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
    return apiRequest<User>({
      method: 'GET',
      url: 'users/me',
    })
  },

  async setRole(role: 'streamer' | 'viewer'): Promise<User> {
    return apiRequest<User>({
      method: 'PATCH',
      url: '/users/me/role',
      data: { role },
    })
  },
}

/**
 * Balance API
 * @see balance
 */

export const balanceApi = {
  async get(): Promise<{ balance: number }> {
    return apiRequest<{ balance: number }>({
      method: 'GET',
      url: 'balance',
    })
  },

  async topup(amount: number): Promise<{ balance: number }> {
    return apiRequest<{ balance: number }>({
      method: 'POST',
      url: 'balance/topup',
      data: { amount },
    })
  },
}

/**
 * Donation API
 * @see donations
 */

export const donationApi = {
  async send(
    donation: Omit<Donation,'id' | 'timestamp' | 'status'>
  ): Promise<Donation> {
    return apiRequest<Donation> ({
      method: 'POST',
      url: 'donations',
      data: {
        ...donation,
        timestamp:new Date().toISOString(),
      },
    })
  },

  async getSessionStats(): Promise<{
    totalEarned: number
    donationCount: number
    topDonor?: {name: string; amount: number}
  }> {
    return apiRequest({
      method: 'GET',
      url: 'donations/session',
    })
  },

  async getHistory(): Promise<Donation[]> {
    return apiRequest<Donation[]>({
      method: 'GET',
      url: 'donations/history',
    })
  },
}

/**
 * Streamer API
 * @see streamers
 */

export const healthApi = {
  async check(): Promise<{ status: string }> {
    return apiRequest<{ status: string }>({
      method: 'GET',
      url: '/health',
    })
  },
}

/**
 * Metrics API
 */
export const metricsApi = {
  async get(): Promise<Record<string, unknown>> {
    return apiRequest<Record<string, unknown>>({
      method: 'GET',
      url: '/metrics',
    })
  },
}

// Legacy API exports for backward compatibility (to be removed after migration)
export const streamerApi = {
    async getAll(): Promise<Streamer[]> {
        return apiRequest<Streamer[]>({
            method: 'GET',
            url: 'streamers',
        })
    },

    async getById(id:string): Promise<Streamer> {
        return apiRequest<Streamer> ({
            method: 'GET',
            url: `streamers/${id}`,
        })
    },

    async search(query:string): Promise<Streamer[]> {
        return apiRequest<Streamer[]>({
            method: 'GET',
            url: 'streamer/search',
            params: {q: query},
        })
    },

    async updateSettings(
        id: string,
        settings: Partial<Pick<Streamer, 'alertSettings' | 'stopWords' | 'passiveIncome'>>
    ) : Promise<Streamer> {
        return apiRequest<Streamer>({
            method: "PATCH",
            url: `streamers/${id}/settings`,
            data:settings,
        })
    },
}

export const sessionApi = {
    async start(streamerId: string): Promise<StreamerSession> {
      return apiRequest<StreamerSession>({
        method: 'POST',
        url: `streamers/${streamerId}/sessions`,
      })
    },

    async end(sessionId: string): Promise<StreamerSession> {
      return apiRequest<StreamerSession>({
        method: 'PATCH',
        url: `sessions/${sessionId}/end`,
      })
    },

    async getCurrent(streamerId: string): Promise<StreamerSession | null> {
        return apiRequest<StreamerSession | null>({
            method: 'GET',
            url: `/streamers/${streamerId}/sessions/current`,
            validateStatus: (status) => status < 500,
        }).catch((error) => {
            if (error?.response?.status === 404) return null
            throw error
        })
    },

    async getStatus(sessionId: string): Promise<{
        totalEarned: number
        donationCount: number
        topDonor?: {name: string; amount: number}
    }> {
        return apiRequest({
            method: 'GET',
            url: `sessions/${sessionId}/status`,
        })
    },
}

export const transactionApi ={
    async getHistory(userId: string): Promise<Transaction[]> {
        return apiRequest<Transaction[]>({
            method: 'GET',
            url: `users/${userId}/transactions`,
        })
    },

    async deposit(userId: string, amount:number, paymentMethod?: string): Promise<Transaction> {
        return apiRequest<Transaction>({
            method: 'POST',
            url: `users/${userId}/deposit`,
            data: {
                amount,
                payment_method: paymentMethod,
            },
        })
    },
}

export const alertApi = {
    async getSettings(streamerId: string): Promise<AlertSettings> {
        return apiRequest<AlertSettings> ({
            method: 'GET',
            url: `streamers/${streamerId}/alerts`,
        })
    },

    async updateSettings(
        streamerId: string,
        settings: Partial<AlertSettings>
    ): Promise<AlertSettings> {
        return apiRequest<AlertSettings> ({
            method: 'PATCH',
            url: `streamers/${streamerId}/alerts`,
            data: settings,
        })
    },
}

export const stopWordsApi = {
    async getAll(streamerId: string): Promise<string[]> {
        return apiRequest<string[]>({
            method: 'GET',
            url: `streamers/${streamerId}/stop-words`
        })
    },

    async add(streamerId: string, word:string): Promise<string[]> {
        return apiRequest<string[]>({
            method: 'POST',
            url: `streamers/${streamerId}/stop-words`,
            data: {word},
        })
    },

    async remove(streamerId: string, word:string): Promise<void>{
        return apiRequest<void>({
            method: 'DELETE',
            url: `streamers/${streamerId}/stop-word/${encodeURIComponent(word)}`,
        })
    },
}

export const passiveIncomeAPI = {
    async getSettings(streamerId: string): Promise<PassiveIncomeSettings> {
        return apiRequest<PassiveIncomeSettings>({
            method: 'GET',
            url: `streamer/${streamerId}/passive-income`,
        })
    },

    async updateSetting(
        streamerId: string,
        settings: Partial<PassiveIncomeSettings>
    ): Promise<PassiveIncomeSettings>{
        return apiRequest<PassiveIncomeSettings>({
            method: 'PATCH',
            url: `streamer/${streamerId}/passive-income`,
            data: settings,
        })
    },
}