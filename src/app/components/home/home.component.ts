import { Component } from '@angular/core';
import { MatchMessage } from 'src/app/models/message.models';
import { SocketManager } from 'src/app/models/socket-manager';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  socketManager = new SocketManager<MatchMessage>(
    'wss://ws-feed.exchange.coinbase.com'
  );
  constructor() {
    this.testMatchSubscription();
  }

  testMatchSubscription = async () => {
    console.log('testing match subscription');
    const subscriptions = await this.socketManager.addMatchSubscription([
      'SOL-USD',
    ]);
    console.log('active subscriptions', JSON.stringify(subscriptions, null, 2));
  };
}
