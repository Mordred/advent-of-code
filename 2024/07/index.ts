import { toInt, sum } from '#aoc/utils.js';
import fs from 'fs/promises';

type Operation = (a: number, b: number) => number;

const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;
const concatenate = (a: number, b: number) => toInt(a.toString() + b.toString());

interface State {
  total: number;
  remaining: number[];
}

function solve(result: number, operands: number[], operations: Operation[]): boolean {
  let queue: State[] = [
    {
      total: operands[0],
      remaining: operands.slice(1),
    },
  ];

  while (queue.length) {
    const { total, remaining } = queue.pop()!;
    if (remaining.length === 0) {
      if (total === result) {
        return true;
      }
      continue;
    }

    const [first, ...rest] = remaining;
    for (const op of operations) {
      const newTotal = op(total, first);
      if (newTotal > result) {
        continue;
      }

      queue.push({
        total: newTotal,
        remaining: rest,
      });
    }
  }

  return false;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => {
    const [result, rest] = line.split(':');
    return {
      result: toInt(result.trim()),
      operands: rest
        .trim()
        .split(' ')
        .map((op) => toInt(op.trim())),
    };
  });

  const part1 = data.filter(({ result, operands }) => solve(result, operands, [add, multiply]));
  console.log('Part 1:', sum(part1.map((v) => v.result)));

  const part2 = data.filter(({ result, operands }, index) => solve(result, operands, [add, multiply, concatenate]));
  console.log('Part 2:', sum(part2.map((v) => v.result)));
}

run().catch((e) => console.error(e));
