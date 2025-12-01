import fs from 'fs/promises';
import { toInt, intDivide, mod } from '#aoc/utils.js';

const MOD = 100;

interface Instruction {
  rotation: 'L' | 'R';
  count: number;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => ({ rotation: line[0], count: toInt(line.slice(1)) } as Instruction));

  let current = 50;
  let newCurrent = 50;
  let part1 = 0;
  let part2 = 0;
  for (const instruction of data) {
    switch (instruction.rotation) {
      case 'L':
        newCurrent = current - instruction.count;
        if (newCurrent < 0) {
          part2 += Math.abs(intDivide(newCurrent + 100, MOD));
          if (current !== 0) {
            part2 += 1;
          }
        }
        current = mod(newCurrent, MOD);
        if (current === 0) {
          part2 += 1;
        }
        break;
      case 'R':
        newCurrent = current + instruction.count;
        part2 += intDivide(newCurrent, MOD);
        current = mod(newCurrent, MOD);
        break;
    }

    if (current === 0) {
      part1 += 1;
    };
  }
  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
