import fs from 'fs/promises';
import { sum } from '#aoc/utils.js'

type Left = number | number[] | Left[]
type Right = number | number[] | Right[]
type Packet = [Left, Right]

function compare(left: number | Left, right: number | Right): number {
  if (Array.isArray(left) && Array.isArray(right)) {
    for (let i = 0; i < left.length; i++) {
      if (i >= right.length) {
        return 1;
      }
      const r = compare(left[i], right[i])
      if (r != 0) {
        return r;
      }
    }

    return left.length - right.length;
  } else if (Array.isArray(left) && typeof right === 'number') {
    return compare(left, [right]);
  } else if (Array.isArray(right) && typeof left === 'number') {
    return compare([left], right);
  } else {
    return (left as number) - (right as number);
  }
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('\n\n').map((r) => r.split('\n').map((v) => JSON.parse(v)) as Packet);

  const part1: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const [left, right] = data[i];
    const r = compare(left, right);
    if (r <= 0) {
      part1.push(i + 1);
    }
  }

  let newData = data.flat(1);
  const p1 = [[2]];
  const p2 = [[6]];
  newData.push(p1, p2)
  newData.sort(compare)

  const i1 = newData.findIndex((v) => v === p1) + 1;
  const i2 = newData.findIndex((v) => v === p2) + 1;

  console.log('Part 1', sum(part1));
  console.log('Part 2', i1 * i2);
}

run().catch((e) => console.error(e));
