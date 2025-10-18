import { describe, expect, it } from 'vitest';
import {
  enhanceError,
  executeWithContext,
  executeWithContextSync,
  getErrorInfo,
  isActionError
} from '../../src/operations/errorEnhancer';
import {
  BusinessLogicError,
  NotFoundError,
  ValidationError
} from '../../src/errors';
import { OperationContext } from '../../src/operations/OperationContext';

describe('executeWithContext', () => {
  const context: OperationContext = {
    itemType: 'user',
    operationType: 'get',
    operationName: 'get',
    params: { key: { pk: 123, kt: 'user' } },
    key: { pk: 123, kt: 'user' }
  };

  it('should return result for successful operation', async () => {
    const result = await executeWithContext(
      async () => ({ id: 123, name: 'John' }),
      context
    );

    expect(result).toEqual({ id: 123, name: 'John' });
  });

  it('should enhance ActionError with context', async () => {
    const error = new NotFoundError('User not found', 'user', 123);

    try {
      await executeWithContext(
        async () => { throw error; },
        context
      );
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(NotFoundError);
      expect(e.errorInfo.operation.type).toBe('get');
      expect(e.errorInfo.operation.name).toBe('get');
      expect(e.errorInfo.context.itemType).toBe('user');
      expect(e.errorInfo.context.key?.primary).toBe(123);
    }
  });

  it('should not modify non-ActionError', async () => {
    const error = new Error('Regular error');

    try {
      await executeWithContext(
        async () => { throw error; },
        context
      );
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e).toBe(error);
      expect(e.errorInfo).toBeUndefined();
    }
  });
});

describe('executeWithContextSync', () => {
  const context: OperationContext = {
    itemType: 'user',
    operationType: 'action',
    operationName: 'validate',
    params: { data: {} }
  };

  it('should return result for successful operation', () => {
    const result = executeWithContextSync(
      () => ({ valid: true }),
      context
    );

    expect(result).toEqual({ valid: true });
  });

  it('should enhance ActionError with context', () => {
    const error = new ValidationError('Invalid data', ['field1', 'field2']);

    try {
      executeWithContextSync(
        () => { throw error; },
        context
      );
      expect.fail('Should have thrown');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ValidationError);
      expect(e.errorInfo.operation.type).toBe('action');
      expect(e.errorInfo.operation.name).toBe('validate');
    }
  });
});

describe('enhanceError', () => {
  const context: OperationContext = {
    itemType: 'invoice',
    operationType: 'action',
    operationName: 'approve',
    params: { approved: true },
    key: { pk: 456, kt: 'invoice' }
  };

  it('should enhance ActionError with operation info', () => {
    const error = new BusinessLogicError('Cannot approve', 'Check status first');
    const enhanced = enhanceError(error, context);

    expect(enhanced).toBe(error);
    expect(error.errorInfo.operation.type).toBe('action');
    expect(error.errorInfo.operation.name).toBe('approve');
    expect(error.errorInfo.operation.params).toEqual({ approved: true });
    expect(error.errorInfo.context.itemType).toBe('invoice');
  });

  it('should not override existing itemType', () => {
    const error = new NotFoundError('Not found', 'custom-type', 123);
    enhanceError(error, context);

    // itemType from error constructor should be preserved
    expect(error.errorInfo.context.itemType).toBe('custom-type');
  });

  it('should add composite key info', () => {
    const error = new NotFoundError('Not found', 'orderItem', undefined);
    const comKeyContext: OperationContext = {
      ...context,
      key: {
        pk: 789,
        kt: 'orderItem',
        loc: [{ lk: 123, kt: 'order' }]
      }
    };

    enhanceError(error, comKeyContext);

    expect(error.errorInfo.context.key?.composite).toBeDefined();
    expect(error.errorInfo.context.key?.composite?.sk).toBe(789);
    expect(error.errorInfo.context.key?.composite?.kta).toEqual(['orderItem']);
    expect(error.errorInfo.context.key?.composite?.locations).toEqual([{ lk: 123, kt: 'order' }]);
  });

  it('should add parent location info', () => {
    const error = new ValidationError('Invalid');
    const locationContext: OperationContext = {
      ...context,
      locations: [
        { lk: 111, kt: 'company' },
        { lk: 222, kt: 'department' }
      ]
    };

    enhanceError(error, locationContext);

    expect(error.errorInfo.context.parentLocation).toBeDefined();
    expect(error.errorInfo.context.parentLocation?.id).toBe(111);
    expect(error.errorInfo.context.parentLocation?.type).toBe('company');
  });

  it('should return non-ActionError unchanged', () => {
    const error = new Error('Regular error');
    const enhanced = enhanceError(error, context);

    expect(enhanced).toBe(error);
    expect((enhanced as any).errorInfo).toBeUndefined();
  });
});

describe('isActionError', () => {
  it('should return true for ActionError', () => {
    const error = new NotFoundError('Not found', 'user', 123);
    expect(isActionError(error)).toBe(true);
  });

  it('should return true for ActionError subclasses', () => {
    expect(isActionError(new ValidationError('Invalid'))).toBe(true);
    expect(isActionError(new BusinessLogicError('Failed'))).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect(isActionError(new Error('Regular'))).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isActionError('string')).toBe(false);
    expect(isActionError(null)).toBe(false);
    expect(isActionError(undefined)).toBe(false);
    expect(isActionError({})).toBe(false);
  });
});

describe('getErrorInfo', () => {
  it('should return errorInfo for ActionError', () => {
    const error = new NotFoundError('Not found', 'user', 123);
    const info = getErrorInfo(error);

    expect(info.code).toBe('NOT_FOUND');
    expect(info.message).toBe('Not found');
    expect(info.context.itemType).toBe('user');
  });

  it('should create info for regular Error', () => {
    const error = new Error('Regular error');
    const info = getErrorInfo(error);

    expect(info.code).toBe('UNKNOWN_ERROR');
    expect(info.message).toBe('Regular error');
    expect(info.technical.timestamp).toBeDefined();
  });

  it('should handle non-Error objects', () => {
    const info = getErrorInfo('string error');

    expect(info.code).toBe('UNKNOWN_ERROR');
    expect(info.message).toBe('string error');
    expect(info.technical.timestamp).toBeDefined();
  });
});

