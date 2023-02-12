import { BehaviorSubject, Subject } from 'rxjs';
import { Message, SubscriptionMessage } from './message.models';

export type SocketManager<T = Message> = {
  socket: WebSocket;
  eventTypes: Record<string, boolean>;
  isOpen$: BehaviorSubject<boolean>;
  lastError$: Subject<any>;
  lastMessage$: Subject<T>;
  activeSubscriptions: SubscriptionMessage[];
  addMatchSubscription: (productIds: string[]) => void; // probably too restrictive for a durable type definition
};
