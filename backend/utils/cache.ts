/**
 * Options for configuring a TtlCache instance.
 */
export interface TtlCacheOptions {
  /**
   * Default Time-To-Live for cached items in milliseconds.
   * Defaults to 5 minutes (300,000 ms).
   */
  defaultTtlMs?: number;

  /**
   * Maximum number of items allowed in the cache.
   * When exceeded, the least recently used item is evicted.
   * Defaults to 1,000 items.
   */
  maxSize?: number;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

/**
 * A lightweight, memory-safe in-memory cache supporting:
 * - Time-To-Live (TTL) expiration per item or globally
 * - Maximum capacity bounding with LRU eviction to prevent memory leaks
 * - Safe concurrent access in a single Node.js process
 */
export class TtlCache<K, V> {
  private readonly defaultTtlMs: number;
  private readonly maxSize: number;
  private readonly store = new Map<K, CacheEntry<V>>();

  constructor(options: TtlCacheOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 5 * 60 * 1000;
    this.maxSize = options.maxSize ?? 1000;
  }

  /**
   * Retrieves a value from the cache.
   * If the item is expired, it is purged and undefined is returned.
   * Re-touches the key to maintain LRU ordering.
   */
  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh LRU order by deleting and re-inserting
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  /**
   * Sets a key-value pair in the cache with an optional custom TTL.
   * If the cache is at capacity, the least recently used (first) item is evicted.
   */
  set(key: K, value: V, customTtlMs?: number): this {
    const ttl = customTtlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    // Delete existing entry if present so new position is at the end (most recent)
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      // Evict oldest item (first key in Map iterator)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, { value, expiresAt });
    return this;
  }

  /**
   * Checks whether a non-expired key exists in the cache.
   */
  has(key: K): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Deletes a key from the cache.
   */
  delete(key: K): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears all items from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Returns the current number of items in the cache (including any unexpired ones).
   */
  size(): number {
    this.pruneExpired();
    return this.store.size;
  }

  /**
   * Purges all expired entries from the cache.
   */
  pruneExpired(): number {
    const now = Date.now();
    let prunedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        prunedCount++;
      }
    }

    return prunedCount;
  }
}
