import fs from 'fs/promises';
import { toInt, sum } from '#aoc/utils.ts';

interface SetCube {
  blue: number;
  red: number;
  green: number;
}

interface Game {
  index: number;
  sets: SetCube[];
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => {
    const gameMatch = l.match(/Game (\d+): /);
    return {
      index: toInt(gameMatch[1]),
      sets: l
        .substring(gameMatch[0].length)
        .split(';')
        .map((s) =>
          s.split(', ').reduce((acc, cur) => {
            const [count, type] = cur.trim().split(' ');
            return { ...acc, [type]: toInt(count) };
          }, {} as SetCube),
        ),
    };
  });

  const firstLimit: SetCube = { red: 12, green: 13, blue: 14 };
  const part1Possible = data.filter((g) => g.sets.every((s) => Object.keys((s)).every((v) => s[v] <= firstLimit[v])));
  console.log('Part 1:', sum(part1Possible.map((g) => g.index)));

  const part2Minimums = data.map((g) => g.sets.reduce((acc, cur) => {
    for (const [color, count] of Object.entries(cur)) {
      acc[color] = Math.max(acc[color] ?? 0, count);
    }
    return acc;
  }, {
    blue: 0,
    red: 0,
    green: 0
  } as SetCube))
  console.log('Part 2:', sum(part2Minimums.map((g) => g.blue * g.red * g.green)));
}

run().catch((e) => console.error(e));
