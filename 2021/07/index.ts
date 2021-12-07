import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);
const sumArray = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);
const sumRange = (start: number, end: number) => {
  const length = Math.abs(start - end);
  return (length * (length + 1)) / 2;
};

async function run() {
  const positions = (await fs.readFile('./input.txt', 'utf-8')).trim().split(',').map(toInt);

  const max = Math.max(...positions);
  let min: number = Infinity;
  for (let position = 1; position < max; position++) {
    min = Math.min(sumArray(positions.map((p) => Math.abs(p - position))), min);
  }

  console.log('Part 1:', min);

  min = Infinity;
  for (let position = 1; position < max; position++) {
    min = Math.min(sumArray(positions.map((p) => sumRange(p, position))), min);
  }

  console.log('Part 2:', min);
}

run().catch((e) => console.error(e));
