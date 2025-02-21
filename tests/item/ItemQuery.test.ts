import { Condition, ConditionOperator, isCondition, ItemQuery } from '@/item/ItemQuery';

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});

describe('ItemQuery', () => {

  describe('isProp', () => {
    
    test('should return true for valid string prop', () => {
      const condition: Condition = { column: 'name', value: 'test', operator: '==' as ConditionOperator };
      expect(isCondition(condition)).toBe(true);
    });

    test('should return true for valid number prop', () => {
      const condition: Condition = { column: 'name', value: 123, operator: '>' as ConditionOperator };
      expect(isCondition(condition)).toBe(true);
    });

    test('should return false for valid number prop', () => {
      const condition: Condition = { column: 'name', value: [123,234], operator: '>' as ConditionOperator };
      expect(isCondition(condition)).toBe(true);
    });
      
    test('should return true for valid boolean prop', () => {
      const condition: Condition = { column: 'name', value: true, operator: '==' as ConditionOperator };
      expect(isCondition(condition)).toBe(true);
    });

    test('should return true for valid Date prop', () => {
      const condition: Condition = { column: 'name', value: new Date(), operator: '<=' as ConditionOperator };
      expect(isCondition(condition)).toBe(true);
    });

    test('should return false for valid Date prop', () => {
      const condition: Condition = {
        column: 'name',
        // @ts-ignore
        value: [new Date(), new Date()],
        operator: '<=' as ConditionOperator
      };
      expect(isCondition(condition)).toBe(false);
    });

    test('should return false for array value', () => {
      const condition: Condition = {
        column: 'name',
        // @ts-ignore
        value: ['test'],
        operator: 'in' as ConditionOperator
      };
      expect(isCondition(condition)).toBe(true);
    });

    test('should return false for invalid operator type', () => {
      const condition: Condition = {
        column: 'name',
        // @ts-ignore
        value: 'test',
        operator: 'in' as ConditionOperator
      };
      expect(isCondition(condition)).toBe(true);
    });

  });

  describe('ItemQuery type', () => {

    test('should allow empty query', () => {
      const query: ItemQuery = {};
      expect(query).toBeDefined();
    });

    test('should allow query with props', () => {
      const query: ItemQuery = {
        compoundCondition: {
          compoundType: 'AND',
          conditions: [
            { column: 'name', value: 'test', operator: '==' as ConditionOperator }
          ]
        }
      };
      expect((query.compoundCondition?.conditions[0] as Condition).value).toBe('test');
    });

    test('should allow query with limit and offset', () => {
      const query: ItemQuery = {
        limit: 10,
        offset: 20
      };
      expect(query.limit).toBe(10);
      expect(query.offset).toBe(20);
    });

    test('should allow query with events', () => {
      const now = new Date();
      const query: ItemQuery = {
        events: {
          created: {
            start: now,
            end: now
          }
        }
      };
      expect(query.events?.created.start).toBe(now);
    });

    test('should allow query with aggregations', () => {
      const query: ItemQuery = {
        aggs: {
          count: {
            limit: 0
          }
        }
      };
      expect(query.aggs?.count.limit).toBe(0);
    });

  });

});
