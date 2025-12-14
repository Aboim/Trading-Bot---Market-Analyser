export interface MarketData {
  symbol: string;
  price: string;
  change: string; // e.g., "+1.2%" or "-0.5%"
  marketStatus: 'Open' | 'Closed';
  lastUpdated: string;
}

export interface AIAnalysis {
  symbol: string;
  currentPrice: number; // Added for the bot calculations
  summary: string;
  recommendation: 'COMPRA' | 'VENDA' | 'MANTER';
  riskLevel: 'BAIXO' | 'MÉDIO' | 'ALTO';
  keyPoints: string[];
  groundingUrls: { title: string; uri: string }[];
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface Trade {
  id: string;
  symbol: string; // Can be 'BRL' or 'EUR' for cash transactions
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW';
  price: number; // Price of asset or amount of transaction
  quantity: number;
  timestamp: Date;
  total: number;
}

export interface Portfolio {
  balance: number;
  holdings: Record<string, number>; // symbol -> quantity
  history: Trade[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  BOT = 'BOT',
  ADVISOR = 'ADVISOR'
}