/**
 * Analytics tracking stub
 * TODO: emit events to analytics backends
 */
export function trackEvent(name: string, payload?: Record<string, unknown>) {
  console.log(`[analytics] ${name}`, payload)
}
