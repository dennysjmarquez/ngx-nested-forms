import { AfterViewInit, Component, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { FormService } from "ngx-nested-forms";

/**
 * DEMO: Preferences Component (Child with dynamic controls)
 */
@Component({
  selector: 'app-preferences',
  template: `
    <div class="form-section">
      <h3>Preferences</h3>
      <form #f="ngForm">
        <div class="form-group">
          <label>
            <input type="checkbox" name="newsletter" ngModel>
            Subscribe to newsletter
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" name="notifications" ngModel>
            Enable notifications
          </label>
        </div>

        <div class="form-group">
          <label>Favorite Color</label>
          <select name="favoriteColor" ngModel>
            <option value="">Select...</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
          </select>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
    select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
  `]
})
export class PreferencesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  private formEventSubscription!: Subscription;

  constructor(private formService: FormService) {}

  ngAfterViewInit() {
    // Example: Check event history to optimize subscription
    const eventHistory = this.formService.getFormEventHistory();
    const isParentRegistered = eventHistory.find(
      event => event.type === 'form' && event.path === 'demoForm'
    );

    if (isParentRegistered) {
      this.registerForm();
    } else {
      this.formEventSubscription = this.formService
        .getFormEventObservable()
        .subscribe((event) => {
          if (event.type === 'form' && event.path === 'demoForm') {
            this.registerForm();
            this.formEventSubscription.unsubscribe();
          }
        });
    }
  }

  private registerForm() {
    this.formService.registerFormElement(
      'demoForm',
      'preferences',
      this.form.form,
      { insertAtIndex: 2 }
    );
  }

  ngOnDestroy() {
    if (this.formEventSubscription) {
      this.formEventSubscription.unsubscribe();
    }
  }
}
