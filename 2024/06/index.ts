import fs from 'fs/promises';

type Coords = readonly [number, number];

const directions = {
  top: [0, -1] as Coords,
  left: [-1, 0] as Coords,
  right: [1, 0] as Coords,
  bottom: [0, 1] as Coords,
} as const;

const turnRight = (direction: Coords) => {
  switch (direction) {
    case directions.top:
      return directions.right;
    case directions.right:
      return directions.bottom;
    case directions.bottom:
      return directions.left;
    case directions.left:
      return directions.top;
  }

  return directions.top;
};

// Yield route for the guard
//  - if guard hits a wall, turn right
//  - if guard leaves the map return true
//  - if guard starts to loop return false
function* traverse(data: string[][], start: Coords, startDirection: Coords) {
  const visited = new Set<string>();
  const decycle = new Set<string>();
  let direction = startDirection;
  let cur = start;

  while (true) {
    const key = hash(cur, direction);
    if (decycle.has(key)) {
      return false;
    }

    if (!visited.has(hash(cur))) {
      yield cur;
    }
    visited.add(hash(cur));
    decycle.add(key);

    let next = [cur[0] + direction[0], cur[1] + direction[1]] as Coords;
    let value = get(data, next);

    if (value === '#') {
      direction = turnRight(direction);
      next = [cur[0] + direction[0], cur[1] + direction[1]] as Coords;
      value = get(data, next);
    }

    switch (value) {
      case '.':
        cur = next;
        break;
      case undefined:
        return true;
    }
  }
}

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const hash = (coords: Coords, direction: Coords = [0, 0]) => coords.join(',') + '|' + direction.join(',');

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => line.split(''));

  let start: Coords = [0, 0];
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] === '^') {
        start = [x, y];
        data[y][x] = '.';
      }
    }
  }

  const part1 = Array.from(traverse(data, start, directions.top));
  console.log('Part 1:', part1.length);

  let part2 = 0;
  // Slow but works
  //  iterate over guard route and try to place obstacle at each point
  //  then check if the guard starts to loop
  // It would be faster to keep state for each route point
  //  after part1 and continue from that state with obstacle placed
  for (const route of part1) {
    const clone = structuredClone(data);
    clone[route[1]][route[0]] = '#';
    const iterator = traverse(clone, start, directions.top);
    let next: IteratorResult<Coords, boolean>;
    do {
      next = iterator.next();
    } while (!next.done);

    if (next.value === false) {
      part2++;
    }
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
