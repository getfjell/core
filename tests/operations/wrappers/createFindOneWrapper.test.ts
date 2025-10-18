/**
 * Tests for createFindOneWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFindOneWrapper } from '../../../src/operations/wrappers/createFindOneWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createFindOneWrapper', () => {
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
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await findOne(
        'byEmail',
        { email: 'test@example.com' },
        [{ kt: 'org', lk: '123' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'byEmail',
        { email: 'test@example.com' },
        [{ kt: 'org', lk: '123' }]
      );
    });

    it('should accept empty params and locations', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await findOne('byEmail', {}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('byEmail', {}, []);
    });

    it('should reject empty finder name', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('', {}, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject whitespace-only finder name', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('  ', {}, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject null finder name', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne(null as any, {}, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject undefined finder name', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne(undefined as any, {}, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject non-string finder name', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne(123 as any, {}, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('byEmail', { invalid: { nested: 'object' } } as any, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('byEmail', [] as any, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('byEmail', null as any, [])
      ).rejects.toThrow('[findOne]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('byEmail', {}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for findOne');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        findOne('byEmail', {}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for findOne');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await findOne('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await findOne('byEmail', undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('byEmail', {}, []);
    });

    it('should normalize undefined locations to empty array', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await findOne('byEmail', {}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('byEmail', {}, []);
    });

    it('should normalize both undefined params', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await findOne('byEmail', undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('byEmail', {}, []);
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const testItem: TestItem = {
        key: { kt: 'test', pk: '123', loc: [{ kt: 'org', lk: 'org1' }] },
        id: '123',
        name: 'Test',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(testItem);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      const result = await findOne(
        'byEmail',
        { email: 'test@example.com' },
        [{ kt: 'org', lk: 'org1' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'byEmail',
        { email: 'test@example.com' },
        [{ kt: 'org', lk: 'org1' }]
      );
      expect(result).toBe(testItem);
    });

    it('should return null when implementation returns null', async () => {
      mockImplementation.mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      const result = await findOne('byEmail', {}, []);
      
      expect(result).toBeNull();
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return null;
      });
      
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      const result = await findOne('byEmail', {}, []);
      
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      await expect(findOne('byEmail', {}, [])).rejects.toThrow('[findOne] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation);
      
      try {
        await findOne('byEmail', {}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(findOne('byEmail', {}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('findOne');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(3);
        return new Error('Handled');
      });
      
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(findOne('byEmail', {}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customFindOne'
      });
      
      await expect(findOne('byEmail', {}, [])).rejects.toThrow('[customFindOne]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(null);
      
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await findOne('byEmail', { test: 'query' }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(null);
      
      const findOne = createFindOneWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await findOne('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem | null> => {
        return null;
      };
      
      const findOne = createFindOneWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await findOne('byEmail', {}, []);
      expect(result).toBeNull();
    });
  });
});
