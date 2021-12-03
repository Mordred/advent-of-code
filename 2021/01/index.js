import fs from 'fs/promises';

async function run() {
  const values = (await fs.readFile('./input.txt', 'utf-8'))
    .trim()
    .split('\n')
    .map((v) => parseInt(v, 10));

  let count = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) {
      count++;
    }
  }
  console.log('Part 1:', count);

  count = 0;
  for (let i = 3; i < values.length; i++) {
    if (values[i - 3] + values[i - 2] + values[i - 1] < values[i - 2] + values[i - 1] + values[i]) {
      count++;
    }
  }
  console.log('Part 2:', count);
}

run().catch((e) => console.error(e));
