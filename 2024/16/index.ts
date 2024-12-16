import { sum, toInt } from '#aoc/utils.js';
import fs from 'fs/promises';

type Coords = [number, number];

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const eq = (a: Coords, b: Coords) => a[0] === b[0] && a[1] === b[1];
const hash = (a: Coords, direction: keyof typeof DIRECTIONS) => a.join(',') + ',' + direction;
const unhash = (hash: string) => {
  const [x, y, direction] = hash.split(',');
  return [[toInt(x), toInt(y)], direction];
};

const DIRECTIONS = {
  N: [0, -1] as Coords,
  E: [1, 0] as Coords,
  S: [0, 1] as Coords,
  W: [-1, 0] as Coords,
} as const;

const DIRECTION_KEYS = Object.keys(DIRECTIONS) as (keyof typeof DIRECTIONS)[];

const rotate = (current: keyof typeof DIRECTIONS, clockwise: Boolean) => {
  const index = DIRECTION_KEYS.indexOf(current);
  const next = (index + (clockwise ? 1 : -1)) % DIRECTION_KEYS.length;
  return DIRECTION_KEYS[next === -1 ? DIRECTION_KEYS.length - 1 : next] as keyof typeof DIRECTIONS;
};

const START = 'S';
const END = 'E';
const WALL = '#';
const EMPTY = '.';

interface State {
  position: Coords;
  direction: keyof typeof DIRECTIONS;
  score: number;
  visited: Set<string>;
  path: Coords[];
}

function* traverse(grid: string[][], start: Coords, end: Coords) {
  let queue: State[] = [
    {
      position: start,
      direction: 'E',
      score: 0,
      visited: new Set([hash(start, 'E')]),
      path: [start],
    },
  ];

  // Track each position and best score for that position
  const scores = new Map<string, number>();
  let bestScore: number | undefined = undefined;
  while (queue.length > 0) {
    queue = queue.sort((a, b) => a.score - b.score);
    const state = queue.shift()!;
    const next = get(grid, state.position, DIRECTIONS[state.direction]);

    const positionKey = hash(state.position, state.direction);
    if (scores.has(positionKey)) {
      if (scores.get(positionKey)! < state.score) {
        // Filter out states if we know that we can reach the same position with a better score
        continue;
      } else {
        scores.set(positionKey, state.score);
      }
    } else {
      scores.set(positionKey, state.score);
    }

    if (bestScore && state.score > bestScore) {
      continue;
    }

    if (eq(state.position, end)) {
      if (!bestScore) {
        bestScore = state.score;
      }

      yield state;
      continue;
    }

    switch (next) {
      case EMPTY: {
        const [dx, dy] = DIRECTIONS[state.direction];
        const next = [state.position[0] + dx, state.position[1] + dy] as Coords;
        const bScore = scores.get(hash(next, state.direction));
        // Move forward if we didn't visited yet or we have a better score
        if (!state.visited.has(hash(next, state.direction)) && (!bScore || bScore > state.score + 1)) {
          const newVisited = new Set(state.visited);
          newVisited.add(hash(next, state.direction));
          queue.push({
            ...state,
            position: next,
            score: state.score + 1,
            visited: newVisited,
            path: [...state.path, next],
          });
        }
      }
      case WALL: {
        const clockwise = rotate(state.direction, true);
        const clockwiseNext = get(grid, state.position, DIRECTIONS[clockwise]);
        let bScore = scores.get(hash(state.position, clockwise));
        // Try to rotate clockwise if we didn't visited yet or we have a better score
        if (
          clockwiseNext === EMPTY &&
          !state.visited.has(hash(state.position, clockwise)) &&
          (!bScore || bScore > state.score + 1000)
        ) {
          const newVisited = new Set(state.visited);
          newVisited.add(hash(state.position, clockwise));
          queue.push({
            ...state,
            direction: clockwise,
            score: state.score + 1000,
            visited: newVisited,
          });
        }
        const counterClockwise = rotate(state.direction, false);
        const counterClockwiseNext = get(grid, state.position, DIRECTIONS[counterClockwise]);
        bScore = scores.get(hash(state.position, counterClockwise));
        // Try to rotate counter-clockwise if we didn't visited yet or we have a better score
        if (
          counterClockwiseNext === EMPTY &&
          !state.visited.has(hash(state.position, counterClockwise)) &&
          (!bScore || bScore > state.score + 1000)
        ) {
          const newVisited = new Set(state.visited);
          newVisited.add(hash(state.position, counterClockwise));
          queue.push({
            ...state,
            direction: counterClockwise,
            score: state.score + 1000,
            visited: newVisited,
          });
        }
      }
    }
  }

  return null;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split(''));

  let start!: Coords;
  let end!: Coords;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (get(grid, [x, y]) === START) {
        start = [x, y];
        grid[y][x] = EMPTY;
      } else if (get(grid, [x, y]) === END) {
        end = [x, y];
        grid[y][x] = EMPTY;
      }
    }
  }

  let iter = traverse(grid, start, end);
  let part1 = iter.next();
  if (!part1.done) {
    console.log('Part 1:', part1.value.score);
  } else {
    throw new Error('Part 1 failed');
  }

  const bestScore = part1.value.score;
  const paths = new Set<string>(part1.value.path.map((p) => p.join(',')));
  let cur = iter.next();
  while (!cur.done && cur.value.score === bestScore) {
    for (const p of cur.value.path) {
      paths.add(p.join(','));
    }
    cur = iter.next();
  }

  console.log('Part 2:', paths.size);
}

run().catch((e) => console.error(e));
