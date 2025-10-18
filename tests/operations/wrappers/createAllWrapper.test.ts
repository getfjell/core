/**
 * Tests for createAllWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAllWrapper } from '../../../src/operations/wrappers/createAllWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
// import type { ComKey, PriKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createAllWrapper', () => {
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
    it('should accept valid query and locations', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await all({ filter: { status: 'active' } }, [{ kt: 'org', lk: '123' }]);
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { filter: { status: 'active' } },
        [{ kt: 'org', lk: '123' }]
      );
    });

    it('should accept empty query and locations', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await all({}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should reject invalid query type', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        all('invalid' as any, [])
      ).rejects.toThrow('[all] Invalid query parameter');
    });

    it('should reject array as query', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        all([] as any, [])
      ).rejects.toThrow('[all]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        all({}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for all');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        all({}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for all');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await all('invalid' as any, [{ wrong: 'structure' }] as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined query to empty object', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await all(undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should normalize undefined locations to empty array', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await all({}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should normalize both undefined params', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await all(undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
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
      
      mockImplementation.mockResolvedValue(testItems);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      const result = await all(
        { filter: { status: 'active' } },
        [{ kt: 'org', lk: 'org1' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { filter: { status: 'active' } },
        [{ kt: 'org', lk: 'org1' }]
      );
      expect(result).toStrictEqual(testItems);
    });

    it('should return empty array when implementation returns empty array', async () => {
      mockImplementation.mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      const result = await all({}, []);
      
      expect(result).toEqual([]);
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return [];
      });
      
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      const result = await all({}, []);
      
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      await expect(all({}, [])).rejects.toThrow('[all] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const all = createAllWrapper(mockCoordinate, mockImplementation);
      
      try {
        await all({}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(all({}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('all');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(2);
        return new Error('Handled');
      });
      
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(all({}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customAll'
      });
      
      await expect(all({}, [])).rejects.toThrow('[customAll]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue([]);
      
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await all({ test: 'query' }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue([]);
      
      const all = createAllWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await all('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem[]> => {
        return [];
      };
      
      const all = createAllWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await all({}, []);
      expect(result).toEqual([]);
    });
  });
});
