<script setup lang="ts">
interface ApiResponse {
  name: string
  hostname: string
  boot: number
  timestamp: number
}

interface Backend {
  name: string
  hostname: string
  boot?: number
  first: Date
  last: Date
  lastSeen: number
  requests: number
  error: boolean
}

const intervals = [
  { name: 'paused', value: 0 },
  { name: '100ms', value: 100 },
  { name: '500ms', value: 500 },
  { name: '1s', value: 1000 },
  { name: '2s', value: 2000 },
  { name: '5s', value: 5000 },
  { name: '10s', value: 10000 },
]

const REQUEST_TIMEOUT_MS = 5000
const ERROR_KEY = '__error__'

const interval = ref(1000)
const backends = ref<Record<string, Backend>>({})
const lastKey = ref<string | null>(null)
const now = ref(Date.now())

let pollTimer: ReturnType<typeof setTimeout> | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined

const sorted = computed(() =>
  Object.entries(backends.value)
    .map(([key, b]) => ({ key, ...b }))
    .sort((a, b) => a.first.getTime() - b.first.getTime()),
)

const totalRequests = computed(() =>
  sorted.value.reduce((sum, b) => sum + b.requests, 0),
)
const errorCount = computed(() => backends.value[ERROR_KEY]?.requests ?? 0)

// A pod counts as stale once it has not answered for five polling rounds
// (at least 5s), which is what a terminated pod looks like during a rollout.
const staleAfter = computed(() => Math.max(5000, (interval.value || 1000) * 5))

function status(b: Backend): 'live' | 'stale' | 'error' {
  if (b.error) return 'error'
  return now.value - b.lastSeen > staleAfter.value ? 'stale' : 'live'
}

const livePods = computed(
  () => sorted.value.filter((b) => !b.error && status(b) === 'live').length,
)

function share(b: Backend): string {
  if (!totalRequests.value) return '0'
  return ((b.requests / totalRequests.value) * 100).toFixed(1)
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('nl-NL', { hour12: false })
}

function record(key: string, data: Partial<ApiResponse>, error = false) {
  const ts = new Date(data.timestamp ?? Date.now())
  const existing = backends.value[key]
  if (existing) {
    existing.requests++
    existing.last = ts
    existing.lastSeen = Date.now()
  } else {
    backends.value[key] = {
      name: data.name ?? 'unknown',
      hostname: data.hostname ?? 'unknown',
      boot: data.boot,
      first: ts,
      last: ts,
      lastSeen: Date.now(),
      requests: 1,
      error,
    }
  }
  lastKey.value = key
}

function schedule() {
  clearTimeout(pollTimer)
  if (interval.value > 0) {
    pollTimer = setTimeout(poll, interval.value)
  }
}

async function poll() {
  if (interval.value === 0) return
  // Schedule first so a slow backend does not slow down the request rate.
  schedule()
  try {
    const resp = await fetch('/api', {
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const info: ApiResponse = await resp.json()
    record(info.name, info)
  } catch {
    record(ERROR_KEY, { name: 'failed requests', hostname: 'n/a' }, true)
  }
}

function reset() {
  backends.value = {}
  lastKey.value = null
}

watch(interval, (val) => {
  if (val > 0) poll()
  else clearTimeout(pollTimer)
})

onNuxtReady(() => {
  clockTimer = setInterval(() => (now.value = Date.now()), 500)
  poll()
})

onBeforeUnmount(() => {
  clearTimeout(pollTimer)
  clearInterval(clockTimer)
})
</script>

<template>
  <main class="page">
    <header class="toolbar">
      <h1 class="title">echoo</h1>
      <div class="controls">
        <label class="field">
          <span class="label">interval</span>
          <select v-model="interval" class="select">
            <option v-for="i in intervals" :key="i.value" :value="i.value">
              {{ i.name }}
            </option>
          </select>
        </label>
        <button type="button" class="button button-secondary" @click="reset">
          Reset counters
        </button>
      </div>
    </header>

    <section class="metrics" aria-label="Summary">
      <div class="metric">
        <span class="label">requests</span>
        <span class="metric-value">{{ totalRequests }}</span>
      </div>
      <div class="metric">
        <span class="label">live pods</span>
        <span class="metric-value">{{ livePods }}</span>
      </div>
      <div class="metric">
        <span class="label">pods seen</span>
        <span class="metric-value">{{ sorted.filter((b) => !b.error).length }}</span>
      </div>
      <div class="metric">
        <span class="label">failed</span>
        <span class="metric-value">{{ errorCount }}</span>
        <span v-if="errorCount" class="tag tag-alert">needs attention</span>
      </div>
    </section>

    <section v-if="sorted.length" class="tiles" aria-label="Backends">
      <article
        v-for="b in sorted"
        :key="b.key"
        class="tile"
        :class="{
          'tile-current': b.key === lastKey && !b.error,
          'tile-stale': status(b) === 'stale',
        }"
      >
        <div class="tile-head">
          <h2 class="tile-name">{{ b.name }}</h2>
          <span class="tag" :class="`tag-${status(b)}`">{{ status(b) }}</span>
        </div>
        <div class="tile-count">
          <span class="metric-value">{{ b.requests }}</span>
          <span class="unit">req · {{ share(b) }}%</span>
        </div>
        <dl class="tile-data">
          <dt class="label">host</dt>
          <dd>{{ b.hostname }}</dd>
          <dt class="label">first</dt>
          <dd>{{ formatTime(b.first) }}</dd>
          <dt class="label">last</dt>
          <dd>{{ formatTime(b.last) }}</dd>
        </dl>
      </article>
    </section>

    <p v-else class="empty">
      Pick an interval to start sending requests to the backend.
    </p>
  </main>
</template>
