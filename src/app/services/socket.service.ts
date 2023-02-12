import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, first, Subject } from 'rxjs';
import { SocketManager } from '../models/socket.models';
import { Message, SubscriptionMessage } from '../models/message.models';
const FEED_URL = 'wss://ws-feed.exchange.coinbase.com';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor() {}

  createSocketManager = <T = Message>() => {
    const socket = new WebSocket(FEED_URL);
    const eventTypes: Record<string, boolean> = {};
    const isOpen$ = new BehaviorSubject<boolean>(false);
    const lastError$ = new Subject<any>();
    const lastMessage$ = new Subject<any>();
    const activeSubscriptions: SubscriptionMessage[] = [];

    socket.onopen = () => isOpen$.next(true);
    socket.onclose = () => isOpen$.next(false);
    socket.onerror = (error) => lastError$.next(error);
    socket.onmessage = (event) => {
      const res = JSON.parse(event.data);
      const { type } = res;

      lastMessage$.next(res);
      eventTypes[type] = true;
    };

    // probably need a way to clean this up too. Do we need to proactively unsubscribe sockets?
    const addMatchSubscription = (productIds: string[]) =>
      isOpen$
        .pipe(
          filter((isOpen) => isOpen),
          first()
        )
        .subscribe(() => {
          const msg = {
            type: 'subscribe' as 'subscribe', // appease TS which thought this was of type "string"
            product_ids: productIds,
            channels: ['matches'],
          };
          socket.send(JSON.stringify(msg));
          activeSubscriptions.push(msg);
        });

    const socketManager: SocketManager<T> = {
      socket,
      eventTypes,
      isOpen$,
      lastError$,
      lastMessage$,
      activeSubscriptions,
      addMatchSubscription,
    };

    return socketManager;
  };
}
