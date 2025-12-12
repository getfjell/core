import { ActionError } from './ActionError';

export class NotFoundError extends ActionError {
  constructor(
    message: string,
    itemType: string,
    key?: any
  ) {
    super({
      code: 'NOT_FOUND',
      message,
      operation: { type: 'get', name: '', params: {} },
      context: {
        itemType,
        key: typeof key === 'object' ? key : { primary: key }
      },
      details: {
        suggestedAction: 'Verify the item ID/key is correct, check if the item was deleted, or create the item if it should exist.',
        retryable: false
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
    this.name = 'NotFoundError';
  }
}

