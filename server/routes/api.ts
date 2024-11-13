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
  let hostname = os.hostname()

  let msg = {
    "boot": boot,
    "name": name,
    "hostname": hostname,
    "timestamp": Date.now(),
  }

  console.log("Sending message: ", msg)
  return msg
})

let names = ['erwin', 'reinier', 'rio', 'fabian', 'truefullstaq', 'frueligan'];
let adjectives = [
  'cool', 'fun', 'fast', 'smart', 'nice', 'great', 'ace', 'boss', 'dandy', 'divine', 'rare',
  'wonderfull', 'fantastic', 'super', 'superb', 'excellent', 'perfect', 'good', 'incredible', 'marvelous', 'outstanding',
  'pleasant', 'terrific', 'tremendous', 'wicked', 'wonderful', 'ace', 'boss', 'capital', 'champion', 'choice',
  'dandy', 'delightful', 'divine', 'exquisite', 'fabulous', 'finest', 'fluent',
  'greatest', 'heavenly', 'lovely', 'magnificent', 'matchless', 'optimum', 'paramount', 'peerless',
  'perfect', 'phenomenal', 'prime', 'prize', 'rad', 'rare', 'righteous',
  'splendid', 'stellar', 'striking', 'tremendous', 'ultimate', 'unreal',
];

function randomName() {
  return adjectives[Math.floor(Math.random() * adjectives.length)] + '_' + names[Math.floor(Math.random() * names.length)];
}
