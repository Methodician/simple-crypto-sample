export interface Message {
  type: 'match' | 'last_match' | 'subscribe';
}

export type SubscriptionMessage = Message & {
  type: 'subscribe';
  product_ids: string[];
  channels: string[]; //maybe string literal e.g. 'matches' | 'ticker' | 'level2' | 'heartbeat'
};

export type MatchMessage = Message & {
  trade_id: number;
  maker_order_id: string;
  taker_order_id: string;
  price: string;
  product_id: string;
  sequence: number;
  side: 'buy' | 'sell';
  size: string;
  time: string;
  type: 'match' | 'last_match';
};
