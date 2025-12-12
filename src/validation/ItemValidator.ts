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
    logger.error('Item validation failed - item is undefined', {
      component: 'core',
      operation: 'validatePK',
      expectedType: pkType,
      item,
      suggestion: 'Ensure the operation returns a valid item object, not undefined/null'
    });
    throw new Error(
      `Item validation failed: item is undefined. Expected item of type '${pkType}'. ` +
      `This usually indicates a database operation returned null/undefined unexpectedly.`
    );
  }
  if (!item.key) {
    logger.error('Item validation failed - item missing key', {
      component: 'core',
      operation: 'validatePK',
      expectedType: pkType,
      item,
      suggestion: 'Ensure the item has a valid key property with kt and pk fields'
    });
    throw new Error(
      `Item validation failed: item does not have a key property. Expected key with type '${pkType}'. ` +
      `Item: ${JSON.stringify(item)}. This indicates a database processing error.`
    );
  }

  const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
  if (keyTypeArray[0] !== pkType) {
    logger.error('Key type mismatch during validation', {
      component: 'core',
      operation: 'validatePK',
      expectedType: pkType,
      actualType: keyTypeArray[0],
      keyTypeArray,
      itemKey: item.key,
      suggestion: `Ensure the item key has kt: '${pkType}', not '${keyTypeArray[0]}'`
    });
    throw new Error(
      `Item has incorrect primary key type. Expected '${pkType}', got '${keyTypeArray[0]}'. ` +
      `Key: ${JSON.stringify(item.key)}. This indicates a data model mismatch.`
    );
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
    logger.error('Key validation failed - item is undefined', {
      component: 'core',
      operation: 'validateKeys',
      expectedKeyTypes: keyTypes,
      suggestion: 'Ensure the operation returns a valid item object, not undefined/null'
    });
    throw new Error(
      `Key validation failed: item is undefined. Expected item with key types [${keyTypes.join(', ')}]. ` +
      `This usually indicates a database operation returned null/undefined unexpectedly.`
    );
  }
  if (!item.key) {
    logger.error('Key validation failed - item missing key', {
      component: 'core',
      operation: 'validateKeys',
      expectedKeyTypes: keyTypes,
      item: JSON.stringify(item),
      suggestion: 'Ensure the item has a valid key property'
    });
    throw new Error(
      `Key validation failed: item does not have a key property. Expected key with types [${keyTypes.join(', ')}]. ` +
      `Item: ${JSON.stringify(item)}. This indicates a database processing error.`
    );
  }

  const keyTypeArray = toKeyTypeArray(item.key as ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>);
  if (keyTypeArray.length !== keyTypes.length) {
    logger.error('Key hierarchy depth mismatch', {
      component: 'core',
      operation: 'validateKeys',
      expectedKeyTypes: keyTypes,
      expectedDepth: keyTypes.length,
      actualKeyTypes: keyTypeArray,
      actualDepth: keyTypeArray.length,
      itemKey: item.key,
      suggestion: `Check coordinate definition. Expected hierarchy depth of ${keyTypes.length}, got ${keyTypeArray.length}`
    });
    throw new Error(
      `Item has incorrect key hierarchy depth. Expected ${keyTypes.length} levels [${keyTypes.join(' > ')}], ` +
      `but got ${keyTypeArray.length} levels [${keyTypeArray.join(' > ')}]. ` +
      `Key: ${JSON.stringify(item.key)}. This indicates a coordinate/hierarchy mismatch.`
    );
  }

  const match: boolean = JSON.stringify(keyTypeArray) === JSON.stringify(keyTypes);
  if (!match) {
    logger.error('Key Type Array Mismatch', {
      component: 'core',
      operation: 'validateKeys',
      expectedKeyTypes: keyTypes,
      actualKeyTypes: keyTypeArray,
      itemKey: item.key,
      suggestion: `Ensure item key matches expected hierarchy: [${keyTypes.join(' > ')}]`
    });
    throw new Error(
      `Item has incorrect key types. Expected [${keyTypes.join(' > ')}], but got [${keyTypeArray.join(' > ')}]. ` +
      `Key: ${JSON.stringify(item.key)}. This indicates a data model mismatch.`
    );
  }
  return item;
};

