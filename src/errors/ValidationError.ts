import { ActionError } from './ActionError';

export class ValidationError extends ActionError {
  constructor(
    message: string,
    validOptions?: string[],
    suggestedAction?: string,
    conflictingValue?: any
  ) {
    super({
      code: 'VALIDATION_ERROR',
      message,
      operation: { type: 'create', name: '', params: {} }, // Will be filled by wrapper
      context: { itemType: '' }, // Will be filled by wrapper
      details: {
        validOptions,
        suggestedAction,
        retryable: true,
        conflictingValue
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

