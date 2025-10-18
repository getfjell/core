import { describe, expect, it } from 'vitest';
import { isOperationComKey, isOperationPriKey, type OperationParams, type Operations } from '../../src';

describe('Operations Type Guards', () => {
  describe('isOperationPriKey', () => {
    it('should identify PriKey correctly', () => {
      const priKey = { kt: 'user', pk: 'user-123' };
      expect(isOperationPriKey(priKey)).toBe(true);
    });

    it('should reject ComKey', () => {
      const comKey = { kt: 'comment', pk: 'comment-123', loc: [{ kt: 'post', lk: 'post-456' }] };
      expect(isOperationPriKey(comKey)).toBe(false);
    });

    it('should handle key with undefined loc', () => {
      const key = { kt: 'user', pk: 'user-123', loc: undefined };
      expect(isOperationPriKey(key)).toBe(true);
    });
  });

  describe('isOperationComKey', () => {
    it('should identify ComKey correctly', () => {
      const comKey = { kt: 'comment', pk: 'comment-123', loc: [{ kt: 'post', lk: 'post-456' }] };
      expect(isOperationComKey(comKey)).toBe(true);
    });

    it('should reject PriKey', () => {
      const priKey = { kt: 'user', pk: 'user-123' };
      expect(isOperationComKey(priKey)).toBe(false);
    });

    it('should reject key with empty loc array', () => {
      const key = { kt: 'user', pk: 'user-123', loc: [] };
      expect(isOperationComKey(key)).toBe(false);
    });
  });
});

describe('Operations Interface', () => {
  it('should compile with correct type parameters', () => {
    // Type test - should compile without errors
    const _userOps: Operations<
      { kt: 'user', pk: string, name: string },
      'user'
    > | null = null;
    
    const _commentOps: Operations<
      { kt: 'comment', pk: string, loc: [{ kt: 'post', lk: string }], text: string },
      'comment',
      'post'
    > | null = null;
    
    // If this compiles, the types are correct
    expect(_userOps || _commentOps || true).toBe(true);
  });
});

describe('OperationParams', () => {
  it('should accept valid parameter types', () => {
    const params: OperationParams = {
      string: 'value',
      number: 42,
      boolean: true,
      date: new Date(),
      array: ['a', 'b', 'c'],
      numberArray: [1, 2, 3]
    };
    
    expect(params).toBeDefined();
  });
});

