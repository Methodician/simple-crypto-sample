import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SMA } from 'trading-signals';
import { BollingerBands } from 'trading-signals/dist/BBANDS/BollingerBands';
import { Candle } from '../models/types/candle';

import { State as SignalState, signalFeatureKey } from './signal.reducer';

export const selectSignalState =
  createFeatureSelector<SignalState>(signalFeatureKey);

export const selectSubscribedProductIds = createSelector(
  selectSignalState,
  (state) => state.subscribedProductIds
);

export const selectTradeHistory = (productId: string) =>
  createSelector(selectSignalState, (state) => state.trades.history[productId]);

export const selectCurrentTrades = createSelector(
  selectSignalState,
  (state) => state.trades.last
);

export const selectLastTrade = (productId: string) =>
  createSelector(selectSignalState, (state) => state.trades.last[productId]);

export const selectMinuteCandles = (productId: string) =>
  createSelector(selectTradeHistory(productId), (trades) => {
    if (!trades) return null;
    const firstTrade = trades[0];
    const { price, size, date } = firstTrade;

    // initialize first candle with first trade
    // it's fine that we use it again in the loop
    let currentCandle: Candle = {
      open: price,
      high: price,
      low: price,
      close: price,
      volume: size,
      timestamp: date.getTime(),
      minute: date.getMinutes(),
    };
    const candles: Candle[] = [];

    trades.forEach((trade) => {
      const { price, size, date } = trade;
      const timestamp = date.getTime();
      const minute = date.getMinutes();

      // if the current trade is in a different minute than the current candle
      // add the current candle to the array and create a new candle
      if (currentCandle.minute !== minute) {
        candles.push(currentCandle);
        currentCandle = {
          open: price,
          high: price,
          low: price,
          close: price,
          volume: size,
          timestamp,
          minute,
        };
      } else {
        // if the current trade is in the same minute as the current candle
        // update the current candle with the current trade
        const { high, low, open, volume } = currentCandle;
        currentCandle = {
          open,
          high: price.gt(high) ? price : high,
          low: price.lt(low) ? price : low,
          close: price,
          volume: volume.plus(size),
          timestamp,
          minute,
        };
      }
    });

    // If the current candle is not in the array, add it
    if (
      !!currentCandle &&
      candles[candles.length - 1].minute !== currentCandle.minute
    ) {
      candles.push(currentCandle);
    }

    return candles;
  });

export const selectSma = (productId: string, period: number) =>
  createSelector(selectMinuteCandles(productId), (candles) => {
    if (!candles) return null;
    // get the last few candles based on period
    const lastFewCandles = candles.slice(-period);
    const sma = new SMA(Math.min(lastFewCandles.length, period));
    // add the last few candles to the sma
    lastFewCandles.forEach((candle) => sma.update(candle.close));
    return sma;
  });

export const selectBollingerBands = (
  productId: string,
  period: number,
  deviationMultiplier?: number
) =>
  createSelector(selectMinuteCandles(productId), (candles) => {
    if (!candles) return null;
    const dm = deviationMultiplier || 2;
    // get the last few candles based on period
    const lastFewCandles = candles.slice(-(period + 1));
    // create a new bollinger bands instance but avoid not having enough candles
    const bb = new BollingerBands(
      Math.min(lastFewCandles.length - 1, period),
      dm
    );
    // add the last few candles to the sma
    lastFewCandles.forEach((candle) => bb.update(candle.close));
    return bb;
  });
