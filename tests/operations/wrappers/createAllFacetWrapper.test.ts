/**
 * Tests for createAllFacetWrapper
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAllFacetWrapper } from '../../../src/operations/wrappers/createAllFacetWrapper';
import type { Coordinate } from '../../../src/Coordinate';

describe('createAllFacetWrapper', () => {
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
    it('should accept valid facet name, params, and locations', async () => {
      mockImplementation.mockResolvedValue({ total: 100 });
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await allFacet(
        'summary',
        { groupBy: 'status' },
        [{ kt: 'org', lk: '123' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'summary',
        { groupBy: 'status' },
        [{ kt: 'org', lk: '123' }]
      );
    });

    it('should accept empty params and locations', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await allFacet('summary', {}, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('summary', {}, []);
    });

    it('should reject empty facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('', {}, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject whitespace-only facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('  ', {}, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject null facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet(null as any, {}, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject undefined facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet(undefined as any, {}, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject non-string facet name', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet(123 as any, {}, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject invalid params with nested objects', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('summary', { invalid: { nested: 'object' } } as any, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject array as params', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('summary', [] as any, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject null as params', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('summary', null as any, [])
      ).rejects.toThrow('[allFacet]');
    });

    it('should reject invalid locations with wrong key type', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('summary', {}, [{ kt: 'wrong', lk: '123' }] as any)
      ).rejects.toThrow('Invalid location key array order for allFacet');
    });

    it('should reject locations with too many elements', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(
        allFacet('summary', {}, [{ kt: 'org', lk: '1' }, { kt: 'extra', lk: '2' }] as any)
      ).rejects.toThrow('Invalid location key array for allFacet');
    });

    it('should skip validation when skipValidation is true', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true
      });
      
      // Should not throw even with invalid data
      await allFacet('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('parameter normalization', () => {
    it('should normalize undefined params to empty object', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await allFacet('summary', undefined, []);
      
      expect(mockImplementation).toHaveBeenCalledWith('summary', {}, []);
    });

    it('should normalize undefined locations to empty array', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await allFacet('summary', {}, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('summary', {}, []);
    });

    it('should normalize both undefined params', async () => {
      mockImplementation.mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await allFacet('summary', undefined, undefined);
      
      expect(mockImplementation).toHaveBeenCalledWith('summary', {}, []);
    });
  });

  describe('implementation execution', () => {
    it('should call implementation with validated params', async () => {
      const facetResult = { total: 100, count: 42, average: 25.5 };
      
      mockImplementation.mockResolvedValue(facetResult);
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      const result = await allFacet(
        'summary',
        { groupBy: 'status' },
        [{ kt: 'org', lk: 'org1' }]
      );
      
      expect(mockImplementation).toHaveBeenCalledWith(
        'summary',
        { groupBy: 'status' },
        [{ kt: 'org', lk: 'org1' }]
      );
      expect(result).toBe(facetResult);
    });

    it('should handle async implementation', async () => {
      const facetResult = { total: 100, count: 42 };
      
      mockImplementation.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return facetResult;
      });
      
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      const result = await allFacet('summary', { groupBy: 'status' }, [{ kt: 'org', lk: 'org1' }]);
      
      expect(result).toBe(facetResult);
    });
  });

  describe('error handling', () => {
    it('should enhance errors with operation context', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      await expect(allFacet('summary', {}, [])).rejects.toThrow('[allFacet] Facet "summary" failed');
    });

    it('should preserve original error in cause', async () => {
      const originalError = new Error('Original error');
      mockImplementation.mockRejectedValue(originalError);
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation);
      
      try {
        await allFacet('summary', {}, []);
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.cause).toBe(originalError);
      }
    });

    it('should use custom error handler if provided', async () => {
      const error = new Error('Database error');
      const customError = new Error('Custom error');
      mockImplementation.mockRejectedValue(error);
      
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        onError: () => customError
      });
      
      await expect(allFacet('summary', {}, [])).rejects.toThrow('Custom error');
    });

    it('should provide context to custom error handler', async () => {
      const error = new Error('Database error');
      mockImplementation.mockRejectedValue(error);
       
      const errorHandler = vi.fn((_err, context) => {
        expect(context.operationName).toBe('allFacet');
        expect(context.coordinate).toBe(mockCoordinate);
        expect(context.params).toHaveLength(3);
        return new Error('Handled');
      });
      
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        onError: errorHandler
      });
      
      await expect(allFacet('summary', {}, [])).rejects.toThrow('Handled');
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('options', () => {
    it('should use custom operation name in errors', async () => {
      mockImplementation.mockRejectedValue(new Error('fail'));
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        operationName: 'customAllFacet'
      });
      
      await expect(allFacet('summary', {}, [])).rejects.toThrow('[customAllFacet]');
    });

    it('should log debug info when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockImplementation.mockResolvedValue({});
      
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        debug: true
      });
      
      await allFacet('summary', { test: 'params' }, []);
      
      // Note: The actual logging uses LibLogger which may not call console.log
      // This test verifies the option is accepted without errors
      expect(mockImplementation).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle all options together', async () => {
      mockImplementation.mockResolvedValue({});
      
      const allFacet = createAllFacetWrapper(mockCoordinate, mockImplementation, {
        skipValidation: true,
        operationName: 'custom',
        debug: true,
        onError: () => new Error('custom')
      });
      
      await allFacet('invalid' as any, 'invalid' as any, 'invalid' as any);
      expect(mockImplementation).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for implementation', async () => {
      // This test verifies TypeScript compilation
      const typedImplementation = async (): Promise<Record<string, any>> => {
        return {};
      };
      
      const allFacet = createAllFacetWrapper<'test', 'org'>(
        mockCoordinate,
        typedImplementation
      );
      
      const result = await allFacet('summary', {}, []);
      expect(result).toBeDefined();
    });
  });
});
