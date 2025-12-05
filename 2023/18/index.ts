import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

type Coords = [number, number];

const directions = {
  L: [-1, 0],
  R: [1, 0],
  U: [0, 1],
  D: [0, -1],
}

type Instruction = {
  direction: 'L' | 'R' | 'U' | 'D';
  distance: number;
  color: string;
}

function calculate(instructions: Omit<Instruction, 'color'>[]) {
  let length = 0;
  const path: Coords[] = [[0, 0]]
  for (const { direction, distance } of instructions) {
    const [x, y] = path.at(-1);
    length += distance;
    const [dx, dy] = directions[direction];
    path.push([x + dx * distance, y + dy * distance]);
  }

  // https://www.mathopenref.com/coordpolygonarea.html
  const area = Math.abs(path.slice(1).reduce((acc, [x1, y1], i) => {
    const [x2, y2] = path[i];
    return acc + (x1 * y2 - x2 * y1);
  }, 0) / 2);
  return (area - Math.floor(length / 2) + 1) + length;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => {
    const parts = line.split(' ')
    return {
      direction: parts[0] as Instruction['direction'],
      distance: toInt(parts[1]),
      color: parts[2].slice(1, -1),
    }
  }) as Instruction[];

  console.log('Part 1:', calculate(data));
  console.log('Part 2:', calculate(data.map(({ color }) => ({
    direction: 'RDLU'[color[6]],
    distance: parseInt(color.slice(1, 6), 16)
  }))));
}

run().catch((e) => console.error(e));
