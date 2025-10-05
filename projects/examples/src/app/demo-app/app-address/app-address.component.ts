import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { FormService } from "ngx-nested-forms";

/**
 * DEMO: Address Component (Child)
 */
@Component({
  selector: 'app-address',
  template: `
    <div class="form-section">
      <h3>Address</h3>
      <form #f="ngForm">
        <div class="form-group">
          <label>Street *</label>
          <input name="street" ngModel required>
        </div>

        <div class="form-group">
          <label>City *</label>
          <input name="city" ngModel required>
        </div>

        <div class="form-group">
          <label>State</label>
          <input name="state" ngModel>
        </div>

        <div class="form-group">
          <label>Zip Code *</label>
          <input name="zipCode" ngModel required>
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
export class AddressComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  private formEventSubscription!: Subscription;

  constructor(private formService: FormService) {}

  ngAfterViewInit() {
    this.formEventSubscription = this.formService
      .getFormEventObservable()
      .subscribe((event) => {
        if (event.type === 'form' && event.path === 'demoForm') {
          // Register with specific order (index 1, after personalInfo)
          this.formService.registerFormElement(
            'demoForm',
            'address',
            this.form.form,
            { insertAtIndex: 1 }
          );

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
