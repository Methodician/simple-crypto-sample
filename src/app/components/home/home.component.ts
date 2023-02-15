import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import {
  addTradeSubscription,
  removeTradeSubscription,
} from 'src/app/state/signal.actions';
import {
  selectBollingerBands,
  selectLastTrade,
  selectMinuteCandles,
  selectSma,
  selectSubscribedProductIds,
  selectTradeHistory,
} from 'src/app/state/signal.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  subscribedProductIds$ = this.store.select(selectSubscribedProductIds);

  selectedProductId = '';

  constructor(private store: Store) {
    // Just for demo
    this.store.dispatch(
      addTradeSubscription({ productId: 'SOL-USD', maxHistory: 1000 })
    );
  }

  ngOnDestroy() {
    this.store.dispatch(removeTradeSubscription({ productId: 'SOL-USD' }));
  }

  addTradeSubscription = () =>
    this.store.dispatch(
      addTradeSubscription({
        productId: this.selectedProductId,
        maxHistory: 400,
      })
    );

  removeTradeSubscription = (productId: string) =>
    this.store.dispatch(removeTradeSubscription({ productId }));

  tradesByProductId$ = (productId: string) =>
    this.store.select(selectTradeHistory(productId));

  lastTradeByProductId$ = (productId: string) =>
    this.store.select(selectLastTrade(productId));

  candlesByProductId$ = (productId: string) =>
    this.store.select(selectMinuteCandles(productId));

  smaByProductId$ = (productId: string) =>
    this.store
      .select(selectSma(productId, 7))
      .pipe(map((sma) => sma?.getResult()));

  bollingerBandsByProductId$ = (productId: string) =>
    this.store
      .select(selectBollingerBands(productId, 7))
      .pipe(map((bb) => bb?.getResult()));
}
