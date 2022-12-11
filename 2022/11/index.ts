import fs from 'fs/promises';
import { lcm } from 'mathjs';

interface Monkey {
  items: number[];
  operation: (old: number) => number;
  test: number;
  next: (level: number) => number;
  times: number;
}

function simulate(monkeys: Monkey[], rounds: number, worryLevel: (level: number) => number) {
  for (let round = 1; round <= rounds; round++) {
    for (const monkey of monkeys) {
      const items = monkey.items;
      monkey.items = [];
      for (const item of items) {
        let level = monkey.operation(item);
        level = worryLevel(level);
        monkeys[monkey.next(level)].items.push(level);
        monkey.times++;
      }
    }
  }
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const monkeys: Monkey[] = raw.split('\n\n').map((m) => {
    const lines = m.split('\n');
    const test = +lines[3].replace('  Test: divisible by ', '');
    return {
      items: lines[1]
        .replace('  Starting items: ', '')
        .split(', ')
        .map((v) => +v),
      operation: new Function('old', lines[2].replace('  Operation: new = ', 'return ')) as (old: number) => number,
      test,
      next: (level: number) =>
        level % test === 0
          ? +lines[4].replace('If true: throw to monkey ', '')
          : +lines[5].replace('If false: throw to monkey ', ''),
      times: 0,
    };
  });

  // Copy data
  const part1Monkeys = monkeys.map((m) => ({ ...m, items: [...m.items] }));
  simulate(part1Monkeys, 20, (l) => Math.floor(l / 3));
  const part1Times = part1Monkeys.map((m) => m.times).sort((a, b) => b - a);
  const part1 = part1Times[0] * part1Times[1];

  // Copy data
  const part2Monkeys = monkeys.map((m) => ({ ...m, items: [...m.items] }));
  // Find least common multiple to keep levels at manageable numbers
  const mod = part2Monkeys.map((m) => m.test).reduce((acc, cur) => lcm(acc, cur), 1);
  simulate(part2Monkeys, 10000, (l) => l % mod);
  const part2Times = part2Monkeys.map((m) => m.times).sort((a, b) => b - a);
  const part2 = part2Times[0] * part2Times[1];

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
