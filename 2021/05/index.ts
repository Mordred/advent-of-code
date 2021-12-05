import fs from 'fs/promises';

const SIZE = 1000;

type Point = [number, number];
type Diagram = number[][];

const toInt = (v: string) => parseInt(v, 10);

async function run() {
  const lines = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');
  const vents: [Point, Point][] = lines.map(
    (l) =>
      l
        .trim()
        .split(/\s+->\s+/g)
        .map((r) => r.split(',').map(toInt) as Point) as [Point, Point],
  );

  const diagram: Diagram = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

  for (const vent of vents) {
    const [[x1, y1], [x2, y2]] = vent;
    if (x1 === x2 || y1 === y2) { // Horizontal, vertical
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          diagram[y][x] += 1;
        }
      }
    }
  }

  console.log('Part 1:', diagram.flat().filter((v) => v > 1).length);

  for (const vent of vents) {
    const [[x1, y1], [x2, y2]] = vent;
    if (x1 !== x2 && y1 !== y2) { // Diagonal
      const distance = Math.abs(x1 - x2); // exactly 45 degree
      for (let d = 0; d <= distance; d++) {
        diagram[y1 + (y1 < y2 ? d : -d)][x1 + (x1 < x2 ? d : -d)] += 1;
      }
    }
  }

  console.log('Part 2:', diagram.flat().filter((v) => v > 1).length);
}

run().catch((e) => console.error(e));
