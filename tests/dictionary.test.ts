import { Dictionary } from "@/dictionary";
import { beforeEach, describe, expect, test } from 'vitest';

describe('Dictionary', () => {
  let dictionary: Dictionary<string, number>;

  beforeEach(() => {
    dictionary = new Dictionary<string, number>();
  });

  test('should set and get a value', () => {
    dictionary.set('key1', 1);
    expect(dictionary.get('key1')).toBe(1);
  });

  test('should return null for a non-existent key', () => {
    expect(dictionary.get('nonExistentKey')).toBeNull();
  });

  test('should delete a key', () => {
    dictionary.set('key1', 1);
    dictionary.delete('key1');
    expect(dictionary.get('key1')).toBeNull();
  });

  test('should return all keys', () => {
    dictionary.set('key1', 1);
    dictionary.set('key2', 2);
    expect(dictionary.keys()).toEqual(['key1', 'key2']);
  });

  test('should return all values', () => {
    dictionary.set('key1', 1);
    dictionary.set('key2', 2);
    expect(dictionary.values()).toEqual([1, 2]);
  });

  test('should check if a key exists', () => {
    dictionary.set('key1', 1);
    expect(dictionary.includesKey('key1')).toBe(true);
    expect(dictionary.includesKey('key2')).toBe(false);
  });

  test('should clone the dictionary', () => {
    dictionary.set('key1', 1);
    const clone = dictionary.clone();
    clone.set('key2', 2);
    expect(clone.get('key1')).toBe(1);
    expect(dictionary.get('key2')).toBeNull();
  });

  test('should use custom hash function', () => {
    const customHashFunction = (key: string) => key.split('').reverse().join('');
    const customDictionary = new Dictionary<string, number>({}, customHashFunction);
    customDictionary.set('1yek', 1);
    expect(customDictionary.get('1yek')).toBe(1);
  });

  // New tests for robustness
  test('should handle circular reference objects with custom hash function', () => {
    interface CircularObj {
      name: string;
      ref?: CircularObj;
    }

    const obj1: CircularObj = { name: 'obj1' };
    const obj2: CircularObj = { name: 'obj2' };
    obj1.ref = obj2;
    obj2.ref = obj1; // Creates circular reference

    // Custom hash function that handles circular references by using object identity
    let objCounter = 0;
    const objMap = new WeakMap<CircularObj, number>();
    const customHash = (obj: CircularObj) => {
      if (!objMap.has(obj)) {
        objMap.set(obj, objCounter++);
      }
      return `${obj.name}-${objMap.get(obj)}`;
    };

    const dict = new Dictionary<CircularObj, string>({}, customHash);

    // This works with custom hash function that doesn't rely on JSON.stringify
    expect(() => {
      dict.set(obj1, 'value1');
      dict.set(obj2, 'value2');
    }).not.toThrow();

    expect(dict.get(obj1)).toBe('value1');
    expect(dict.get(obj2)).toBe('value2');

    const keys = dict.keys();
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(obj1);
    expect(keys[1]).toBe(obj2);
  });

  test('should throw error with default hash function on circular references', () => {
    interface CircularObj {
      name: string;
      ref?: CircularObj;
    }

    const obj1: CircularObj = { name: 'obj1' };
    const obj2: CircularObj = { name: 'obj2' };
    obj1.ref = obj2;
    obj2.ref = obj1; // Creates circular reference

    const dict = new Dictionary<CircularObj, string>();

    // This will throw with default JSON.stringify hash function - this is expected behavior
    expect(() => {
      dict.set(obj1, 'value1');
    }).toThrow('Converting circular structure to JSON');
  });

  test('should work with custom hash function that does not use JSON', () => {
    interface CustomKey {
      id: number;
      name: string;
    }

    // Custom hash function that doesn't use JSON
    const customHash = (key: CustomKey) => `${key.id}-${key.name}`;
    const dict = new Dictionary<CustomKey, string>({}, customHash);

    const key1 = { id: 1, name: 'test' };
    const key2 = { id: 2, name: 'test' };

    dict.set(key1, 'value1');
    dict.set(key2, 'value2');

    expect(dict.get(key1)).toBe('value1');
    expect(dict.get(key2)).toBe('value2');

    // The old implementation would fail here because JSON.parse('1-test') would throw
    const keys = dict.keys();
    expect(keys).toHaveLength(2);
    expect(keys[0]).toEqual(key1);
    expect(keys[1]).toEqual(key2);
  });

  test('should handle complex object keys without serialization issues', () => {
    class ComplexKey {
      constructor(
        public id: string,
        public data: any,
        public method: () => string
      ) { }
    }

    const key1 = new ComplexKey('1', { nested: { value: 42 } }, () => 'method1');
    const key2 = new ComplexKey('2', { nested: { value: 84 } }, () => 'method2');

    const dict = new Dictionary<ComplexKey, string>();

    dict.set(key1, 'value1');
    dict.set(key2, 'value2');

    expect(dict.get(key1)).toBe('value1');
    expect(dict.get(key2)).toBe('value2');

    const keys = dict.keys();
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(key1);
    expect(keys[1]).toBe(key2);
    expect(keys[0].method()).toBe('method1');
    expect(keys[1].method()).toBe('method2');
  });

  // Additional comprehensive tests for robustness
  describe('Legacy compatibility', () => {
    test('should handle legacy constructor with populated map', () => {
      const legacyMap = {
        '"key1"': 'value1',
        '"key2"': 'value2'
      };

      const dict = new Dictionary<string, string>(legacyMap);

      // Should recover keys from legacy format
      expect(dict.get('key1')).toBe('value1');
      expect(dict.get('key2')).toBe('value2');

      const keys = dict.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    test('should handle legacy constructor with unparseable keys gracefully', () => {
      const legacyMap = {
        'invalid-json-key': 'value1',
        '"valid-key"': 'value2'
      };

      // Should not throw during construction
      expect(() => {
        new Dictionary<string, string>(legacyMap);
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty dictionary operations', () => {
      expect(dictionary.keys()).toEqual([]);
      expect(dictionary.values()).toEqual([]);
      expect(dictionary.includesKey('any')).toBe(false);
      expect(dictionary.get('any')).toBeNull();
    });

    test('should handle operations after deletions', () => {
      dictionary.set('key1', 1);
      dictionary.set('key2', 2);
      dictionary.set('key3', 3);

      dictionary.delete('key2');

      const keys = dictionary.keys();
      const values = dictionary.values();

      expect(keys).toHaveLength(2);
      expect(values).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key3');
      expect(keys).not.toContain('key2');
      expect(values).toContain(1);
      expect(values).toContain(3);
      expect(values).not.toContain(2);
    });

    test('should handle overwriting existing keys', () => {
      dictionary.set('key1', 1);
      expect(dictionary.get('key1')).toBe(1);
      expect(dictionary.keys()).toHaveLength(1);

      dictionary.set('key1', 999);
      expect(dictionary.get('key1')).toBe(999);
      expect(dictionary.keys()).toHaveLength(1); // Should not duplicate
    });

    test('should handle null and undefined values correctly', () => {
      const dict = new Dictionary<string, any>();
      const undefinedValue = void 0; // ESLint-friendly undefined

      dict.set('null-key', null);
      dict.set('undefined-key', undefinedValue);
      dict.set('zero-key', 0);
      dict.set('false-key', false);
      dict.set('empty-string-key', '');

      expect(dict.get('null-key')).toBeNull();
      expect(dict.get('undefined-key')).toBe(undefinedValue);
      expect(dict.get('zero-key')).toBe(0);
      expect(dict.get('false-key')).toBe(false);
      expect(dict.get('empty-string-key')).toBe('');

      expect(dict.includesKey('null-key')).toBe(true);
      expect(dict.includesKey('undefined-key')).toBe(true);
      expect(dict.includesKey('zero-key')).toBe(true);
      expect(dict.includesKey('false-key')).toBe(true);
      expect(dict.includesKey('empty-string-key')).toBe(true);
    });
  });

  describe('Hash collision handling', () => {
    test('should handle hash collisions correctly', () => {
      // Create a hash function that always returns the same value
      const alwaysCollide = () => 'collision';
      const dict = new Dictionary<string, string>({}, alwaysCollide);

      dict.set('key1', 'value1');
      dict.set('key2', 'value2'); // This should overwrite due to hash collision

      // With hash collision, second key overwrites first
      expect(dict.get('key1')).toBeNull();
      expect(dict.get('key2')).toBe('value2');
      expect(dict.keys()).toHaveLength(1);
      expect(dict.keys()[0]).toBe('key2'); // Should preserve the actual key, not hash
    });
  });

  describe('Clone robustness', () => {
    test('should clone complex objects preserving original key references', () => {
      interface ObjectKey {
        id: number;
        metadata: { tags: string[] };
      }

      const key1: ObjectKey = { id: 1, metadata: { tags: ['tag1'] } };
      const key2: ObjectKey = { id: 2, metadata: { tags: ['tag2'] } };

      const dict = new Dictionary<ObjectKey, string>();
      dict.set(key1, 'value1');
      dict.set(key2, 'value2');

      const clone = dict.clone();

      // Original keys should be preserved in clone
      const cloneKeys = clone.keys();
      expect(cloneKeys[0]).toBe(key1); // Same reference
      expect(cloneKeys[1]).toBe(key2); // Same reference

      // Modifications to clone shouldn't affect original
      const key3: ObjectKey = { id: 3, metadata: { tags: ['tag3'] } };
      clone.set(key3, 'value3');

      expect(dict.keys()).toHaveLength(2);
      expect(clone.keys()).toHaveLength(3);
    });

    test('should clone with custom hash function', () => {
      interface CustomObj {
        value: number;
      }

      const customHash = (obj: CustomObj) => `custom-${obj.value}`;
      const dict = new Dictionary<CustomObj, string>({}, customHash);

      const key1 = { value: 1 };
      const key2 = { value: 2 };

      dict.set(key1, 'value1');
      dict.set(key2, 'value2');

      const clone = dict.clone();

      // Clone should work with the custom hash function
      expect(clone.get(key1)).toBe('value1');
      expect(clone.get(key2)).toBe('value2');

      const cloneKeys = clone.keys();
      expect(cloneKeys).toHaveLength(2);
      expect(cloneKeys[0]).toBe(key1);
      expect(cloneKeys[1]).toBe(key2);
    });
  });

  describe('Performance and scale', () => {
    test('should handle many keys efficiently', () => {
      const largeDict = new Dictionary<number, string>();
      const keyCount = 1000;

      // Add many keys
      for (let i = 0; i < keyCount; i++) {
        largeDict.set(i, `value-${i}`);
      }

      // Verify all keys are accessible
      expect(largeDict.keys()).toHaveLength(keyCount);
      expect(largeDict.values()).toHaveLength(keyCount);

      // Random access should work
      expect(largeDict.get(500)).toBe('value-500');
      expect(largeDict.includesKey(750)).toBe(true);
      expect(largeDict.includesKey(1500)).toBe(false);

      // keys() method should return all original keys
      const keys = largeDict.keys();
      for (let i = 0; i < keyCount; i++) {
        expect(keys).toContain(i);
      }
    });
  });

  describe('Memory management', () => {
    test('should not leak references through keys() method', () => {
      const key1 = { id: 1 };
      const key2 = { id: 2 };

      const dict = new Dictionary<typeof key1, string>();
      dict.set(key1, 'value1');
      dict.set(key2, 'value2');

      const keys1 = dict.keys();
      const keys2 = dict.keys();

      // Should return new arrays each time (not the same reference)
      expect(keys1).not.toBe(keys2);
      expect(keys1).toEqual(keys2); // But content should be equal

      // Modifying returned array shouldn't affect internal state
      keys1.push({ id: 999 } as any);
      expect(dict.keys()).toHaveLength(2); // Original still has 2 keys
    });
  });

  describe('Error scenarios', () => {
    test('should handle errors in custom hash function gracefully', () => {
      const throwingHash = (key: any) => {
        if (key.shouldThrow) {
          throw new Error('Hash function error');
        }
        return String(key.id);
      };

      const dict = new Dictionary<any, string>({}, throwingHash);
      const normalKey = { id: 1 };

      // Normal operation should work
      expect(() => dict.set(normalKey, 'value1')).not.toThrow();
      expect(dict.get(normalKey)).toBe('value1');

      // Error in hash function should propagate
      expect(() => {
        dict.set({ shouldThrow: true }, 'bad-value');
      }).toThrow('Hash function error');
    });
  });

  describe('Type safety', () => {
    test('should maintain type safety with complex key types', () => {
      interface StrictKey {
        readonly id: string;
        readonly category: 'A' | 'B' | 'C';
        metadata?: Record<string, unknown>;
      }

      const strictDict = new Dictionary<StrictKey, number>();

      const validKey: StrictKey = {
        id: 'test-1',
        category: 'A',
        metadata: { score: 100 }
      };

      strictDict.set(validKey, 42);
      expect(strictDict.get(validKey)).toBe(42);

      const retrievedKeys = strictDict.keys();
      expect(retrievedKeys[0]).toBe(validKey);
      expect(retrievedKeys[0].category).toBe('A'); // Type safety maintained
    });
  });
});
