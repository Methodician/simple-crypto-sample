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
  selectLastTrade,
  selectTradeHistory,
} from 'src/app/state/signal.selectors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  lastTrade$ = this.store.select(selectLastTrade('SOL-USD'));
  trades$ = this.store
    .select(selectTradeHistory('SOL-USD'))
    .pipe(map((trades) => trades?.map((trade) => trade.tradeId)));

  constructor(private store: Store) {
    this.testProductTrades();
  }

  ngOnDestroy() {
    this.store.dispatch(removeTradeSubscription({ productId: 'SOL-USD' }));
  }

  testProductTrades = () => {
    console.log('testing product trades');

    this.store.dispatch(addTradeSubscription({ productId: 'SOL-USD' }));
  };
}
