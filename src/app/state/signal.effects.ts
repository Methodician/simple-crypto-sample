import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, first, map, of, switchMap, tap } from 'rxjs';
import { SLTrades } from '../models/sltrades';
import { CoinbaseService } from '../services/coinbase.service';
import {
  addTradeSubscription,
  addTradeSubscriptionSuccess,
  onNewHistory,
  onNewTrade,
  removeTradeSubscription,
  removeTradeSubscriptionFailure,
  removeTradeSubscriptionSuccess,
} from './signal.actions';

@Injectable()
export class SignalEffects {
  constructor(
    private actions$: Actions,
    // private slTrades: SLTrades,
    private coinbaseService: CoinbaseService,
    private store: Store
  ) {}

  slTradesRecord: Record<string, SLTrades> = {};
  addTradeSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addTradeSubscription),
      switchMap(({ productId, maxHistory }) => {
        const slTrades = new SLTrades(
          this.coinbaseService,
          productId,
          2000,
          7,
          maxHistory
        );

        this.slTradesRecord[productId] = slTrades;
        return slTrades.isReady$.pipe(
          first((isReady) => !!isReady),
          tap((_) => {
            slTrades.lastTrade$.subscribe((trade) => {
              this.store.dispatch(onNewTrade({ lastTrade: trade }));
            });
            slTrades.tradeHistory$.subscribe((tradeHistory) => {
              this.store.dispatch(onNewHistory({ productId, tradeHistory }));
            });
          }),
          switchMap(() => slTrades.lastTrade$),
          first(),
          map((lastTrade) =>
            addTradeSubscriptionSuccess({
              lastTrade,
              tradeHistory: slTrades.tradeHistory$.value,
            })
          )
        );
      })
    )
  );

  removeTradeSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeTradeSubscription),
      map(({ productId }) => {
        this.slTradesRecord[productId].destroy();
        delete this.slTradesRecord[productId];
        return removeTradeSubscriptionSuccess({ productId });
      }),
      catchError((error) => of(removeTradeSubscriptionFailure({ error })))
    )
  );
}
