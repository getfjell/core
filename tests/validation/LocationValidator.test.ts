import { describe, expect, it } from 'vitest';
import { isValidLocations, validateLocations } from '../../src/validation/LocationValidator';
import type { LocKeyArray } from '../../src/keys';
import type { Coordinate } from '../../src/Coordinate';

// Mock coordinate for testing
const mockCoordinate = (kta: readonly string[]): Coordinate<any, any, any, any, any, any> => ({
  kta,
  toString: () => `Coordinate[${kta.join(', ')}]`
} as any);

describe('LocationValidator', () => {
  describe('validateLocations', () => {
    describe('valid cases', () => {
      it('should accept undefined locations', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        expect(() => validateLocations(undefined, coordinate, 'test')).not.toThrow();
      });

      it('should accept empty location array', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        expect(() => validateLocations([], coordinate, 'test')).not.toThrow();
      });

      it('should accept valid single-level location', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const locations: LocKeyArray<'store'> = [{ kt: 'store', lk: '123' }];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept valid two-level location', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const locations: LocKeyArray<'store', 'region'> = [
          { kt: 'store', lk: '123' },
          { kt: 'region', lk: '456' }
        ];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept valid three-level location', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country']);
        const locations: LocKeyArray<'store', 'region', 'country'> = [
          { kt: 'store', lk: '123' },
          { kt: 'region', lk: '456' },
          { kt: 'country', lk: '789' }
        ];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept valid four-level location', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country', 'continent']);
        const locations: LocKeyArray<'store', 'region', 'country', 'continent'> = [
          { kt: 'store', lk: '1' },
          { kt: 'region', lk: '2' },
          { kt: 'country', lk: '3' },
          { kt: 'continent', lk: '4' }
        ];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept valid five-level location', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country', 'continent', 'planet']);
        const locations: LocKeyArray<'store', 'region', 'country', 'continent', 'planet'> = [
          { kt: 'store', lk: '1' },
          { kt: 'region', lk: '2' },
          { kt: 'country', lk: '3' },
          { kt: 'continent', lk: '4' },
          { kt: 'planet', lk: '5' }
        ];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept partial location arrays (fewer than max)', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country']);
        const locations: LocKeyArray<'store', 'region'> = [
          { kt: 'store', lk: '123' },
          { kt: 'region', lk: '456' }
        ];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should accept primary library with no locations', () => {
        const coordinate = mockCoordinate(['product']);
        expect(() => validateLocations([], coordinate, 'test')).not.toThrow();
      });
    });

    describe('invalid cases - length', () => {
      it('should reject too many location keys', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const locations = [
          { kt: 'store', lk: '123' },
          { kt: 'region', lk: '456' },
          { kt: 'country', lk: '789' }
        ] as any;
        
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /Invalid location key array for find/
        );
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /Expected at most 1 location keys/
        );
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /but received 3/
        );
      });
    });

    describe('invalid cases - key type mismatch', () => {
      it('should reject wrong key type at position 0', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const locations = [{ kt: 'warehouse', lk: '123' }] as any;
        
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /Invalid location key array order for find/
        );
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /At position 0, expected key type "store" but received "warehouse"/
        );
      });

      it('should reject wrong key type at position 1', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const locations = [
          { kt: 'store', lk: '123' },
          { kt: 'country', lk: '456' }
        ] as any;
        
        expect(() => validateLocations(locations, coordinate, 'all')).toThrow(
          /At position 1, expected key type "region" but received "country"/
        );
      });

      it('should reject wrong key type at position 2', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region', 'country']);
        const locations = [
          { kt: 'store', lk: '1' },
          { kt: 'region', lk: '2' },
          { kt: 'planet', lk: '3' }
        ] as any;
        
        expect(() => validateLocations(locations, coordinate, 'create')).toThrow(
          /At position 2, expected key type "country" but received "planet"/
        );
      });
    });

    describe('error messages', () => {
      it('should include operation name in error message', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const locations = [{ kt: 'warehouse', lk: '123' }] as any;
        
        expect(() => validateLocations(locations, coordinate, 'myOperation')).toThrow(
          /myOperation/
        );
      });

      it('should include expected hierarchy in error message', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const locations = [
          { kt: 'store', lk: '123' },
          { kt: 'country', lk: '456' }
        ] as any;
        
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /hierarchy: \[store, region\]/
        );
      });

      it('should include received order in error message', () => {
        const coordinate = mockCoordinate(['product', 'store', 'region']);
        const locations = [
          { kt: 'store', lk: '123' },
          { kt: 'country', lk: '456' }
        ] as any;
        
        expect(() => validateLocations(locations, coordinate, 'find')).toThrow(
          /Received order: \[store, country\]/
        );
      });
    });

    describe('coordinate hierarchies', () => {
      it('should work with 1-level hierarchy', () => {
        const coordinate = mockCoordinate(['product', 'store']);
        const locations: LocKeyArray<'store'> = [{ kt: 'store', lk: '123' }];
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });

      it('should work with 5-level hierarchy', () => {
        const coordinate = mockCoordinate(['product', 'l1', 'l2', 'l3', 'l4', 'l5']);
        const locations = [
          { kt: 'l1', lk: '1' },
          { kt: 'l2', lk: '2' },
          { kt: 'l3', lk: '3' },
          { kt: 'l4', lk: '4' },
          { kt: 'l5', lk: '5' }
        ] as any;
        expect(() => validateLocations(locations, coordinate, 'test')).not.toThrow();
      });
    });
  });

  describe('isValidLocations', () => {
    it('should return valid:true for valid locations', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const locations: LocKeyArray<'store'> = [{ kt: 'store', lk: '123' }];
      const result = isValidLocations(locations, coordinate, 'test');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid:false for invalid locations', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const locations = [{ kt: 'warehouse', lk: '123' }] as any;
      const result = isValidLocations(locations, coordinate, 'test');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid location key array order');
    });

    it('should return valid:true for undefined locations', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const result = isValidLocations(undefined, coordinate, 'test');
      
      expect(result.valid).toBe(true);
    });

    it('should return valid:true for empty locations', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const result = isValidLocations([], coordinate, 'test');
      
      expect(result.valid).toBe(true);
    });

    it('should include error message when validation fails', () => {
      const coordinate = mockCoordinate(['product', 'store']);
      const locations = [
        { kt: 'store', lk: '123' },
        { kt: 'region', lk: '456' }
      ] as any;
      const result = isValidLocations(locations, coordinate, 'find');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Expected at most 1 location keys');
      expect(result.error).toContain('but received 2');
    });
  });
});

