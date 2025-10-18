/**
 * Item validation
 *
 * Validates that Item objects have correct key types and structures.
 */

import type { Item } from "../items";
import { toKeyTypeArray } from "../key/KUtils";
import type { AllItemTypeArrays, ComKey, PriKey } from "../keys";
import LibLogger from '../logger';

const logger = LibLogger.get('validation', 'ItemValidator');

/**
 * Validates that a single item has the correct primary key type
 *
 * @param item - The item to validate
 * @param pkType - The expected primary key type
 * @returns The validated item
 * @throws Error if item is invalid or has wrong key type
 */
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

/**
 * Validates that an item or array of items have the correct primary key type
 *
 * @param input - The item or array of items to validate
 * @param pkType - The expected primary key type
 * @returns The validated item(s)
 * @throws Error if any item is invalid or has wrong key type
 *
 * @example
 * ```typescript
 * // Validate single item
 * const item = validatePK(fetchedItem, 'product');
 *
 * // Validate array of items
 * const items = validatePK(fetchedItems, 'product');
 * ```
 */
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

/**
 * Validates that an item's key matches the expected key type array
 *
 * This is used to validate composite items where the key structure must match
 * the complete hierarchy (e.g., [product, store, region])
 *
 * @param item - The item to validate
 * @param keyTypes - The expected key type array
 * @returns The validated item
 * @throws Error if item is invalid or key types don't match
 *
 * @example
 * ```typescript
 * // Validate item has correct key structure
 * const item = validateKeys(fetchedItem, ['product', 'store']);
 * ```
 */
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

