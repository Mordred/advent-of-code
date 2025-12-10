import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';
import { Heap } from 'mnemonist';

const ON = '#';
const OFF = '.';

interface Machine {
  lights: string;
  buttons: number[][];
  joltage: number[];
}

interface State {
  lights: number[];
  buttonPressed: number[];
}

function lightsToHash(lights: number[]): string {
  return lights.map((v) => (v % 2 === 0 ? OFF : ON)).join('');
}

function solve1(machine: Machine): number {
  const heap = new Heap((a: State, b: State) => a.buttonPressed.length - b.buttonPressed.length);
  heap.push({
    lights: machine.lights.split('').map((l) => 0),
    buttonPressed: [],
  });

  const visited = new Set<string>();
  while (heap.size) {
    const current = heap.pop()!;

    const key = lightsToHash(current.lights);
    if (machine.lights === key) {
      return current.buttonPressed.length;
    }

    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    for (let i = 0; i < machine.buttons.length; i++) {
      const newLights = [...current.lights];
      for (const index of machine.buttons[i]) {
        newLights[index] = (newLights[index] + 1) % 2;
      }

      heap.push({
        lights: newLights,
        buttonPressed: [...current.buttonPressed, i],
      });
    }
  }

  throw new Error('No solution found');
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l): Machine => {
    const parts = l.split(/\] | \{/);
    return {
      lights: parts[0].slice(1),
      buttons: parts[1].split(' ').map((w) => w.slice(1, -1).split(',').map(toInt)),
      joltage: parts[2].slice(0, -1).split(',').map(toInt),
    };
  });

  let part1 = 0;
  for (const machine of data) {
    part1 += solve1(machine);
  }

  console.log('Part 1:', part1);
  console.log('Part 2: Use part2.py (I was too lazy to write equations solver in TS)');
}

run().catch((e) => console.error(e));
