import { TestBed } from '@angular/core/testing';

import { NgxNestedFormsService } from './ngx-nested-forms.service';

describe('NgxNestedFormsService', () => {
  let service: NgxNestedFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxNestedFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
