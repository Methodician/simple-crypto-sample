import Big from 'big.js';

export interface RestResponseTrade {
  trade_id: number;
  price: string;
  size: string;
  side: 'buy' | 'sell';
  time: string;
}

// internal trade merges rest and socket trades
// and uses Big.js to avoid floating point errors
// It can be useful to have a naming convention
// for internal types across teams and in private libs
export interface SLTrade {
  tradeId: number;
  productId: string;
  price: Big;
  size: Big;
  side: 'buy' | 'sell';
  date: Date;
}
