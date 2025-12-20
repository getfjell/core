import { ComKey, CompoundCondition, Condition, EventQuery, isCondition, Item, ItemQuery, OrderBy, PriKey, QueryParams, Reference, ReferenceItem, References } from "@fjell/types";
import { isItemKeyEqual, isPriKey } from "../key/KUtils";
import LibLogger from "../logger";
import * as luxon from 'luxon';

const logger = LibLogger.get('IQUtils');

/**
 * When we query or search, we're sending a GET request.  This converts everything in ItemQuery into a flat
 * object that can be sent over a GET request.
 *
 * Note that there is some discussion about this.  Evidently Elastic supports search with POST, but that also
 * feels like a bit of a hack. It's not a RESTful way to do things.  So we're sticking with GET for now.
 *
 * For reference, look at RFC 9110 "HTTP Semantics", June which clarified on top of and RFC 7231.  It's possible
 * but there are so many caveats and conditions in the standard, it's not worth it.
 *
 * Anticipating the next question - "isn't there a limit to the length of a URL?"   The specification does not
 * specify a limit, and there are limits in various browsers and servers - Apache is 4,000 chars, Chrome is 2M chars.
 * Short answer is that if this query is being used to craft something that complex, it is probably a better idea
 * to provide an action or a custom query endpoint on the server.
 *
 * @param query
 * @returns QueryParams ready to be get over a GET request.
 */
export const queryToParams = (query: ItemQuery): QueryParams => {
  const params: QueryParams = {};
  if (query.compoundCondition) {
    params.compoundCondition = JSON.stringify(query.compoundCondition);
  }
  if (query.refs) {
    params.refs = JSON.stringify(query.refs);
  }
  if (query.limit) {
    params.limit = query.limit;
  }
  if (query.offset) {
    params.offset = query.offset;
  }
  if (query.aggs) {
    params.aggs = JSON.stringify(query.aggs);
  }
  if (query.events) {
    params.events = JSON.stringify(query.events);
  }
  if (query.orderBy) {
    params.orderBy = JSON.stringify(query.orderBy);
  }
  return params;
}

// This is a dateTimeReviver used for JSON parse - when we convert a param back to a query, we need this.
const dateTimeReviver = function (key: string, value: string) {
  if (typeof value === 'string') {
    const parsedDate = luxon.DateTime.fromISO(value);
    if (parsedDate.isValid) {
      return parsedDate.toJSDate();
    }
  }
  return value;
}

/**
 * This method translates from a flat QueryParams object with stringify'd JSON back to a full ItemQuery.
 *
 * @param params Parameters sent over a GET request
 * @returns A fully hydrated ItemQuery object.
 */
export const paramsToQuery = (params: QueryParams): ItemQuery => {
  const query: ItemQuery = {};
  if (params.compoundCondition) {
    query.compoundCondition = JSON.parse(params.compoundCondition as string) as CompoundCondition;
  }
  if (params.refs) {
    query.refs = JSON.parse(params.refs as string) as References;
  }
  if (params.limit) {
    query.limit = Number(params.limit);
  }
  if (params.offset) {
    query.offset = Number(params.offset);
  }
  if (params.aggs) {
    query.aggs = JSON.parse(params.aggs as string) as Record<string, ItemQuery>;
  }
  if (params.events) {
    query.events = JSON.parse(params.events as string, dateTimeReviver) as Record<string, { start?: Date, end?: Date }>;
  }
  if (params.orderBy) {
    query.orderBy = JSON.parse(params.orderBy as string) as OrderBy[];
  }
  return query;
}

const isRefQueryMatch =
  <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(
    refKey: string,
    queryRef: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>,
    references: References,
  ): boolean => {
    logger.trace('doesRefMatch', { queryRef, references });
    logger.debug('Comparing Ref', { refKey, itemRef: references[refKey], queryRef });
    if (!references[refKey]) {
      return false;
    }
    return isItemKeyEqual(queryRef, references[refKey].key);
  }

