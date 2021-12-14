import fs from 'fs/promises';

const countCharsFromPairsCount = (pairCounts: Record<string, number>): [string, number][] => {
  // Count by first and second charater of the pair
  // if first count is bigger -> character is first in the result string
  // if second count is bigger -> character is last in the result string
  // if equal -> character is in the middle
  let sets: Record<string, [number, number]> = Object.keys(pairCounts).reduce((acc, cur) => {
    const first = cur[0];
    const second = cur[1];
    acc[first] = acc[first] ?? [0, 0];
    acc[second] = acc[second] ?? [0, 0];
    acc[first][0] = acc[first][0] + pairCounts[cur];
    acc[second][1] = acc[second][1] + pairCounts[cur];
    return acc;
  }, {});

  return Object.entries(sets)
    .map((a) => [a[0], Math.max(...a[1])] as [string, number])
    .sort((a, b) => a[1] - b[1]);
};

function step(pairs: Record<string, string>, counts: Record<string, number>): Record<string, number> {
  // Each pair will produce two additional pairs -> so count them
  return Object.keys(counts).reduce((acc, cur) => {
    const middle = pairs[cur];
    const left = `${cur[0]}${middle}`;
    const right = `${middle}${cur[1]}`;
    acc[left] = (acc[left] ?? 0) + counts[cur];
    acc[right] = (acc[right] ?? 0) + counts[cur];
    return acc;
  }, {});
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const [d1, d2] = data.split(/\r?\n\r?\n/);
  const template = d1.trim();

  const pairs: Record<string, string> = d2
    .split('\n')
    .map((l) => l.split(' -> '))
    .reduce((acc, [f, s]) => {
      acc[f] = s;
      return acc;
    }, {});

  let pairCounts: Record<string, number> = {};
  for (let i = 0; i < template.length - 1; i++) {
    const pair = template.substr(i, 2);
    pairCounts[pair] = (pairCounts[pair] ?? 0) + 1;
  }

  // First 10 steps
  for (let i = 0; i < 10; i++) {
    pairCounts = step(pairs, pairCounts);
  }

  let sorted = countCharsFromPairsCount(pairCounts);
  console.log('Part 1:', sorted.at(-1)[1] - sorted.at(0)[1]);

  // Next 30 steps to 40
  for (let i = 0; i < 30; i++) {
    pairCounts = step(pairs, pairCounts);
  }

  sorted = countCharsFromPairsCount(pairCounts);
  console.log('Part 2:', sorted.at(-1)[1] - sorted.at(0)[1]);
}

run().catch((e) => console.error(e));
