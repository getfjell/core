/**
 * Tests for createUpdateWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUpdateWrapper } from '../../../src/operations/wrappers/createUpdateWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createUpdateWrapper', () => {
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
      keyTypes: ['test', 'org']
    } as Coordinate<'test', 'org'>;
    
    mockImplementation = vi.fn();
    
    mockKey = {
      kt: 'test',
      pk: '123',
      loc: [{ kt: 'org', lk: 'org1' }]
    };
  });

  describe('validation', () => {
    it('should accept valid key and item', async () => {
      const updated: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { user: 'test', at: new Date() },
          modified: { user: 'test', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(updated);
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await update(mockKey, { name: 'Updated' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, { name: 'Updated' });
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update(null as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update(undefined as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update({} as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(
        update(wrongKey as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(
        update(wrongKey as any, { name: 'Test' })
      ).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject invalid item type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update(mockKey, 'invalid' as any)
      ).rejects.toThrow('[update]');
    });

    it('should reject null item', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update(mockKey, null as any)
      ).rejects.toThrow('[update]');
    });

    it('should reject array as item', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        update(mockKey, [] as any)
      ).rejects.toThrow('[update]');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await update('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const updated: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(updated);
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      const result = await update(mockKey, { name: 'Updated' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, { name: 'Updated' });
      expect(result).toBe(updated);
    });

    it('should handle async implementation', async () => {
      const updated: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return updated;
      });
      
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      const result = await update(mockKey, { name: 'Updated' });
      
      expect(result).toBe(updated);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      await expect(update(mockKey, { name: 'Test' })).rejects.toThrow('[update] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const update = createUpdateWrapper(mockCoordinate, mockImplementation);
      
      try {
        await update(mockKey, { name: 'Test' });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(update(mockKey, { name: 'Test' })).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('update');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(2);
        return new Error('Handled');
      });
      
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(update(mockKey, { name: 'Test' })).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customUpdate'
      });
      
      await expect(update(mockKey, { name: 'Test' })).rejects.toThrow('[customUpdate]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(createTestItem());
      
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await update(mockKey, { name: 'Test' });
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      
      const update = createUpdateWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await update('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem> => {
        return createTestItem();
      };
      
      const update = createUpdateWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await update(mockKey, { name: 'Test' });
      expect(result).toBeDefined();
    });
  });
});
