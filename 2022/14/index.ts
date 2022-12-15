import fs from 'fs/promises';

type Coords = [number, number];
type Grid = string[][];

enum Fill {
  Air = ' ',
  Rock = '#',
  Sand = '.',
}

function simulate(grid: Grid, startX: number, maxY: number) {
  let count = 0;
  while (true) {
    let x = startX;
    let y = 0;

    for (y = 0; y < maxY - 1; y++) {
      // Current
      if (grid[y + 1][x] === Fill.Air) {
        continue;
      } else if (grid[y + 1][x - 1] === Fill.Air) {
        x--;
      } else if (grid[y + 1][x + 1] === Fill.Air) {
        x++;
      } else {
        break;
      }
    }

    if (y === maxY - 1 || y === 0) {
      grid[y][x] = Fill.Sand;
      return count + (y === 0 ? 1 : 0);
    }

    grid[y][x] = Fill.Sand;
    count++;
  }
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const rocks = raw.split('\n').map((r) => r.split(' -> ').map((v) => v.split(',').map((v) => +v) as Coords));

  const Yes = rocks.flat(1).map((v) => v[1]);
  const maxY = Math.max(...Yes);

  const grid = Array.from({ length: maxY }, () => Array.from({ length: 1000 }, () => Fill.Air));

  for (const lines of rocks) {
    let s = [lines[0][0] - 1, lines[0][1] - 1];
    grid[s[1]][s[0]] = Fill.Rock;
    for (let i = 1; i < lines.length; i++) {
      const e = [lines[i][0] - 1, lines[i][1] - 1];
      if (s[0] === e[0] && s[1] < e[1]) {
        for (let j = s[1]; j < e[1]; j++) {
          grid[j][s[0]] = Fill.Rock;
        }
      } else if (s[0] === e[0] && s[1] >= e[1]) {
        for (let j = e[1]; j < s[1]; j++) {
          grid[j][s[0]] = Fill.Rock;
        }
      } else if (s[1] === e[1] && s[0] < e[0]) {
        for (let j = s[0]; j < e[0]; j++) {
          grid[s[1]][j] = Fill.Rock;
        }
      } else if (s[1] === e[1] && s[0] >= e[0]) {
        for (let j = e[0]; j < s[0]; j++) {
          grid[s[1]][j] = Fill.Rock;
        }
      }
      grid[e[1]][e[0]] = Fill.Rock;
      s = e;
    }
  }

  const part1 = simulate(
    grid.map((l) => l.map((v) => v)),
    500 - 1,
    maxY,
  );

  const part2Grid = [
    Array.from({ length: 1000 }, () => Fill.Air),
    ...grid.map((l) => l.map((v) => v)),
    Array.from({ length: 1000 }, () => Fill.Air),
    Array.from({ length: 1000 }, () => Fill.Rock),
  ];

  const part2 = simulate(part2Grid, 500 - 1, maxY + 3);
  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
