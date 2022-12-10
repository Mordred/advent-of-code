import fs from 'fs/promises';

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('\n');

  let X = 1;
  let cycles = 0;

  let part1 = 0;
  let part2 = '';

  function incrementCycles(x: number) {
    let mod = cycles % 40 + 1;
    cycles++;
    if (cycles % 40 === 20) {
      part1 += cycles * x;
    }
    part2 += (mod >= x && mod <= x + 2) ? '██' : '  ';
    if (mod === 40) {
      part2 += '\n'
    }
  }

  for (const row of data) {
    if (row === 'noop') {
      incrementCycles(X);
    } else if (row.startsWith('addx')) {
      incrementCycles(X);
      incrementCycles(X);
      const value = +row.replace('addx ', '');
      X += value;
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2')
  console.log(part2);
}

run().catch((e) => console.error(e));
