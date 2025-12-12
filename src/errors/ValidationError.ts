import { ActionError } from './ActionError';

export interface FieldError {
  path: (string | number)[];
  message: string;
  code: string;
}

export class ValidationError extends ActionError {
  public fieldErrors?: FieldError[];

  constructor(
    message: string,
    validOptions?: string[],
    suggestedAction?: string,
    conflictingValue?: any,
    fieldErrors?: FieldError[]
  ) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      operation: { type: 'create', name: '', params: {} }, // Will be filled by wrapper
      context: { itemType: '' }, // Will be filled by wrapper
      details: {
        validOptions,
        suggestedAction: suggestedAction || (validOptions && validOptions.length > 0
          ? `Valid options are: ${validOptions.join(', ')}. Please use one of these values.`
          : 'Check the validation requirements and ensure all fields meet the required format, type, and constraints.'),
        retryable: true,
        conflictingValue,
        fieldErrors
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
    // Explicitly assign to this instance, ensuring it's enumerable if needed
    this.fieldErrors = fieldErrors;
    // Also patch it onto the errorInfo for good measure
    if (fieldErrors) {
      if (!this.errorInfo.details) this.errorInfo.details = {};
      this.errorInfo.details.fieldErrors = fieldErrors;
    }
  }
}
