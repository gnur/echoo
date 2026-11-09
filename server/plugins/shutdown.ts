// In a container the server runs as PID 1, and Linux does not apply the default
// "terminate" action to PID 1 for signals it has no handler for. Without this,
// SIGTERM from Kubernetes (or `docker stop`) is ignored and the pod only goes
// away after the grace period, when it gets SIGKILL (30s by default).
export default defineNitroPlugin(() => {
  if (import.meta.dev) return
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      console.log(`Received ${signal}, shutting down`)
      process.exit(0)
    })
  }
})
