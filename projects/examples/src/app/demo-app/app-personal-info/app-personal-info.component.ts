import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from "rxjs";
import { FormService } from "ngx-nested-forms";
import { NgForm } from "@angular/forms";

/**
 * DEMO: Personal Info Component (Child)
 */
@Component({
  selector: 'app-personal-info',
  template: `
    <div class="form-section">
      <h3>Personal Information</h3>
      <form #f="ngForm">
        <div class="form-group">
          <label>First Name *</label>
          <input name="firstName" ngModel required>
        </div>

        <div class="form-group">
          <label>Last Name *</label>
          <input name="lastName" ngModel required>
        </div>

        <div class="form-group">
          <label>Age</label>
          <input name="age" ngModel type="number">
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input name="email" ngModel type="email" required>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    input.ng-invalid.ng-touched { border-color: red; }
  `]
})
export class PersonalInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  private formEventSubscription!: Subscription;

  constructor(private formService: FormService) {}

  ngAfterViewInit() {
    // Wait for parent form to be registered
    this.formEventSubscription = this.formService
      .getFormEventObservable()
      .subscribe((event) => {
        if (event.type === 'form' && event.path === 'demoForm') {
          // Register this child form
          this.formService.registerFormElement(
            'demoForm',
            'personalInfo',
            this.form.form
          );

          // Unsubscribe after registration
          this.formEventSubscription.unsubscribe();
        }
      });
  }

  ngOnDestroy() {
    if (this.formEventSubscription) {
      this.formEventSubscription.unsubscribe();
    }
  }
}
