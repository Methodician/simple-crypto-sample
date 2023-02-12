import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { CoinbaseService } from '../services/coinbase.service';
import { SLTrade } from './types/trade.models';

export class SLTrades {
  trades: SLTrade[] = [];
  maxHistory?: number;
  lastTrade$ = new Observable<SLTrade>();
  lastRemovedTrade$ = new Subject<SLTrade>();
  productId: string;
  totalRetries = 0;
  maxRetries = 0;
  private restTrades: SLTrade[] = [];
  private socketTrades: SLTrade[] = [];
  private restDidUpdate$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private coinbaseSvc: CoinbaseService,
    productId: string,
    cooldownInMs: number,
    maxRetries: number,
    maxHistory?: number
  ) {
    this.productId = productId;
    this.maxRetries = maxRetries;
    this.maxHistory = maxHistory;
    this.lastTrade$ = this.coinbaseSvc
      .streamProductTrades$(productId)
      .pipe(takeUntil(this.destroy$));
    this.lastTrade$
      .pipe(
        takeWhile(
          () => !this.getWasOverlapFound() && this.totalRetries < maxRetries
        )
      )
      .subscribe((trade) => {
        this.socketTrades.push(trade);
      });
    this.synchronizeHistoryAndStream(cooldownInMs);
  }

  destroy = () => {
    this.destroy$.next();
  };

  private getDeDupedResults = () => [
    ...new Set([...this.restTrades, ...this.socketTrades]),
  ];

  private manageHistory = () => {
    this.lastTrade$.pipe(takeUntil(this.destroy$)).subscribe((trade) => {
      if (!!this.maxHistory && this.trades.length >= this.maxHistory) {
        this.lastRemovedTrade$.next(this.trades.shift()!);
      }
      this.trades.push(trade);
    });
  };

  private synchronizeHistoryAndStream = (cooldown: number) => {
    if (this.getWasOverlapFound()) {
      let trades = this.getDeDupedResults().reverse();
      if (!this.maxHistory) {
        this.trades = trades;
      } else {
        this.trades = trades.slice(-this.maxHistory);
      }
      this.manageHistory();
    } else if (this.totalRetries < this.maxRetries) {
      this.totalRetries++;
      setTimeout(() => {
        this.coinbaseSvc
          .getProductTrades$(this.productId)
          .subscribe((trades) => {
            this.restTrades = trades;
            this.restDidUpdate$.next();
            this.synchronizeHistoryAndStream(cooldown);
          });
      }, cooldown);
    }
  };

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
