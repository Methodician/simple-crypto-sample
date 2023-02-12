import { SocketManager } from './socket-manager';

const FEED_URL = 'wss://ws-feed.exchange.coinbase.com';

describe('SocketManager', () => {
  let socketManager: SocketManager;

  beforeEach(() => {
    socketManager = new SocketManager(FEED_URL);
  });

  it('should create an instance', () => {
    expect(socketManager).toBeTruthy();
  });

  it('should have the correct default values', () => {
    expect(socketManager.eventTypes).toEqual({});
    expect(socketManager.isOpen$.value).toBe(false);
    expect(socketManager.activeSubscriptions).toEqual([]);
  });

  it('should initialize the socket with the correct URL', () => {
    expect(socketManager.url).toEqual(FEED_URL);
  });

  it('should add a subscription', async () => {
    const productIds = ['ETH-USD'];
    const res = await socketManager.addMatchSubscription(productIds);
    expect(res).toEqual([
      {
        type: 'subscribe',
        product_ids: productIds,
        channels: ['matches'],
      },
    ]);
    expect(socketManager.isOpen$.value).toBe(true);
  });

  it('should fail to add an invalid subscription', async () => {
    const productIds = ['NOT-REAL'];
    try {
      await socketManager.addMatchSubscription(productIds);
    } catch (error) {
      expect(error).toEqual('Timeout has occurred');
    }
    socketManager.lastError$.subscribe((error) => {
      expect(error).toEqual('Timeout has occurred');
    });
  });
});
