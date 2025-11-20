export interface ErrorInfo {
  code: string;
  message: string;
  operation: {
    type: 'get' | 'create' | 'update' | 'remove' | 'upsert' |
          'all' | 'one' | 'find' | 'findOne' |
          'action' | 'allAction' | 'facet' | 'allFacet';
    name: string;
    params: Record<string, any>;
  };
  context: {
    itemType: string;
    key?: {
      primary?: string | number;
      composite?: {
        sk: string | number;
        kta: string[];
        locations?: Array<{ lk: string | number; kt: string }>;
      };
    };
    affectedItems?: Array<{
      id: string | number;
      type: string;
      displayName?: string;
    }>;
    parentLocation?: {
      id: string | number;
      type: string;
    };
    requiredPermission?: string;
  };
  details?: {
    validOptions?: string[];
    suggestedAction?: string;
    retryable?: boolean;
    conflictingValue?: any;
    expectedValue?: any;
    fieldErrors?: any[];
  };
  technical?: {
    timestamp: string;
    requestId?: string;
    stackTrace?: string;
    cause?: any;
  };
}

export class ActionError extends Error {
  constructor(
    public readonly errorInfo: ErrorInfo,
    cause?: Error
  ) {
    super(errorInfo.message);
    this.name = 'ActionError';
    this.cause = cause;
    
    // Ensure timestamp is always set
    if (!this.errorInfo.technical) {
      this.errorInfo.technical = { timestamp: new Date().toISOString() };
    }
    if (!this.errorInfo.technical.timestamp) {
      this.errorInfo.technical.timestamp = new Date().toISOString();
    }
  }

  toJSON(): ErrorInfo {
    return this.errorInfo;
  }
}

