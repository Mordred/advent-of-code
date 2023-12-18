import fs from 'fs/promises';
import { sum } from 'mathjs';

function HASH(str: string): number {
  return str.split('').reduce((acc, c) => ((acc + c.charCodeAt(0)) * 17) % 256, 0);
}

type BoxSlot = {
  label: string;
  focalLength: number;
};

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split(',');

  console.log('Part 1:', sum(data.map((d) => HASH(d))));

  const boxes: BoxSlot[][] = new Array(256).fill(0).map((_, i) => []);
  for (const instruction of data) {
    const split = instruction.split(/[=-]/);
    const hash = HASH(split[0]);
    if (instruction.at(-1) === '-') {
      boxes[hash] = boxes[hash].filter((b) => b.label !== split[0]);
    } else {
      const found = boxes[hash].find((b) => b.label === split[0]);
      if (!found) {
        boxes[hash].push({
          label: split[0],
          focalLength: parseInt(split[1], 10),
        });
      } else {
        found.focalLength = parseInt(split[1], 10);
      }
    }
  }

  console.log('Part 2:', boxes.reduce((acc, box, boxIndex) => acc + box.reduce((acc, slot, slotIndex) => acc + (boxIndex + 1) * (slotIndex + 1) * slot.focalLength, 0), 0));
}

run().catch((e) => console.error(e));
