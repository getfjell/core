import { ComKey, PriKey } from './keys';

export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends (infer U)[] ? RecursivePartial<U>[] :
  T[P] extends object | undefined ? RecursivePartial<T[P]> :
  T[P];
};

export type Identified<S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never> = {
    key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>;
  };

/**
 * This is a generic item event, and it's designed to make sure we have the ability to define not just
 * the required fields, but also the optional fields.
 */
export interface ItemEvent {
  at: Date | null;
  by?: ComKey<any, any | never, any | never, any | never, any | never, any | never> | PriKey<any>;
  agg?: Item<any, any, any, any, any, any>;
}

/**
 * This is a required item event, and it's here mainly to define that there are events that must be present.
 */
export interface RequiredItemEvent extends ItemEvent {
  at: Date;
}

export type Evented = Record<string, ItemEvent>;

export interface Timestamped extends Evented {
  created: RequiredItemEvent;
  updated: RequiredItemEvent;
};

export interface Deletable extends Partial<Evented> {
  deleted: ItemEvent;
};

export type ManagedEvents = Timestamped & Deletable;

export type ItemProperties<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never> =
  Omit<Item<S, L1, L2, L3, L4, L5>, 'events' | 'key'> & {
    events?: Evented;
  };

export type References = Record<
  string,
  ComKey<string, string | never, string | never, string | never, string | never, string | never> |
  PriKey<string>
>;

export type ReferenceItem<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = { key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>, item: Item<S, L1, L2, L3, L4, L5> };

export type ReferenceItems = Record<
  string, ReferenceItem<string, string | never, string | never, string | never, string | never, string | never>>;

export interface Item<S extends string = never,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never> extends Identified<S, L1, L2, L3, L4, L5> {
  events: ManagedEvents & Evented;
  // TODO: This is a bit of a hack to get around the fact that we don't want to pass all these generics
  aggs?: ReferenceItems;
  refs?: References;
  [key: string]: any
}
