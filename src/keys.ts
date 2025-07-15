
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export interface ComKey<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> {
  readonly kt: S,
  readonly pk: UUID | string | number,
  readonly loc: LocKeyArray<L1, L2, L3, L4, L5>
};

export interface PriKey<
  S extends string,
> {
  readonly kt: S,
  readonly pk: UUID | string | number,
};

export interface LocKey<
  L extends string
> {
  readonly kt: L,
  readonly lk: UUID | string | number
};
export type LocKeyArray<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> =
  ([L5] extends [never] ?
    ([L4] extends [never] ?
      ([L3] extends [never] ?
        ([L2] extends [never] ?
          ([L1] extends [never] ?
            [] | never :
            [LocKey<L1>]) :
          [LocKey<L1>, LocKey<L2>]) :
        [LocKey<L1>, LocKey<L2>, LocKey<L3>]) :
      [LocKey<L1>, LocKey<L2>, LocKey<L3>, LocKey<L4>]) :
    [LocKey<L1>, LocKey<L2>, LocKey<L3>, LocKey<L4>, LocKey<L5>]);

export type ItemTypeArray<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> =
([L5] extends [never] ?
  ([L4] extends [never] ?
    ([L3] extends [never] ?
      ([L2] extends [never] ?
        ([L1] extends [never] ?
          [S] :
          [S, L1]) :
        [S, L1, L2]) :
      [S, L1, L2, L3]) :
    [S, L1, L2, L3, L4]) :
  [S, L1, L2, L3, L4, L5]);

export type AllItemTypeArrays<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> = readonly [S] |
  readonly [S, L1] |
  readonly [S, L1, L2] |
  readonly [S, L1, L2, L3] |
  readonly [S, L1, L2, L3, L4] |
  readonly [S, L1, L2, L3, L4, L5];

export type AllLocTypeArrays<
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> = readonly [] |
  readonly [L1] |
  readonly [L1, L2] |
  readonly [L1, L2, L3] |
  readonly [L1, L2, L3, L4] |
  readonly [L1, L2, L3, L4, L5];

