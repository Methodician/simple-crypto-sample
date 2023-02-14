import { createAction, props } from '@ngrx/store';
import { SLTrade } from '../models/types/trade.models';

export const addTradeSubscription = createAction(
  '[Signal] Add Trade Subscription',
  props<{ productId: string }>()
);

export const addTradeSubscriptionSuccess = createAction(
  '[Signal] Add Trade Subscription Success',
  props<{ lastTrade: SLTrade; tradeHistory: SLTrade[] }>()
);

export const addTradeSubscriptionFailure = createAction(
  '[Signal] Add Trade Subscription Failure',
  props<{ error: any }>()
);

export const onNewTrade = createAction(
  '[Signal] On New Trade',
  props<{ lastTrade: SLTrade }>()
);

export const onNewHistory = createAction(
  '[Signal] On New History',
  props<{ productId: string; tradeHistory: SLTrade[] }>()
);

export const removeTradeSubscription = createAction(
  '[Signal] Remove Trade Subscription',
  props<{ productId: string }>()
);

export const removeTradeSubscriptionSuccess = createAction(
  '[Signal] Remove Trade Subscription Success',
  props<{ productId: string }>()
);

export const removeTradeSubscriptionFailure = createAction(
  '[Signal] Remove Trade Subscription Failure',
  props<{ error: any }>()
);
