/**
 * Tests for createAllActionWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAllActionWrapper } from '../../../src/operations/wrappers/createAllActionWrapper';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createAllActionWrapper', () => {
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
    it('should accept valid action name, params, and locations', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await allAction(
        'archive',
        { status: 'archived' },
        [{ kt: 'org', lk: '123' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'archive',
        { status: 'archived' },
        [{ kt: 'org', lk: '123' }]
      );
    });

    it('should accept empty params and locations', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await allAction('archive', {}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('archive', {}, []);
    });

    it('should reject empty action name', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('', {}, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject whitespace-only action name', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('  ', {}, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject null action name', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction(null as any, {}, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject undefined action name', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction(undefined as any, {}, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject non-string action name', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction(123 as any, {}, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('archive', { invalid: { nested: 'object' } } as any, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('archive', [] as any, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('archive', null as any, [])
      ).rejects.toThrow('[allAction]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('archive', {}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for allAction');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allAction('archive', {}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for allAction');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await allAction('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await allAction('archive', undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('archive', {}, []);
    });

    it('should normalize undefined locations to empty array', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await allAction('archive', {}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('archive', {}, []);
    });

    it('should normalize both undefined params', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await allAction('archive', undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('archive', {}, []);
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
      
      mockImplementation.mockResolvedValue([testItems, []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      const result = await allAction(
        'archive',
        { status: 'archived' },
        [{ kt: 'org', lk: 'org1' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'archive',
        { status: 'archived' },
        [{ kt: 'org', lk: 'org1' }]
      );
      expect(result).toEqual([testItems, []]);
    });

    it('should return empty arrays when implementation returns empty arrays', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      const result = await allAction('archive', {}, []);
      
      expect(result).toEqual([[], []]);
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return [[], []];
      });
      
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      const result = await allAction('archive', {}, []);
      
      expect(result).toEqual([[], []]);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      await expect(allAction('archive', {}, [])).rejects.toThrow('[allAction] Action "archive" failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation);
      
      try {
        await allAction('archive', {}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(allAction('archive', {}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('allAction');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(3);
        return new Error('Handled');
      });
      
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(allAction('archive', {}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customAllAction'
      });
      
      await expect(allAction('archive', {}, [])).rejects.toThrow('[customAllAction]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue([[], []]);
      
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await allAction('archive', { test: 'params' }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue([[], []]);
      
      const allAction = createAllActionWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await allAction('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<[TestItem[], TestItem[]]> => {
        return [[], []];
      };
      
      const allAction = createAllActionWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await allAction('archive', {}, []);
      expect(result).toEqual([[], []]);
    });
  });
});
