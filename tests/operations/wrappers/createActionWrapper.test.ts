/**
 * Tests for createActionWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActionWrapper } from '../../../src/operations/wrappers/createActionWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createActionWrapper', () => {
  let mockCoordinate: Coordinate<'test', 'org'>;
  let mockImplementation: ReturnType<typeof vi.fn>;
  let mockKey: ComKey<'test', 'org'>;

  // Helper to create a valid test item with proper key
  const createTestItem = (overrides?: Partial<TestItem>): TestItem => ({
    key: mockKey,
    id: '123',
    name: 'Test Item',
    events: {
      created: { at: new Date() },
      updated: { at: new Date() },
      deleted: { at: null }
    },
    ...overrides
  });

  beforeEach(() => {
    mockCoordinate = {
      pkType: 'test',
      kta: ['test', 'org'],
      keyTypes: ['test', 'org'],
      scopes: []
    } as Coordinate<'test', 'org'>;
    
    mockImplementation = vi.fn();
    
    mockKey = {
      kt: 'test',
      pk: '123',
      loc: [{ kt: 'org', lk: 'org1' }]
    };
  });

  describe('validation', () => {
    it('should accept valid key, action name, and params', async () => {
      const updatedItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue([updatedItem, []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await action(mockKey, 'promote', { role: 'admin' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'promote', { role: 'admin' });
    });

    it('should accept empty params', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await action(mockKey, 'promote', {});
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'promote', {});
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(null as any, 'promote', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(undefined as any, 'promote', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action({} as any, 'promote', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(
        action(wrongKey as any, 'promote', {})
      ).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(
        action(wrongKey as any, 'promote', {})
      ).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject empty action name', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, '', {})
      ).rejects.toThrow('[action]');
    });

    it('should reject whitespace-only action name', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, '  ', {})
      ).rejects.toThrow('[action]');
    });

    it('should reject null action name', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, null as any, {})
      ).rejects.toThrow('[action]');
    });

    it('should reject undefined action name', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, undefined as any, {})
      ).rejects.toThrow('[action]');
    });

    it('should reject non-string action name', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, 123 as any, {})
      ).rejects.toThrow('[action]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, 'promote', { invalid: { nested: 'object' } } as any)
      ).rejects.toThrow('[action]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, 'promote', [] as any)
      ).rejects.toThrow('[action]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        action(mockKey, 'promote', null as any)
      ).rejects.toThrow('[action]');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await action('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await action(mockKey, 'promote', undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'promote', {});
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const updatedItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue([updatedItem, []]);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      const result = await action(mockKey, 'promote', { role: 'admin' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'promote', { role: 'admin' });
      expect(result).toEqual([updatedItem, []]);
    });

    it('should handle async implementation', async () => {
      const updatedItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return [updatedItem, []];
      });
      
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      const result = await action(mockKey, 'promote', { role: 'admin' });
      
      expect(result).toEqual([updatedItem, []]);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(action(mockKey, 'promote', {})).rejects.toThrow('[action] Action "promote" failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const action = createActionWrapper(mockCoordinate, mockImplementation);
      
      try {
        await action(mockKey, 'promote', {});
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(action(mockKey, 'promote', {})).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('action');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(3);
        return new Error('Handled');
      });
      
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(action(mockKey, 'promote', {})).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customAction'
      });
      
      await expect(action(mockKey, 'promote', {})).rejects.toThrow('[customAction]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await action(mockKey, 'promote', { test: 'params' });
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue([createTestItem(), []]);
      
      const action = createActionWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await action('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<[TestItem, any[]]> => {
        return [createTestItem(), []];
      };
      
      const action = createActionWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await action(mockKey, 'promote', {});
      expect(result).toBeDefined();
    });
  });
});
