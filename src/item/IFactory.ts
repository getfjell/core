import deepmerge from 'deepmerge';
import { ComKey, Item, PriKey } from '@fjell/types';
import { primaryType } from '../key/KUtils';

export class IFactory<
  V extends Item<S, L1, L2, L3, L4, L5>,
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never> {
  private item: any = {
  };

  public constructor(props: Record<string, any> = {}) {
    this.item = deepmerge(this.item, props);
  }

  public addRef(i: Item<any, any|never, any|never, any|never, any|never, any|never>, name?: string) {
    const ik: ComKey<any, any|never, any|never, any|never, any|never, any|never> | PriKey<any> = i.key;

    const refName = name || primaryType(ik);
    if (!this.item.refs) {
      this.item.refs = {};
    }
    this.item.refs[refName] = ik;
    return this;
  }

  public static addRef<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(i: V, name?: string) {
    return new IFactory<V, S, L1, L2, L3, L4, L5>().addRef(i, name);
  }

  public addDefaultEvents() {
    if (!this.item.events) {
      this.item.events = {};
    }
    const now = new Date();
    if (!this.item.events.created) {
      this.item.events.created = { at: now };
    }
    if (!this.item.events.updated) {
      this.item.events.updated = { at: now };
    }
    if (!this.item.events.deleted) {
      this.item.events.deleted = { at: null };
    }
    return this;
  }

  public addEvent(
    name: string,
    at: Date | null,
    by?: ComKey<any, any|never, any|never, any|never, any|never, any|never> | PriKey<any>
  ) {
    if (!this.item.events) {
      this.item.events = {};
    }
    this.item.events[name] = { at, by };
    return this;
  }

  public static addEvent<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(name: string, at: Date | null, by?: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>) {
    return new IFactory<V, S, L1, L2, L3, L4, L5>().addEvent(name, at, by);
  }

  public addProp(name: string, value: string | number | boolean | Date) {
    this.item[name] = value;
    return this;
  }

  public static addProp<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(name: string, value: string | number | boolean | Date) {
    return new IFactory<V, S, L1, L2, L3, L4, L5>().addProp(name, value);
  }

  public addProps(props: Record<string, any>) {
    this.item = deepmerge(this.item, props);
    return this;
  }

  public static addProps<
    V extends Item<S, L1, L2, L3, L4, L5>,
    S extends string,
    L1 extends string = never,
    L2 extends string = never,
    L3 extends string = never,
    L4 extends string = never,
    L5 extends string = never
  >(props: Record<string, any>) {
    return new IFactory<V, S, L1, L2, L3, L4, L5>().addProps(props);
  }

  toItem(): V {
    return this.item as V;
  }
}