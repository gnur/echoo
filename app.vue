<script setup>

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

setInterval(checkBackend, 1000);
</script>

<style>
.mycolor {
  animation: mymove 3s;
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
          <ColorScheme>
            <USelect v-model="$colorMode.preference" :options="['system', 'light', 'dark']" />
          </ColorScheme>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div class="mycolor m-4 w-full p-3 rounded-lg border border-gray-200 shadow-sm" v-for="(val, index) in backends"
            :key="val.requests">
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
