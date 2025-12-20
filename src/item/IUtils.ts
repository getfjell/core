/* eslint-disable indent */
 
import { ComKey, Item, PriKey } from "@fjell/types";
import { isComKey, isPriKey } from "../key/KUtils";

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