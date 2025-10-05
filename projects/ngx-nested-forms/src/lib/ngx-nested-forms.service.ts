import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { FormEvent } from './models/form-event.interface';


/**
 * Service for managing nested forms and their controls.
 *
 * This service solves the problem of managing nested forms between components.
 * It allows centralizing the management of forms and their controls, facilitating interaction
 * between parent, child, and grandchild components within a single main form.
 *
 * **Important, correct usage:** To avoid state sharing problems between different screens,
 * this service must be provided at the main component level of the screen.
 * Child components should inject the service normally to share the same instance.
 * This ensures that each instance of the main component has its own service instance,
 * resetting its state when entering the screen again and maintaining data integrity.
 *
 * @example
 * ```typescript
 * import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
 * import { FormBuilder, FormGroup, FormControl, NgForm } from '@angular/forms';
 * import { FormService } from '@dennysjmarquez/ngx-nested-forms';
 * import { Subscription } from 'rxjs';
 *
 * @Component({
 *   selector: 'app-example',
 *   templateUrl: './example.component.html',
 *   providers: [FormService] // Provider at main component level
 * })
 * export class ExampleComponent implements AfterViewInit, OnDestroy {
 *   @ViewChild('f') f!: NgForm;
 *   private formEventSubscription: Subscription;
 *
 *   constructor(private formService: FormService) {}
 *
 *   ngAfterViewInit() {
 *     // Register the form in the service
 *     this.formService.registerRootForms('myForm', this.f);
 *
 *     // Subscribe to service events
 *     this.formEventSubscription = this.formService.getFormEventObservable().subscribe(event => {
 *       console.log('Form event:', event);
 *     });
 *   }
 *
 *   ngOnDestroy() {
 *     // Unsubscribe from observable to avoid memory leaks
 *     if (this.formEventSubscription) {
 *       this.formEventSubscription.unsubscribe();
 *     }
 *   }
 *
 *   // Method to add a control dynamically
 *   addControl() {
 *     const newControl = new FormControl('');
 *     this.formService.registerFormElement('myForm', 'newControl', newControl);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app-child',
 *   templateUrl: './child.component.html',
 * })
 * export class ChildComponent {
 *   constructor(private formService: FormService) {
 *     // Uses the same service instance in children without using providers: [FormService] in child/grandchild components
 *   }
 * }
 * ```
 *
 * @author
 * Author Name: Dennys Jose Marquez Reyes - dennysjmarquez
 * Contact: dennysjmarquez@gmail.com
 * Website: https://dennysjmarquez.dev/
 *
 * @repository
 * Repository URL: https://github.com/dennysjmarquez/angular-nested-forms-service
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {
  private readonly mainForm: FormGroup;
  private formEventSubject = new Subject<FormEvent>();
  private eventHistory: FormEvent[] = [];

  constructor(private fb: FormBuilder) {
    this.mainForm = this.fb.group({});
  }

  // Public Registration Methods

  /**
   * Registers a form in the service.
   *
   * @param name - Name of the form.
   * @param formGroup - Instance of the FormGroup representing the form.
   *
   * @example
   * ```typescript
   * // Using FormGroup
   * const formGroup = this.fb.group({
   *   name: new FormControl(''),
   *   age: new FormControl('')
   * });
   * this.formService.registerRootForms('myForm', formGroup);
   *
   * // Using NgForm with @ViewChild
   * @ViewChild('f') f!: NgForm;
   * this.formService.registerRootForms('myForm', this.f);
   * ```
   */
  registerRootForms(name: string, formGroup: FormGroup): void {
    this.mainForm.setControl(name, formGroup);
    const event: FormEvent = { type: 'form', path: name };
    this.eventHistory.push(event);
    this.formEventSubject.next(event);
  }

  /**
   * Registers a control within a nested form.
   *
   * This method allows adding a `FormControl` or `FormGroup` within another `FormGroup`,
   * at a specific path. It supports the option to overwrite an existing control
   * and to insert the new control at a specific position within the control order.
   *
   * @param path - Path of the nested form in string format (`'form.subForm'`)
   * or as array (`['form', 'subForm']`).
   *
   * @param controlName - Name of the control to register within the target form.
   *
   * @param control - Instance of `FormControl`, `FormGroup` or `AbstractControl` to register.
   *
   * @param optionsOrOverwrite - (Optional) Can be:
   * - A boolean `true` to overwrite an existing control (backward compatible mode).
   * - Options:
   *   - `overwrite` (boolean): Whether to overwrite an existing control. Default: `false`.
   *   - `insertAtIndex` (number): Index where to insert the new control, useful for dynamic ordering.
   *
   * @returns A `FormEventInterface` object with `{ type: 'formElement', path, control }` if registration was successful,
   * or `null` if the form was not found.
   *
   * @example
   * ```ts
   * const newControl = new FormControl('');
   * formService.registerFormElement(
   *   ['myForm', 'subForm'],
   *   'newControl',
   *   newControl,
   *   true // Overwrite if exists
   * );
   * ```
   *
   * @example
   * ```ts
   * const newControl = new FormControl('');
   * formService.registerFormElement(
   *   'myForm.subForm',
   *   'newControl',
   *   newControl,
   *   { overwrite: true, insertAtIndex: 1 } // Insert in controlled order
   * );
   * ```
   */
  registerFormElement(
    path: string | string[],
    controlName: string,
    control: FormControl | FormGroup | AbstractControl,
    optionsOrOverwrite: boolean | { overwrite?: boolean; insertAtIndex?: number } = false
  ): FormEvent | null {
    const normalizedPath = this.normalizePath(path);
    const formGroup = this.getNestedForm(normalizedPath);
    if (!formGroup) return null;

    const overwrite = typeof optionsOrOverwrite === 'boolean'
      ? optionsOrOverwrite
      : optionsOrOverwrite.overwrite ?? false;

    const insertAtIndex = typeof optionsOrOverwrite === 'object'
      ? optionsOrOverwrite.insertAtIndex
      : undefined;

    const exists = formGroup.contains(controlName);

    if (!exists || overwrite) {
      if (exists) {
        formGroup.removeControl(controlName);
      }

      if (insertAtIndex !== undefined && insertAtIndex >= 0) {
        const newControls: { [key: string]: AbstractControl } = {};
        const keys = Object.keys(formGroup.controls);

        keys.forEach((key, i) => {
          if (i === insertAtIndex) {
            newControls[controlName] = control;
          }
          newControls[key] = formGroup.controls[key];
        });

        if (insertAtIndex >= keys.length) {
          newControls[controlName] = control;
        }

        Object.keys(formGroup.controls).forEach(k => formGroup.removeControl(k));
        Object.entries(newControls).forEach(([k, c]) => formGroup.addControl(k, c));
      } else {
        formGroup.addControl(controlName, control);
      }

      const event: FormEvent = {
        type: 'formElement',
        path: [...normalizedPath, controlName].join('.'),
        control
      };
      this.eventHistory.push(event);
      this.formEventSubject.next(event);
      return event;
    }
    return null;
  }

  /**
   * Removes a form element at the specified path.
   * @param path - Form path in format "form.control" or as string array.
   * @returns true if the control was removed, false otherwise.
   *
   * @example
   * ```typescript
   * this.formService.removeFormElement('myForm.newControl');
   * ```
   * @example
   * ```typescript
   * this.formService.removeFormElement(['myForm', 'subForm', 'newControl']);
   * ```
   */
  removeFormElement(path: string | string[]): boolean {
    const keys = this.normalizePath(path);
    const controlName = keys.pop();
    const parentGroup = this.getNestedForm(keys);
    if (parentGroup && controlName && parentGroup.contains(controlName)) {
      parentGroup.removeControl(controlName);
      return true;
    }
    return false;
  }

  // Public Retrieval Methods

  /**
   * Gets a form control at the specified path.
   * @param path - Form path in format "form.control" or as string array.
   * @returns The control instance (AbstractControl) or null if not found.
   *
   * @example
   * ```typescript
   * const control = this.formService.getControl('myForm.newControl');
   * ```
   * @example
   * ```typescript
   * const control = this.formService.getControl(['myForm', 'subForm', 'newControl']);
   * ```
   */
  getControl(path: string | string[]): AbstractControl | null {
    const keys = this.normalizePath(path);
    let currentControl: AbstractControl | null = this.mainForm;

    for (const key of keys) {
      if (currentControl && currentControl.get(key)) {
        currentControl = currentControl.get(key);
      } else {
        return null;
      }
    }

    return currentControl;
  }

  /**
   * Gets the main form managed by the service.
   *
   * @returns The main FormGroup instance.
   *
   * @example
   * ```typescript
   * const mainForm = this.formService.getForm();
   * console.log('Main form:', mainForm);
   * ```
   */
  getForm(): FormGroup {
    return this.mainForm;
  }

  /**
   * Gets an observable that emits events when forms or controls are registered.
   *
   * Method provided so that child or descendant components of the main component
   * can register additional forms or controls. This ensures that forms and
   * controls are fully loaded and available before attempting to add
   * any additional controls, following the component lifecycle flow.
   *
   * A way to ensure that forms and controls are fully loaded and
   * available before attempting to add any additional controls.
   * This is achieved through the use of an Observable that emits events when forms
   * and controls are ready.
   *
   * Registration Events:
   *
   * - Event Type 'form': Indicates that a new form has been registered. The event.path contains the identifier of the registered form.
   * - Event Type 'formElement': Indicates that a new control has been registered in a form. The event.path contains the identifier of the form and the registered control in format formPath.controlPath.
   *
   * Usage of event.path:
   *
   * - For 'form' type events, event.path will be the form identifier, for example, 'mainForm'.
   * - For 'formElement' type events, event.path will be the form identifier and the control, for example, 'mainForm.newControl'.
   *
   * Note:
   *
   * It is important to ensure that subscriptions to the observable are destroyed using `ngOnDestroy`
   * to avoid performance problems or unexpected behavior.
   *
   * Additionally, in some specific cases, it may be useful to unsubscribe within the `subscribe`
   * after performing a specific action to avoid repeated calls. For example, if you only
   * want to perform an action once when a specific form is registered.
   *
   * @returns Observable that emits FormEventInterface type events.
   *
   * @example
   * Example 1: Registering an additional control when a specific form is registered.
   *
   * ```typescript
   * this.formService.getFormEventObservable().subscribe(event => {
   *   if (event.type === 'form' && event.path === 'form-1') {
   *     this.formService.registerFormElement(
   *       'form-1',
   *       'list',
   *       new FormControl(this.dataTable)
   *     );
   *     this.formEventSubscription$.unsubscribe();
   *   }
   * });
   * ```
   *
   * Example 2: Registering an additional control when a specific control is registered in a form.
   *
   * ```typescript
   * this.formService.getFormEventObservable().subscribe(event => {
   *   if (event.type === 'formElement' && event.path === 'mainForm.existingForm') {
   *     this.formService.registerFormElement(
   *       'mainForm.existingForm',
   *       'newControl',
   *       new FormControl('')
   *     );
   *   }
   * });
   * ```
   */
  getFormEventObservable(): Observable<FormEvent> {
    return this.formEventSubject.asObservable();
  }

  /**
   * Gets the event history.
   * Useful for optimization - check if a form is already registered before subscribing.
   *
   * @returns Array of all FormEventInterface objects that have occurred.
   *
   * @example
   * ```typescript
   * const eventHistory = this.formService.getFormEventHistory();
   * const isParentRegistered = eventHistory.find(
   *   event => event.type === 'form' && event.path === 'mainForm'
   * );
   *
   * if (isParentRegistered) {
   *   // Parent is already registered, register immediately
   *   this.registerChildForm();
   * } else {
   *   // Wait for parent registration
   *   this.formService.getFormEventObservable().subscribe(...);
   * }
   * ```
   */
  getFormEventHistory(): FormEvent[] {
    return this.eventHistory;
  }

  /**
   * Disables ALL controls of a form, except those indicated in `exceptions`.
   * Useful for read-only modes or cloning scenarios where only certain fields should be editable.
   *
   * @param formPath - Path of the form (e.g., 'form1.form_tab1').
   * @param exceptions - Array of control names that should remain enabled (e.g., ['id']).
   *
   * @example
   * ```typescript
   * // Disable all fields except 'status' and 'comments'
   * this.formService.disableAllExcept('mainForm.personalInfo', ['status', 'comments']);
   * ```
   *
   * @example
   * ```typescript
   * // In a cloning scenario, allow only certain fields to be edited
   * if (this.isClone) {
   *   this.formService.disableAllExcept('form1.form_tab1', [
   *     'id',
   *     'name'
   *   ]);
   * }
   * ```
   */
  disableAllExcept(formPath: string, exceptions: string[] = []): void {
    const form = this.getControl(formPath);
    if (!(form instanceof FormGroup)) return;

    Object.keys(form.controls).forEach((controlName) => {
      if (!exceptions.includes(controlName)) {
        form.get(controlName)?.disable({ emitEvent: false, onlySelf: true });
      }
    });
  }

  // Private Methods

  /**
   * Gets a nested FormGroup at the specified path.
   * @param path - Form path in format "form.control" or as string array.
   * @returns The FormGroup instance or null if not found.
   *
   * @example
   * ```typescript
   * const subForm = this.formService.getNestedForm('myForm.subForm');
   * ```
   * @example
   * ```typescript
   * const subForm = this.formService.getNestedForm(['myForm', 'subForm']);
   * ```
   */
  private getNestedForm(path: string | string[]): FormGroup | null {
    const keys = this.normalizePath(path);
    let currentGroup: FormGroup | null = this.mainForm;

    for (const key of keys) {
      if (currentGroup && currentGroup.get(key) instanceof FormGroup) {
        currentGroup = currentGroup.get(key) as FormGroup;
      } else {
        return null;
      }
    }

    return currentGroup;
  }

  /**
   * Normalizes the path to an array of strings.
   * If the path is a string, it splits it by dots.
   * If the path is an array, it returns it as is.
   *
   * @param path - The form path as string or array.
   * @returns An array of strings representing the path.
   */
  private normalizePath(path: string | string[]): string[] {
    if (typeof path === 'string') {
      return path.split('.');
    }
    return path;
  }
}
