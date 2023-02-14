import { Action, createReducer, on } from '@ngrx/store';
import { SLTrade } from '../models/types/trade.models';
import {
  addTradeSubscriptionSuccess,
  onNewHistory,
  onNewTrade,
} from './signal.actions';
// import cloneDeep from 'lodash/cloneDeep';
import { cloneDeep } from 'lodash';
export const signalFeatureKey = 'signal';

export interface TradeMap {
  history: {
    [key: string]: SLTrade[];
  };
  last: {
    [key: string]: SLTrade;
  };
}

export interface State {
  trades: TradeMap;
}

export const initialState: State = {
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
  on(onNewTrade, (state, { lastTrade }) => ({
    trades: {
      ...state.trades,
      last: {
        ...state.trades.last,
        [lastTrade.productId]: lastTrade,
      },
    },
  })),
  on(onNewHistory, (state, { productId, tradeHistory }) => ({
    trades: {
      ...state.trades,
      history: {
        ...state.trades.history,
        [productId]: tradeHistory,
      },
    },
  }))
);
