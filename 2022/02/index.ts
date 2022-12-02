import fs from 'fs/promises';

const points = {
  A: 1,
  B: 2,
  C: 3,
  X: 1,
  Y: 2,
  Z: 3,
};

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((l) => l.split(' '));

  let part1: number = 0;
  let part2: number = 0;
  for (const [a, b] of data) {
    if ((points[a] % 3) + 1 === points[b]) {
      part1 += points[b] + 6;
    } else if ((points[b] % 3) + 1 === points[a]) {
      part1 += points[b] + 0;
    } else if (points[a] === points[b]) {
      part1 += points[b] + 3;
    }

    switch (b) {
      case 'X': {
        // 1 -> 3
        // 2 -> 1
        // 3 -> 2
        part2 += ((points[a] - 4) % 3) + 3 + 0;
        break;
      }
      case 'Y': {
        // 1 -> 1
        // 2 -> 2
        // 3 -> 3
        part2 += points[a] + 3;
        break;
      }
      case 'Z': {
        // 1 -> 2
        // 2 -> 3
        // 3 -> 1
        part2 += (points[a] % 3) + 1 + 6;
        break;
      }
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
