import { ActionError } from './ActionError';

export class BusinessLogicError extends ActionError {
  constructor(
    message: string,
    suggestedAction?: string,
    retryable: boolean = false
  ) {
    super({
      code: 'BUSINESS_LOGIC_ERROR',
      message,
      operation: { type: 'action', name: '', params: {} },
      context: { itemType: '' },
      details: {
        suggestedAction: suggestedAction || 'Review the business logic requirements and ensure all conditions are met before retrying.',
        retryable
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

