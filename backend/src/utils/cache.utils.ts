import logger from './logger.utils';

class InMemoryCache {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  // NEW: Separate storage for hash structures (hset/hget)
  private hashes: Map<string, Map<string, any>> = new Map();

  // UPDATED: Added <T = any> to allow generic calls like cache.get<number>(...)
  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + (ttl * 1000) : 0;
    this.cache.set(key, { value, expiresAt });
  }

  async setex(key: string, ttl: number, value: any): Promise<void> {
    await this.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    // Also clear any hashes with this key
    this.hashes.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    // Check standard cache
    const item = this.cache.get(key);
    if (item) {
        if (item.expiresAt && item.expiresAt < Date.now()) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    // Also check hashes
    return this.hashes.has(key);
  }

  async incr(key: string): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = (current || 0) + 1;
    await this.set(key, newValue);
    return newValue;
  }

  async decr(key: string): Promise<number> {
    const current = await this.get<number>(key);
    const newValue = Math.max(0, (current || 0) - 1);
    await this.set(key, newValue);
    return newValue;
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    item.expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, item);
    return true;
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    
    if (!item || !item.expiresAt) {
      return -1; // No expiry
    }

    const remaining = Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));
    return remaining;
  }

  // NEW: Hash Set
  async hset(key: string, field: string, value: any): Promise<void> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    this.hashes.get(key)!.set(field, value);
  }

  // NEW: Hash Get
  async hget(key: string, field: string): Promise<any | null> {
    const hash = this.hashes.get(key);
    return hash ? hash.get(field) || null : null;
  }

  // NEW: Hash Get All
  async hgetall(key: string): Promise<Record<string, any>> {
    const hash = this.hashes.get(key);
    if (!hash) return {};
    
    // Convert Map to Object
    const result: Record<string, any> = {};
    hash.forEach((val, k) => {
      result[k] = val;
    });
    return result;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const standardKeys = Array.from(this.cache.keys());
    const hashKeys = Array.from(this.hashes.keys());
    // Combine both sets of keys
    return [...new Set([...standardKeys, ...hashKeys])].filter(key => regex.test(key));
  }

  // Cleanup expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; hits: number; misses: number } {
    return {
      size: this.cache.size + this.hashes.size,
      hits: 0, // You would need to implement hit tracking
      misses: 0 // You would need to implement miss tracking
    };
  }
}

// Create a singleton instance
const cache = new InMemoryCache();

// Run cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Export the singleton instance
export default cache;