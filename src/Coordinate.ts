import type { ItemTypeArray } from "@fjell/types";
import LibLogger from "./logger";
import { Coordinate } from "@fjell/types/Coordinate";

export type { Coordinate } from "@fjell/types/Coordinate";

const logger = LibLogger.get("Coordinate");

export const createCoordinate = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(kta: ItemTypeArray<S, L1, L2, L3, L4, L5> | S, scopes: string[] = []): Coordinate<S, L1, L2, L3, L4, L5> => {
  const ktArray = Array.isArray(kta) ? kta : [kta];
  const toString = () => {
    logger.debug("toString", { kta, scopes });
    return `${ktArray.join(', ')} - ${scopes.join(', ')}`;
  }
  logger.debug("createCoordinate", { kta: ktArray, scopes, toString });
  return { kta: ktArray as ItemTypeArray<S, L1, L2, L3, L4, L5>, scopes, toString };
}
