import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, timer } from 'rxjs';
import { SLTrades } from 'src/app/models/sltrades';

import { CoinbaseService } from 'src/app/services/coinbase.service';
import {
  addTradeSubscription,
  removeTradeSubscription,
} from 'src/app/state/signal.actions';
import {
  selectBollingerBands,
  selectLastTrade,
  selectMinuteCandles,
  selectSma,
  selectTradeHistory,
} from 'src/app/state/signal.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  lastTrade$ = this.store.select(selectLastTrade('SOL-USD'));
  trades$ = this.store.select(selectTradeHistory('SOL-USD'));
  candles$ = this.store.select(selectMinuteCandles('SOL-USD'));
  // .pipe(map((trades) => trades?.map((trade) => trade.tradeId)));
  sma$ = this.store
    .select(selectSma('SOL-USD', 7))
    .pipe(map((sma) => sma?.getResult()));
  bollingerBands$ = this.store
    .select(selectBollingerBands('SOL-USD', 7))
    .pipe(map((bb) => bb?.getResult()));

  constructor(private store: Store) {
    this.store.dispatch(
      // addTradeSubscription({ productId: 'SOL-USD', maxHistory: 100 })
      addTradeSubscription({ productId: 'SOL-USD' })
    );
  }

  ngOnDestroy() {
    this.store.dispatch(removeTradeSubscription({ productId: 'SOL-USD' }));
  }
}
