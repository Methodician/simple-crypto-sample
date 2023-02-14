import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SignalEffects } from './signal.effects';

describe('SignalEffects', () => {
  let actions$: Observable<any>;
  let effects: SignalEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignalEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SignalEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
