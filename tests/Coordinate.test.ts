import { describe, expect, it, vi } from 'vitest';
import { createCoordinate } from '../src/Coordinate';

// Mock logger to keep test output clean
vi.mock('../src/logger', () => ({
  default: { get: () => ({ debug: vi.fn(), info: vi.fn(), error: vi.fn() }) }
}));

describe('Coordinate', () => {
  it('builds from single S and formats toString with scopes', () => {
    const coord = createCoordinate('product', ['alpha', 'beta']);
    expect(coord.kta).toEqual(['product']);
    expect(coord.scopes).toEqual(['alpha', 'beta']);
    expect(coord.toString()).toContain('product');
    expect(coord.toString()).toContain('alpha');
  });

  it('builds from KTA and preserves order', () => {
    const coord = createCoordinate(['product', 'store', 'region'] as any, []);
    expect(coord.kta).toEqual(['product', 'store', 'region']);
    expect(typeof coord.toString()).toBe('string');
  });
});
