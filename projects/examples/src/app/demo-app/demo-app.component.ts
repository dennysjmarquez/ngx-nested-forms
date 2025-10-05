import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FormService } from '@dennysjmarquez/ngx-nested-forms';
import { Subscription } from 'rxjs';

/**
 * DEMO: Main Form Component
 *
 * This is the parent component that provides the FormService
 * and registers the root form.
 */
@Component({
  selector: 'app-demo',
  template: `
    <div class="container">
      <h1>ngx-nested-forms Demo</h1>

      <form #f="ngForm">
        <h2>Multi-Step Wizard Form</h2>

        <!-- Child components will register their forms here -->
        <app-personal-info></app-personal-info>
        <app-address></app-address>
        <app-preferences></app-preferences>

        <div class="actions">
          <button type="button" (click)="submit()">Submit</button>
          <button type="button" (click)="showFormData()">Show Form Data</button>
        </div>
      </form>

      <div *ngIf="formData" class="result">
        <h3>Form Data:</h3>
        <pre>{{ formData | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .actions { margin-top: 20px; }
    button { margin-right: 10px; padding: 10px 20px; }
    .result { margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 4px; }
    pre { white-space: pre-wrap; }
  `],
  providers: [FormService] // IMPORTANT: Provide at component level
})
export class DemoAppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') f!: NgForm;
  private formEventSubscription!: Subscription;
  formData: any = null;

  constructor(private formService: FormService) {}

  ngAfterViewInit() {
    // Optional: Listen to form events
    this.formEventSubscription = this.formService
      .getFormEventObservable()
      .subscribe((event) => {
        console.log('Form event:', event);
      });

    // Register the root form
    this.formService.registerRootForms('demoForm', this.f.form);
  }

  submit() {
    const form = this.formService.getForm();

    // Validate entire form
    form.markAllAsTouched();

    if (form.invalid) {
      alert('Please fill all required fields!');
      return;
    }

    // Get all form data
    const mainForm = form.get('demoForm') as FormGroup;
    const formValues = mainForm?.getRawValue();

    console.log('Submitting form data:', formValues);

    // Here you would send to your backend
    // this.apiService.save(formValues).subscribe(...);

    alert('Form submitted successfully!');
  }

  showFormData() {
    const form = this.formService.getForm();
    const mainForm = form.get('demoForm') as FormGroup;
    console.log(mainForm);
    this.formData = mainForm?.getRawValue();
  }

  ngOnDestroy() {
    if (this.formEventSubscription) {
      this.formEventSubscription.unsubscribe();
    }
  }
}
