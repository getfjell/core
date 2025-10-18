/**
 * Tests for createRemoveWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRemoveWrapper } from '../../../src/operations/wrappers/createRemoveWrapper';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

describe('createRemoveWrapper', () => {
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
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      await remove(mockKey);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey);
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      await expect(remove(null as any)).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      await expect(remove(undefined as any)).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      await expect(remove({} as any)).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(remove(wrongKey as any)).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(remove(wrongKey as any)).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject key with too many location keys', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }, { kt: 'extra', lk: 'extra1' }]
      };
      await expect(remove(wrongKey as any)).rejects.toThrow('Location key array length mismatch');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await remove({ wrong: 'structure' } as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated key', async () => {
      mockImplementation.mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      const result = await remove(mockKey);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey);
      expect(result).toBeUndefined();
    });

    it('should handle async implementation', async () => {
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return undefined;
      });
      
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      const result = await remove(mockKey);
      
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      await expect(remove(mockKey)).rejects.toThrow('[remove] Operation failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation);
      
      try {
        await remove(mockKey);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(remove(mockKey)).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('remove');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(1);
        return new Error('Handled');
      });
      
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(remove(mockKey)).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customRemove'
      });
      
      await expect(remove(mockKey)).rejects.toThrow('[customRemove]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue(undefined);
      
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await remove(mockKey);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue(undefined);
      
      const remove = createRemoveWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await remove('invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<void> => {
        return;
      };
      
      const remove = createRemoveWrapper<'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await remove(mockKey);
      expect(result).toBeUndefined();
    });
  });
});
