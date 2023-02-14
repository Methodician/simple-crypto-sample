import { SLTrades } from './sltrades';
import { RestResponseTrade, SLTrade } from './types/trade.models';
import { from, Observable, of, Subject, take } from 'rxjs';
import Big from 'big.js';

class MockCoinbaseService {
  revertPastedTrade = (trade: {
    price: string;
    size: string;
    date: string;
    side: 'buy' | 'sell';
    tradeId: number;
    productId: string;
  }): SLTrade => ({
    price: new Big(trade.price),
    size: new Big(trade.size),
    date: new Date(trade.date),
    side: trade.side,
    tradeId: trade.tradeId,
    productId: trade.productId,
  });

  getProductTrades = (productId: string): Promise<RestResponseTrade[]> => {
    return new Promise((resolve) => {
      resolve([]);
    });
  };

  getProductTrades$(productId: string): Observable<SLTrade[]> {
    return of([
      this.revertPastedTrade({
        price: '21.51',
        size: '46.301',
        date: '2023-02-12T23:45:25.861Z',
        side: 'sell',
        tradeId: 82219879,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '5.464',
        date: '2023-02-12T23:45:26.024Z',
        side: 'sell',
        tradeId: 82219880,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '39.23',
        date: '2023-02-12T23:45:31.789Z',
        side: 'sell',
        tradeId: 82219881,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '46.509',
        date: '2023-02-12T23:45:31.789Z',
        side: 'sell',
        tradeId: 82219882,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '9.3',
        date: '2023-02-12T23:45:31.789Z',
        side: 'sell',
        tradeId: 82219883,
        productId: productId,
      }),
    ]);
  }

  streamProductTrades$(productId: string) {
    return from([
      this.revertPastedTrade({
        price: '21.5',
        size: '0.871',
        date: '2023-02-12T23:45:15.254Z',
        side: 'sell',
        tradeId: 82219876,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '0.628',
        date: '2023-02-12T23:45:19.825Z',
        side: 'sell',
        tradeId: 82219877,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.5',
        size: '0.535',
        date: '2023-02-12T23:45:20.745Z',
        side: 'buy',
        tradeId: 82219878,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '46.301',
        date: '2023-02-12T23:45:25.861Z',
        side: 'sell',
        tradeId: 82219879,
        productId: productId,
      }),
      this.revertPastedTrade({
        price: '21.51',
        size: '5.464',
        date: '2023-02-12T23:45:26.024Z',
        side: 'sell',
        tradeId: 82219880,
        productId: productId,
      }),
    ]);
  }
}

describe('SLTrades', () => {
  let slTrades: SLTrades;
  let mockCoinbaseService: MockCoinbaseService;

  beforeEach(() => {
    mockCoinbaseService = new MockCoinbaseService();
    slTrades = new SLTrades(mockCoinbaseService, 'productId', 100, 2, 5);
  });

  it('should create an instance', () => {
    expect(slTrades).toBeTruthy();
  });

  it('should have correct initial values', () => {
    expect(slTrades.tradeHistory$.value).toEqual([]);
    expect(slTrades.maxHistory).toEqual(5);
    expect(slTrades.cooldown).toEqual(100);
    expect(slTrades.productId).toEqual('productId');
    expect(slTrades.totalRetries).toEqual(1);
    expect(slTrades.maxRetries).toEqual(2);
  });

  it('should receive trades from socket stream and rest API', () => {
    slTrades.isReady$.subscribe((isReady) => {
      slTrades.lastTrade$.subscribe((trade) => {
        expect(trade.tradeId).toEqual(82219876);
      });
      slTrades.lastRemovedTrade$.subscribe((trade) => {
        expect(trade.tradeId).toEqual(82219876);
      });
      if (isReady) {
        expect(slTrades.tradeHistory$.value.length).toEqual(5);
      }
    });
  });

  it('should clean up correctly', () => {
    slTrades.destroy();
    expect(slTrades.tradeHistory$.value).toEqual([]);
  });
});
