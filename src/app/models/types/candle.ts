import Big from 'big.js';

export interface Candle {
  open: Big;
  high: Big;
  low: Big;
  close: Big;
  volume: Big;
  timestamp: number;
  minute: number;
}
