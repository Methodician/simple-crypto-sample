import { Injectable } from '@angular/core';
import { filter, from, map, Subject } from 'rxjs';
import processTrade from '../helpers/process-trade';
import { SocketManager } from '../models/socket-manager';
import { MatchMessage } from '../models/types/message.models';
import { RestResponseTrade, SLTrade } from '../models/types/trade.models';
const FEED_URL = 'wss://ws-feed.exchange.coinbase.com';
const EXCHANGE_URL = 'https://api.exchange.coinbase.com';
// It can be helpful to create a function that returns the URL for a given resource.
// This way, if the URL changes, you only have to change it in one place.
const tradesUrl = (productId: string) =>
  `${EXCHANGE_URL}/products/${productId}/trades`;

@Injectable({
  providedIn: 'root',
})
export class CoinbaseService {
  constructor() {}

  // Raw rest API call returning RestResponseTrade[]
  getProductTrades = async (productId: string) => {
    const url = tradesUrl(productId);
    const res = await fetch(url);

    return res.json() as Promise<RestResponseTrade[]>;
  };

  // just converts getProductTrades to an observable of SLTrade[]
  getProductTrades$ = (productId: string) => {
    return from(this.getProductTrades(productId)).pipe(
      map((trades) => trades.map((trade) => processTrade(trade, productId)))
    );
  };

  // Provides a stream of SLTrade[] from the socket
  streamProductTrades$ = (productId: string) => {
    const manager = new SocketManager<MatchMessage>(FEED_URL);
    manager.addMatchSubscription([productId]);

    return manager.lastMessage$.pipe(
      filter(
        (message) => message.type == 'last_match' || message.type == 'match'
      ),
      map((message) => processTrade(message, productId))
    );
  };
}
