import { ActionReducerMap } from '@ngrx/store';
import { signalFeatureKey, reducer as signalReducer } from './signal.reducer';

export const reducers: ActionReducerMap<any> = {
  [signalFeatureKey]: signalReducer,
};
