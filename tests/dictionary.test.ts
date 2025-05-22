import { Dictionary } from "@/dictionary";
import { describe, expect, test } from 'vitest';

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
    expect(clone.get('key1')).toBe(1);
    clone.set('key2', 2);
    expect(dictionary.get('key2')).toBeNull();
    expect(clone.get('key2')).toBe(2);
  });

  test('should use custom hash function', () => {
    const customHashFunction = (key: string) => key.split('').reverse().join('');
    const customDictionary = new Dictionary<string, number>({}, customHashFunction);
    customDictionary.set('1yek', 1);
    expect(customDictionary.get('1yek')).toBe(1);
  });
});