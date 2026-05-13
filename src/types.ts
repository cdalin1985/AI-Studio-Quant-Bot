export enum TradeType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export interface MarketData {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: TradeType;
  quantity: number;
  price?: number;
}
