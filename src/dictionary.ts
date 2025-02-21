import LibLogger from "./logger";

const logger = LibLogger.get("Dictionary");

export class Dictionary<T, V> {
  protected map: { [key: string]: V } = {}
  protected hashFunction = (key: T) => JSON.stringify(key);

  constructor(map?: { [key: string]: V }, hashFunction?: (key: T) => string) {
    if (map) {
      this.map = map
    }
    if (hashFunction) {
      this.hashFunction = hashFunction
    }
  }

  public set(key: T, item: V): void {
    logger.trace('set', { key, item });
    const hashedKey = this.hashFunction(key)
    this.map[hashedKey] = item
  }

  public get(key: T): V | null {
    logger.trace('get', { key });
    const hashedKey = this.hashFunction(key)
    return this.map[hashedKey] || null
  }

  public delete(key: T): void {
    logger.trace('delete', { key });
    const hashedKey = this.hashFunction(key)
    delete this.map[hashedKey]
  }

  public keys(): T[] {
    return Object.keys(this.map).map(key => JSON.parse(key))
  }

  public values(): V[] {
    return Object.values(this.map)
  }

  public includesKey(key: T): boolean {
    return Object.keys(this.map).includes(this.hashFunction(key))
  }

  public clone(): Dictionary<T, V> {
    const clonedMap = Object.assign({}, this.map);

    const clone = new Dictionary<T, V>(clonedMap, this.hashFunction)
    return clone;
  }
}