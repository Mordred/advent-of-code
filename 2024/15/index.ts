import { sum } from '#aoc/utils.js';
import fs from 'fs/promises';

type Coords = [number, number];

const ROBOT = '@';
const BOX = 'O';
const WALL = '#';
const FREE = '.';
const LEFT_BOX = '[';
const RIGHT_BOX = ']';

const DIRECTIONS = {
  '^': [0, -1] as Coords,
  '>': [1, 0] as Coords,
  v: [0, 1] as Coords,
  '<': [-1, 0] as Coords,
} as const;

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];

function move(map: string[][], start: Coords, direction: Coords): string[][] | null {
  const [dx, dy] = direction;
  let copy = structuredClone(map);
  let previous = get(map, start);
  let cur = [start[0] + dx, start[1] + dy] as Coords;
  let next = get(map, cur);
  switch (next) {
    case WALL:
      return null;
    case FREE:
      copy[cur[1]][cur[0]] = previous;
      return copy;
    case BOX: {
      let newMap = move(copy, cur, direction);
      if (!newMap) {
        return null;
      }

      newMap[cur[1]][cur[0]] = previous;
      return newMap;
    }
    case LEFT_BOX: {
      let newMap = copy;
      if (direction === DIRECTIONS['^'] || direction === DIRECTIONS['v']) {
        const moved = move(copy, [cur[0] + 1, cur[1]], direction);
        if (!moved) {
          return null;
        }

        newMap = moved;
        newMap[cur[1]][cur[0] + 1] = FREE;
      }

      const moved = move(newMap, cur, direction);
      if (!moved) {
        return null;
      }

      newMap = moved;
      newMap[cur[1]][cur[0]] = previous;
      return newMap;
    }
    case RIGHT_BOX: {
      let newMap = copy;
      if (direction === DIRECTIONS['^'] || direction === DIRECTIONS['v']) {
        const moved = move(copy, [cur[0] - 1, cur[1]], direction);
        if (!moved) {
          return null;
        }

        newMap = moved;
        newMap[cur[1]][cur[0] - 1] = FREE;
      }

      const moved = move(newMap, cur, direction);
      if (!moved) {
        return null;
      }

      newMap = moved;
      newMap[cur[1]][cur[0]] = previous;
      return newMap;
    }
    default:
      return map;
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [mapRaw, movementsRaw] = raw.split('\n\n');
  const map = mapRaw.split('\n').map((line) => line.split(''));
  const movements = movementsRaw
    .split('\n')
    .map((line) => line.split(''))
    .flat(1);

  const expandedMap = map.map((line) =>
    line
      .map((cell) => {
        switch (cell) {
          case BOX:
            return [LEFT_BOX, RIGHT_BOX];
          case FREE:
            return [FREE, FREE];
          case ROBOT:
            return [ROBOT, FREE];
          case WALL:
          default:
            return [WALL, WALL];
        }
      })
      .flat(1),
  );

  let start!: Coords;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === ROBOT) {
        start = [x, y];
        map[y][x] = '.';
        break;
      }
    }
  }
  let state = { map: structuredClone(map), robot: start };
  for (const movement of movements) {
    const direction = DIRECTIONS[movement];
    const moved = move(state.map, state.robot, direction);
    if (moved) {
      state.map = moved;
      state.robot = [state.robot[0] + direction[0], state.robot[1] + direction[1]];
    }
  }

  console.log(
    'Part 1:',
    sum(state.map.map((line, y) => line.map((cell, x) => (cell === BOX ? y * 100 + x : 0))).flat(1)),
  );

  for (let y = 0; y < expandedMap.length; y++) {
    for (let x = 0; x < expandedMap[y].length; x++) {
      if (expandedMap[y][x] === ROBOT) {
        start = [x, y];
        expandedMap[y][x] = '.';
        break;
      }
    }
  }

  state = { map: structuredClone(expandedMap), robot: start };
  for (const movement of movements) {
    const direction = DIRECTIONS[movement];
    const moved = move(state.map, state.robot, direction);
    if (moved) {
      state.map = moved;
      state.robot = [state.robot[0] + direction[0], state.robot[1] + direction[1]];
    }
  }

  console.log(
    'Part 2:',
    sum(state.map.map((line, y) => line.map((cell, x) => (cell === LEFT_BOX ? y * 100 + x : 0))).flat(1)),
  );
}

run().catch((e) => console.error(e));
