import { TestBed } from '@angular/core/testing';

import { Style } from './style.service';

describe('Style', () => {
  let service: Style;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Style);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
