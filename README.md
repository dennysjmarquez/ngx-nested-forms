# @dennysjmarquez/ngx-nested-forms

[![npm version](https://badge.fury.io/js/%40dennysjmarquez%2Fngx-nested-forms.svg)](https://www.npmjs.com/package/@dennysjmarquez/ngx-nested-forms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A powerful Angular service for managing nested forms across multiple components with centralized state management.

## 🚀 Features

- ✅ **Centralized Form Management** - Single source of truth for complex nested forms
- ✅ **Event System** - Observable-based events with history tracking
- ✅ **Dynamic Ordering** - Control form element insertion order with `insertAtIndex`
- ✅ **Conditional Disabling** - Disable all controls except specified ones
- ✅ **Deep Access** - Access nested controls at any depth level
- ✅ **No ControlValueAccessor Required** - Simpler than traditional nested form solutions
- ✅ **TypeScript Support** - Full type safety and IntelliSense
- ✅ **Hybrid Forms** - Works with both Template-driven and Reactive Forms

## 📦 Installation

```bash
npm install @dennysjmarquez/ngx-nested-forms
```

## 🎯 Problem It Solves

When building complex Angular forms with multiple nested components (parent, children, grandchildren), it becomes challenging to:

- Centralize form validation
- Access data from all nested components
- Maintain form state across dynamic components
- Control the order of dynamically added form controls
- Validate the entire form before submission

**This library solves all these problems with a simple, elegant API.**

## 📖 Basic Usage

### 1. Import the Service

The service is provided in root by default, but **you should provide it at the component level** to avoid state sharing between different screens:

```typescript
import { Component } from '@angular/core';
import { FormService } from '@dennysjmarquez/ngx-nested-forms';

@Component({
  selector: 'app-main-form',
  templateUrl: './main-form.component.html',
  providers: [FormService] // ⚠️ Important: Provide at component level
})
export class MainFormComponent {
  constructor(private formService: FormService) {}
}
```

### 2. Register Root Form (Parent Component)

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormService } from '@dennysjmarquez/ngx-nested-forms';

@Component({
  selector: 'app-main-form',
  template: `
    <form #f="ngForm">
      <app-personal-info></app-personal-info>
      <app-address></app-address>
      <button (click)="submit()">Submit</button>
    </form>
  `,
  providers: [FormService]
})
export class MainFormComponent implements AfterViewInit {
  @ViewChild('f') form!: NgForm;
  
  constructor(private formService: FormService) {}
  
  ngAfterViewInit() {
    // Register the root form
    this.formService.registerRootForms('mainForm', this.form);
  }
  
  submit() {
    const form = this.formService.getForm();
    
    // Validate entire form
    form.markAllAsTouched();
    if (form.invalid) {
      alert('Form is invalid!');
      return;
    }
    
    // Get all values
    const formData = form.get('mainForm')?.getRawValue();
    console.log('Complete form data:', formData);
    
    // Send to backend
    this.api.save(formData).subscribe();
  }
}
```

### 3. Register Child Forms

```typescript
import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormService } from '@dennysjmarquez/ngx-nested-forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-personal-info',
  template: `
    <form #f="ngForm">
      <input name="firstName" ngModel placeholder="First Name" required>
      <input name="lastName" ngModel placeholder="Last Name" required>
      <input name="age" ngModel type="number" placeholder="Age">
    </form>
  `
})
export class PersonalInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  private formEventSubscription!: Subscription;
  private destroy$ = new Subject<void>();
  
  constructor(private formService: FormService) {}
  
  ngAfterViewInit() {
    // Wait for parent form to be registered
    this.formEventSubscription = this.formService
      .getFormEventObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event.type === 'form' && event.path === 'mainForm') {
          // Register this child form
          this.formService.registerFormElement(
            'mainForm',
            'personalInfo',
            this.form.form
          );
          
          this.formEventSubscription.unsubscribe();
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Deeply Nested Components

```typescript
@Component({
  selector: 'app-address-details',
  template: `
    <form #f="ngForm">
      <input name="street" ngModel placeholder="Street">
      <input name="city" ngModel placeholder="City">
      <input name="zipCode" ngModel placeholder="Zip Code">
    </form>
  `
})
export class AddressDetailsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  private destroy$ = new Subject<void>();
  
  constructor(private formService: FormService) {}
  
  ngAfterViewInit() {
    this.formService
      .getFormEventObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        // Wait for parent address form
        if (event.type === 'formElement' && event.path === 'mainForm.address') {
          // Register as nested child
          this.formService.registerFormElement(
            ['mainForm', 'address'],
            'details',
            this.form.form
          );
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🔥 Advanced Features

### 1. Control Insertion Order with `insertAtIndex`

Useful when components can be destroyed and recreated dynamically, but you need to maintain a specific order:

```typescript
this.formService.registerFormElement(
  ['mainForm', 'tabs'],
  'tab1',
  this.form.form,
  { insertAtIndex: 0, overwrite: true }
);
```

### 2. Optimize with Event History

Avoid unnecessary subscriptions by checking if a form is already registered:

```typescript
ngAfterViewInit() {
  const eventHistory = this.formService.getFormEventHistory();
  const isParentRegistered = eventHistory.find(
    event => event.type === 'form' && event.path === 'mainForm'
  );
  
  if (isParentRegistered) {
    this.registerForm();
  } else {
    this.formService.getFormEventObservable()
      .subscribe(event => {
        if (event.type === 'form' && event.path === 'mainForm') {
          this.registerForm();
        }
      });
  }
}
```

### 3. Access Nested Controls

```typescript
// Get a specific control value
const firstName = this.formService.getControl('mainForm.personalInfo.firstName');
console.log(firstName?.value);

// Or use array notation
const city = this.formService.getControl(['mainForm', 'address', 'details', 'city']);
console.log(city?.value);

// Check if user has filled tasks before allowing change
const tasks = this.formService.getControl(['mainForm', 'tasks'])?.value ?? [];
if (tasks.length > 0) {
  // Show confirmation dialog
}
```

### 4. Disable All Except Specific Fields

Perfect for "read-only" modes where only certain fields can be edited:

```typescript
// Disable all fields except 'status' and 'comments'
this.formService.disableAllExcept(
  'mainForm.personalInfo',
  ['status', 'comments']
);
```

### 5. Remove Form Elements on Destroy

Clean up when components are destroyed:

```typescript
ngOnDestroy() {
  const removed = this.formService.removeFormElement([
    'mainForm',
    'address',
    'details'
  ]);
  console.log('Form element removed:', removed);
  
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 6. Building Request Payload

```typescript
submit() {
  const form = this.formService.getForm();
  
  // Validate
  form.markAllAsTouched();
  if (form.invalid) {
    this.showValidationErrors();
    return;
  }
  
  // Get complete form structure
  const mainForm = form.get('mainForm') as FormGroup;
  const formData = mainForm.getRawValue();
  
  // Extract nested data
  const { personalInfo, address, preferences } = formData;
  const { details } = address;
  
  // Map to backend model
  const payload = {
    userId: this.userId,
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    age: personalInfo.age,
    address: {
      street: details.street,
      city: details.city,
      zipCode: details.zipCode
    },
    preferences: preferences?.list ?? [] // From FormArray
  };
  
  // Send to API
  this.apiService.save(payload).subscribe(
    response => console.log('Saved!', response),
    error => console.error('Error:', error)
  );
}
```

## 📚 API Reference

### Methods

#### `registerRootForms(name: string, formGroup: FormGroup): void`
Register the main/root form.

**Parameters:**
- `name`: Identifier for the form
- `formGroup`: FormGroup or NgForm instance

---

#### `registerFormElement(path, controlName, control, options?): FormEventInterface | null`
Register a nested form element.

**Parameters:**
- `path`: Path to parent form (string or array)
- `controlName`: Name of the control to register
- `control`: FormControl, FormGroup, or AbstractControl instance
- `options`: Optional configuration
  - `overwrite`: boolean - Replace existing control (default: false)
  - `insertAtIndex`: number - Insert at specific position

**Returns:** FormEventInterface object or null if parent not found

---

#### `removeFormElement(path: string | string[]): boolean`
Remove a form element at the specified path.

**Returns:** true if removed, false otherwise

---

#### `getControl(path: string | string[]): AbstractControl | null`
Get a control at any nested level.

**Parameters:**
- `path`: Path to control ('form.subform.control' or ['form', 'subform', 'control'])

---

#### `getForm(): FormGroup`
Get the main FormGroup with all nested forms.

---

#### `getFormEventObservable(): Observable<FormEventInterface>`
Get observable that emits when forms/controls are registered.

---

#### `getFormEventHistory(): FormEventInterface[]`
Get array of all registration events (useful for optimization).

---

#### `disableAllExcept(formPath: string, exceptions: string[]): void`
Disable all controls in a form except specified ones.

**Parameters:**
- `formPath`: Path to the form
- `exceptions`: Array of control names to keep enabled

## 🎨 Use Cases

### ✅ Multi-step Wizards
Perfect for forms split across multiple steps/pages where you need centralized validation.

### ✅ Dynamic Tab Forms
When tabs can be added/removed dynamically and you need to maintain order and validation.

### ✅ Complex Enterprise Forms
Large forms with dozens of sections distributed across multiple components.

### ✅ Conditional Form Sections
Forms where sections appear/disappear based on user selections.

### ✅ Lazy Loaded Form Modules
When form sections are loaded lazily but need to integrate into a main form.

## 🆚 Comparison with Other Solutions

| Feature | ngx-nested-forms | ngx-sub-form | Manual @Input/@Output |
|---------|------------------|--------------|----------------------|
| No ControlValueAccessor needed | ✅ | ❌ | ✅ |
| Centralized validation | ✅ | ⚠️ Partial | ❌ |
| Event system | ✅ | ❌ | ⚠️ Manual |
| Control insertion order | ✅ | ❌ | ❌ |
| Event history optimization | ✅ | ❌ | ❌ |
| Deep nested access | ✅ | ⚠️ Limited | ❌ |
| Conditional disabling | ✅ | ❌ | ⚠️ Manual |
| Learning curve | Low | Medium | Low |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use in personal and commercial projects.

## 👤 Author

**Dennys Jose Marquez Reyes**
- GitHub: [@dennysjmarquez](https://github.com/dennysjmarquez)
- Email: dennysjmarquez@gmail.com
- Website: [dennysjmarquez.dev](https://dennysjmarquez.dev/)

## 🙏 Support

If this library helped you, please give it a ⭐️ on [GitHub](https://github.com/dennysjmarquez/angular-nested-forms-service)!

---

Made with ❤️ for the Angular community
