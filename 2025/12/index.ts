import { sum, toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

const FULL = '#';
const EMPTY = '.';

type Shape = string[][];
type Shapes = Record<string, Shape>;

interface Region {
  width: number;
  height: number;
  presents: number[];
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const parts = raw.split('\n\n');
  const shapes: Shapes = parts.slice(0, -1).reduce((acc, cur) => {
    const lines = cur.split('\n');
    const name = lines[0].replace(':', '').trim();
    acc[name] = lines.slice(1).map((line) => line.trim().split(''));
    return acc;
  }, {} as Shapes);

  const regions: Region[] = parts.at(-1)!.split('\n').map((line) => {
    const parts = line.trim().split(':');
    const size = parts[0].split('x').map(toInt);
    return {
      width: size[0],
      height: size[1],
      presents: parts[1].trim().split(' ').map(toInt),
    };
  });

  let part1 = 0;
  for (const region of regions) {
    const area = region.width * region.height;
    const presents = sum(region.presents);
    // First check if each region can fit the presents
    part1 += area >= presents * 9 ? 1 : 0
  }
  // It is solution? WTF?
  console.log('Part 1:', part1);
}

run().catch((e) => console.error(e));
