import fs from 'fs/promises';

async function run() {
  const values = (await fs.readFile('./input.txt', 'utf-8'))
    .trim()
    .split('\n')
    .map((v) => {
      let [dir, val] = v.split(' ');
      return [dir, parseInt(val, 10)];
    });

  let position = 0;
  let depth = 0;
  for (const [dir, val] of values) {
    switch (dir) {
      case 'forward':
        position += val;
        break;
      case 'down':
        depth += val;
        break;
      case 'up':
        depth -= val;
        break;
    }
  }
  console.log('Part 1:', position * depth);

  let aim = 0;
  position = 0;
  depth = 0;
  for (const [dir, val] of values) {
    switch (dir) {
      case 'forward':
        position += val;
        depth += aim * val;
        break;
      case 'down':
        aim += val;
        break;
      case 'up':
        aim -= val;
        break;
    }
  }
  console.log('Part 2:', position * depth);
}

run().catch((e) => console.error(e));
