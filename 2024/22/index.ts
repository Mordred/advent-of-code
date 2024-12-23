import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';

function mix(a: number, b: number): number {
  return Number(BigInt(a) ^ BigInt(b));
}

function prune(a: number): number {
  return a % 16777216;
}

function* pseudoRandom(secret: number) {
  let changes: number[] = [];
  let previous: number = secret % 10;

  while (true) {
    let res = secret * 64;
    secret = mix(secret, res);
    secret = prune(secret);
    res = Math.floor(secret / 32);
    secret = mix(secret, res);
    secret = prune(secret);
    res = secret * 2048;
    secret = mix(secret, res);
    secret = prune(secret);

    let price = secret % 10;
    changes.push(price - previous);
    changes = changes.slice(-4);
    yield { secret, price, changes };
    previous = price;
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map(toInt);

  let part1 = 0;
  const bestChangesPerBuyer: Record<string, Record<string, number>> = {};
  const bestChanges: Record<string, number> = {};
  for (const buyer of data) {
    let i = 0;
    bestChangesPerBuyer[buyer] = {};
    for (const { secret, price, changes } of pseudoRandom(buyer)) {
      i++;

      const key = changes.join(',');
      // Take only first price for each sequence
      if (bestChangesPerBuyer[buyer][key] === undefined) {
        bestChangesPerBuyer[buyer][key] = price;
      }

      if (i === 2000) {
        part1 += secret;
        break;
      }
    }

    // Sum all prices for each sequence
    for (const [key, price] of Object.entries(bestChangesPerBuyer[buyer])) {
      bestChanges[key] = (bestChanges[key] ?? 0) + price;
    }
  }
  console.log('Part 1: ', part1);
  console.log('Part 2: ', Math.max(...Object.values(bestChanges)));
}

run().catch((e) => console.error(e));
