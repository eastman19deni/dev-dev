export interface User {
  id: string;
  username: string;
  role: 'streamer' | 'viewer';
  balance: number;
  avatar?: string;
}

export interface Streamer {
  id: string;
  username: string;
  avatar: string;
  isLive: boolean;
  description: string;
  goal?: {
    description: string;
    current: number;
    target: number;
  };
  alertSettings: AlertSettings;
  stopWords: string[];
  passiveIncome: PassiveIncomeSettings;
}

export interface AlertSettings {
  backgroundColor: string;
  textColor: string;
  font: string;
  duraction: number; // duraction (сохранено для совместимости)
  duration?: number; // правильное написание
}

export interface PassiveIncomeSettings {
  enabled: boolean;
  amount: number;
  intervalMinutes: number;
}

export interface Donation {
  id: string;
  streamerId: string;
  streamerName: string;
  viewerId: string;
  viewerName: string;
  amount: number;
  message: string;
  timestamp: Date;
  status: 'success' | 'rejected' | 'pending';
}

export interface StreamerSession {
  id: string;
  streamerId: string;
  startTime: Date;
  endTime?: Date;
  totalEarned: number;
  donationCount?: number;
  topDonor?: {
    name: string;
    amount: number;
  };
}

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
