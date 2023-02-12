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

const exampleRestTrade = {
  time: '2023-02-12T18:41:20.319659Z',
  trade_id: 82205637,
  price: '22.18000000',
  size: '6.00200000',
  side: 'sell',
};
