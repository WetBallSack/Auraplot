
export interface LifeEvent {
  id: string;
  name: string;
  date: string; // ISO String
  impact: number; // -10 to 10
  intensity: number; // 1 to 10
  stickiness: number; // 0 to 1
}

export type Timeframe = '1H' | '4H' | '1D';

export interface OHLC {
  time: string | number; // String for Day, Number (Unix) for Intraday
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  // Custom fields for UI logic
  isEvent?: boolean;
  eventName?: string;
}

export interface MarketSummary {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  roe: number;
  isLiquidationRisk: boolean;
}

export interface AnalysisResult {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number; // -10 to 10 range used for logic
  confidence: number; // 0 to 100%
  targetPrice: number;
  signals: string[];
  description: string;
}

export enum Step {
  INTRO = 0,
  EVENTS = 1,
  CALCULATING = 2,
  RESULT = 3,
}

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  hasSeenOnboarding: boolean;
  joinedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SavedSession {
  id: string;
  user_id: string;
  name: string;
  initial_score: number;
  events: LifeEvent[];
  created_at: string;
}

// --- ORDER BOOK TYPES ---

export interface Order {
  id: string;
  name: string;   // Renamed from ticker
  impact: number; // Renamed from roi
  intensity: number;
  stickiness: number;
  filled: boolean;
  timestamp: number;
  time?: string; // HH:MM 24h format
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  orders: Order[]; // Stored as JSON
  created_at: string;
}
