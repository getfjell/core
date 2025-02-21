import { References } from '@/items';

export type QueryParams = Record<string, string | number | boolean | Date>;

/**
 * The operator for a condition.  This is the same as the operators used in the Firestore query language.
 */
export type ConditionOperator =
  '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';

/**
 * A single property condition is defined with a column, value, and operator.
 * This is a condition that is used in a query.
 */
export type Condition = {
  column: string,
  value: string[] | string | number[] | number | boolean | Date,
  operator: ConditionOperator,
};

/**
 * When applying a compound condition, the CompoundType defines the type of compound condition.
 */
export type CompoundType = 'AND' | 'OR';

/**
 * When configuring a CompoundCondition this can contain a collection of conditions
 * that will be applied to the query.  By default, this is an AND conditiion that is associated
 * with an array of Condition objects OR an array of CompoundCondition objects.
 *
 * For example, I could have { compoundType: 'AND', conditions: [{column: 'name', value: 'test', operator: '=='},
 * {column: 'age', value: 21, operator: '>='}]} which would filter the query to only include items
 * where the name is 'test' and the age is greater than or equal to 21.
 *
 * Or, I could have a { compoundType: 'OR', conditions: [{column: 'name', value: 'test', operator: '=='},
 * {column: 'age', value: 21, operator: '>='}]} which would filter the query to only include items
 * where the name is 'test' OR the age is greater than or equal to 21.
 *
 * I could also nest an OR within an AND, like this:
 * ['AND', [{column: 'name', value: 'test', operator: '=='},
 * { compoundType: 'OR', conditions: [{column: 'age', value: 21, operator: '<='},
 * {column: 'age', value: 52, operator: '>='}]}]] which would filter the query to only include items where the
 * name is 'test' and the age is less than or equal to 21 or greater than or equal to 52.
 */
export type CompoundCondition = {
  compoundType: CompoundType,
  conditions: Array<Condition | CompoundCondition>
};

export const isCondition = (condition: any): condition is Condition => {
  return (
    typeof condition.column === 'string' &&
    (Array.isArray(condition.value) && condition.value.every((item: any) => typeof item === 'string')) ||
    (Array.isArray(condition.value) && condition.value.every((item: any) => typeof item === 'number')) ||
    typeof condition.value === 'string' ||
    typeof condition.value === 'number' ||
    typeof condition.value === 'boolean' ||
    condition.value instanceof Date
  ) && (condition.operator ? typeof condition.operator === 'string' : true);
}

export type EventQuery = {
  start?: Date,
  end?: Date,
  by?: string,
}

export type OrderDirection = 'asc' | 'desc';

export type OrderBy = {
  field: string;
  direction: OrderDirection;
}

export type ItemQuery = {
  refs?: References;
  compoundCondition?: CompoundCondition;
  limit?: number;
  offset?: number;
  aggs?: Record<
    string,
    ItemQuery
  >;
  events?: Record<string, EventQuery>;
  orderBy?: OrderBy[];
};

