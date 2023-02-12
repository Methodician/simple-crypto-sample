import { TestBed } from '@angular/core/testing';

import { CoinbaseService } from './coinbase.service';

describe('CoinbaseService', () => {
  let service: CoinbaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinbaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
