/**
 * Comprehensive tests for all operation wrappers
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createActionWrapper,
  createAllActionWrapper,
  createAllFacetWrapper,
  createAllWrapper,
  createCreateWrapper,
  createFacetWrapper,
  createFindOneWrapper,
  createFindWrapper,
  createGetWrapper,
  createOneWrapper,
  createRemoveWrapper,
  createUpdateWrapper,
  createUpsertWrapper
} from '../../../src/operations/wrappers';
import type { Item } from '../../../src';
import { type Coordinate, createCoordinate } from '../../../src/Coordinate';
import type { ComKey, PriKey } from '../../../src/keys';

interface TestItem extends Item<'test', 'org'> {
  id: string;
  name: string;
}

describe('Operation Wrappers - Comprehensive Suite', () => {
  let mockCoordinate: Coordinate<'test', 'org'>;
  let mockKey: ComKey<'test', 'org'>;

  // Helper to create a valid test item with proper key
  const createTestItem = (overrides?: Partial<TestItem>): TestItem => ({
    key: mockKey,
    id: '123',
    name: 'Test Item',
    events: {
      created: { at: new Date() },
      updated: { at: new Date() },
      deleted: { at: null }
    },
    ...overrides
  });

  beforeEach(() => {
    mockCoordinate = createCoordinate(['test', 'org']);

    mockKey = {
      kt: 'test',
      pk: '123',
      loc: [{ kt: 'org', lk: 'org1' }]
    };
  });

  describe('createAllWrapper', () => {
    it('should validate and execute all()', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, impl);
      
      const result = await all({}, []);
      
      expect(result).toEqual([]);
      expect(impl).toHaveBeenCalledWith({}, []);
    });

    it('should normalize undefined params', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, impl);
      
      await all(undefined, undefined);
      
      expect(impl).toHaveBeenCalledWith({}, []);
    });

    it('should reject invalid query', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const all = createAllWrapper(mockCoordinate, impl);
      
      await expect(all('invalid' as any, [])).rejects.toThrow('[all]');
    });
  });

  describe('createGetWrapper', () => {
    it('should validate and execute get()', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, impl);
      
      await get(mockKey);
      
      expect(impl).toHaveBeenCalledWith(mockKey);
    });

    it('should reject invalid key', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, impl);
      
      await expect(get(null as any)).rejects.toThrow('Invalid key structure for get operation');
    });

    it('should validate key type matches coordinate', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const get = createGetWrapper(mockCoordinate, impl);
      
      const wrongKey: PriKey<'test'> = { kt: 'test', pk: '123' };
      await expect(get(wrongKey as any)).rejects.toThrow('Invalid key type');
    });
  });

  describe('createCreateWrapper', () => {
    it('should validate and execute create()', async () => {
      const newItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'New Item',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      const impl = vi.fn().mockResolvedValue(newItem);
      const create = createCreateWrapper(mockCoordinate, impl);
      
      const result = await create({ name: 'New Item' }, {
        locations: [{ kt: 'org', lk: 'org1' }]
      });
      
      expect(result).toBe(newItem);
      expect(impl).toHaveBeenCalledWith(
        { name: 'New Item' },
        { locations: [{ kt: 'org', lk: 'org1' }] }
      );
    });

    it('should validate key in options', async () => {
      const impl = vi.fn().mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, impl);
      
      await expect(
        create({ name: 'Test' }, { key: null as any })
      ).rejects.toThrow('Invalid key structure for create operation');
    });

    it('should validate locations in options', async () => {
      const impl = vi.fn().mockResolvedValue(createTestItem());
      const create = createCreateWrapper(mockCoordinate, impl);
      
      await expect(
        create({ name: 'Test' }, {
          locations: [{ kt: 'wrong', lk: '123' }] as any
        })
      ).rejects.toThrow('Invalid location key array order');
    });
  });

  describe('createUpdateWrapper', () => {
    it('should validate and execute update()', async () => {
      const updated: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      const impl = vi.fn().mockResolvedValue(updated);
      const update = createUpdateWrapper(mockCoordinate, impl);
      
      const result = await update(mockKey, { name: 'Updated' });
      
      expect(result).toBe(updated);
      expect(impl).toHaveBeenCalledWith(mockKey, { name: 'Updated' });
    });

    it('should reject invalid key', async () => {
      const impl = vi.fn().mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, impl);
      
      await expect(
        update(null as any, { name: 'Test' })
      ).rejects.toThrow('Invalid key structure for update operation');
    });

    it('should reject invalid item', async () => {
      const impl = vi.fn().mockResolvedValue(createTestItem());
      const update = createUpdateWrapper(mockCoordinate, impl);
      
      await expect(
        update(mockKey, 'invalid' as any)
      ).rejects.toThrow('[update]');
    });
  });

  describe('createUpsertWrapper', () => {
    it('should validate and execute upsert()', async () => {
      const upserted: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Upserted',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      const impl = vi.fn().mockResolvedValue(upserted);
      const upsert = createUpsertWrapper(mockCoordinate, impl);
      
      const result = await upsert(
        mockKey,
        { name: 'Upserted' }
      );
      
      expect(result).toBe(upserted);
      expect(impl).toHaveBeenCalledWith(
        mockKey,
        { name: 'Upserted' }
      );
    });

    it('should accept undefined locations', async () => {
      const impl = vi.fn().mockResolvedValue(createTestItem());
      const upsert = createUpsertWrapper(mockCoordinate, impl);
      
      await upsert(mockKey, { name: 'Test' });
      
      expect(impl).toHaveBeenCalledWith(mockKey, { name: 'Test' });
    });
  });

  describe('createRemoveWrapper', () => {
    it('should validate and execute remove()', async () => {
      const impl = vi.fn().mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, impl);
      
      await remove(mockKey);
      
      expect(impl).toHaveBeenCalledWith(mockKey);
    });

    it('should reject invalid key', async () => {
      const impl = vi.fn().mockResolvedValue(undefined);
      const remove = createRemoveWrapper(mockCoordinate, impl);
      
      await expect(remove(null as any)).rejects.toThrow('Invalid key structure for remove operation');
    });
  });

  describe('createFindWrapper', () => {
    it('should validate and execute find()', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, impl);
      
      const result = await find(
        'byStatus',
        { status: 'active' },
        []
      );
      
      expect(result).toEqual([]);
      expect(impl).toHaveBeenCalledWith(
        'byStatus',
        { status: 'active' },
        []
      );
    });

    it('should reject invalid finder name', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, impl);
      
      await expect(
        find('' as any, {}, [])
      ).rejects.toThrow('[find]');
    });

    it('should normalize undefined params', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, impl);
      
      await find('byStatus', {}, []);
      
      expect(impl).toHaveBeenCalledWith('byStatus', {}, []);
    });

    it('should reject invalid param types', async () => {
      const impl = vi.fn().mockResolvedValue([]);
      const find = createFindWrapper(mockCoordinate, impl);
      
      await expect(
        find('byStatus', { invalid: { nested: 'object' } } as any, [])
      ).rejects.toThrow('[find]');
    });
  });

  describe('createFindOneWrapper', () => {
    it('should validate and execute findOne()', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, impl);
      
      const result = await findOne(
        'byEmail',
        { email: 'test@example.com' },
        []
      );
      
      expect(result).toBeNull();
      expect(impl).toHaveBeenCalledWith(
        'byEmail',
        { email: 'test@example.com' },
        []
      );
    });

    it('should reject empty finder name', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const findOne = createFindOneWrapper(mockCoordinate, impl);
      
      await expect(
        findOne('  ', {}, [])
      ).rejects.toThrow('[findOne]');
    });
  });

  describe('createActionWrapper', () => {
    it('should validate and execute action()', async () => {
      const updatedItem: TestItem = {
        key: mockKey,
        id: '123',
        name: 'Updated',
        events: {
          created: { at: new Date() },
          updated: { at: new Date() },
          deleted: { at: null }
        }
      };
      
      const impl = vi.fn().mockResolvedValue([updatedItem, []]);
      const action = createActionWrapper(mockCoordinate, impl);
      
      const result = await action(mockKey, 'promote', { role: 'admin' });
      
      expect(result).toEqual([updatedItem, []]);
      expect(impl).toHaveBeenCalledWith(mockKey, 'promote', { role: 'admin' });
    });

    it('should reject invalid action name', async () => {
      const impl = vi.fn().mockResolvedValue([{} as TestItem, []]);
      const action = createActionWrapper(mockCoordinate, impl);
      
      await expect(
        action(mockKey, '' as any, {})
      ).rejects.toThrow('[action]');
    });

    it('should normalize undefined params', async () => {
      const impl = vi.fn().mockResolvedValue([createTestItem(), []]);
      const action = createActionWrapper(mockCoordinate, impl);
      
      await action(mockKey, 'promote', undefined);
      
      expect(impl).toHaveBeenCalledWith(mockKey, 'promote', {});
    });
  });

  describe('createAllActionWrapper', () => {
    it('should validate and execute allAction()', async () => {
      const impl = vi.fn().mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, impl);
      
      const result = await allAction(
        'archive',
        { status: 'archived' },
        []
      );
      
      expect(result).toEqual([[], []]);
      expect(impl).toHaveBeenCalledWith(
        'archive',
        { status: 'archived' },
        []
      );
    });

    it('should reject invalid action name', async () => {
      const impl = vi.fn().mockResolvedValue([[], []]);
      const allAction = createAllActionWrapper(mockCoordinate, impl);
      
      await expect(
        allAction('', {}, [])
      ).rejects.toThrow('[allAction]');
    });
  });

  describe('createFacetWrapper', () => {
    it('should validate and execute facet()', async () => {
      const impl = vi.fn().mockResolvedValue({ count: 42 });
      const facet = createFacetWrapper(mockCoordinate, impl);
      
      const result = await facet(mockKey, 'statistics', { period: 'month' });
      
      expect(result).toEqual({ count: 42 });
      expect(impl).toHaveBeenCalledWith(mockKey, 'statistics', { period: 'month' });
    });

    it('should reject invalid facet name', async () => {
      const impl = vi.fn().mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, impl);
      
      await expect(
        facet(mockKey, '', {})
      ).rejects.toThrow('[facet]');
    });

    it('should normalize undefined params', async () => {
      const impl = vi.fn().mockResolvedValue({});
      const facet = createFacetWrapper(mockCoordinate, impl);
      
      await facet(mockKey, 'statistics', undefined);
      
      expect(impl).toHaveBeenCalledWith(mockKey, 'statistics', {});
    });
  });

  describe('createAllFacetWrapper', () => {
    it('should validate and execute allFacet()', async () => {
      const impl = vi.fn().mockResolvedValue({ total: 100 });
      const allFacet = createAllFacetWrapper(mockCoordinate, impl);
      
      const result = await allFacet(
        'summary',
        { groupBy: 'status' },
        []
      );
      
      expect(result).toEqual({ total: 100 });
      expect(impl).toHaveBeenCalledWith(
        'summary',
        { groupBy: 'status' },
        []
      );
    });

    it('should reject invalid facet name', async () => {
      const impl = vi.fn().mockResolvedValue({});
      const allFacet = createAllFacetWrapper(mockCoordinate, impl);
      
      await expect(
        allFacet('', {}, [])
      ).rejects.toThrow('[allFacet]');
    });
  });

  describe('Common wrapper behaviors', () => {
    it('should support skipValidation option', async () => {
      const impl = vi.fn().mockResolvedValue(null);
      const one = createOneWrapper(mockCoordinate, impl, { skipValidation: true });
      
      // Should not throw with invalid data
      await one('totally invalid' as any, 'also invalid' as any);
      expect(impl).toHaveBeenCalled();
    });

    it('should support custom operation names', async () => {
      const impl = vi.fn().mockRejectedValue(new Error('test'));
      const one = createOneWrapper(mockCoordinate, impl, {
        operationName: 'myCustomOne'
      });
      
      await expect(one({}, [])).rejects.toThrow('[myCustomOne]');
    });

    it('should support custom error handlers', async () => {
      const impl = vi.fn().mockRejectedValue(new Error('original'));
      const customError = new Error('custom handled');
      
      const one = createOneWrapper(mockCoordinate, impl, {
        onError: () => customError
      });
      
      await expect(one({}, [])).rejects.toThrow('custom handled');
    });

    it('should pass context to error handlers', async () => {
      const impl = vi.fn().mockRejectedValue(new Error('test'));
      let capturedContext: any;
      
      const one = createOneWrapper(mockCoordinate, impl, {
        onError: (err, context) => {
          capturedContext = context;
          return err;
        }
      });
      
      await expect(one({}, [])).rejects.toThrow();
      expect(capturedContext.operationName).toBe('one');
      expect(capturedContext.coordinate).toBe(mockCoordinate);
      expect(capturedContext.params).toHaveLength(2);
    });
  });
});

