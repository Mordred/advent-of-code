import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

const eq = (a: Coords, b: Coords) => a[0] === b[0] && a[1] === b[1];
const hash = (a: Coords) => a.join(',');

type Coords = [number, number];

const start: Coords = [0, 0];

const DIRECTIONS = {
  N: [0, -1] as Coords,
  E: [1, 0] as Coords,
  S: [0, 1] as Coords,
  W: [-1, 0] as Coords,
} as const;

interface State {
  position: Coords;
  score: number;
  path: Coords[];
}

function *traverse(corrupted: Record<string, true>, start: Coords, end: Coords) {
  let queue: State[] = [
    {
      position: start,
      score: 0,
      path: [start],
    }
  ];

  const fastest = new Map<string, number>();
  while (queue.length > 0) {
    queue = queue.sort((a, b) => a.score - b.score);
    const state = queue.shift()!;

    // debug(corrupted, state.path, end);
    // console.log('-----------');

    for (const [name, [dx, dy]]  of Object.entries(DIRECTIONS)) {
      const nextPosition = [state.position[0] + dx, state.position[1] + dy] as Coords;
      if (nextPosition[0] < 0 || nextPosition[1] < 0 || nextPosition[0] > end[0] || nextPosition[1] > end[1]) {
        continue
      }

      const key = hash(nextPosition);

      if (eq(nextPosition, end)) {
        yield [...state.path, nextPosition];
        continue;
      }

      const isCorrupted = corrupted[key];
      if (isCorrupted) {
        continue
      }

      const visited = state.path.some((p) => eq(p, nextPosition));
      if (visited) {
        continue;
      }

      if (fastest.get(key) ?? Infinity <= state.score + 1) {
        continue;
      }

      fastest.set(key, Math.min(fastest.get(key) ?? Infinity, state.score + 1));
      queue.push({
        position: nextPosition,
        score: state.score + 1,
        path: [...state.path, nextPosition],
      })
    }
  }

  return null;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n');

  const end: Coords = process.argv[3] ? process.argv[3].split(',').map(toInt) as Coords : [70, 70];

  const firstKb = data.slice(0, 1024).reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {} as Record<string, true>);
  const iter = traverse(firstKb, start, end);
  const part1 = iter.next();
  if (!part1.value) {
    throw new Error('Part 1 failed');
  }

  console.log('Part 1:', part1.value.length - 1); // Subtract 1 because the start is included in the path

  const corructed = structuredClone(firstKb)
  let path = part1.value;
  for (const cor of data.slice(1024)) {
    corructed[cor] = true;
    const corCoords = cor.split(',').map(toInt) as Coords;
    const found = path.find((p) => eq(p, corCoords));

    if (found) {
      // Check if stil reachable
      const iter = traverse(corructed, start, end);
      const next = iter.next();
      if (!next.value) {
        console.log('Part 2:', cor);
        break;
      } else {
        path = next.value;
      }
    }
  }
}

run().catch((e) => console.error(e));
