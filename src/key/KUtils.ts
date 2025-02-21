/* eslint-disable no-undefined */
import {
  ComKey,
  LocKey,
  LocKeyArray,
  PriKey,
  UUID
} from "@/keys";

import LibLogger from "@/logger";

const logger = LibLogger.get('KUtils');

export const isItemKeyEqual = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(a: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>, b: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): boolean => {
  logger.trace('isKeyEqual', { a, b });
  if (isComKey(a) && isComKey(b)) {
    return isComKeyEqual(a as ComKey<S, L1, L2, L3, L4, L5>, b as ComKey<S, L1, L2, L3, L4, L5>);
  } else if (isPriKey(a) && isPriKey(b)) {
    if(isComKey(a) || isComKey(b)) {
      return false;
    } else {
      return isPriKeyEqual(a as PriKey<S>, b as PriKey<S>);
    }
  } else {
    return false;
  }
}

export const isPriKeyEqual = <
  S extends string,
>(a: PriKey<S>, b: PriKey<S>): boolean => {
  logger.trace('isPriKeyEqual', { a, b });
  return a && b && a.pk === b.pk && a.kt === b.kt;
}

export const isLocKeyEqual = <
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(a: LocKey<L1 | L2 | L3 | L4 | L5>, b: LocKey<L1 | L2 | L3 | L4 | L5>): boolean => {
  logger.trace('isLocKeyEqual', { a, b });
  return a && b && a.lk === b.lk && a.kt === b.kt;
}

