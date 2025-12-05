import fs from 'fs/promises';
import { sum } from '#aoc/utils.ts'

const chunks = <T>(a: T[], size: number): T[][] =>
  Array.from(new Array(Math.ceil(a.length / size)), (_, i) => a.slice(i * size, i * size + size));

const prioritize = (a: string[]): number => {
  return sum(
    a.map((v) => {
      if (v.toLowerCase() == v) {
        return v.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
      } else {
        return v.charCodeAt(0) - 'A'.charCodeAt(0) + 27;
      }
    }),
  );
};

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n');

  const dataChunks = chunks(data, 3);

  let part1: number = 0;
  let part2: number = 0;
  for (const chunk of dataChunks) {
    for (const row of chunk) {
      const p1 = new Set(row.slice(0, row.length / 2).split(''));
      const p2 = new Set(row.slice(row.length / 2).split(''));
      const intersection = [...p1].filter((x) => p2.has(x));
      part1 += prioritize(intersection);
    }

    const chunkIntersection = chunk
      .slice(1)
      .reduce((acc, cur) => new Set([...cur.split('')].filter((x) => acc.has(x))), new Set(chunk[0].split('')));

    part2 += prioritize(Array.from(chunkIntersection));
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
