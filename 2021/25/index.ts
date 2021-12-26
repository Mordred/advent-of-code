import fs from 'fs/promises';

const EAST = '>';
const SOUTH = 'v';
const EMPTY = '.';

type Map = string[][];

const key = (x: number, y: number) => `${x},${y}`;

function* steps(map: Map): Generator<Map> {
  const rows = map.length;
  const cells = map[0].length;

  let current = map;
  let moved = false;

  do {
    const newMap: Map = Array.from({ length: rows }, (_, y) => Array.from({ length: cells }, (_, x) => current[y][x]));

    const wasWest: Record<string, boolean> = {};
    const wasNorth: Record<string, boolean> = {};
    const hasMoved: Record<string, boolean> = {};
    moved = false;
    for (let r = rows; r >= 0; r--) {
      for (let c = cells; c >= 0; c--) {
        const y = r % rows;
        const x = c % cells;

        const rightX = (x + cells - 1) % cells;
        const upY = (y + rows - 1) % rows;
        if (
          newMap[y][x] === EMPTY &&
          newMap[y][rightX] === EAST &&
          !wasWest[key(x, y)] &&
          !wasNorth[key(x, y)] &&
          !hasMoved[key(rightX, y)]
        ) {
          newMap[y][x] = newMap[y][rightX];
          newMap[y][rightX] = EMPTY;
          wasWest[key(rightX, y)] = true;
          hasMoved[key(x, y)] = true;
          moved = true;
        }

        if (
          newMap[y][x] === EMPTY &&
          newMap[upY][x] === SOUTH &&
          !wasNorth[key(x, y)] &&
          !hasMoved[key(x, upY)]
        ) {
          newMap[y][x] = newMap[upY][x];
          newMap[upY][x] = EMPTY;
          wasNorth[key(x, upY)] = true;
          hasMoved[key(x, y)] = true;
          moved = true;
        }
      }
    }

    current = newMap;
    yield current;
  } while (moved);
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const map: Map = data.split('\n').map((l) => l.split(''));

  let count = 0;
  for (const state of steps(map)) {
    count++;
  }

  console.log('Part 1:', count);
}

run().catch((e) => console.error(e));
