<script setup>

const intervals = [
  {
    name: 'disabled',
    value: 0,
  },
  {
    name: '100ms',
    value: 100,
  },
  {
    name: '500ms',
    value: 500,
  },
  {
    name: '1s',
    value: 1000,
  },
  {
    name: '2s',
    value: 2000,
  },
  {
    name: '5s',
    value: 5000,
  },
  {
    name: '10s',
    value: 10000,
  },
]

let interval = ref(intervals[3].value);

watch(interval, (val, oldval) => {
  if (oldval == 0 && val > 0) {
    checkBackend();
  }
});

let b = {};
const backends = ref(b);

function updateBackend(backend) {
  if (backend.name in backends.value) {
    backends.value[backend.name].requests++;
    backends.value[backend.name].last = new Date(backend.timestamp)
  } else {
    backends.value[backend.name] = {
      name: backend.name,
      hostname: backend.hostname,
      data: backend,
      first: new Date(backend.timestamp),
      last: new Date(backend.timestamp),
      requests: 1,
    };
  }
}

async function checkBackend() {
  if (interval.value == 0) return;
  //set timeout immediately to ignore the time it takes to fetch
  setTimeout(checkBackend, interval.value);
  try {
    const resp = await fetch("/api");
    const info = await resp.json();

    updateBackend(info);
  } catch (e) {
    updateBackend({
      name: "error",
      hostname: "error",
      timestamp: new Date().getTime(),
    });
  }
}
function resetBackends() {
  backends.value = {};
}

onNuxtReady(() => {
  checkBackend();
});
</script>

<style>
.mycolor {
  animation: mymove 2s;
}

@keyframes mymove {
  from {
    background-color: #ee8888;
  }

  to {
    background-color: none;
  }
}
</style>


<template>
  <UContainer>
    <UCard class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1 class="text-4xl">echoo!</h1>
          <UButton @click="resetBackends">Reset</UButton>
          <USelect v-model="interval" :options="intervals" option-attribute="name" size="lg">
            <template #leading>
              <UIcon name="i-heroicons-clock" />
            </template>
          </USelect>
          <ColorScheme>
            <USelect v-model="$colorMode.preference" :options="['system', 'light', 'dark']" size="lg" />
          </ColorScheme>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="mycolor m-2 mt-6 w-full p-2 rounded-lg border border-gray-200 shadow-sm truncate"
            v-for="(val, index) in backends" :key="val.requests">
            <h1 class="h-8 text-2xl font-bold">{{ val.name }}</h1>
            Requests: {{ val.requests }}<br>
            First: {{ val.first.toLocaleTimeString('nl-NL') }}<br>
            Last: {{ val.last.toLocaleTimeString('nl-NL') }}<br>
            Host: {{ val.hostname }}<br>
          </div>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
