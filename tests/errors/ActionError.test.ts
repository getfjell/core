import { describe, expect, it } from 'vitest';
import {
  ActionError,
  BusinessLogicError,
  DuplicateError,
  NotFoundError,
  PermissionError,
  ValidationError
} from '../../src/errors';

describe('ActionError', () => {
  it('should create error with full context', () => {
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Test error message',
      operation: {
        type: 'create',
        name: 'createUser',
        params: { name: 'John' }
      },
      context: {
        itemType: 'user',
        key: { primary: 123 }
      },
      details: {
        retryable: true
      }
    });

    expect(error.message).toBe('Test error message');
    expect(error.errorInfo.code).toBe('TEST_ERROR');
    expect(error.errorInfo.technical?.timestamp).toBeDefined();
    expect(error.toJSON()).toEqual(error.errorInfo);
  });

  it('should automatically set timestamp if not provided', () => {
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Test error',
      operation: {
        type: 'get',
        name: 'getUser',
        params: {}
      },
      context: {
        itemType: 'user'
      }
    });

    expect(error.errorInfo.technical).toBeDefined();
    expect(error.errorInfo.technical?.timestamp).toBeDefined();
    expect(typeof error.errorInfo.technical?.timestamp).toBe('string');
  });

  it('should preserve cause error if provided', () => {
    const cause = new Error('Original error');
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Wrapped error',
      operation: {
        type: 'update',
        name: 'updateUser',
        params: {}
      },
      context: {
        itemType: 'user'
      }
    }, cause);

    expect(error.cause).toBe(cause);
  });

  it('should support composite key in context', () => {
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Test error',
      operation: {
        type: 'get',
        name: 'getItem',
        params: {}
      },
      context: {
        itemType: 'comment',
        key: {
          composite: {
            sk: 'comment-1',
            kta: ['post', 'user'],
            locations: [
              { lk: 'post-123', kt: 'post' },
              { lk: 'user-456', kt: 'user' }
            ]
          }
        }
      }
    });

    expect(error.errorInfo.context.key?.composite).toBeDefined();
    expect(error.errorInfo.context.key?.composite?.sk).toBe('comment-1');
    expect(error.errorInfo.context.key?.composite?.locations).toHaveLength(2);
  });

  it('should support affected items in context', () => {
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Test error',
      operation: {
        type: 'remove',
        name: 'removeUser',
        params: {}
      },
      context: {
        itemType: 'user',
        affectedItems: [
          { id: 1, type: 'comment', displayName: 'User comment' },
          { id: 2, type: 'post', displayName: 'User post' }
        ]
      }
    });

    expect(error.errorInfo.context.affectedItems).toHaveLength(2);
    expect(error.errorInfo.context.affectedItems?.[0].id).toBe(1);
  });

  it('should support parent location in context', () => {
    const error = new ActionError({
      code: 'TEST_ERROR',
      message: 'Test error',
      operation: {
        type: 'create',
        name: 'createComment',
        params: {}
      },
      context: {
        itemType: 'comment',
        parentLocation: {
          id: 'post-123',
          type: 'post'
        }
      }
    });

    expect(error.errorInfo.context.parentLocation).toBeDefined();
    expect(error.errorInfo.context.parentLocation?.id).toBe('post-123');
    expect(error.errorInfo.context.parentLocation?.type).toBe('post');
  });
});

