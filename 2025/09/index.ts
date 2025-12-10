import { type Coords, toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

function area(a: Coords, b: Coords): number {
  return (Math.abs(a[0] - b[0]) + 1) * (Math.abs(a[1] - b[1]) + 1);
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split(',').map(toInt)) as Coords[];

  let part1 = -1;
  let part2 = -1;
  for (let i = 0; i < data.length; i++) {
    for (let j = i + 1; j < data.length; j++) {
      const size = area(data[i], data[j]);

      part1 = Math.max(part1, size);

      const [x1, x2] = [data[i][0], data[j][0]].sort((a, b) => a - b);
      const [y1, y2] = [data[i][1], data[j][1]].sort((a, b) => a - b);

      let intersect = false;
      // Check if there is no intersection with green lines
      //  - they are outside of current rectangle
      // NOTE: Won't work for specific cases, but there wasn't any in the input:
      /*
          #------#
          |......|
          #...#--|
          #...#--|
          |......|
          #------#
      */
      for (let k = 0; k < data.length; k++) {
        const nextK = (k + 1) % data.length;
        const [x3, x4] = [data[k][0], data[nextK][0]].sort((a, b) => a - b);
        const [y3, y4] = [data[k][1], data[nextK][1]].sort((a, b) => a - b);

        if (x1 < x4 && x2 > x3 && y1 < y4 && y2 > y3) {
          intersect = true;
          break;
        }
      }

      if (!intersect) {
        part2 = Math.max(part2, size);
      }
    }
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
