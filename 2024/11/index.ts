import { toInt, sum, counts } from '#aoc/utils.js';
import fs from 'fs/promises';

type Counts = Record<string, number>;

function blink(stone: number): number[] {
  if (stone === 0) {
    return [1];
  }

  const str = stone.toString();
  if (str.length % 2 === 0) {
    return [str.slice(0, str.length / 2), str.slice(str.length / 2)].map(toInt);
  }

  return [stone * 2024];
}

function blinkAll(counts: Counts): Counts {
  let newCounts = {} as Counts;
  for (const [stone, count] of Object.entries(counts)) {
    const blinked = blink(toInt(stone));
    for (const stone of blinked) {
      newCounts[stone] ??= 0;
      newCounts[stone] += count;
    }
  }
  return newCounts;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split(' ').map(toInt);

  let stones = counts(data);

  for (let i = 0; i < 25; i++) {
    stones = blinkAll(stones);
  }
  console.log('Part 1:', sum(Object.values(stones)));

  for (let i = 25; i < 75; i++) {
    stones = blinkAll(stones);
  }
  console.log('Part 2:', sum(Object.values(stones)));
}

run().catch((e) => console.error(e));
