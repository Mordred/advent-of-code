import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';

type Position = [number, number];
type Grid = string[][];

type StackItem = [number, number, number]

const directions = {
  '.': [[0, 1], [1, 0], [0, -1], [-1, 0]],
  'v': [[0, 1]],
  '<': [[-1, 0]],
  '>': [[1, 0]],
  '^': [[0, -1]],
}

const hash = ([x, y]: Position) => `${x},${y}`;

function calculate(points: Record<string, Position>, data: Grid, start: Position, end: Position) {
  const graph = Object.values(points).reduce((acc, cur) => {
    acc[hash(cur)] = {};
    return acc;
  }, {} as Record<string, Record<string, number>>);

  for (const [x, y] of Object.values(points)) {
    const stack: StackItem[] = [[0, x, y]];
    const seen = new Set<string>();
    seen.add(hash([x, y]));

    while (stack.length > 0) {
      const [dist, cx, cy] = stack.pop()!;
      if (dist !== 0 && points[hash([cx, cy])]) {
        graph[hash([x, y])][hash([cx, cy])] = dist;
        continue;
      }

      for (const [dx, dy] of directions[data[cy][cx]]) {
        const [nx, ny] = [cx + dx, cy + dy];
        const item = data[ny]?.[nx];
        if (item !== undefined && item !== '#' && !seen.has(hash([nx, ny]))) {
          stack.push([dist + 1, nx, ny]);
          seen.add(hash([nx, ny]));
        }
      }
    }
  }

  const seen = new Set<string>();
  const dfs = (node: Position) => {
    if (hash(node) === hash(end)) {
      return 0;
    }

    let max = -Infinity;
    seen.add(hash(node));
    for (const [next, dist] of Object.entries(graph[hash(node)])) {
      if (!seen.has(next)) {
        max = Math.max(max, dfs(points[next]) + dist);
      }
    }
    seen.delete(hash(node));

    return max;
  }

  return dfs(start);
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split('')) as Grid;

  const start  = [data[0].indexOf('.'), 0] as Position;
  const end = [data.at(-1).indexOf('.'), data.length - 1] as Position;

  const points = { [hash(start)]: start, [hash(end)]: end };
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data.at(y).length; x++) {
      if (data[y][x] === '#') {
        continue
      }
      let neighbours = 0;
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const [nx, ny] = [x + dx, y + dy];
        if ((data[ny]?.[nx] ?? '#') != '#') {
          neighbours++;
        }
      }
      if (neighbours >= 3) {
        points[hash([x, y])] = [x, y];
      }
    }
  }

  console.log('Part 1:', calculate(points, data, start, end));
  console.log('Part 2:', calculate(points, data.map((r) => r.map((c) => c === '<' || c === '>' || c === '^' || c === 'v' ? '.' : c)), start, end));
}

run().catch((e) => console.error(e));
