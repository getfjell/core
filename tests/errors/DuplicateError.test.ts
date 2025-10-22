import { describe, expect, it } from 'vitest';
import { DuplicateError } from '../../src/errors/DuplicateError';

describe('DuplicateError', () => {
  it('constructs with simple id', () => {
    const err = new DuplicateError('Duplicate found', 'abc123', 'email');
    const json = err.toJSON();
    expect(json.code).toBe('DUPLICATE_ERROR');
    expect(json.details?.conflictingValue).toBe('email');
    expect(json.context.affectedItems?.[0].id).toBe('abc123');
  });

  it('constructs with key object and extracts primary', () => {
    const key = { pk: 'k1', kt: 'user', loc: [] } as any;
    const err = new DuplicateError('Duplicate found', key, 'username');
    const json = err.toJSON();
    expect(json.context.key?.primary).toBe('k1');
    expect(json.context.key?.composite?.kta).toBeUndefined(); // ensure we did not force shape
  });

  it('constructs without id details when no pk derivable', () => {
    const key = { kt: 'user' } as any;
    const err = new DuplicateError('Duplicate found', key);
    const json = err.toJSON();
    expect(json.context.affectedItems).toBeUndefined();
    expect(json.context.key).toBeDefined();
  });
});