describe('Specific Error Types', () => {
  describe('ValidationError', () => {
    it('should create ValidationError with defaults', () => {
      const error = new ValidationError(
        'Invalid status',
        ['active', 'inactive'],
        'Use one of the valid status values'
      );

      expect(error.errorInfo.code).toBe('VALIDATION_ERROR');
      expect(error.errorInfo.details?.validOptions).toEqual(['active', 'inactive']);
      expect(error.errorInfo.details?.suggestedAction).toBe('Use one of the valid status values');
      expect(error.errorInfo.details?.retryable).toBe(true);
    });

    it('should support conflicting value', () => {
      const error = new ValidationError(
        'Invalid value',
        undefined,
        undefined,
        'invalid-status'
      );

      expect(error.errorInfo.details?.conflictingValue).toBe('invalid-status');
    });

    it('should have empty operation fields to be filled by wrapper', () => {
      const error = new ValidationError('Invalid');

      expect(error.errorInfo.operation.name).toBe('');
      expect(error.errorInfo.context.itemType).toBe('');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with primary key', () => {
      const error = new NotFoundError('User not found', 'user', 123);

      expect(error.errorInfo.code).toBe('NOT_FOUND');
      expect(error.errorInfo.context.itemType).toBe('user');
      expect(error.errorInfo.context.key?.primary).toBe(123);
      expect(error.errorInfo.details?.retryable).toBe(false);
    });

    it('should create NotFoundError with composite key object', () => {
      const compositeKey = {
        composite: {
          sk: 'comment-1',
          kta: ['post'],
          locations: [{ lk: 'post-123', kt: 'post' }]
        }
      };
      const error = new NotFoundError('Comment not found', 'comment', compositeKey);

      expect(error.errorInfo.context.key).toEqual(compositeKey);
    });

    it('should create NotFoundError without key', () => {
      const error = new NotFoundError('Item not found', 'item');

      expect(error.errorInfo.context.key).toEqual({});
    });
  });

  describe('BusinessLogicError', () => {
    it('should create BusinessLogicError with suggested action', () => {
      const error = new BusinessLogicError(
        'Cannot delete user with active orders',
        'Please archive orders first',
        false
      );

      expect(error.errorInfo.code).toBe('BUSINESS_LOGIC_ERROR');
      expect(error.errorInfo.details?.suggestedAction).toBe('Please archive orders first');
      expect(error.errorInfo.details?.retryable).toBe(false);
    });

    it('should default retryable to false', () => {
      const error = new BusinessLogicError('Business rule violation');

      expect(error.errorInfo.details?.retryable).toBe(false);
    });

    it('should support retryable errors', () => {
      const error = new BusinessLogicError(
        'Temporary constraint violation',
        'Try again later',
        true
      );

      expect(error.errorInfo.details?.retryable).toBe(true);
    });
  });

  describe('PermissionError', () => {
    it('should create PermissionError with permission details', () => {
      const error = new PermissionError(
        'Access denied',
        'admin',
        ['user', 'viewer']
      );

      expect(error.errorInfo.code).toBe('PERMISSION_DENIED');
      expect(error.errorInfo.details?.suggestedAction).toContain('admin');
      expect(error.errorInfo.details?.expectedValue).toBe('admin');
      expect(error.errorInfo.details?.conflictingValue).toEqual(['user', 'viewer']);
      expect(error.errorInfo.details?.retryable).toBe(false);
    });

    it('should work without permission details', () => {
      const error = new PermissionError('Access denied');

      expect(error.errorInfo.code).toBe('PERMISSION_DENIED');
      expect(error.errorInfo.details?.suggestedAction).toBeUndefined();
    });
  });

  describe('DuplicateError', () => {
    it('should create DuplicateError with existing item info', () => {
      const error = new DuplicateError(
        'Email already exists',
        'user-123',
        'email'
      );

      expect(error.errorInfo.code).toBe('DUPLICATE_ERROR');
      expect(error.errorInfo.context.affectedItems).toHaveLength(1);
      expect(error.errorInfo.context.affectedItems?.[0].id).toBe('user-123');
      expect(error.errorInfo.context.affectedItems?.[0].displayName).toContain('email');
      expect(error.errorInfo.details?.conflictingValue).toBe('email');
      expect(error.errorInfo.details?.retryable).toBe(false);
    });

    it('should work without existing item details', () => {
      const error = new DuplicateError('Duplicate detected');

      expect(error.errorInfo.code).toBe('DUPLICATE_ERROR');
      expect(error.errorInfo.context.affectedItems).toBeUndefined();
    });

    it('should use default "key" text when field not specified', () => {
      const error = new DuplicateError('Duplicate', 'item-1');

      expect(error.errorInfo.context.affectedItems?.[0].displayName).toContain('key');
    });
  });
});

describe('Error Serialization', () => {
  it('should serialize to JSON correctly', () => {
    const error = new ValidationError(
      'Invalid input',
      ['a', 'b'],
      'Use a or b'
    );

    const json = error.toJSON();
    expect(json.code).toBe('VALIDATION_ERROR');
    expect(json.message).toBe('Invalid input');
    expect(json.details?.validOptions).toEqual(['a', 'b']);
  });

  it('should include technical information in serialization', () => {
    const error = new NotFoundError('Not found', 'item', 123);

    const json = error.toJSON();
    expect(json.technical?.timestamp).toBeDefined();
  });
});

describe('Operation Types', () => {
  it('should support all operation types in error info', () => {
    const operationTypes = [
      'get', 'create', 'update', 'remove', 'upsert',
      'all', 'one', 'find', 'findOne',
      'action', 'allAction', 'facet', 'allFacet'
    ] as const;

    operationTypes.forEach(opType => {
      const error = new ActionError({
        code: 'TEST',
        message: 'Test',
        operation: {
          type: opType,
          name: `test${opType}`,
          params: {}
        },
        context: {
          itemType: 'test'
        }
      });

      expect(error.errorInfo.operation.type).toBe(opType);
    });
  });
});

