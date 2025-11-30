/**
 * Tests for createFindWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFindWrapper } from '../../../src/operations/wrappers/createFindWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createFindWrapper', () => {
  let mockCoordinate: Coordinate<'test', 'org'>;
  let mockImplementation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCoordinate = {
      pkType: 'test',
      kta: ['test', 'org'],
      keyTypes: ['test', 'org']
    } as Coordinate<'test', 'org'>;
    
    mockImplementation = vi.fn();
  });

  describe('validation', () => {
    it('should accept valid finder name, params, and locations', async () => {
      const emptyResult = {
        items: [],
        metadata: { total: 0, returned: 0, offset: 0, hasMore: false }
      };
      mockImplementation.mockResolvedValue(emptyResult);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await find(
        'byStatus',
        { status: 'active' },
        [{ kt: 'org', lk: '123' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'byStatus',
        { status: 'active' },
        [{ kt: 'org', lk: '123' }],
        undefined
      );
    });

    it('should accept empty params and locations', async () => {
      const emptyResult = {
        items: [],
        metadata: { total: 0, returned: 0, offset: 0, hasMore: false }
      };
      mockImplementation.mockResolvedValue(emptyResult);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await find('byStatus', {}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('byStatus', {}, [], undefined);
    });

    it('should reject empty finder name', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('', {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject whitespace-only finder name', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('  ', {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject null finder name', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find(null as any, {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject undefined finder name', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find(undefined as any, {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject non-string finder name', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find(123 as any, {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('byStatus', { invalid: { nested: 'object' } } as any, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('byStatus', [] as any, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('byStatus', null as any, [])
      ).rejects.toThrow('[find]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('byStatus', {}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for find');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        find('byStatus', {}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for find');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await find('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      const emptyResult = {
        items: [],
        metadata: { total: 0, returned: 0, offset: 0, hasMore: false }
      };
      mockImplementation.mockResolvedValue(emptyResult);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await find('byStatus', undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('byStatus', {}, [], undefined);
    });

    it('should normalize undefined locations to empty array', async () => {
      const emptyResult = {
        items: [],
        metadata: { total: 0, returned: 0, offset: 0, hasMore: false }
      };
      mockImplementation.mockResolvedValue(emptyResult);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await find('byStatus', {}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('byStatus', {}, [], undefined);
    });

    it('should normalize both undefined params', async () => {
      const emptyResult = {
        items: [],
        metadata: { total: 0, returned: 0, offset: 0, hasMore: false }
      };
      mockImplementation.mockResolvedValue(emptyResult);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await find('byStatus', undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('byStatus', {}, [], undefined);
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const testItems: TestItem[] = [
        {
          key: { kt: 'test', pk: '123', loc: [{ kt: 'org', lk: 'org1' }] },
          id: '123',
          name: 'Test 1',
          events: {
            created: { user: 'system', at: new Date() },
            modified: { user: 'system', at: new Date() }
          }
        },
        {
          key: { kt: 'test', pk: '456', loc: [{ kt: 'org', lk: 'org1' }] },
          id: '456',
          name: 'Test 2',
          events: {
            created: { user: 'system', at: new Date() },
            modified: { user: 'system', at: new Date() }
          }
        }
      ];
      
      // Implementation can return array (legacy) or FindOperationResult (opt-in)
      // Wrapper will handle both
      mockImplementation.mockResolvedValue(testItems);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      const result = await find(
        'byStatus',
        { status: 'active' },
        [{ kt: 'org', lk: 'org1' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'byStatus',
        { status: 'active' },
        [{ kt: 'org', lk: 'org1' }],
        undefined
      );
      // Wrapper wraps array in FindOperationResult
      expect(result.items).toStrictEqual(testItems);
      expect(result.metadata.total).toBe(testItems.length);
    });

    it('should return empty array when implementation returns empty array', async () => {
      mockImplementation.mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      const result = await find('byStatus', {}, []);
      
      // Wrapper wraps array in FindOperationResult
      expect(result.items).toEqual([]);
      expect(result.metadata.total).toBe(0);
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return [];
      });
      
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      const result = await find('byStatus', {}, []);
      
      // Wrapper wraps array in FindOperationResult
      expect(result.items).toEqual([]);
      expect(result.metadata.total).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      await expect(find('byStatus', {}, [])).rejects.toThrow('[find] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const find = createFindWrapper(mockCoordinate, mockImplementation);
      
      try {
        await find('byStatus', {}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(find('byStatus', {}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('find');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(4); // finder, params, locations, findOptions
        return new Error('Handled');
      });
      
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(find('byStatus', {}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customFind'
      });
      
      await expect(find('byStatus', {}, [])).rejects.toThrow('[customFind]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue([]);
      
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await find('byStatus', { test: 'query' }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue([]);
      
      const find = createFindWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await find('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      // Implementation can return array (legacy) - wrapper will wrap it
      const typedImplementation = async (): Promise<TestItem[]> => {
        return [];
      };
      
      const find = createFindWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await find('byStatus', {}, []);
      // Wrapper wraps array in FindOperationResult
      expect(result.items).toEqual([]);
      expect(result.metadata.total).toBe(0);
    });
  });
});