export const isComKeyEqual = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(a: ComKey<S, L1, L2, L3, L4, L5>, b: ComKey<S, L1, L2, L3, L4, L5>): boolean => {
  logger.trace('isComKeyEqual', { a, b });
  if (a && b && isPriKeyEqual({ kt: a.kt, pk: a.pk } as PriKey<S>, { kt: b.kt, pk: b.pk } as PriKey<S>)) {
    if (a.loc.length === b.loc.length) {
      for (let i = 0; i < a.loc.length; i++) {
        if (!isLocKeyEqual<L1, L2, L3, L4, L5>(a.loc[i], b.loc[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export const isItemKey = (key: any): boolean => {
  logger.trace('isItemKey', { key });
  return key !== undefined && (isComKey(key) || isPriKey(key));
}

export const isComKey = (key: any): boolean => {
  logger.trace('isComKey', { key });
  return key !== undefined &&
    (key.pk !== undefined && key.kt !== undefined) && (key.loc !== undefined && key.loc.length > 0);
}

export const isPriKey = (key: any): boolean => {
  logger.trace('isPriKey', { key });
  return key !== undefined &&
    (key.pk !== undefined && key.kt !== undefined) && (key.loc === undefined || key.loc.length === 0);
}

export const isLocKey = (key: any): boolean => {
  logger.trace('isLocKey', { key });
  return key !== undefined && (key.lk !== undefined && key.kt !== undefined);
}

export const generateKeyArray = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
>(key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S> | LocKeyArray<L1, L2, L3, L4, L5> | []):
  Array<PriKey<S> | LocKey<L1 | L2 | L3 | L4 | L5>> => {
  logger.trace('generateKeyArray', { key });
  const keys: Array<PriKey<S> | LocKey<L1 | L2 | L3 | L4 | L5>> = [];

  if (isComKey(key) || isPriKey(key)) {
    // console.log('it is an item key');
    if (isComKey(key)) {
      //  console.log('it is a composite key');
      const comKey = key as ComKey<S, L1, L2, L3, L4, L5>;
      keys.push({ pk: comKey.pk, kt: comKey.kt });
      for (let i = 0; i < comKey.loc.length; i++) {
        keys.push(comKey.loc[i]);
      }
    } else {
      keys.push(key as PriKey<S>);
    }
  } else {
    // console.log('is is an array, length: ' + key.length);
    const locKeys = key as LocKey<L1 | L2 | L3 | L4 | L5>[];
    for (let i = 0; i < locKeys.length; i++) {
      // console.log('Pushing a key');
      keys.push(locKeys[i]);
    }
  }
  return keys;
}

// TODO: Exactly the same as in ContainedItemLib
export const constructPriKey = <S extends string>(
  pk: string | PriKey<S>,
  kt: S,
) => {
  logger.trace('constructPriKey', { pk, kt });
  let pri: PriKey<S>;
  if (typeof pk === 'string') {
    pri = { kt: kt as S, pk: pk as UUID };
  } else {
    pri = pk;
  }
  return pri;
}

// TODO: Exactly the same as in ContainedItemLib
export const cPK = constructPriKey;

export const toKeyTypeArray = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(ik: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>):
  string[] => {
  logger.trace('toKeyTypeArray', { ik });
  if (isComKey(ik)) {
    const ck = ik as ComKey<S, L1, L2, L3, L4, L5>;
    return [ck.kt, ...ck.loc.map(l => l.kt)];
  } else {
    return [(ik as PriKey<S>).kt];
  }
}

export const abbrevIK = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(ik: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): string => {
  logger.trace('abbrevIK', { ik });
  if(ik) {
    if (isComKey(ik)) {
      const ck = ik as ComKey<S, L1, L2, L3, L4, L5>;
      return `${ck.kt}:${ck.pk}:${ck.loc.map(l => `${l.kt}:${l.lk}`).join(',')}`;
    } else {
      return `${(ik as PriKey<S>).kt}:${(ik as PriKey<S>).pk}`;
    }
  } else {
    return 'null IK';
  }
}

export const abbrevLKA = <
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(keyArray: Array<LocKey<L1 | L2 | L3 | L4 | L5>> | null): string => {
  logger.trace('abbrevLKA', { keyArray });
  if (keyArray === undefined || keyArray === null) {
    return 'null LKA';
  } else {
    return keyArray.map(key => {
      if (key) {
        return `${key.kt}:${key.lk}`;
      } else {
        return key;
      }
    }).join(',');
  }
}

export const primaryType = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(ik: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): string => {
  logger.trace('primaryType', { ik });
  if (isComKey(ik)) {
    return (ik as ComKey<S, L1, L2, L3, L4, L5>).kt;
  } else {
    return (ik as PriKey<S>).kt;
  }
}

/**
 *
 * @param ik ItemKey to be used as a basis for a location
 * @returns
 */
export const itemKeyToLocKeyArray =
  <
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(ik: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>): LocKeyArray<S, L1, L2, L3, L4> => {
    logger.trace('itemKeyToLocKeyArray', { ik: abbrevIK(ik) });
    let lka: Array<LocKey<L1 | L2 | L3 | L4 | L5>> = [];
    if (isComKey(ik)) {
      const ck = ik as ComKey<S, L1, L2, L3, L4, L5>;
      // @ts-expect-error
      lka = [{ kt: ck.kt, lk: ck.pk } as LocKey<S>, ...ck.loc];
    } else {
      const pk = ik as PriKey<S>;
      // @ts-expect-error
      lka = [{ kt: pk.kt, lk: pk.pk } as LocKey<S>];
    }
    logger.trace('itemKeyToLocKeyArray Results', { ik: abbrevIK(ik), lka: abbrevLKA(lka) });
    return lka as LocKeyArray<S, L1, L2, L3, L4>;
  }

export const ikToLKA = itemKeyToLocKeyArray;

/**
 * Sometimes you need to take a location key array and convert it to the item key that points to the containing item.
 * @param lka A location key array
 * @returns An item key corresponding to the containing item this location refers to.
 */
export const locKeyArrayToItemKey =
  <
    L1 extends string,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(lka: LocKeyArray<L1, L2, L3, L4, L5>):
    PriKey<L1> | ComKey<L1, L2, L3, L4, L5> => {
    // @ts-expect-error
    logger.trace('locKeyArrayToItemKey', { lka: abbrevLKA(lka) });

    if(lka.length === 1) {
      const priKey = cPK(lka[0].lk, lka[0].kt);
      return priKey as PriKey<L1>;
    } else {
      const locs = lka.slice(1);
      // @ts-expect-error
      const priKey = cPK(lka[0].lk, lka[0].kt);
      const comKey = { kt: priKey.kt, pk: priKey.pk, loc: locs as LocKeyArray<L2, L3, L4, L5> };
      return comKey as ComKey<L1, L2, L3, L4, L5>;
    }
  }

// TODO: This is annoying that we have to check for '' and 'null'
export const isValidPriKey = <S extends string>(key: PriKey<S>): boolean => {
  const valid = (key !== undefined && key !== null)
    && (key.pk !== undefined && key.pk !== null && key.pk !== '' && key.pk !== 'null')
    && (key.kt !== undefined && key.kt !== null && key.kt !== '' && key.kt !== 'null');
  return valid;
}

// TODO: This is annoying that we have to check for '' and 'null'
export const isValidLocKey = <
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(key: LocKey<L1 | L2 | L3 | L4 | L5>): boolean => {
  const valid = (key !== undefined && key !== null)
    && (key.lk !== undefined && key.lk !== null && key.lk !== '' && key.lk !== 'null')
    && (key.kt !== undefined && key.kt !== null && key.kt !== '' && key.kt !== 'null');
  return valid;
}

export const isValidLocKeyArray = <
  L1 extends string,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(keyArray: Array<LocKey<L1 | L2 | L3 | L4 | L5>>): boolean => {
  return (keyArray !== undefined && keyArray !== null) && keyArray.every(isValidLocKey);
}

export const isValidComKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(key: ComKey<S, L1, L2, L3, L4, L5>): boolean => {
  return (key !== undefined
    // @ts-expect-error
    && key !== null) && isValidPriKey(key) && isValidLocKeyArray(key.loc);
}

export const isValidItemKey = <
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
>(key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>): boolean => {
  return (isComKey(key) &&
    isValidComKey(key as ComKey<S, L1, L2, L3, L4, L5>)) || (isPriKey(key) && isValidPriKey(key as PriKey<S>));
}

export const lkaToIK = locKeyArrayToItemKey;
