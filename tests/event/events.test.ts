import { describe, expect, it } from 'vitest';
import { type BaseEvent, isActionEvent, isCreateEvent, isDeleteEvent, isUpdateEvent } from '../../src/event/events';

const base = <T extends BaseEvent<'product'>> (overrides: Partial<T>): T => ({
  eventType: 'create',
  key: { kt: 'product', pk: 'p1' },
  scopes: ['test'],
  timestamp: new Date('2024-01-01T00:00:00.000Z'),
  ...(overrides as any),
});

describe('event/events type guards', () => {
  it('isCreateEvent', () => {
    expect(isCreateEvent(base({ eventType: 'create' }))).toBe(true);
    expect(isCreateEvent(base({ eventType: 'update' }))).toBe(false);
  });
  it('isUpdateEvent', () => {
    expect(isUpdateEvent(base({ eventType: 'update' }))).toBe(true);
    expect(isUpdateEvent(base({ eventType: 'delete' }))).toBe(false);
  });
  it('isDeleteEvent', () => {
    expect(isDeleteEvent(base({ eventType: 'delete' }))).toBe(true);
    expect(isDeleteEvent(base({ eventType: 'action' }))).toBe(false);
  });
  it('isActionEvent', () => {
    expect(isActionEvent(base({ eventType: 'action' }))).toBe(true);
    expect(isActionEvent(base({ eventType: 'create' }))).toBe(false);
  });
});
