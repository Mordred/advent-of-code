import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

interface Number {
  value: number;
}

function mix(numbers: Number[], times = 1) {
  const current = [...numbers];
  for (let i = 0; i < times; i++) {
    for (const num of numbers) {
      const index = current.indexOf(num);
      const newIndex = (index + num.value) % (numbers.length - 1);
      current.splice(index, 1);
      current.splice(newIndex, 0, num);
    }
  }
  return current;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const numbers = raw
    .split('\n')
    .map(toInt)
    .map((v) => ({ value: v } satisfies Number));

  const part1Numbers = mix([...numbers]);
  const part1ZeroIndex = part1Numbers.findIndex((n) => n.value === 0);
  console.log(
    'Part 1',
    part1Numbers[(part1ZeroIndex + 1000) % part1Numbers.length].value +
      part1Numbers[(part1ZeroIndex + 2000) % part1Numbers.length].value +
      part1Numbers[(part1ZeroIndex + 3000) % part1Numbers.length].value,
  );

  const part2Numbers = mix(numbers.map((v) => ({ value: v.value * 811589153})), 10);
  const part2ZeroIndex = part2Numbers.findIndex((n) => n.value === 0);
  console.log(
    'Part 2',
    part2Numbers[(part2ZeroIndex + 1000) % part2Numbers.length].value +
    part2Numbers[(part2ZeroIndex + 2000) % part2Numbers.length].value +
    part2Numbers[(part2ZeroIndex + 3000) % part2Numbers.length].value,
  );
}

run().catch((e) => console.error(e));
