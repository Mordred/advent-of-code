import fs from 'fs/promises';
import { sum } from '#aoc/utils.ts'

enum Mode {
  COMMAND,
  LS_OUTPUT
}

type File = number;
interface Directory {
  [path: string]: File | Directory
}

function get(dir: Directory, path: string[]) {
  let actual: File | Directory = dir;
  for (const p of path) {
    actual = actual[p];
  }
  return actual;
}

function *files(dir: Directory | File, path: string[]): Generator<{ path: string[]; size: number }, void> {
  if (typeof dir === 'number') {
    yield { path, size: dir }
  }

  for (const p of Object.keys(dir)) {
    yield *files(dir[p], [...path, p]);
  }
}

function *directories(dir: Directory | File, path: string[]): Generator<{ path: string[]; dir: Directory }, void> {
  if (typeof dir !== 'number') {
    yield { path, dir }
  }

  for (const p of Object.keys(dir)) {
    yield *directories(dir[p], [...path, p]);
  }
}

function du(dir: Directory | File, path: string[]): number {
  let sum = 0;
  for (const { path: subpath, size } of files(dir, path)) {
    sum += size;
  }
  return sum;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8'));
  const data = raw.split('\n');

  const filesystem = { '/': {} };

  let pwd: string[] = [];
  let mode: Mode = Mode.COMMAND;
  for (const line of data) {
    const parts = line.split(' ');
    if (parts[0] === '$') {
      mode = Mode.COMMAND;
      if (parts[1] === 'cd') {
        if (parts[2] === '..') {
          pwd.pop();
        } else {
          pwd.push(parts[2]);
        }
      } else if (parts[1] === 'ls') {
        mode = Mode.LS_OUTPUT;
        continue
      }
    } else if (mode === Mode.LS_OUTPUT) {
      const dir = get(filesystem, pwd);
      if (parts[0] === 'dir') {
        dir[parts[1]] = {};
      } else {
        dir[parts[1]] = +parts[0]
      }
    }
  }

  const diskSize = 70000000;
  const needed = 30000000;
  const unused = diskSize - du(filesystem, ['/']);
  const needFree = needed - unused;

  const part1: number[] = [];
  const part2: number[] = [];
  for (const { dir } of directories(filesystem, ['/'])) {
    const size = du(dir, []);
    if (size <= 100000) {
      part1.push(size)
    }
    if (size >= needFree) {
      part2.push(size);
    }
  }

  part2.sort((a, b) => a - b);

  console.log('Part 1', sum(part1));
  console.log('Part 2', part2[0]);
}

run().catch((e) => console.error(e));
