import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPersonalInfoComponent } from './app-personal-info.component';

describe('AppPersonalInfoComponent', () => {
  let component: AppPersonalInfoComponent;
  let fixture: ComponentFixture<AppPersonalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppPersonalInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPersonalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
