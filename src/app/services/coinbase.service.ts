import { Injectable } from '@angular/core';
const FEED_URL = 'wss://ws-feed.exchange.coinbase.com';

@Injectable({
  providedIn: 'root',
})
export class CoinbaseService {
  constructor() {}
}
