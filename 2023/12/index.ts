import { toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';
import { sum } from 'mathjs';

const cacheKey = (springs: string, groups: number[], mustBeDamaged = false) =>
  `${springs}-${groups.join(',')}-${mustBeDamaged}`;

let cache = new Map<string, number>();
function count(springs: string, groups: number[], mustBeDamaged = false) {
  const process = () => {
    const needed = sum(groups);
    // Nothing left
    if (springs === '') {
      // We traversed all springs -> we do not comsumed all damaged in groups -> invalid case
      return needed === 0 ? 1 : 0;
    }

    if (needed == 0) {
      // Rest must be operational
      // If there is damanged -> this case is invalid
      return springs.includes('#') ? 0 : 1;
    }

    if (springs[0] === '#') {
      // Next must be damaged, but there is nothing left -> invalid
      if (mustBeDamaged && groups[0] === 0) {
        return 0;
      }

      return count(springs.slice(1), [groups[0] - 1, ...groups.slice(1)], true);
    }

    if (springs[0] === '.') {
      // Current is operational, but it has to be damaged -> invalid
      if (mustBeDamaged && groups[0] > 0) {
        return 0;
      }

      return count(springs.slice(1), groups[0] === 0 ? groups.slice(1) : groups, false);
    }

    // springs[0] === '?'
    if (mustBeDamaged) {
      if (groups[0] === 0) {
        // We reduced group to 0, so we can't use it anymore
        return count(springs.slice(1), groups.slice(1), false);
      }

      // Current must be damaged
      return count(springs.slice(1), [groups[0] - 1, ...groups.slice(1)], true);
    }

    // Try case 1 -> operational
    // Try case 2 -> damaged
    return count(springs.slice(1), groups, false) + count(springs.slice(1), [groups[0] - 1, ...groups.slice(1)], true);
  };

  // Cache same cases
  const key = cacheKey(springs, groups, mustBeDamaged);
  if (!cache.has(key)) {
    cache.set(key, process());
  }

  return cache.get(key);
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => {
    const [springs, groups] = line.split(' ');
    return {
      springs,
      groups: groups.split(',').map(toInt),
    };
  });

  let part1 = 0;
  let part2 = 0;
  for (const { springs, groups } of grid) {
    part1 += count(springs, groups);

    const repeatedSprings = [];
    const repeatedGroups = [];
    for (let i = 0; i < 5; i++) {
      repeatedSprings.push(springs);
      repeatedGroups.push(...groups);
    }

    part2 += count(repeatedSprings.join('?'), repeatedGroups);
  }
  console.log('Part 1:', part1);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
