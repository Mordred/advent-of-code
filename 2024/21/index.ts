import fs from 'fs/promises';

const get = (grid: Keypad, [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];

type Coords = [number, number];
type Keypad = (null | string)[][];

const numeric: Keypad = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  [null, '0', 'A'],
];

const directional: Keypad = [
  [null, '^', 'A'],
  ['<', 'v', '>'],
];

const findKeyCache = new Map<string, Coords | null>();
function findKey(keypad: Keypad, key: string): Coords | null {
  const h = JSON.stringify(keypad) + ':' + key;
  if (findKeyCache.has(h)) {
    return findKeyCache.get(h)!;
  }

  for (let y = 0; y < keypad.length; y++) {
    for (let x = 0; x < keypad[y].length; x++) {
      if (keypad[y][x] === key) {
        findKeyCache.set(h, [x, y] as Coords);
        return [x, y];
      }
    }
  }

  findKeyCache.set(h, null);
  return null;
}

const routeToKeyCache = new Map<string, number>();
function routeToKey(keypad: Keypad, current: string, key: string, depth: number = 0) {
  const cacheKey = JSON.stringify({ keypad, current, key, depth });
  if (routeToKeyCache.has(cacheKey)) {
    return routeToKeyCache.get(cacheKey)!;
  }

  const start = findKey(keypad, current);
  if (!start) {
    throw new Error('Invalid start key');
  }

  const end = findKey(keypad, key);
  if (!end) {
    throw new Error('Invalid end key');
  }

  // >>^ is faster than >^> because next robot do not have to swich between keys
  // so keep horizontal and vertical moves next to each other
  let horizontal: string;
  if (start[0] < end[0]) {
    horizontal = '>'.repeat(end[0] - start[0]);
  } else if (start[0] > end[0]) {
    horizontal = '<'.repeat(start[0] - end[0]);
  } else {
    horizontal = '';
  }

  let vertical: string;
  if (start[1] < end[1]) {
    vertical = 'v'.repeat(end[1] - start[1]);
  } else if (start[1] > end[1]) {
    vertical = '^'.repeat(start[1] - end[1]);
  } else {
    vertical = '';
  }

  let options: string[];
  if (horizontal === '') {
    options = [vertical];
  } else if (vertical === '') {
    options = [horizontal];
  } else if (get(keypad, [start[0], end[1]]) === null) {
    options = [horizontal + vertical];
  } else if (get(keypad, [end[0], start[1]]) === null) {
    options = [vertical + horizontal];
  } else {
    options = [horizontal + vertical, vertical + horizontal];
  }

  const res = Math.min(...options.map((opt) => route(opt + 'A', depth - 1, directional)));
  routeToKeyCache.set(cacheKey, res);
  return res;
}

function route(code: string, depth: number = 0, keypad: Keypad): number {
  if (depth <= 0) {
    return code.length;
  }

  let result = 0;
  let start = 'A';
  for (const c of code) {
    result += routeToKey(keypad, start, c, depth);
    start = c;
  }

  return result;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const codes = raw.split('\n');

  let part1 = 0;
  for (const code of codes) {
    const best = route(code, 3, numeric);
    part1 += best * parseInt(code);
  }

  console.log('Part 1:', part1);

  let part2 = 0;
  for (const code of codes) {
    const best = route(code, 26, numeric);
    part2 += best * parseInt(code);
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
