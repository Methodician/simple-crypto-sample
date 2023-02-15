import { cloneDeep } from 'lodash';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  Subject,
  takeUntil,
  takeWhile,
} from 'rxjs';
import processTrade from '../helpers/process-trade';
import { CoinbaseService } from '../services/coinbase.service';
import { SocketManager } from './socket-manager';
import { MatchMessage } from './types/message.models';
import { SLTrade } from './types/trade.models';

// Manages a set of recent trades for a given product
export class SLTrades {
  isReady$ = new Subject<boolean>();
  // All of the trades being tracked
  tradeHistory$ = new BehaviorSubject<SLTrade[]>([]);
  // The maximum number of trades to hold in memory
  maxHistory?: number;
  // The number of milliseconds to wait between retries
  cooldown: number;
  // The last trade received from the socket
  lastTrade$ = new Observable<SLTrade>();
  // The last trade removed from the trades array, if any
  lastRemovedTrade$ = new Subject<SLTrade>();
  productId: string;
  totalRetries = 0;
  maxRetries = 0;
  // Temporary storage for trades received from the rest API before sync completes
  private restTrades: SLTrade[] = [];
  // Temporary storage for trades received from the socket before sync completes
  private socketTrades: SLTrade[] = [];
  // nexting this signals class to clean up to minimize memory leaks
  private destroy$ = new Subject<void>();

  private socketManager: SocketManager<MatchMessage>;

  constructor(
    // Questionable design choice: this class depends on the CoinbaseService.
    // Smells a little backwards.
    private coinbaseSvc: CoinbaseService,
    productId: string,
    // hwo long to wait between retries
    cooldownInMs: number,
    // how many times to retry
    maxRetries: number,
    // how many trades to hold in memory (optional, would allow for infinite history)
    maxHistory?: number
  ) {
    this.isReady$.next(false);
    this.cooldown = cooldownInMs;
    this.productId = productId;
    this.maxRetries = maxRetries;
    this.maxHistory = maxHistory;
    this.socketManager = this.coinbaseSvc.streamProductTrades$(this.productId);
    this.initialize();
  }

  // a start at clean-up logic
  destroy = () => {
    this.tradeHistory$.next([]);
    this.tradeHistory$.complete();
    this.restTrades = [];
    this.socketTrades = [];
    this.destroy$.next();
    this.destroy$.complete();
    this.socketManager.destroy();
  };

  getSubscriptions = () => {
    return [
      ...this.socketManager.activeSubscriptions.map((sub) => sub.product_ids),
    ];
  };

  // Runs through set-up logic
  private initialize = () => {
    // Assigns the lastTrade$ observable to the socket stream
    this.lastTrade$ = this.socketManager.lastMessage$
      .pipe(
        filter(
          (message) => message.type == 'last_match' || message.type == 'match'
        ),
        map((message) => processTrade(message, this.productId))
      )
      .pipe(takeUntil(this.destroy$));

    // Begins tracking socket trades for sync up
    this.lastTrade$
      .pipe(
        takeWhile(
          () =>
            !this.getWasOverlapFound() && this.totalRetries < this.maxRetries
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((trade) => {
        this.socketTrades.push(trade);
      });
    this.synchronizeHistoryAndStream();
  };

  // Merge the rest and socket trades, then transfers to the trades array in reverse
  private handoff = () => {
    // Avoid duplicates
    let trades = [
      ...new Set([...this.socketTrades, ...this.restTrades]),
    ].reverse();
    if (!this.maxHistory) {
      this.tradeHistory$.next(trades);
    } else {
      this.tradeHistory$.next(trades.slice(-this.maxHistory));
    }
    this.isReady$.next(true);
    // Cleanup temporary storage
    this.restTrades = [];
    this.socketTrades = [];
  };

  // Keeps trades up to date and truncates to maxHistory if necessary
  private manageHistory = () => {
    this.lastTrade$.pipe(takeUntil(this.destroy$)).subscribe((trade) => {
      let trades = cloneDeep(this.tradeHistory$.value);
      if (
        !!this.maxHistory &&
        this.tradeHistory$.value.length >= this.maxHistory
      ) {
        this.lastRemovedTrade$.next(trades.shift()!);
      }
      trades.push(trade);
      this.tradeHistory$.next(trades);
    });
  };

  // Tries to find overlap between rest and socket trades
  private synchronizeHistoryAndStream = () => {
    // If all is well, handoff and manageHistory
    if (this.getWasOverlapFound()) {
      this.handoff();
      this.manageHistory();
    } else if (this.totalRetries < this.maxRetries) {
      // Get recursive until maxRetries is reached
      this.attemptToSynchronize();
    }
  };

  // Waits for cooldown before trying again with a new rest call
  private attemptToSynchronize = () => {
    this.totalRetries++;
    setTimeout(() => {
      this.coinbaseSvc
        .getProductTrades$(this.productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((trades) => {
          this.restTrades = trades;
          this.synchronizeHistoryAndStream();
        });
    }, this.cooldown);
  };

  // Checks to see if the socketTrades overlap with the restTrades
  private getWasOverlapFound = () => {
    const { restTrades, socketTrades } = this,
      firstRestId = restTrades[0]?.tradeId,
      firstSocketId = socketTrades[0]?.tradeId,
      lastSocketId = socketTrades[socketTrades.length - 1]?.tradeId;

    // Checking to ensure that the socketTrades
    // end after resTrades and start before restTrades
    return lastSocketId >= firstRestId && firstSocketId <= firstRestId;
  };
}
