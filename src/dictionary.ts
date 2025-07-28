import LibLogger from "./logger";

const logger = LibLogger.get("Dictionary");

interface DictionaryEntry<T, V> {
  originalKey: T;
  value: V;
}

export class Dictionary<T, V> {
  protected map: { [key: string]: DictionaryEntry<T, V> } = {}
  protected hashFunction = (key: T) => JSON.stringify(key);

  constructor(map?: { [key: string]: V }, hashFunction?: (key: T) => string) {
    if (hashFunction) {
      this.hashFunction = hashFunction
    }
    if (map) {
      // Convert legacy map format to new format
      Object.entries(map).forEach(([hashedKey, value]) => {
        try {
          // Try to parse the key if it looks like JSON
          const originalKey = JSON.parse(hashedKey) as T;
          this.map[hashedKey] = { originalKey, value };
        } catch {
          // If parsing fails, we can't recover the original key
          logger.warning('Cannot recover original key from legacy map entry', { hashedKey });
        }
      });
    }
  }

  public set(key: T, item: V): void {
    logger.trace('set', { key, item });
    const hashedKey = this.hashFunction(key);
    this.map[hashedKey] = { originalKey: key, value: item };
  }

  public get(key: T): V | null {
    logger.trace('get', { key });
    const hashedKey = this.hashFunction(key);
    const entry = this.map[hashedKey];
    // Check if entry exists AND the original key matches the requested key
    return entry && this.keysEqual(entry.originalKey, key) ? entry.value : null;
  }

  private keysEqual(key1: T, key2: T): boolean {
    // For basic equality check - this works for primitives and object references
    // For deep equality, users can provide a custom hash function that avoids collisions
    return key1 === key2;
  }

  public delete(key: T): void {
    logger.trace('delete', { key });
    const hashedKey = this.hashFunction(key);
    delete this.map[hashedKey];
  }

  public keys(): T[] {
    return Object.values(this.map).map(entry => entry.originalKey);
  }

  public values(): V[] {
    return Object.values(this.map).map(entry => entry.value);
  }

  public includesKey(key: T): boolean {
    const hashedKey = this.hashFunction(key);
    const entry = this.map[hashedKey];
    return entry ? this.keysEqual(entry.originalKey, key) : false;
  }

  public clone(): Dictionary<T, V> {
    const clonedMap: { [key: string]: V } = {};
    Object.entries(this.map).forEach(([hashedKey, entry]) => {
      clonedMap[hashedKey] = entry.value;
    });

    const clone = new Dictionary<T, V>(clonedMap, this.hashFunction);
    // Copy the entries directly to preserve original keys
    clone.map = Object.assign({}, this.map);
    return clone;
  }
}
