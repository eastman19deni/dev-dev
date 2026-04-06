import type { Streamer, User, Donation, StreamSession, Transaction } from './types';
import streamer1Avatar from '../images/streamer1.jpeg';
import streamer2Avatar from '../images/streamer2.jpg';
import streamer3Avatar from '../images/streamer3.jpg';
import streamer4Avatar from '../images/streamer4.jpg';

export const mockUser: User = {
  id: 'user-1',
  username: 'Deni',
  role: 'streamer', 
  balance: 1500,
  avatar: streamer1Avatar,

};

export const mockStreamers: Streamer[] = [
  {
    id: 'streamer-1',
    username: 'ProGamer_Mike',
    avatar: streamer1Avatar,
    isLive: true,
    description: 'CS2 профессионал | 10k+ часов игры',
    goal: {
      description: 'На новую мышку',
      current: 4500,
      target: 10000
    },
    alertSettings: {
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      font: 'Arial',
      duration: 5
    },
    stopWords: ['спам', 'реклама'],
    passiveIncome: {
      enabled: true,
      amount: 10,
      intervalMinutes: 5
    }
  },
  {
    id: 'streamer-2',
    username: 'StreamQueen_Anna',
    avatar: streamer2Avatar,
    isLive: true,
    description: 'Just Chatting | Позитивные вайбы ✨',
    goal: {
      description: 'Новая веб-камера 4K',
      current: 8200,
      target: 15000
    },
    alertSettings: {
      backgroundColor: '#ec4899',
      textColor: '#ffffff',
      font: 'Comic Sans MS',
      duration: 7
    },
    stopWords: ['токсик', 'хейт'],
    passiveIncome: {
      enabled: true,
      amount: 5,
      intervalMinutes: 10
    }
  },
  {
    id: 'streamer-3',
    username: 'TechGuru_Alex',
    avatar: streamer3Avatar,
    isLive: false,
    description: 'Программирование | Python & JS',
    alertSettings: {
      backgroundColor: '#10b981',
      textColor: '#000000',
      font: 'Courier New',
      duration: 4
    },
    stopWords: [],
    passiveIncome: {
      enabled: false,
      amount: 0,
      intervalMinutes: 0
    }
  },
  {
    id: 'streamer-4',
    username: 'MusicMaster_DJ',
    avatar:streamer4Avatar,
    isLive: true,
    description: '🎵 Лучшие миксы | House & Techno',
    goal: {
      description: 'Новый контроллер Pioneer',
      current: 2100,
      target: 25000
    },
    alertSettings: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      font: 'Impact',
      duration: 6
    },
    stopWords: ['мат'],
    passiveIncome: {
      enabled: true,
      amount: 15,
      intervalMinutes: 3
    }
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'don-1',
    streamerId: 'streamer-1',
    streamerName: 'ProGamer_Mike',
    viewerId: 'user-1',
    viewerName: 'viewer_alex',
    amount: 500,
    message: 'Красивая игра! Продолжай в том же духе!',
    timestamp: new Date('2026-03-06T10:30:00'),
    status: 'success'
  },
  {
    id: 'don-2',
    streamerId: 'streamer-2',
    streamerName: 'StreamQueen_Anna',
    viewerId: 'user-1',
    viewerName: 'viewer_alex',
    amount: 100,
    message: 'Спасибо за стрим!',
    timestamp: new Date('2026-03-05T15:20:00'),
    status: 'success'
  },
  {
    id: 'don-3',
    streamerId: 'streamer-1',
    streamerName: 'ProGamer_Mike',
    viewerId: 'user-1',
    viewerName: 'viewer_alex',
    amount: 50,
    message: 'Попытка донатить со спам словами',
    timestamp: new Date('2026-03-04T12:00:00'),
    status: 'rejected'
  }
];

export const mockSession: StreamSession = {
  id: 'session-1',
  streamerId: 'streamer-1',
  startTime: new Date('2026-03-06T08:00:00'),
  totalEarned: 4500,
  donationCount: 23,
  topDonor: {
    name: 'mega_donor',
    amount: 1000
  }
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 1000,
    timestamp: new Date('2026-03-06T09:00:00'),
    description: 'Пополнение баланса',
    status: 'completed'
  },
  {
    id: 'tx-2',
    type: 'donation_sent',
    amount: -500,
    timestamp: new Date('2026-03-06T10:30:00'),
    description: 'Донат для ProGamer_Mike',
    status: 'completed'
  },
  {
    id: 'tx-3',
    type: 'passive_income',
    amount: 10,
    timestamp: new Date('2026-03-06T10:05:00'),
    description: 'Пассивный доход от ProGamer_Mike',
    status: 'completed'
  },
  {
    id: 'tx-4',
    type: 'donation_sent',
    amount: -100,
    timestamp: new Date('2026-03-05T15:20:00'),
    description: 'Донат для StreamQueen_Anna',
    status: 'completed'
  }
];

export const mockSessionEarnings = [
  { time: '08:00', amount: 0 },
  { time: '09:00', amount: 500 },
  { time: '10:00', amount: 1200 },
  { time: '11:00', amount: 2100 },
  { time: '12:00', amount: 2800 },
  { time: '13:00', amount: 3500 },
  { time: '14:00', amount: 4500 }
];