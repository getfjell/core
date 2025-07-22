/* eslint-disable indent */
 
import { Item } from "@/items";
import { isComKey, isPriKey, toKeyTypeArray } from "@/key/KUtils";
import { AllItemTypeArrays, ComKey, PriKey } from "@/keys";

import LibLogger from '@/logger';

const logger = LibLogger.get('IUtils');

const validatePKForItem = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(item: Item<S, L1, L2, L3, L4, L5>, pkType: S): Item<S, L1, L2, L3, L4, L5> => {
  if (!item) {
    logger.error('Validating PK, Item is undefined', { item });
    throw new Error('Validating PK, Item is undefined');
  }
  if (!item.key) {
    logger.error('Validating PK, Item does not have a key', { item });
    throw new Error('Validating PK, Item does not have a key');
  }

  const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
  if (keyTypeArray[0] !== pkType) {
    logger.error('Key Type Array Mismatch', { keyTypeArray, pkType });
    throw new Error(`Item does not have the correct primary key type. Expected ${pkType}, got ${keyTypeArray[0]}`);
  }
  return item;
};

export const validatePK = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  input: Item<S, L1, L2, L3, L4, L5> | Item<S, L1, L2, L3, L4, L5>[],
  pkType: S,
): Item<S, L1, L2, L3, L4, L5> | Item<S, L1, L2, L3, L4, L5>[] => {
  logger.trace('Checking Return Type', { input });

  if (Array.isArray(input)) {
    return input.map((item) => validatePKForItem(item, pkType));
  }
  return validatePKForItem(input, pkType);
};

export const validateKeys = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  item: Item<S, L1, L2, L3, L4, L5>,
  keyTypes: AllItemTypeArrays<S, L1, L2, L3, L4, L5>,
): Item<S, L1, L2, L3, L4, L5> => {
  logger.trace('Checking Return Type', { item });
  if (!item) {
    throw new Error('validating keys, item is undefined');
  }
  if (!item.key) {
    throw new Error('validating keys, item does not have a key: ' + JSON.stringify(item));
  }

  const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
  if (keyTypeArray.length !== keyTypes.length) {
    throw new Error(`Item does not have the correct number of keys. Expected ${keyTypes.length}, but got ${keyTypeArray.length}`);
  }

  const match: boolean = JSON.stringify(keyTypeArray) === JSON.stringify(keyTypes);
  if (!match) {
    logger.error('Key Type Array Mismatch', { keyTypeArray, thisKeyTypes: keyTypes });
    throw new Error(`Item does not have the correct key types. Expected [${keyTypes.join(', ')}], but got [${keyTypeArray.join(', ')}]`);
  }
  return item;
};

export const isPriItem = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  item: Item<S, L1, L2, L3, L4, L5>,
): item is Item<S> & { key: PriKey<S> } => {
  return !!(item && item.key && isPriKey(item.key));
};

export const isComItem = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(
  item: Item<S, L1, L2, L3, L4, L5>,
): item is Item<S, L1, L2, L3, L4, L5> & { key: ComKey<S, L1, L2, L3, L4, L5> } => {
  return !!(item && item.key && isComKey(item.key));
};