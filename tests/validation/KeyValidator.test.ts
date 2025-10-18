import { describe, expect, it } from 'vitest';
import { validateComKey, validateKey, validatePriKey } from '../../src/validation/KeyValidator';
import type { ComKey, PriKey } from '../../src/keys';
import type { Coordinate } from '../../src/Coordinate';

// Mock coordinate for testing
const mockCoordinate = (kta: readonly string[]): Coordinate<any, any, any, any, any, any> => ({
  kta,
  toString: () => `Coordinate[${kta.join(', ')}]`
} as any);

describe('KeyValidator', () => {
  describe('validateKey', () => {
    describe('primary library (kta.length === 1)', () => {
      it('should accept valid PriKey', () => {
        const coordinate = mockCoordinate(['product']);
        const key: PriKey<'product'> = { kt: 'product', pk: '123' };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should accept PriKey with UUID', () => {
        const coordinate = mockCoordinate(['user']);
        const key: PriKey<'user'> = {
          kt: 'user',
          pk: '123e4567-e89b-12d3-a456-426614174000'
        };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should accept PriKey with number pk', () => {
        const coordinate = mockCoordinate(['order']);
        const key: PriKey<'order'> = { kt: 'order', pk: 12345 };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should reject ComKey for primary library', () => {
        const coordinate = mockCoordinate(['product']);
        const key: ComKey<'product', 'store'> = {
          kt: 'product',
          pk: '123',
          loc: [{ kt: 'store', lk: '456' }]
        };
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Invalid key type for get operation/
        );
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /This is a primary item library/
        );
      });
    });

    describe('composite library (kta.length > 1)', () => {
      it('should accept valid ComKey with single location', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key: ComKey<'product', 'store'> = {
          kt: 'product',
          pk: '123',
          loc: [{ kt: 'store', lk: '456' }]
        };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should accept valid ComKey with two locations', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const key: ComKey<'product', 'store', 'region'> = {
          kt: 'product',
          pk: '123',
          loc: [
            { kt: 'store', lk: '456' },
            { kt: 'region', lk: '789' }
          ]
        };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should accept valid ComKey with three locations', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country']);
        const key: ComKey<'product', 'store', 'region', 'country'> = {
          kt: 'product',
          pk: '1',
          loc: [
            { kt: 'store', lk: '2' },
            { kt: 'region', lk: '3' },
            { kt: 'country', lk: '4' }
          ]
        };
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should accept ComKey with empty loc array (foreign key case)', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key = {
          kt: 'product',
          pk: '123',
          loc: []
        } as ComKey<'product', 'store'>;
        
        expect(() => validateKey(key, coordinate, 'get')).not.toThrow();
      });

      it('should reject PriKey for composite library', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key: PriKey<'product'> = { kt: 'product', pk: '123' };
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Invalid key type for get operation/
        );
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /This is a composite item library/
        );
      });

      it('should reject ComKey with wrong location order', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const key = {
          kt: 'product',
          pk: '123',
          loc: [
            { kt: 'region', lk: '789' },
            { kt: 'store', lk: '456' }
          ]
        } as any;
        
        expect(() => validateKey(key, coordinate, 'update')).toThrow(
          /Location key array order mismatch/
        );
      });

      it('should reject ComKey with wrong location types', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key = {
          kt: 'product',
          pk: '123',
          loc: [{ kt: 'warehouse', lk: '456' }]
        } as any;
        
        expect(() => validateKey(key, coordinate, 'remove')).toThrow(
          /At position 0, expected key type "store" but received "warehouse"/
        );
      });

      it('should reject ComKey with too many locations', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key = {
          kt: 'product',
          pk: '123',
          loc: [
            { kt: 'store', lk: '456' },
            { kt: 'region', lk: '789' }
          ]
        } as any;
        
        expect(() => validateKey(key, coordinate, 'action')).toThrow(
          /Location key array length mismatch/
        );
      });

      it('should reject ComKey with too few locations', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const key = {
          kt: 'product',
          pk: '123',
          loc: [{ kt: 'store', lk: '456' }]
        } as any;
        
        expect(() => validateKey(key, coordinate, 'facet')).toThrow(
          /Location key array length mismatch/
        );
        expect(() => validateKey(key, coordinate, 'facet')).toThrow(
          /Expected 2 location keys but received 1/
        );
      });
    });

    describe('invalid key structures', () => {
      it('should reject invalid key structure (missing fields)', () => {
        const coordinate = mockCoordinate(['product']);
        const key = { kt: 'product' } as any;
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Invalid key structure/
        );
      });

      it('should reject null key', () => {
        const coordinate = mockCoordinate(['product']);
        const key = null as any;
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Invalid key structure/
        );
      });

      it('should reject undefined key', () => {
        const coordinate = mockCoordinate(['product']);
        const key = undefined as any;
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Invalid key structure/
        );
      });
    });

    describe('error messages', () => {
      it('should include operation name in error', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key: PriKey<'product'> = { kt: 'product', pk: '123' };
        
        expect(() => validateKey(key, coordinate, 'myCustomOp')).toThrow(
          /myCustomOp/
        );
      });

      it('should provide helpful ComKey format example', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const key: PriKey<'product'> = { kt: 'product', pk: '123' };
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Expected: ComKey with format/
        );
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /loc: \[/
        );
      });

      it('should provide helpful PriKey format example', () => {
        const coordinate = mockCoordinate(['product']);
        const key: ComKey<'product', 'store'> = {
          kt: 'product',
          pk: '123',
          loc: [{ kt: 'store', lk: '456' }]
        };
        
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /Expected: PriKey with format/
        );
        expect(() => validateKey(key, coordinate, 'get')).toThrow(
          /{ kt: 'product', pk: string\|number }/
        );
      });
    });

    describe('all operations', () => {
      const operations = ['get', 'create', 'update', 'upsert', 'remove', 'action', 'facet'];
      
      operations.forEach(operation => {
        it(`should work correctly for ${operation} operation`, () => {
          const coordinate = mockCoordinate(['product', 'store']);
          const validKey: ComKey<'product', 'store'> = {
            kt: 'product',
            pk: '123',
            loc: [{ kt: 'store', lk: '456' }]
          };
          const invalidKey: PriKey<'product'> = { kt: 'product', pk: '123' };
          
          expect(() => validateKey(validKey, coordinate, operation)).not.toThrow();
          expect(() => validateKey(invalidKey, coordinate, operation)).toThrow();
        });
      });
    });
  });

  describe('validatePriKey', () => {
    it('should accept valid PriKey', () => {
      const key: PriKey<'product'> = { kt: 'product', pk: '123' };
      expect(() => validatePriKey(key, 'product', 'test')).not.toThrow();
    });

    it('should accept PriKey with number pk', () => {
      const key: PriKey<'order'> = { kt: 'order', pk: 999 };
      expect(() => validatePriKey(key, 'order', 'test')).not.toThrow();
    });

    it('should reject undefined key', () => {
      expect(() => validatePriKey(undefined as any, 'product', 'test')).toThrow(
        /PriKey is undefined or null/
      );
    });

    it('should reject null key', () => {
      expect(() => validatePriKey(null as any, 'product', 'test')).toThrow(
        /PriKey is undefined or null/
      );
    });

    it('should reject key missing kt', () => {
      const key = { pk: '123' } as any;
      expect(() => validatePriKey(key, 'product', 'test')).toThrow(
        /PriKey is missing 'kt' field/
      );
    });

    it('should reject key with wrong kt', () => {
      const key: PriKey<'order'> = { kt: 'order', pk: '123' };
      expect(() => validatePriKey(key, 'product', 'test')).toThrow(
        /PriKey has incorrect type/
      );
      expect(() => validatePriKey(key, 'product', 'test')).toThrow(
        /Expected: 'product'/
      );
      expect(() => validatePriKey(key, 'product', 'test')).toThrow(
        /Received: 'order'/
      );
    });

    it('should reject key missing pk', () => {
      const key = { kt: 'product' } as any;
      expect(() => validatePriKey(key, 'product', 'test')).toThrow(
        /PriKey is missing 'pk' field/
      );
    });

    it('should include operation name in errors', () => {
      const key = { kt: 'product' } as any;
      expect(() => validatePriKey(key, 'product', 'myOp')).toThrow(
        /\[myOp\]/
      );
    });
  });

  describe('validateComKey', () => {
    it('should accept valid ComKey', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key: ComKey<'product', 'store'> = {
        kt: 'product',
        pk: '123',
        loc: [{ kt: 'store', lk: '456' }]
      };
      expect(() => validateComKey(key, coordinate, 'test')).not.toThrow();
    });

    it('should accept ComKey with empty loc array', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = {
        kt: 'product',
        pk: '123',
        loc: []
      } as ComKey<'product', 'store'>;
      expect(() => validateComKey(key, coordinate, 'test')).not.toThrow();
    });

    it('should accept ComKey with multiple locations', () => {
      const coordinate = mockCoordinate(['product', 'store', 'region']);
      const key: ComKey<'product', 'store', 'region'> = {
        kt: 'product',
        pk: '123',
        loc: [
          { kt: 'store', lk: '456' },
          { kt: 'region', lk: '789' }
        ]
      };
      expect(() => validateComKey(key, coordinate, 'test')).not.toThrow();
    });

    it('should reject undefined key', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      expect(() => validateComKey(undefined as any, coordinate, 'test')).toThrow(
        /ComKey is undefined or null/
      );
    });

    it('should reject null key', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      expect(() => validateComKey(null as any, coordinate, 'test')).toThrow(
        /ComKey is undefined or null/
      );
    });

    it('should reject key missing kt', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { pk: '123', loc: [] } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /ComKey is missing 'kt' field/
      );
    });

    it('should reject key with wrong kt', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { kt: 'order', pk: '123', loc: [] } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /ComKey has incorrect type/
      );
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /Expected: 'product'/
      );
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /Received: 'order'/
      );
    });

    it('should reject key missing pk', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { kt: 'product', loc: [] } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /ComKey is missing 'pk' field/
      );
    });

    it('should reject key missing loc', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { kt: 'product', pk: '123' } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /ComKey is missing or invalid 'loc' field/
      );
    });

    it('should reject key with non-array loc', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { kt: 'product', pk: '123', loc: 'invalid' } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /ComKey is missing or invalid 'loc' field \(must be an array\)/
      );
    });

    it('should reject key with wrong location order', () => {
      const coordinate = mockCoordinate(['product', 'store', 'region']);
      const key = {
        kt: 'product',
        pk: '123',
        loc: [
          { kt: 'region', lk: '789' },
          { kt: 'store', lk: '456' }
        ]
      } as any;
      expect(() => validateComKey(key, coordinate, 'test')).toThrow(
        /Location key array order mismatch/
      );
    });

    it('should include operation name in errors', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const key = { kt: 'product', pk: '123' } as any;
      expect(() => validateComKey(key, coordinate, 'myOp')).toThrow(
        /\[myOp\]/
      );
    });
  });
});

