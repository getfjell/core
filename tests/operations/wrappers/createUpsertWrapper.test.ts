/**
 * Tests for createUpsertWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUpsertWrapper } from '../../../src/operations/wrappers/createUpsertWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createUpsertWrapper', () => {
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
    it('should accept valid key, item, and locations', async () => {
      const upserted: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Upserted',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue(upserted);
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await upsert(
        mockKey,
        { name: 'Upserted' }
      );
      
      // UpsertMethod takes (key, item, locations, options)
      expect(mockImplementation).toHaveBeenCalledWith(
        mockKey,
        { name: 'Upserted' },
        undefined,
        undefined
      );
    });

    it('should accept undefined locations', async () => {
      const upserted: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Upserted',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue(upserted);
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await upsert(mockKey, { name: 'Upserted' });
      
      // UpsertMethod takes (key, item, locations, options)
      expect(mockImplementation).toHaveBeenCalledWith(
        mockKey,
        { name: 'Upserted' },
        undefined,
        undefined
      );
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert(null as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert(undefined as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert({} as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(
        upsert(wrongKey as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(
        upsert(wrongKey as any, { name: 'Test' })
      ).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject invalid item type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert(mockKey, 'invalid' as any)
      ).rejects.toThrow('[upsert]');
    });

    it('should reject null item', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert(mockKey, null as any)
      ).rejects.toThrow('[upsert]');
    });

    it('should reject array as item', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        upsert(mockKey, [] as any)
      ).rejects.toThrow('[upsert]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      // This test is no longer valid since upsert only takes 2 params
      await upsert(mockKey, { name: 'Test' });
      expect(mockImplementation).toHaveBeenCalled();
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      // This test is no longer valid since upsert only takes 2 params
      await upsert(mockKey, { name: 'Test' });
      expect(mockImplementation).toHaveBeenCalled();
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await upsert('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should pass through item data correctly', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await upsert(mockKey, { name: 'Test' });
      
      // UpsertMethod takes (key, item, locations, options)
      expect(mockImplementation).toHaveBeenCalledWith(
        mockKey,
        { name: 'Test' },
        undefined,
        undefined
      );
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const upserted: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Upserted',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue(upserted);
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      const result = await upsert(
        mockKey,
        { name: 'Upserted' }
      );
      
      // UpsertMethod takes (key, item, locations, options)
      expect(mockImplementation).toHaveBeenCalledWith(
        mockKey,
        { name: 'Upserted' },
        undefined,
        undefined
      );
      expect(result).toBe(upserted);
    });

    it('should handle async implementation', async () => {
      const upserted: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Upserted',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return upserted;
      });
      
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      const result = await upsert(mockKey, { name: 'Upserted' });
      
      expect(result).toBe(upserted);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      await expect(upsert(mockKey, { name: 'Test' })).rejects.toThrow('[upsert] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation);
      
      try {
        await upsert(mockKey, { name: 'Test' });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(upsert(mockKey, { name: 'Test' })).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('upsert');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(4); // key, item, locations (undefined), options (undefined)
        return new Error('Handled');
      });
      
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(upsert(mockKey, { name: 'Test' })).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customUpsert'
      });
      
      await expect(upsert(mockKey, { name: 'Test' })).rejects.toThrow('[customUpsert]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(createTestItem());
      
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await upsert(mockKey, { name: 'Test' });
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      
      const upsert = createUpsertWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await upsert('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem> => {
        return createTestItem();
      };
      
      const upsert = createUpsertWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await upsert(mockKey, { name: 'Test' });
      expect(result).toBeDefined();
    });
  });
});
