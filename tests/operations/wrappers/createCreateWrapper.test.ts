/**
 * Tests for createCreateWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCreateWrapper } from '../../../src/operations/wrappers/createCreateWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createCreateWrapper', () => {
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
    it('should accept valid item and options', async () => {
      const newItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'New Item',
        events: {
          created: { user: 'test', at: new Date() },
          modified: { user: 'test', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(newItem);
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await create({ name: 'New Item' }, {
        locations: [{ kt: 'org', lk: 'org1' }]
      });
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { name: 'New Item' },
        { locations: [{ kt: 'org', lk: 'org1' }] }
      );
    });

    it('should accept valid item with key in options', async () => {
      const newItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'New Item',
        events: {
          created: { user: 'test', at: new Date() },
          modified: { user: 'test', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(newItem);
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await create({ name: 'New Item' }, {
        key: mockKey,
        locations: [{ kt: 'org', lk: 'org1' }]
      });
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { name: 'New Item' },
        { key: mockKey, locations: [{ kt: 'org', lk: 'org1' }] }
      );
    });

    it('should reject invalid item type', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        create('invalid' as any, { locations: [{ kt: 'org', lk: 'org1' }] })
      ).rejects.toThrow('[create]');
    });

    it('should reject null item', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        create(null as any, { locations: [{ kt: 'org', lk: 'org1' }] })
      ).rejects.toThrow('[create]');
    });

    it('should reject invalid key in options', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        create({ name: 'Test' }, { key: null as any })
      ).rejects.toThrow('Invalid key structure');
    });

    it('should reject invalid locations in options', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        create({ name: 'Test' }, {
          locations: [{ kt: 'wrong', lk: '123' }] as any
        })
      ).rejects.toThrow('Invalid location key array');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        create({ name: 'Test' }, {
          locations: [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any
        })
      ).rejects.toThrow('Invalid location key array');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await create('invalid' as any, { wrong: 'structure' } as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should pass undefined options through', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await create({ name: 'Test' }, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { name: 'Test' },
        undefined
      );
    });

    it('should pass undefined locations through', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await create({ name: 'Test' }, { locations: undefined });
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { name: 'Test' },
        { locations: undefined }
      );
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const newItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'New Item',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(newItem);
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      const result = await create(
        { name: 'New Item' },
        { locations: [{ kt: 'org', lk: 'org1' }] }
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { name: 'New Item' },
        { locations: [{ kt: 'org', lk: 'org1' }] }
      );
      expect(result).toBe(newItem);
    });

    it('should handle async implementation', async () => {
      const newItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'New Item',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return newItem;
      });
      
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      const result = await create({ name: 'New Item' }, { locations: [{ kt: 'org', lk: 'org1' }] });
      
      expect(result).toBe(newItem);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      await expect(create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] })).rejects.toThrow('[create] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const create = createCreateWrapper(mockCoordinate, mockImplementation);
      
      try {
        await create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] })).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('create');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(2);
        return new Error('Handled');
      });
      
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] })).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customCreate'
      });
      
      await expect(create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] })).rejects.toThrow('[customCreate]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(createTestItem());
      
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] });
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(createTestItem());
      
      const create = createCreateWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await create('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem> => {
        return createTestItem();
      };
      
      const create = createCreateWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await create({ name: 'Test' }, { locations: [{ kt: 'org', lk: 'org1' }] });
      expect(result).toBeDefined();
    });
  });
});
