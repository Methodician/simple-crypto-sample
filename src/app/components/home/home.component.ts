import { Component } from '@angular/core';
import { MatchMessage } from 'src/app/models/message.models';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  socketManager = this.socketSvc.createSocketManager<MatchMessage>();
  constructor(private socketSvc: SocketService) {
    this.socketManager.addMatchSubscription(['SOL-USD']);
    console.log(
      'active subscriptions',
      JSON.stringify(this.socketManager.activeSubscriptions, null, 2)
    );

    this.socketManager.lastMessage$.subscribe((msg) => {
      console.log('last message', msg);
    });
  }
}
