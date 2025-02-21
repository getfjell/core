import { Item } from "@/items";
import { isComKey, isPriKey, toKeyTypeArray } from "@/key/KUtils";
import { AllItemTypeArrays, ComKey, PriKey } from "@/keys";

import LibLogger from '@/logger';

const logger = LibLogger.get('IUtils');

export const validatePK = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(input: Item<S, L1, L2, L3, L4, L5> | Item<S, L1, L2, L3, L4, L5>[], pkType: S):
  Item<S, L1, L2, L3, L4, L5> | Item<S, L1, L2, L3, L4, L5>[] => {

  logger.trace('Checking Return Type', { input });

  if (Array.isArray(input)) {
    const itemArray = input as Item<S, L1, L2, L3, L4, L5>[];
    return itemArray.map((item) => validatePK(item, pkType)) as Item<S, L1, L2, L3, L4, L5>[];
  } else {
    const item = input as Item<S, L1, L2, L3, L4, L5>;
    if( item ) {
      if (item.key) {
        const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
        const match: boolean = keyTypeArray[0] === pkType;
        if (!match) {
          logger.error('Key Type Array Mismatch', { keyTypeArray, pkType });
          throw new Error('Item does not have the correct primary key type');
        } else {
          return item;
        }
      } else {
        logger.error('Validating PK, Item does not have a key', { item });
        throw new Error('Validating PK, Item does not have a key');
      }
    } else {
      logger.error('Validating PK, Item is undefined', { item });
      throw new Error('Validating PK, Item is undefined');
    }
  }
};

export const validateKeys = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(item: Item<S, L1, L2, L3, L4, L5>, keyTypes: AllItemTypeArrays<S, L1, L2, L3, L4, L5>):
  Item<S, L1, L2, L3, L4, L5> => {
  logger.trace('Checking Return Type', { item });
  if( item ) {
    if (item.key) {
      const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
      if (keyTypeArray.length !== keyTypes.length) {
        throw new Error('Item does not have the correct number of keys');
      } else {
        const match: boolean = JSON.stringify(keyTypeArray) === JSON.stringify(keyTypes);
        if (!match) {
          logger.error('Key Type Array Mismatch', { keyTypeArray, thisKeyTypes: keyTypes });
          throw new Error('Item does not have the correct key types');
        } else {
          return item;
        }
      }
    } else {
      throw new Error('validating keys, item does not have a key: ' + JSON.stringify(item));
    }
  } else {
    throw new Error('validating keys, item is undefined');
  }
};

export const isPriItem = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(item: Item<S, L1, L2, L3, L4, L5>): item is Item<S, L1, L2, L3, L4, L5> => {
  return (item && item.key) ? isPriKey(item.key as PriKey<S>) : false;
}

export const isComItem = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(item: Item<S, L1, L2, L3, L4, L5>): item is Item<S, L1, L2, L3, L4, L5> => {
  return (item && item.key) ? isComKey(item.key as ComKey<S, L1, L2, L3, L4, L5>) : false;
}