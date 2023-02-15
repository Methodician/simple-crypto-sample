import { createReducer, on } from '@ngrx/store';
import { SLTrade } from '../models/types/trade.models';
import {
  addTradeSubscriptionSuccess,
  onNewHistory,
  onNewTrade,
  removeTradeSubscriptionSuccess,
} from './signal.actions';
export const signalFeatureKey = 'signal';

export interface TradeMap {
  history: {
    [key: string]: SLTrade[];
  };
  last: {
    [key: string]: SLTrade;
  };
}

// May ultimately belong in multiple reducers
export interface State {
  subscribedProductIds: string[];
  trades: TradeMap;
}

export const initialState: State = {
  subscribedProductIds: [],
  trades: {
    history: {},
    last: {},
  },
};

export const reducer = createReducer(
  initialState,
  on(
    addTradeSubscriptionSuccess,
    (state, { lastTrade, tradeHistory: trades }) => ({
      ...state,
      subscribedProductIds: [
        ...state.subscribedProductIds,
        lastTrade.productId,
      ],
      trades: {
        ...state.trades,
        history: {
          ...state.trades.history,
          [lastTrade.productId]: trades,
        },
        last: {
          ...state.trades.last,
          [lastTrade.productId]: lastTrade,
        },
      },
    })
  ),
  on(removeTradeSubscriptionSuccess, (state, { productId }) => {
    const { [productId]: _, ...newTrades } = state.trades.history;
    const { [productId]: __, ...newLastTrades } = state.trades.last;
    return {
      ...state,
      subscribedProductIds: state.subscribedProductIds.filter(
        (id) => id !== productId
      ),
      trades: {
        ...state.trades,
        history: newTrades,
        last: newLastTrades,
      },
    };
  }),
  on(onNewTrade, (state, { lastTrade }) => ({
    ...state,
    trades: {
      ...state.trades,
      last: {
        ...state.trades.last,
        [lastTrade.productId]: lastTrade,
      },
    },
  })),
  on(onNewHistory, (state, { productId, tradeHistory }) => ({
    ...state,
    trades: {
      ...state.trades,
      history: {
        ...state.trades.history,
        [productId]: tradeHistory,
      },
    },
  }))
);
