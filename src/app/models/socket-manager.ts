import { BehaviorSubject, filter, firstValueFrom, Subject } from 'rxjs';
import { Message, SubscriptionMessage } from './types/message.models';

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
  // Tracking all event types received from the socket in case we need to
  // filter them out later
  eventTypes: Record<string, boolean> = {};
  // Whether the socket is open or not
  isOpen$ = new BehaviorSubject(false);
  // Last error received from the socket
  lastError$ = new Subject<any>();
  // Last message received from the socket
  lastMessage$ = new Subject<T>();
  // All active subscriptions
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

  private sendMessage = async (message: Message) => {
    await firstValueFrom(this.isOpen$.pipe(filter((isOpen) => isOpen)));
    this.socket.send(JSON.stringify(message));
  };

  addMatchSubscription = async (productIds: string[]) => {
    const message: SubscriptionMessage = {
      type: 'subscribe',
      product_ids: productIds,
      channels: ['matches'],
    };
    await this.sendMessage(message);
    this.activeSubscriptions.push(message);
    return this.activeSubscriptions;
  };
}
