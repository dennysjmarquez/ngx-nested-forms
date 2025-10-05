import { AbstractControl } from '@angular/forms';

/**
 * Interface that defines the structure of events emitted by the form service.
 */
export interface FormEvent {
  /**
   * Type of event that can be 'form' or 'formElement'.
   * - 'form': Indicates that a new root form has been registered.
   * - 'formElement': Indicates that a new FormControl or FormGroup has been registered in a form.
   */
  type: 'form' | 'formElement';

  /**
   * Path of the registered form or control.
   * - For 'form' type events, it is the form identifier.
   * - For 'formElement' type events, it is the form identifier and control in format 'formPath.controlPath'.
   */
  path: string;

  /**
   * Instance of the registered control. This property is optional and is only included in 'formElement' type events.
   */
  control?: AbstractControl;
}
