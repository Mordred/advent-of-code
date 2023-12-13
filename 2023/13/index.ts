import fs from 'fs/promises';

type Mirror = string[];

function transpose(grid: Mirror): Mirror {
  return grid[0].split('').map((_, i) => grid.map((row) => row[i]).join(''));
}

function isReflection(left: Mirror, right: Mirror, smudges: number): boolean {
  const leftStr = left.reverse().join('');
  const rightStr = right.join('');

  // Count number of non-matching characters between two strings
  let diffs = 0;
  for (let i = 0; i < Math.min(leftStr.length, rightStr.length); i++) {
    if (leftStr[i] !== rightStr[i]) {
      diffs++;
    }
  }

  return diffs === smudges;
}

function findRow(mirror: Mirror, smudges: number): number {
  for (let i = 1; i < mirror.length; i++) {
    const left = mirror.slice(0, i);
    const right = mirror.slice(i);
    if (isReflection(left, right, smudges)) {
      return i;
    }
  }

  return 0;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const mirrors = raw.split('\n\n').map((mirror) => {
    return mirror.split('\n') as Mirror;
  });

  let part1 = 0;
  let part2 = 0;
  for (const mirror of mirrors) {
    part1 += findRow(mirror, 0) * 100;
    part2 += findRow(mirror, 1) * 100;
    const transposed = transpose(mirror);
    part1 += findRow(transposed, 0);
    part2 += findRow(transposed, 1);
  }

  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
