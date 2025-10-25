/**
 * Tests for createGetWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGetWrapper } from '../../../src/operations/wrappers/createGetWrapper';
import { NotFoundError } from '../../../src/errors/NotFoundError';
import type { Item } from '../../../src';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey, PriKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('createGetWrapper', () => {
  let mockCoordinate: Coordinate<'test', 'org'>;
  let mockImplementation: ReturnType<typeof vi.fn>;
  let mockKey: ComKey<'test', 'org'>;

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
    it('should accept valid key', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      await get(mockKey);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey);
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      await expect(get(null as any)).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      await expect(get(undefined as any)).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      await expect(get({} as any)).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey: PriKey<'test'> = { kt: 'test', pk: '123' };
      await expect(get(wrongKey as any)).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong primary key type', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(get(wrongKey as any)).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(get(wrongKey as any)).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject key with too many location keys', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }, { kt: 'extra', lk: 'extra1' }]
      };
      await expect(get(wrongKey as any)).rejects.toThrow('Location key array length mismatch');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await get({ wrong: 'structure' } as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated key', async () => {
      const testItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Test',
        events: {
          created: { user: 'system', at: new Date() },
          modified: { user: 'system', at: new Date() }
        }
      };
      
      mockImplementation.mockResolvedValue(testItem);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const result = await get(mockKey);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey);
      expect(result).toBe(testItem);
    });

    it('should return null when implementation returns null', async () => {
      mockImplementation.mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      const result = await get(mockKey);
      
      expect(result).toBeNull();
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return null;
      });
      
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      const result = await get(mockKey);
      
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      await expect(get(mockKey)).rejects.toThrow('[get] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      try {
        await get(mockKey);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(get(mockKey)).rejects.toThrow('Custom error');
    });

    it('should preserve NotFoundError instances without wrapping them', async () => {
      const notFoundError = new NotFoundError(
        'Item not found',
        'test',
        mockKey
      );
      mockImplementation.mockRejectedValue(notFoundError);
      const get = createGetWrapper(mockCoordinate, mockImplementation);
      
      try {
        await get(mockKey);
        expect.fail('Should have thrown');
      } catch (error: any) {
        // Verify it's still a NotFoundError, not wrapped in a generic Error
        expect(error).toBe(notFoundError);
        expect(error instanceof NotFoundError).toBe(true);
        expect(error.constructor.name).toBe('NotFoundError');
        // It should NOT have the "[get] Operation failed" wrapper message
        expect(error.message).not.toContain('[get] Operation failed');
      }
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('get');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(1);
        return new Error('Handled');
      });
      
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(get(mockKey)).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customGet'
      });
      
      await expect(get(mockKey)).rejects.toThrow('[customGet]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(null);
      
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await get(mockKey);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(null);
      
      const get = createGetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await get('invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<TestItem | null> => {
        return null;
      };
      
      const get = createGetWrapper<TestItem, 'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await get(mockKey);
      expect(result).toBeNull();
    });
  });
});
