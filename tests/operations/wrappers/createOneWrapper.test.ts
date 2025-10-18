/**
 * Tests for createOneWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOneWrapper } from '../../../src/operations/wrappers/createOneWrapper';
import type { Item } from '../../../src';
import { type Coordinate, createCoordinate } from '../../../src/Coordinate';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createOneWrapper', () => {
  let mockCoordinate: Coordinate<'test', 'org'>;
  let mockImplementation: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCoordinate = createCoordinate(['test', 'org']);
    
    mockImplementation = vi.fn();
  });

  describe('validation', () => {
    it('should accept valid query and locations', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await one({ compoundCondition: { compoundType: 'AND', conditions: [{ column: 'status', value: 'active', operator: '==' }] } }, []);
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { compoundCondition: { compoundType: 'AND', conditions: [{ column: 'status', value: 'active', operator: '==' }] } },
        []
      );
    });

    it('should accept empty query and locations', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await one({}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should reject invalid query type', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        one('invalid' as any, [])
      ).rejects.toThrow('[one] Invalid query parameter');
    });

    it('should reject array as query', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        one([] as any, [])
      ).rejects.toThrow('[one]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        one({}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for one');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        one({}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for one');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await one('invalid' as any, [{ wrong: 'structure' }] as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined query to empty object', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await one(undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should normalize undefined locations to empty array', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await one({}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });

    it('should normalize both undefined params', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await one(undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith({}, []);
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const testItem: TestItem = {
        key: { kt: 'test', pk: '123', loc: [{ kt: 'org', lk: 'org1' }] },
        id: '123',
        name: 'Test',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      mockImplementation.mockResolvedValue(testItem);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      const result = await one(
        { compoundCondition: { compoundType: 'AND', conditions: [{ column: 'name', value: 'Test', operator: '==' }] } },
        []
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        { compoundCondition: { compoundType: 'AND', conditions: [{ column: 'name', value: 'Test', operator: '==' }] } },
        []
      );
      expect(result).toBe(testItem);
    });

    it('should return null when implementation returns null', async () => {
      mockImplementation.mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      const result = await one({}, []);
      
      expect(result).toBeNull();
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return null;
      });
      
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      const result = await one({}, []);
      
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(one({}, [])).rejects.toThrow('[one] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const one = createOneWrapper(mockCoordinate, mockImplementation);
      
      try {
        await one({}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(one({}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('one');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(2);
        return new Error('Handled');
      });
      
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(one({}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customOne'
      });
      
      await expect(one({}, [])).rejects.toThrow('[customOne]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(null);
      
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await one({ limit: 10 }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(null);
      
      const one = createOneWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await one('invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem | null> => {
        return null;
      };
      
      const one = createOneWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await one({}, []);
      expect(result).toBeNull();
    });
  });
});

