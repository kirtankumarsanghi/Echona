/**
 * Simple client-side API response cache (#28)
 * Caches GET-like responses in memory with TTL
 */

const cache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

export function clearCache(keyPattern) {
  if (!keyPattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) cache.delete(key);
  }
}

/**
 * Wraps an async fn with caching.
 * Usage: const data = await cachedFetch("spotify-search-rock", () => axiosInstance.get("/api/spotify/search?q=rock"));
 */
export async function cachedFetch(key, fetchFn, ttl = DEFAULT_TTL) {
  const existing = getCached(key);
  if (existing) return existing;

  const result = await fetchFn();
  const data = result?.data !== undefined ? result.data : result;
  setCache(key, data, ttl);
  return data;
}
