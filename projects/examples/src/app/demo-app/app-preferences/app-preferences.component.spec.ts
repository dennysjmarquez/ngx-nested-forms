import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPreferencesComponent } from './app-preferences.component';

describe('AppPreferencesComponent', () => {
  let component: AppPreferencesComponent;
  let fixture: ComponentFixture<AppPreferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppPreferencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
