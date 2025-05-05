import { TestBed } from '@angular/core/testing';

import { RouterWrapperService } from './router-wrapper.service';

describe('RouterWrapperService', () => {
  let service: RouterWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
