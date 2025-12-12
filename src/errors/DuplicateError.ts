import { ActionError } from './ActionError';

export class DuplicateError extends ActionError {
  constructor(
    message: string,
    existingItemIdOrKey?: string | number | any,
    duplicateField?: string
  ) {
    // Extract ID and build key info
    let existingItemId: string | number | null = null;
    let keyInfo: any = null;
    
    if (typeof existingItemIdOrKey === 'object' && existingItemIdOrKey !== null) {
      // It's a key object - extract the primary key value and build proper key structure
      existingItemId = existingItemIdOrKey.pk || existingItemIdOrKey.id || existingItemIdOrKey.primary || null;
      
      // Build key info with primary field set
      if (existingItemId !== null) {
        keyInfo = {
          primary: existingItemId,
          ...existingItemIdOrKey
        };
      } else {
        keyInfo = existingItemIdOrKey;
      }
    } else if (typeof existingItemIdOrKey !== 'undefined') {
      // It's a simple ID
      existingItemId = existingItemIdOrKey;
      keyInfo = { primary: existingItemId };
    }
    
    super({
      code: 'DUPLICATE_ERROR',
      message,
      operation: { type: 'create', name: '', params: {} },
      context: {
        itemType: '',
        ...(keyInfo && { key: keyInfo }),
        ...(existingItemId && {
          affectedItems: [{
            id: existingItemId,
            type: '',
            displayName: `Existing item with ${duplicateField || 'key'}`
          }]
        })
      },
      details: {
        suggestedAction: duplicateField
          ? `An item with this ${duplicateField} already exists. Use a different ${duplicateField} value or update the existing item.`
          : 'An item with this key already exists. Use a different key or update the existing item using upsert.',
        retryable: false,
        conflictingValue: duplicateField
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

