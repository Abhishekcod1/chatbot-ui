// Polyfill React.cache for stable React 18.3.x which doesn't export it.
// Next.js 14 App Router uses this internally for fetch deduplication.
export async function register() {
  const React = await import("react")
  const r = React as unknown as Record<string, unknown>
  if (typeof r["cache"] !== "function") {
    // Request-scoped cache using AsyncLocalStorage (server-only, build-time safe)
    r["cache"] = function cache<T>(fn: (...args: unknown[]) => T) {
      const store = new Map<string, T>()
      return function (...args: unknown[]): T {
        const key = JSON.stringify(args)
        if (!store.has(key)) store.set(key, fn(...args))
        return store.get(key) as T
      }
    }
  }
}
