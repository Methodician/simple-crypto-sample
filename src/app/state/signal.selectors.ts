import { createFeatureSelector, createSelector } from '@ngrx/store';

import { State as SignalState, signalFeatureKey } from './signal.reducer';

export const selectSignalState =
  createFeatureSelector<SignalState>(signalFeatureKey);

export const selectTradeHistory = (productId: string) =>
  createSelector(selectSignalState, (state) => state.trades.history[productId]);

export const selectCurrentTrades = createSelector(
  selectSignalState,
  (state) => state.trades.last
);

export const selectLastTrade = (productId: string) =>
  createSelector(selectSignalState, (state) => state.trades.last[productId]);
