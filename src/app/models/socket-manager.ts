import {
  BehaviorSubject,
  catchError,
  filter,
  first,
  Subject,
  timeout,
} from 'rxjs';
import { Message, SubscriptionMessage } from './message.models';

export class SocketManager<T = Message> {
  // probably need a way to clean this up too.
  // Do we need to proactively unsubscribe sockets?
  // (I am new to WebSockets so this is pretty experimental)
  private socket: WebSocket;
  // might implement private setters for some/all of these IRL
  // to prevent accidental mutation
  private _url: string;
  get url() {
    return this._url;
  }
  eventTypes: Record<string, boolean> = {};
  isOpen$ = new BehaviorSubject<boolean>(false);
  lastError$ = new Subject<any>();
  lastMessage$ = new Subject<T>();
  activeSubscriptions: SubscriptionMessage[] = [];

  constructor(feedUrl: string) {
    this._url = feedUrl;
    this.socket = new WebSocket(feedUrl);
    this.socket.onopen = () => this.isOpen$.next(true);
    this.socket.onclose = () => this.isOpen$.next(false);
    this.socket.onerror = (error) => this.lastError$.next(error);
    this.socket.onmessage = (event) => {
      const res = JSON.parse(event.data);
      const { type } = res;

      this.lastMessage$.next(res);
      this.eventTypes[type] = true;
    };
  }

  // probably need a way to clean this up too. Do we need to proactively unsubscribe sockets?
  addMatchSubscription = (productIds: string[]) =>
    // Promise conveniently verifies that everything went through and
    // informs consumer of all active subscriptions
    new Promise<SubscriptionMessage[]>((resolve, reject) => {
      this.isOpen$
        .pipe(
          filter((isOpen) => isOpen),
          timeout(1500),
          catchError((error) => {
            reject(error);
            return [];
          }),
          first()
        )
        .subscribe(() => {
          try {
            const msg = {
              type: 'subscribe' as 'subscribe', // appease TS which thought this was of type "string"
              product_ids: productIds,
              channels: ['matches'],
            };
            this.socket.send(JSON.stringify(msg));
            this.activeSubscriptions.push(msg);
            resolve(this.activeSubscriptions);
          } catch (error) {
            reject(error);
          }
        });
    });
}
