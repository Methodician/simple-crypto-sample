import { Component } from '@angular/core';
import { SLTrades } from 'src/app/models/sltrades';

import { CoinbaseService } from 'src/app/services/coinbase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  solUsdTrades = new SLTrades(this.coinbaseService, 'SOL-USD', 2000, 7, 40);
  historyIds = () => this.solUsdTrades.trades.map((trade) => trade.tradeId);
  constructor(private coinbaseService: CoinbaseService) {
    this.testProductTrades();
  }

  ngOnDestroy() {
    this.solUsdTrades.destroy();
  }

  testProductTrades = async () => {
    console.log('testing product trades');
  };
}
