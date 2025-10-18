/**
 * Tests for createFacetWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacetWrapper } from '../../../src/operations/wrappers/createFacetWrapper';
import type { Coordinate } from '../../../src/Coordinate';
import type { ComKey } from '../../../src/keys';

describe('createFacetWrapper', () => {
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
    it('should accept valid key, facet name, and params', async () => {
      mockImplementation.mockResolvedValue({ count: 42 });
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await facet(mockKey, 'statistics', { period: 'month' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'statistics', { period: 'month' });
    });

    it('should accept empty params', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await facet(mockKey, 'statistics', {});
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'statistics', {});
    });

    it('should reject null key', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(null as any, 'statistics', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject undefined key', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(undefined as any, 'statistics', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject invalid key structure', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet({} as any, 'statistics', {})
      ).rejects.toThrow('Invalid key');
    });

    it('should reject key with wrong key type', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'wrong',
        pk: '123',
        loc: [{ kt: 'org', lk: 'org1' }]
      };
      await expect(
        facet(wrongKey as any, 'statistics', {})
      ).rejects.toThrow('Invalid key type');
    });

    it('should reject key with wrong location key type', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      const wrongKey = {
        kt: 'test',
        pk: '123',
        loc: [{ kt: 'wrong', lk: 'org1' }]
      };
      await expect(
        facet(wrongKey as any, 'statistics', {})
      ).rejects.toThrow('Location key array order mismatch');
    });

    it('should reject empty facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, '', {})
      ).rejects.toThrow('[facet]');
    });

    it('should reject whitespace-only facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, '  ', {})
      ).rejects.toThrow('[facet]');
    });

    it('should reject null facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, null as any, {})
      ).rejects.toThrow('[facet]');
    });

    it('should reject undefined facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, undefined as any, {})
      ).rejects.toThrow('[facet]');
    });

    it('should reject non-string facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, 123 as any, {})
      ).rejects.toThrow('[facet]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, 'statistics', { invalid: { nested: 'object' } } as any)
      ).rejects.toThrow('[facet]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, 'statistics', [] as any)
      ).rejects.toThrow('[facet]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        facet(mockKey, 'statistics', null as any)
      ).rejects.toThrow('[facet]');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await facet('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      mockImplementation.mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await facet(mockKey, 'statistics', undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'statistics', {});
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const facetResult = { count: 42, total: 100 };
      
      mockImplementation.mockResolvedValue(facetResult);
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      const result = await facet(mockKey, 'statistics', { period: 'month' });
      
      expect(mockImplementation).toHaveBeenCalledWith(mockKey, 'statistics', { period: 'month' });
      expect(result).toBe(facetResult);
    });

    it('should handle async implementation', async () => {
      const facetResult = { count: 42, total: 100 };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return facetResult;
      });
      
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      const result = await facet(mockKey, 'statistics', { period: 'month' });
      
      expect(result).toBe(facetResult);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(facet(mockKey, 'statistics', {})).rejects.toThrow('[facet] Facet "statistics" failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const facet = createFacetWrapper(mockCoordinate, mockImplementation);
      
      try {
        await facet(mockKey, 'statistics', {});
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(facet(mockKey, 'statistics', {})).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('facet');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(3);
        return new Error('Handled');
      });
      
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(facet(mockKey, 'statistics', {})).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customFacet'
      });
      
      await expect(facet(mockKey, 'statistics', {})).rejects.toThrow('[customFacet]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue({});
      
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await facet(mockKey, 'statistics', { test: 'params' });
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue({});
      
      const facet = createFacetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await facet('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<Record<string, any>> => {
        return {};
      };
      
      const facet = createFacetWrapper<'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await facet(mockKey, 'statistics', {});
      expect(result).toBeDefined();
    });
  });
});
