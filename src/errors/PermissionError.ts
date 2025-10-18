import { ActionError } from './ActionError';

export class PermissionError extends ActionError {
  constructor(
    message: string,
    requiredPermission?: string,
    currentPermissions?: string[]
  ) {
    super({
      code: 'PERMISSION_DENIED',
      message,
      operation: { type: 'action', name: '', params: {} },
      context: {
        itemType: '',
        ...(requiredPermission && { requiredPermission })
      },
      details: {
        ...(requiredPermission && {
          suggestedAction: `Required permission: ${requiredPermission}`,
          expectedValue: requiredPermission
        }),
        ...(currentPermissions && { conflictingValue: currentPermissions }),
        retryable: false
      },
      technical: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