const isCompoundConditionQueryMatch = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    queryCondition: CompoundCondition,
    item: Item<S, L1, L2, L3, L4, L5>,
  ): boolean => {
  if (queryCondition.compoundType === 'AND') {
    // If this is an AND compound condition, we need to check if all of the conditions match
    return queryCondition.conditions.every(
      (condition: Condition | CompoundCondition) =>
        isCondition(condition) ?
          isConditionQueryMatch(condition, item) :
          isCompoundConditionQueryMatch(condition, item)
    );
  } else {
    // If this is an OR compound condition, we need to check if any of the conditions match
    return queryCondition.conditions.some(
      (condition: Condition | CompoundCondition) =>
        isCondition(condition) ?
          isConditionQueryMatch(condition, item) :
          isCompoundConditionQueryMatch(condition, item)
    );
  }
}

const isConditionQueryMatch = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    queryCondition: Condition,
    item: Item<S, L1, L2, L3, L4, L5>,
  ): boolean => {
  const propKey = queryCondition.column;
  logger.trace('doesConditionMatch', { propKey, queryCondition, item });
  // eslint-disable-next-line no-undefined
  if (item[propKey] === undefined) {
    logger.debug('Item does not contain prop under key', { propKey, item });
    return false;
  }
  logger.debug('Comparing Condition', { propKey, itemProp: item[propKey], queryCondition });

  // Handle null values - only == and != make sense with null
  if (queryCondition.value === null) {
    if (queryCondition.operator === '==') {
      return item[propKey] === null;
    } else if (queryCondition.operator === '!=') {
      return item[propKey] !== null;
    } else {
      throw new Error(
        `Operator ${queryCondition.operator} cannot be used with null value. Use '==' for null checks or '!=' for not-null checks.`
      );
    }
  }

  let result = false;
  switch (queryCondition.operator) {
    case '==':
      result = item[propKey] === queryCondition.value;
      break;
    case '!=':
      result = item[propKey] !== queryCondition.value;
      break;
    case '>':
      result = item[propKey] > queryCondition.value;
      break;
    case '>=':
      result = item[propKey] >= queryCondition.value;
      break;
    case '<':
      result = item[propKey] < queryCondition.value;
      break;
    case '<=':
      result = item[propKey] <= queryCondition.value;
      break;
    case 'in':
      result = (queryCondition.value as unknown as string[]).includes(item[propKey] as string);
      break;
    case 'not-in':
      result = !(queryCondition.value as unknown as string[]).includes(item[propKey] as string);
      break;
    case 'array-contains':
      result = (item[propKey] as unknown as string[]).includes(queryCondition.value as string);
      break;
    case 'array-contains-any':
      result = (queryCondition.value as unknown as string[])
        .some(value => (item[propKey] as unknown as string[]).includes(value));
      break;
  }
  return result;
}

const isAggQueryMatch = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    aggKey: string,
    aggQuery: ItemQuery,
    agg: ReferenceItem<S, L1, L2, L3, L4, L5>
  ): boolean => {
  const aggItem = agg.item;
  logger.debug('Comparing Agg', { aggKey, aggItem, aggQuery });
  // Fancy, right?  This is a recursive call to isQueryMatch
  if (!aggItem) {
    return false;
  }
  return isQueryMatch(aggItem, aggQuery);
}

const isEventQueryMatch = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(
    eventKey: string,
    eventQuery: EventQuery,
    item: Item<S, L1, L2, L3, L4, L5>,
  ): boolean => {
  if (!item.events[eventKey]) {
    logger.debug('Item does not contain event under key', { eventKey, events: item.events });
    return false;
  } else {
    const itemEvent = item.events[eventKey];
    if (itemEvent.at !== null) {
      if (eventQuery.start && !(eventQuery.start.getTime() <= itemEvent.at.getTime())) {
        logger.debug('Item date before event start query', { eventQuery, itemEvent });
        return false;
      }
      if (eventQuery.end && !(eventQuery.end.getTime() > itemEvent.at.getTime())) {
        logger.debug('Item date after event end query', { eventQuery, itemEvent });
        return false;
      }
    } else {
      logger.debug('Item event does contains a null at', { itemEvent });
      return false;
    }
    return true;
  }
}

