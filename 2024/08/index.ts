import fs from 'fs/promises';

type Coords = readonly [number, number];
type AntenaCoords = Record<string, Coords[]>;

const get = (grid: string[][], [x, y]: Coords, [dx, dy]: Coords = [0, 0]) => grid[y + dy]?.[x + dx];
const hash = ([x, y]: Coords) => `${x},${y}`;

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((v) => v.split(''));

  const antenas = {} as AntenaCoords;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const cur = get(grid, [x, y]);
      if (cur === '.') {
        continue;
      }

      antenas[cur] ??= [];
      antenas[cur].push([x, y]);
    }
  }

  const part1 = new Set<string>();
  const part2 = new Set<string>();
  for (const [antena, coords] of Object.entries(antenas)) {
    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const first = coords[i];
        const second = coords[j];
        const diff = [first[0] - second[0], first[1] - second[1]];

        part2.add(hash(first));
        part2.add(hash(second));

        let antinode: Coords = [first[0] + diff[0], first[1] + diff[1]];
        let k = 0;
        while (get(grid, antinode) !== undefined) {
          part2.add(hash(antinode));
          if (k === 0) {
            part1.add(hash(antinode));
          }
          antinode = [antinode[0] + diff[0], antinode[1] + diff[1]];
          k++;
        }

        antinode = [second[0] - diff[0], second[1] - diff[1]];
        k = 0;
        while (get(grid, antinode) !== undefined) {
          part2.add(hash(antinode));
          if (k === 0) {
            part1.add(hash(antinode));
          }
          antinode = [antinode[0] - diff[0], antinode[1] - diff[1]];
          k++;
        }
      }
    }
  }

  console.log('Part 1:', part1.size);
  console.log('Part 2:', part2.size);
}

run().catch((e) => console.error(e));
