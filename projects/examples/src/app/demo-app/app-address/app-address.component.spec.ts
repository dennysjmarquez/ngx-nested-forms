import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAddressComponent } from './app-address.component';

describe('AppAddressComponent', () => {
  let component: AppAddressComponent;
  let fixture: ComponentFixture<AppAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppAddressComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
