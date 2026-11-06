import os from 'os';


export default defineEventHandler(async (event) => {
  let bt = await useStorage().hasItem('bootTime')
  if (!bt) {
    await useStorage().setItem('bootTime', Date.now())
  }
  let rm = await useStorage().hasItem('name')
  if (!rm) {
    await useStorage().setItem('name', randomName())
  }

  let boot = await useStorage().getItem('bootTime')
  let name = await useStorage().getItem('name')
  let hostname = displayHostname(useRuntimeConfig(event).maskHostname)

  let msg = {
    "boot": boot,
    "name": name,
    "hostname": hostname,
    "timestamp": Date.now(),
  }

  console.log("Sending message: ", msg)
  return msg
})

// Kubernetes pod names: Deployment (echoo-7d9f8b6c5-x2k4p), DaemonSet
// (echoo-x2k4p) and StatefulSet (echoo-0). Lowercase, no dots.
const POD_NAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?-([a-z0-9]{5}|[0-9]+)$/

function looksLikePod(hostname: string): boolean {
  return POD_NAME.test(hostname)
}

// With masking on (the default), hostnames that don't look like a pod, such as
// a laptop or VM name, are reported as "localhost" so they don't leak into
// demos or screenshots. Disable with NUXT_MASK_HOSTNAME=false.
function displayHostname(mask: boolean): string {
  const hostname = os.hostname()
  if (!mask || looksLikePod(hostname)) return hostname
  return 'localhost'
}

let names = ['erwin', 'reinier', 'rio', 'fabian', 'linus', 'yakshaver'];
let adjectives = [
  'cool', 'fun', 'fast', 'smart', 'nice', 'great', 'ace', 'boss', 'dandy', 'divine', 'rare',
  'wonderfull', 'fantastic', 'super', 'superb', 'excellent', 'perfect', 'good', 'incredible', 'marvelous', 'outstanding',
  'pleasant', 'terrific', 'tremendous', 'wicked', 'wonderful', 'ace', 'boss', 'capital', 'champion', 'choice',
  'dandy', 'delightful', 'divine', 'exquisite', 'fabulous', 'finest', 'fluent',
  'greatest', 'heavenly', 'lovely', 'magnificent', 'matchless', 'optimum', 'paramount', 'peerless',
  'perfect', 'phenomenal', 'prime', 'prize', 'rad', 'rare', 'righteous',
  'splendid', 'stellar', 'striking', 'tremendous', 'ultimate', 'unreal',
];

// Names must stay shorter than this so they fit on a tile without truncation.
const MAX_NAME_LENGTH = 15

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

// Keep drawing until the name is short enough. The attempt cap only guards
// against an infinite loop if the word lists are edited so that no
// combination fits; with the current lists a valid name comes up quickly.
function randomName() {
  let name = ''
  for (let attempt = 0; attempt < 1000; attempt++) {
    name = pick(adjectives) + '_' + pick(names)
    if (name.length < MAX_NAME_LENGTH) return name
  }
  return name.slice(0, MAX_NAME_LENGTH - 1)
}
