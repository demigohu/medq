/**
 * Observability: success/failure rate + latency logs.
 */

export interface Metrics {
  mirrorNode: { success: number; failure: number; totalLatencyMs: number }
  autoVerify: { success: number; failure: number }
  submitProof: { success: number; failure: number }
}

const metrics: Metrics = {
  mirrorNode: { success: 0, failure: 0, totalLatencyMs: 0 },
  autoVerify: { success: 0, failure: 0 },
  submitProof: { success: 0, failure: 0 },
}

export function getMetrics(): Metrics {
  return { ...metrics }
}

export function recordMirrorNodeCall(success: boolean, latencyMs: number): void {
  if (success) {
    metrics.mirrorNode.success++
  } else {
    metrics.mirrorNode.failure++
  }
  metrics.mirrorNode.totalLatencyMs += latencyMs
}

export function recordAutoVerify(success: boolean): void {
  if (success) metrics.autoVerify.success++
  else metrics.autoVerify.failure++
}

export function recordSubmitProof(success: boolean): void {
  if (success) metrics.submitProof.success++
  else metrics.submitProof.failure++
}

export function logObservability(): void {
  const m = metrics.mirrorNode
  const avgLatency =
    m.success + m.failure > 0
      ? Math.round(m.totalLatencyMs / (m.success + m.failure))
      : 0
  console.log(
    `[OBSERVABILITY] MirrorNode: ${m.success} ok, ${m.failure} fail, avg ${avgLatency}ms | ` +
      `AutoVerify: ${metrics.autoVerify.success} ok, ${metrics.autoVerify.failure} fail | ` +
      `SubmitProof: ${metrics.submitProof.success} ok, ${metrics.submitProof.failure} fail`
  )
}
