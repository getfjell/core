import { IQFactory } from '../../src/item/IQFactory';
import { describe, expect, test } from 'vitest';

describe('Testing IQFactory', () => {
  const nowDate = new Date();

  test('Query for all', () => {
    const iqFactory = IQFactory.all();

    const expected = {};
    expect(iqFactory.toQuery()).toStrictEqual(expected);
  });

  test('Query with a date range', () => {
    const iqFactory = IQFactory.event('tested', { start: nowDate, end: nowDate });

    const expected = { events: { tested: { end: nowDate, start: nowDate } } };
    expect(iqFactory.toQuery()).toStrictEqual(expected);
  });

  describe('orderBy', () => {
    test('Query with an orderBy', () => {
      const iqFactory = IQFactory.orderBy('name', 'desc');

      const expected = { orderBy: [{ field: 'name', direction: 'desc' }] };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('orderBy testing default direction', () => {
      const iqFactory = IQFactory.orderBy('name');

      const expected = { orderBy: [{ field: 'name', direction: 'asc' }] };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('orderBy testing default direction for non-static call', () => {
      const iqFactory = new IQFactory();
      iqFactory.orderBy('name');

      const expected = { orderBy: [{ field: 'name', direction: 'asc' }] };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });

  describe('agg', () => {
    test('Query with an agg', () => {
      const iqFactory = IQFactory.agg('tested', { limit: 1 });

      const expected = { aggs: { tested: { limit: 1 } } };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });

  describe('limit', () => {
    test('Query with limit', () => {
      const iqFactory = IQFactory.limit(1);

      const expected = { limit: 1 };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });

  describe('offset', () => {
    test('Query with offset', () => {
      const iqFactory = IQFactory.offset(1);

      const expected = { offset: 1 };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });

  describe('condition', () => {
    test('Query with prop', () => {
      const iqFactory = IQFactory.condition('whatever', true);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'whatever', value: true, operator: '==' }],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with props', () => {
      const iqFactory = IQFactory.conditions([{ column: 'yimby', value: true, operator: '==' }]);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }],
        }
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with null value works', () => {
      const iqFactory = IQFactory.condition('yimby', null, '==');

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: null, operator: '==' }],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with null value in conditions array works', () => {
      const iqFactory = IQFactory.conditions([{ column: 'yimby', value: null, operator: '==' }]);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: null, operator: '==' }],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with null value using != operator', () => {
      const iqFactory = IQFactory.condition('yimby', null, '!=');

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: null, operator: '!=' }],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with multiple conditions including null', () => {
      const iqFactory = IQFactory.conditions([
        { column: 'name', value: 'test', operator: '==' },
        { column: 'deletedAt', value: null, operator: '==' },
        { column: 'status', value: 'active', operator: '==' }
      ]);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [
            { column: 'name', value: 'test', operator: '==' },
            { column: 'deletedAt', value: null, operator: '==' },
            { column: 'status', value: 'active', operator: '==' }
          ],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query with chained conditions including null', () => {
      const iqFactory = IQFactory.condition('name', 'test')
        .condition('deletedAt', null, '==')
        .condition('active', true);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [
            { column: 'name', value: 'test', operator: '==' },
            { column: 'deletedAt', value: null, operator: '==' },
            { column: 'active', value: true, operator: '==' }
          ],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });

    test('Query for condition with default operator non-static', () => {
      const iqFactory = new IQFactory();
      iqFactory.condition('yimby', true);

      const expected = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [{ column: 'yimby', value: true, operator: '==' }],
        },
      };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });

  describe('pk', () => {
    test('Query with pk', () => {
      const iqFactory = IQFactory.pk('turbo', '1-1-1-1-1');

      const expected = { refs: { turbo: { key: { kt: 'turbo', pk: '1-1-1-1-1' } } } };
      expect(iqFactory.toQuery()).toStrictEqual(expected);
    });
  });
});
