import { toInt, sum } from '#aoc/utils.js';
import fs from 'fs/promises';

interface File {
  id: number;
  size: number;
}

interface Space {
  size: number;
}

type Block = File | Space;

function *compress(data: number[]) {
  let isFile = true;
  let sId = 0;
  let eId = Math.floor(data.length / 2);
  let e = data.length - 1;
  let offset = 0;

  for (let s = 0; s <= data.length; s++) {
    let size = data[s];
    if (isFile) {
      for (let i = 0; i < size; i++) {
        yield sId;
      }
      offset += size
      sId += 1;
    } else {
      while (size > 0 && e >= s) {
        let chunk: number = Math.min(data[e], size);
        data[e] -= chunk;
        size -= chunk;

        for (let i = 0; i < chunk; i++) {
          yield eId;
        }

        if (data[e] === 0) {
          e -= 2;
          eId -= 1;
        }

        offset += chunk;
      }
    }

    isFile = !isFile;
  }
}

function *moveFiles(data: Block[]) {
  const newData = structuredClone(data);
  for (let s = newData.length - 1; s >= 0; s--) {
    const block = newData[s]
    if ('id' in block) {
      // is File
      for (let i = 0; i < s; i++) {
        const cur = newData[i];
        if ('id' in cur) {
          continue;
        }

        if (cur.size >= block.size) {
          // Mark as empty
          newData[s] = { size: block.size };
          // Insert new file
          newData.splice(i, 1, { size: 0 }, { ...block }, { size: cur.size - block.size })
          s += 2;
          break;
        }
      }
    }
  }

  for (let s = 0; s < newData.length; s++) {
    let block = newData[s];
    if ('id' in block) {
      for (let i = 0; i < block.size; i++) {
        yield block.id;
      }
    } else {
      for (let i = 0; i < block.size; i++) {
        yield 0;
      }
    }
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('').map(toInt);

  const disk = data.map((v, i) => i % 2 === 0 ? { id: Math.floor(i / 2), size: v } : { size: v });

  console.log('Part 1:', sum(Array.from(compress(structuredClone(data))).map((v, i) => v * i)));
  console.log('Part 2:', sum(Array.from(moveFiles(structuredClone(disk))).map((v, i) => v * i)));
}

run().catch((e) => console.error(e));