export const isQueryMatch = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(item: Item<S, L1, L2, L3, L4, L5>, query: ItemQuery): boolean => {

  logger.trace('isMatch', { item, query });
  if (query.refs && item.refs) {
    for (const key in query.refs) {
      const queryRef = query.refs[key];
      if (!isRefQueryMatch(key, queryRef.key, item.refs)) return false;
    }
  } else if (query.refs && !item.refs) {
    logger.debug('Query contains refs but item does not have refs', { query, item });
    return false;
  }

  if (query.compoundCondition && item) {
    if (!isCompoundConditionQueryMatch(query.compoundCondition, item)) return false;
  }

  if (query.events && item.events) {
    for (const key in query.events) {
      const queryEvent = query.events[key];
      if (!isEventQueryMatch(key, queryEvent, item)) return false
    }
    return true;
  }

  if (query.aggs && item.aggs) {
    for (const key in query.aggs) {
      const aggQuery = query.aggs[key];
      // aggs is a record where each key maps to an array of aggregations
      if (item.aggs[key]) {
        let hasMatch = false;
        for (const aggRecord of item.aggs[key]) {
          if (isAggQueryMatch(key, aggQuery, aggRecord as ReferenceItem<any, any, any, any, any, any>)) {
            hasMatch = true;
            break;
          }
        }
        if (!hasMatch) return false;
      } else {
        return false;
      }
    }
  } else if (query.aggs && !item.aggs) {
    logger.debug('Query contains aggs but item does not have aggs', { query, item });
    return false;
  }

  // If it hasn't returned false by now, it must be a match
  return true;
}

export const abbrevQuery = (query: ItemQuery | null | undefined): string => {
  const abbrev = ['IQ'];
  if( query ) {
    if (query.refs) {
      for (const key in query.refs) {
        const ref = abbrevRef(key, query.refs[key]);
        abbrev.push(ref);
      }
    }
    if (query.compoundCondition) {
      const props = abbrevCompoundCondition(query.compoundCondition);
      abbrev.push(props);
    }
    if (query.aggs) {
      for (const key in query.aggs) {
        const agg = abbrevAgg(key, query.aggs[key]);
        abbrev.push(agg);
      }
    }
    if (query.events) {
      const events = `(E${Object.keys(query.events).join(',')})`;
      abbrev.push(events);
    }
    if (query.limit) {
      abbrev.push(`L${query.limit}`);
    }
    if (query.offset) {
      abbrev.push(`O${query.offset}`);
    }
  } else {
    abbrev.push('(empty)');
  }
  return abbrev.join(' ');
}

export const abbrevRef = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(key: string, ref: Reference<S, L1, L2, L3, L4, L5>): string => {
  if (isPriKey(ref.key)) {
    const priKey = ref.key as PriKey<S>;
    return `R(${key},${priKey.kt},${priKey.pk})`;
  } else {
    const comKey = ref.key as ComKey<S, L1, L2, L3, L4, L5>;
    return `R(${key},${JSON.stringify(comKey)})`;
  }
}

export const abbrevAgg = (key: string, agg: ItemQuery): string => {
  return `A(${key},${abbrevQuery(agg)})`;
}

export const abbrevCompoundCondition = (compoundCondition: CompoundCondition): string => {
  return `CC(${compoundCondition.compoundType},` +
    `${compoundCondition.conditions ? compoundCondition.conditions.map(abbrevCondition).join(',') : 'No Conditions'})`;
}

export const abbrevCondition = (condition: Condition | CompoundCondition): string => {
  if (isCondition(condition)) {
    return `(${condition.column},${condition.value},${condition.operator})`;
  } else {
    return abbrevCompoundCondition(condition);
  }
}
