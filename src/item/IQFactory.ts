import { cPK } from '@/key/KUtils';
import {
  CompoundType,
  Condition,
  ConditionOperator,
  EventQuery,
  isCondition,
  ItemQuery,
  OrderDirection
} from "./ItemQuery";

export class IQFactory {

  private query: ItemQuery = {};

  public constructor(query: ItemQuery = {}) {
    this.query = query;
  }

  public orderBy(field: string, direction: OrderDirection = 'asc') {
    if (!this.query.orderBy) {
      this.query.orderBy = [];
    }
    this.query.orderBy.push({ field, direction });
    return this;
  }

  public agg(name: string, query: ItemQuery) {
    if (!this.query.aggs) {
      this.query.aggs = {};
    }
    this.query.aggs[name] = query;
    return this;
  }

  public event(name: string, query: EventQuery) {
    if (!this.query.events) {
      this.query.events = {};
    }
    this.query.events[name] = query;
    return this;
  }

  public conditions(conditions: Condition[], compoundType: CompoundType = 'AND') {
    for (const condition of conditions) {
      if (!isCondition(condition)) {
        throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
      }
    }
    if (!this.query.compoundCondition) {
      // If there is no top-level compound condition, create one
      // with the given compound type.   This will mostly likely be the most common case.
      this.query.compoundCondition = {
        compoundType,
        conditions: conditions,
      };
    } else {
      // If there is already a top-level compound condition, create a new compound condition
      // and add it to the conditions array of the top-level compound condition.
      const compoundCondition = {
        compoundType,
        conditions,
      };
      this.query.compoundCondition.conditions.push(compoundCondition);
    }
    return this;
  }

  public limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  public offset(offset: number) {
    this.query.offset = offset;
    return this;
  }

  // TODO: right now, we're only supporting PK refs for queries.  Should add support for CKs
  public pk(kt: string, pk: string, name?: string) {
    if (!this.query.refs) {
      this.query.refs = {};
    }
    const refName = name || kt;
    this.query.refs[refName] = cPK<string>(pk, kt);
    return this;
  }

  public condition(
    column: string,
    value: string[] | string | number[] | number | boolean | Date,
    operator: ConditionOperator = '==',
  ) {
    const condition: Condition = { column, value, operator };
    if (isCondition(condition)) {
      if (!this.query.compoundCondition) {
        // If there is no top-level compound condition, create one
        // with the default compound type of 'AND'.
        this.query.compoundCondition = {
          compoundType: 'AND',
          conditions: [],
        };
      }
      this.query.compoundCondition.conditions.push(condition);
      return this;
    } else {
      throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
    }
  }

  public static all() {
    const iqFactory = new IQFactory();
    return iqFactory;
  }

  public static orderBy(field: string, direction: OrderDirection = 'asc') {
    const iqFactory = new IQFactory();
    return iqFactory.orderBy(field, direction);
  }

  public static agg(name: string, query: ItemQuery) {
    const iqFactory = new IQFactory();
    return iqFactory.agg(name, query);
  }

  public static event(name: string, query: EventQuery) {
    const iqFactory = new IQFactory();
    return iqFactory.event(name, query);
  }

  public static limit(limit: number) {
    const iqFactory = new IQFactory();
    return iqFactory.limit(limit);
  }

  public static offset(offset: number) {
    const iqFactory = new IQFactory();
    return iqFactory.offset(offset);
  }

  public static pk(kt: string, pk: string, name?: string) {
    const iqFactory = new IQFactory();
    return iqFactory.pk(kt, pk, name);
  }

  public static condition(
    column: string,
    value: string[] | string | number[] | number | boolean | Date,
    operator: ConditionOperator = '=='
  ) {
    const iqFactory = new IQFactory();
    return iqFactory.condition(column, value, operator);
  }

  public static conditions(conditions: Condition[], compoundType: CompoundType = 'AND') {
    const iqFactory = new IQFactory();
    return iqFactory.conditions(conditions, compoundType);
  }

  toQuery() {
    return this.query;
  }
}