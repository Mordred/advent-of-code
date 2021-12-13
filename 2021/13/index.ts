import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);
const key = (x: number, y: number): string => `${x},${y}`;

type Dot = [number, number];

function fold(dots: Dot[], axes: string, num: number): Record<string, Dot> {
  const working: Record<string, Dot> = {};
  if (axes === 'x') {
    for (const [x, y] of dots) {
      const x2 = x < num ? x : num - (x - num);
      working[key(x2, y)] = [x2, y];
    }
  } else {
    for (const [x, y] of dots) {
      const y2 = y < num ? y : num - (y - num);
      working[key(x, y2)] = [x, y2];
    }
  }
  return working;
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const [d1, d2] = data.split(/\r?\n\r?\n/);
  const folds = d2.split('\n').map((l) => l.replace('fold along ', '').split('='));

  let working: Record<string, Dot> = {};
  for (const line of d1.split('\n')) {
    const [x, y] = line.split(',').map(toInt) as Dot;
    working[key(x, y)] = [x, y];
  }

  for (const [axes, numStr] of folds.slice(0, 1)) {
    const num = toInt(numStr);
    working = fold(Object.values(working), axes, num);
  }

  console.log('Part 1:', Object.values(working).length);

  for (const [axes, numStr] of folds.slice(1)) {
    const num = toInt(numStr);
    working = fold(Object.values(working), axes, num);
  }

  const dots = Object.values(working);
  const maxX = Math.max(...dots.map(([x]) => x));
  const maxY = Math.max(...dots.map(([_, y]) => y));

  console.log('Part 2:');
  for (let y = 0; y < maxY + 1; y++) {
    let line = '';
    for (let x = 0; x < maxX + 1; x++) {
      line += working[key(x, y)] ? '##' : '  ';
    }
    console.log(line);
  }
}

run().catch((e) => console.error(e));
