
import { IQFactory } from '../../src/item/IQFactory';
import { abbrevQuery, isQueryMatch, paramsToQuery, queryToParams } from '../../src/item/IQUtils';
import { ItemQuery, QueryParams } from "../../src/item/ItemQuery";
import { Item } from '../../src/items';
import { ComKey, PriKey } from '../../src/keys';
import * as luxon from 'luxon';
import { describe, expect, test } from 'vitest';
describe('Testing IQUtils', () => {
  const nowDate = new Date();
  const profileKey: PriKey<'profile'> = { kt: 'profile', pk: '1-1-1-1-1' };

  describe('Testing queryToParams', () => {

    test('testing empty query', () => {
      const params: QueryParams = queryToParams({});

      const expected = {};
      expect(params).toStrictEqual(expected);
    });

    test('testing query with a date range', () => {
      const query: ItemQuery = { events: { tested: { start: nowDate, end: nowDate } } };
      const params: QueryParams = queryToParams(query);

      // Note that part of this transformation is passing parameters as strings.
      const expected = { events: JSON.stringify({ tested: { start: nowDate, end: nowDate } }) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with an agg', () => {
      const query: ItemQuery = { aggs: { tested: { limit: 1 } } };
      const params: QueryParams = queryToParams(query);

      const expected = { aggs: JSON.stringify({ tested: { limit: 1 } }) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with limit', () => {
      const query: ItemQuery = { limit: 1 };
      const params: QueryParams = queryToParams(query);

      const expected = { limit: 1 };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with offset', () => {
      const query: ItemQuery = { offset: 1 };
      const params: QueryParams = queryToParams(query);

      const expected = { offset: 1 };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with prop', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'whatever', value: true, operator: '==' }]
        }
      };
      const params: QueryParams = queryToParams(query);

      const expected = {
        compoundCondition: JSON.stringify({
          compoundType: 'AND',
          conditions: [{
            column: 'whatever',
            value: true,
            operator: '=='
          }]
        })
      };
      expect(params).toEqual(expected);
    });

    test('testing query with props', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }]
        }
      };
      const params: QueryParams = queryToParams(query);

      const expected = {
        compoundCondition: JSON.stringify({
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }]
        })
      };
      expect(params).toEqual(expected);
    });

    test('testing query with pk', () => {
      const query: ItemQuery = { refs: { turbo: profileKey } };
      const params: QueryParams = queryToParams(query);

      const expected = { refs: JSON.stringify({ turbo: profileKey }) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with single orderBy ascending', () => {
      const query: ItemQuery = { orderBy: [{ field: 'name', direction: 'asc' }] };
      const params: QueryParams = queryToParams(query);

      const expected = { orderBy: JSON.stringify([{ field: 'name', direction: 'asc' }]) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with single orderBy descending', () => {
      const query: ItemQuery = { orderBy: [{ field: 'submittedAt', direction: 'desc' }] };
      const params: QueryParams = queryToParams(query);

      const expected = { orderBy: JSON.stringify([{ field: 'submittedAt', direction: 'desc' }]) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with multiple orderBy fields', () => {
      const query: ItemQuery = {
        orderBy: [
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' }
        ]
      };
      const params: QueryParams = queryToParams(query);

      const expected = {
        orderBy: JSON.stringify([
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' }
        ])
      };
      expect(params).toStrictEqual(expected);
    });

    test('testing query with orderBy and other parameters', () => {
      const query: ItemQuery = {
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 10,
        offset: 5,
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'status', value: 'active', operator: '==' }]
        }
      };
      const params: QueryParams = queryToParams(query);

      expect(params.orderBy).toBe(JSON.stringify([{ field: 'name', direction: 'asc' }]));
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(5);
      expect(params.compoundCondition).toBe(JSON.stringify({
        compoundType: 'AND',
        conditions: [{ column: 'status', value: 'active', operator: '==' }]
      }));
    });

    test('testing query with empty orderBy array', () => {
      const query: ItemQuery = { orderBy: [] };
      const params: QueryParams = queryToParams(query);

      const expected = { orderBy: JSON.stringify([]) };
      expect(params).toStrictEqual(expected);
    });

    test('testing query without orderBy (should not add to params)', () => {
      const query: ItemQuery = { limit: 10 };
      const params: QueryParams = queryToParams(query);

      expect(params.orderBy).toBeUndefined();
      expect(params.limit).toBe(10);
    });

    test('testing query with orderBy undefined (should not add to params)', () => {
      const query: ItemQuery = { limit: 10, orderBy: undefined };
      const params: QueryParams = queryToParams(query);

      expect(params.orderBy).toBeUndefined();
      expect(params.limit).toBe(10);
    });
  });

  describe('Testing paramsToQuery', () => {

    test('testing empty params', () => {
      const params: QueryParams = {};
      const query: ItemQuery = paramsToQuery(params);

      const expected = {};
      expect(query).toStrictEqual(expected);
    });

    test('testing params with a date range', () => {
      const params: QueryParams = { events: JSON.stringify({ tested: { start: nowDate, end: nowDate } }) };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { events: { tested: { start: nowDate, end: nowDate } } };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with an agg', () => {
      const params: QueryParams = { aggs: JSON.stringify({ tested: { limit: 1 } }) };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { aggs: { tested: { limit: 1 } } };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with limit', () => {
      const params: QueryParams = { limit: 1 };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { limit: 1 };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with offset', () => {
      const params: QueryParams = { offset: 1 };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { offset: 1 };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with prop', () => {
      const params: QueryParams = {
        compoundCondition: JSON.stringify({
          compoundType: 'AND',
          conditions: [{ column: 'whatever', value: true, operator: '==' }]
        })
      };
      const query: ItemQuery = paramsToQuery(params);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'whatever', value: true, operator: '==' }]
        }
      };
      expect(query).toEqual(expected);
    });

    test('testing params with props', () => {
      const params: QueryParams = {
        compoundCondition: JSON.stringify({
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }]
        })
      };
      const query: ItemQuery = paramsToQuery(params);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }]
        }
      };
      expect(query).toEqual(expected);
    });

    test('testing params with pk', () => {
      const params: QueryParams = { refs: JSON.stringify({ turbo: profileKey }) };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { refs: { turbo: profileKey } };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with single orderBy ascending', () => {
      const params: QueryParams = {
        orderBy: JSON.stringify([{ field: 'name', direction: 'asc' }])
      };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { orderBy: [{ field: 'name', direction: 'asc' }] };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with single orderBy descending', () => {
      const params: QueryParams = {
        orderBy: JSON.stringify([{ field: 'submittedAt', direction: 'desc' }])
      };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { orderBy: [{ field: 'submittedAt', direction: 'desc' }] };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with multiple orderBy fields', () => {
      const params: QueryParams = {
        orderBy: JSON.stringify([
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' }
        ])
      };
      const query: ItemQuery = paramsToQuery(params);

      const expected = {
        orderBy: [
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' }
        ]
      };
      expect(query).toStrictEqual(expected);
    });

    test('testing params with orderBy and other parameters', () => {
      const params: QueryParams = {
        orderBy: JSON.stringify([{ field: 'name', direction: 'asc' }]),
        limit: 10,
        offset: 5,
        compoundCondition: JSON.stringify({
          compoundType: 'AND',
          conditions: [{ column: 'status', value: 'active', operator: '==' }]
        })
      };
      const query: ItemQuery = paramsToQuery(params);

      expect(query.orderBy).toEqual([{ field: 'name', direction: 'asc' }]);
      expect(query.limit).toBe(10);
      expect(query.offset).toBe(5);
      expect(query.compoundCondition).toEqual({
        compoundType: 'AND',
        conditions: [{ column: 'status', value: 'active', operator: '==' }]
      });
    });

    test('testing params without orderBy (should not add to query)', () => {
      const params: QueryParams = { limit: 10 };
      const query: ItemQuery = paramsToQuery(params);

      expect(query.orderBy).toBeUndefined();
      expect(query.limit).toBe(10);
    });

    test('testing params with empty orderBy array', () => {
      const params: QueryParams = { orderBy: JSON.stringify([]) };
      const query: ItemQuery = paramsToQuery(params);

      const expected = { orderBy: [] };
      expect(query).toStrictEqual(expected);
    });
  });

  describe('Testing orderBy round-trip conversion', () => {
    test('queryToParams → paramsToQuery should preserve single orderBy', () => {
      const originalQuery: ItemQuery = {
        orderBy: [{ field: 'name', direction: 'asc' }]
      };
      const params = queryToParams(originalQuery);
      const roundTripQuery = paramsToQuery(params);

      expect(roundTripQuery.orderBy).toEqual(originalQuery.orderBy);
    });

    test('queryToParams → paramsToQuery should preserve multiple orderBy fields', () => {
      const originalQuery: ItemQuery = {
        orderBy: [
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' }
        ]
      };
      const params = queryToParams(originalQuery);
      const roundTripQuery = paramsToQuery(params);

      expect(roundTripQuery.orderBy).toEqual(originalQuery.orderBy);
    });

    test('queryToParams → paramsToQuery should preserve orderBy with other parameters', () => {
      const originalQuery: ItemQuery = {
        orderBy: [{ field: 'name', direction: 'asc' }],
        limit: 10,
        offset: 5,
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'status', value: 'active', operator: '==' }]
        },
        refs: { turbo: profileKey }
      };
      const params = queryToParams(originalQuery);
      const roundTripQuery = paramsToQuery(params);

      expect(roundTripQuery.orderBy).toEqual(originalQuery.orderBy);
      expect(roundTripQuery.limit).toBe(originalQuery.limit);
      expect(roundTripQuery.offset).toBe(originalQuery.offset);
      expect(roundTripQuery.compoundCondition).toEqual(originalQuery.compoundCondition);
      expect(roundTripQuery.refs).toEqual(originalQuery.refs);
    });

    test('multiple round trips should not corrupt orderBy data', () => {
      const originalQuery: ItemQuery = {
        orderBy: [
          { field: 'submittedAt', direction: 'desc' },
          { field: 'id', direction: 'asc' },
          { field: 'name', direction: 'asc' }
        ]
      };

      let currentQuery = originalQuery;
      // Perform 5 round trips
      for (let i = 0; i < 5; i++) {
        const params = queryToParams(currentQuery);
        currentQuery = paramsToQuery(params);
      }

      expect(currentQuery.orderBy).toEqual(originalQuery.orderBy);
      expect(currentQuery.orderBy?.length).toBe(3);
      expect(currentQuery.orderBy?.[0].field).toBe('submittedAt');
      expect(currentQuery.orderBy?.[0].direction).toBe('desc');
      expect(currentQuery.orderBy?.[1].field).toBe('id');
      expect(currentQuery.orderBy?.[1].direction).toBe('asc');
      expect(currentQuery.orderBy?.[2].field).toBe('name');
      expect(currentQuery.orderBy?.[2].direction).toBe('asc');
    });

    test('round trip with empty orderBy array should preserve empty array', () => {
      const originalQuery: ItemQuery = { orderBy: [] };
      const params = queryToParams(originalQuery);
      const roundTripQuery = paramsToQuery(params);

      expect(roundTripQuery.orderBy).toEqual([]);
    });

    test('round trip without orderBy should not add orderBy', () => {
      const originalQuery: ItemQuery = { limit: 10, offset: 5 };
      const params = queryToParams(originalQuery);
      const roundTripQuery = paramsToQuery(params);

      expect(roundTripQuery.orderBy).toBeUndefined();
      expect(roundTripQuery.limit).toBe(10);
      expect(roundTripQuery.offset).toBe(5);
    });
  });

  describe('Testing isQueryMatch', () => {

    const aggItem: Item<'test'> = {
      hello: 'world',
      key: { kt: 'test', pk: '2-2-2-2-2' },
      events: {
        created: { at: nowDate },
        deleted: { at: null },
        updated: { at: nowDate },
      }
    }

    const item: Item<'test'> = {
      key: { kt: 'test', pk: '2-2-2-2-2' },
      turnip: 3,
      refs: {
        turbo: { key: profileKey },
        motor: { key: { kt: 'motor', pk: '3-3-3-3-3' } },
      },
      events: {
        created: { at: nowDate },
        deleted: { at: null },
        updated: { at: nowDate },
      },
      aggs: {
        tested: [{
          key: { kt: 'test', pk: '2-2-2-2-2' },
          item: aggItem,
        }]
      }
    };

    test('testing empty query success', () => {
      const query: ItemQuery = IQFactory.all().toQuery();
      const result = isQueryMatch(item, query);
      expect(result).toBe(true);
    });

    describe('Testing ref query match', () => {
      test('testing ref query success', () => {
        const query: ItemQuery = IQFactory.pk('profile', profileKey.pk, 'turbo').pk('motor', '3-3-3-3-3').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing ref query failure', () => {
        const query: ItemQuery = IQFactory.pk('thomas', profileKey.pk, 'turbo').pk('motor', '3-3-3-3-3').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing ref query failure: no refs', () => {
        const reflessItem: Item<'test'> = {
          key: { kt: 'test', pk: '2-2-2-2-2' },
          events: {
            created: { at: nowDate },
            deleted: { at: null },
            updated: { at: nowDate },
          },
        };
        const query: ItemQuery = IQFactory.pk('thomas', profileKey.pk, 'turbo').pk('motor', '3-3-3-3-3').toQuery();
        const result = isQueryMatch(reflessItem, query);
        expect(result).toBe(false);
      });
    });

    describe('Testing prop query match', () => {
      test('testing prop query success', () => {
        const query: ItemQuery = IQFactory.condition('turnip', 3, '==').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing prop query failure - values do not match', () => {
        const query: ItemQuery = IQFactory.condition('turnip', 5, '==').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing prop query failure - property does not exist', () => {
        const query: ItemQuery = IQFactory.condition('woohoo', true, '==').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing null prop query - value is null and condition checks for null', () => {
        const itemWithNull: Item<'test'> = {
          key: { kt: 'test', pk: '1-1-1-1-1' },
          events: {
            created: { at: nowDate },
            deleted: { at: null },
            updated: { at: nowDate },
          },
          nullProp: null,
        };
        const query: ItemQuery = IQFactory.condition('nullProp', null, '==').toQuery();
        const result = isQueryMatch(itemWithNull, query);
        expect(result).toBe(true);
      });

      test('testing null prop query - value is not null but condition checks for null', () => {
        const query: ItemQuery = IQFactory.condition('turnip', null, '==').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing not-null prop query - value is null but condition checks for not-null', () => {
        const itemWithNull: Item<'test'> = {
          key: { kt: 'test', pk: '1-1-1-1-1' },
          events: {
            created: { at: nowDate },
            deleted: { at: null },
            updated: { at: nowDate },
          },
          nullProp: null,
        };
        const query: ItemQuery = IQFactory.condition('nullProp', null, '!=').toQuery();
        const result = isQueryMatch(itemWithNull, query);
        expect(result).toBe(false);
      });

      test('testing not-null prop query - value is not null and condition checks for not-null', () => {
        const query: ItemQuery = IQFactory.condition('turnip', null, '!=').toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing null with invalid operator throws error', () => {
        const query: ItemQuery = IQFactory.condition('turnip', null as any, '>').toQuery();
        expect(() => isQueryMatch(item, query)).toThrow(
          'Operator > cannot be used with null value. Use \'==\' for null checks or \'!=\' for not-null checks.'
        );
      });
    });

    describe('Testing event query match', () => {

      test('testing event query success - date range - success', () => {
        const query: ItemQuery = IQFactory.event('created', {
          start: luxon.DateTime.fromJSDate(nowDate).minus({ days: 1 }).toJSDate(),
          end: luxon.DateTime.fromJSDate(nowDate).plus({ days: 1 }).toJSDate(),
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing event query failure - date range - failure out of range', () => {
        const query: ItemQuery = IQFactory.event('created', {
          start: luxon.DateTime.fromJSDate(nowDate).plus({ days: 1 }).toJSDate(),
          end: luxon.DateTime.fromJSDate(nowDate).plus({ days: 2 }).toJSDate(),
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing event query failure - date range - failure end boundary', () => {
        const query: ItemQuery = IQFactory.event('created', {
          start: luxon.DateTime.fromJSDate(nowDate).minus({ days: 1 }).toJSDate(),
          end: nowDate,
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing event query success - date range - success start boundary', () => {
        const query: ItemQuery = IQFactory.event('created', {
          start: nowDate,
          end: luxon.DateTime.fromJSDate(nowDate).plus({ days: 2 }).toJSDate(),
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing event query failure - date range - no matching event', () => {
        const query: ItemQuery = IQFactory.event('toaster', {
          start: luxon.DateTime.fromJSDate(nowDate).minus({ days: 1 }).toJSDate(),
          end: luxon.DateTime.fromJSDate(nowDate).plus({ days: 1 }).toJSDate(),
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing event query success - date range - success start boundary no end', () => {
        const query: ItemQuery = IQFactory.event('created', {
          start: nowDate,
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing event query failure - date range - failure end boundary no start', () => {
        const query: ItemQuery = IQFactory.event('created', {
          end: nowDate,
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing event query failure - date range - event with null at', () => {
        const query: ItemQuery = IQFactory.event('deleted', {
          end: nowDate,
        }).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });
    });

    describe('Testing agg query match', () => {

      const agglessItem: Item<'test'> = {
        key: { kt: 'test', pk: '2-2-2-2-2' },
        events: {
          created: { at: nowDate },
          deleted: { at: null },
          updated: { at: nowDate },
        },
      };

      test('testing agg query success', () => {
        const query: ItemQuery =
          IQFactory.agg('tested',
            IQFactory.conditions([{ column: 'hello', value: "world", operator: '==' }]).toQuery()).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(true);
      });

      test('testing agg query failure - subquery fails', () => {
        const query: ItemQuery =
          IQFactory.agg('tested',
            IQFactory.conditions([{ column: 'hello', value: "you", operator: '==' }]).toQuery()).toQuery();
        const result = isQueryMatch(item, query);
        expect(result).toBe(false);
      });

      test('testing agg query failure - no aggs', () => {
        const query: ItemQuery =
          IQFactory.agg('tested',
            IQFactory.conditions([{ column: 'hello', value: "world", operator: '==' }]).toQuery()).toQuery();
        const result = isQueryMatch(agglessItem, query);
        expect(result).toBe(false);
      });
    });

    describe('Testing prop query operators', () => {
      const testItem: Item<'test'> = {
        key: { kt: 'test', pk: '123-1-1-1-1' },
        numValue: 42,
        strValue: 'test',
        arrayValue: ['a', 'b', 'c'],
        events: {
          created: { at: nowDate },
          deleted: { at: null },
          updated: { at: nowDate }
        }
      };

      test('testing != operator', () => {
        const query = IQFactory.condition('numValue', 100, '!=').toQuery();
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing > operator', () => {
        const query = IQFactory.condition('numValue', 40, '>').toQuery();
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing >= operator', () => {
        const query = IQFactory.condition('numValue', 42, '>=').toQuery();
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing < operator', () => {
        const query = IQFactory.condition('numValue', 50, '<').toQuery();
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing <= operator', () => {
        const query = IQFactory.condition('numValue', 42, '<=').toQuery();
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing in operator', () => {
        const query: ItemQuery = {
          compoundCondition: {
            compoundType: 'AND',
            conditions: [
              { column: 'strValue', value: ['test', 'other'], operator: 'in' }
            ]
          }
        };
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing not-in operator', () => {
        const query: ItemQuery = {
          compoundCondition: {
            compoundType: 'AND',
            conditions: [
              { column: 'strValue', value: ['other', 'values'], operator: 'not-in' }
            ]
          }
        };
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing array-contains operator', () => {
        const query: ItemQuery = {
          compoundCondition: {
            compoundType: 'AND',
            conditions: [
              { column: 'arrayValue', value: 'b', operator: 'array-contains' }
            ]
          }
        };
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });

      test('testing array-contains-any operator', () => {
        const query: ItemQuery = {
          compoundCondition: {
            compoundType: 'AND',
            conditions: [
              { column: 'arrayValue', value: ['b', 'd'], operator: 'array-contains-any' }
            ]
          }
        };
        const result = isQueryMatch(testItem, query);
        expect(result).toBe(true);
      });
    });
  });

  describe('Testing abbrevQuery', () => {

    test('testing abbrevQuery', () => {
      const query = IQFactory
        .agg('tested',
          IQFactory.conditions([{ column: 'hello', value: "world", operator: '==' }]).toQuery())
        .event('created', { start: nowDate, end: nowDate })
        .limit(1)
        .offset(1)
        .pk('profile', profileKey.pk, 'turbo')
        .condition('turnip', 3, '==')
        .conditions([{ column: 'yimby', value: true, operator: '==' }])
        .toQuery();

      const expected = 'IQ R(turbo,profile,1-1-1-1-1) CC(AND,(turnip,3,==),CC(AND,(yimby,true,==)))' +
        ' A(tested,IQ CC(AND,(hello,world,==))) (Ecreated) L1 O1';
      expect(abbrevQuery(query)).toStrictEqual(expected);
    });

  });

  describe('Testing abbrevQuery', () => {
    test('should handle null value', () => {
      // @ts-ignore
      const result = abbrevQuery(null);
      expect(result).toBe('IQ (empty)');
    });

    test('should abbreviate compound condition', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [
            { column: 'field1', value: 'value1', operator: '==' },
            {
              compoundType: 'OR',
              conditions: [
                { column: 'field2', value: true, operator: '==' },
                { column: 'field3', value: 123, operator: '>' }
              ]
            }
          ]
        }
      };

      const result = abbrevQuery(query);
      expect(result).toBe('IQ CC(AND,(field1,value1,==),CC(OR,(field2,true,==),(field3,123,>)))');
    });

    test('should abbreviate compound condition with no conditions', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: []
        }
      };

      const result = abbrevQuery(query);
      expect(result).toBe('IQ CC(AND,)');
    });

    test('should handle compound condition with null conditions', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          // @ts-ignore
          conditions: null
        }
      };

      const result = abbrevQuery(query);
      expect(result).toBe('IQ CC(AND,No Conditions)');
    });

    test('should abbreviate ref', () => {
      const query: ItemQuery = {
        refs: {
          test: {
            key: {
              kt: 'test', pk: '123-456',
              loc: [{ kt: 'loc', lk: '123-456' }]
            } as ComKey<'test', 'loc'>
          }
        }
      };

      const result = abbrevQuery(query);
      expect(result)
        .toBe('IQ R(test,{\"kt\":\"test\",\"pk\":\"123-456\",\"loc\":[{\"kt\":\"loc\",\"lk\":\"123-456\"}]})');
    });
  });

  describe('Testing Compound Condition Matching', () => {
    test('testing query with a nested compound condition', () => {

      const matchingItem: Item<'test'> = {
        key: { kt: 'test', pk: '123-1-1-1-1' },
        whatever: false,
        yimby: false,
        feels: true,
        skier: true,
        events: {
          created: { at: nowDate },
          deleted: { at: null },
          updated: { at: nowDate }
        }
      };

      const noMatch1: Item<'test'> = {
        key: { kt: 'test', pk: '123-1-1-1-1' },
        whatever: false,
        yimby: false,
        feels: true,
        skier: false,
        events: {
          created: { at: nowDate },
          deleted: { at: null },
          updated: { at: nowDate }
        }
      };

      const match1: Item<'test'> = {
        key: { kt: 'test', pk: '123-1-1-1-1' },
        whatever: false,
        yimby: true,
        feels: false,
        skier: false,
        events: {
          created: { at: nowDate },
          deleted: { at: null },
          updated: { at: nowDate }
        }
      };

      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [
            { column: 'whatever', value: false, operator: '==' },
            {
              compoundType: 'OR',
              conditions: [
                { column: 'yimby', value: true, operator: '==' },
                {
                  compoundType: 'AND',
                  conditions: [
                    { column: 'feels', value: true, operator: '==' },
                    { column: 'skier', value: true, operator: '==' },
                  ]
                }]
            }
          ]
        }
      };
      expect(isQueryMatch(matchingItem, query)).toBe(true);
      expect(isQueryMatch(noMatch1, query)).toBe(false);
      expect(isQueryMatch(match1, query)).toBe(true);
    });
  });
});
