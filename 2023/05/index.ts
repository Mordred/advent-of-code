import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';

type Map = {
  name: string;
  mapping: {
    source: number;
    destination: number;
    range: number;
  }[];
};

type Interval = [number, number];

function transform(seed: number, maps: Map[]) {
  let current = seed;
  for (const map of maps) {
    let found = false;
    for (const mapping of map.mapping) {
      if (current >= mapping.source && current <= mapping.source + mapping.range - 1) {
        current = mapping.destination + (current - mapping.source);
        found = true;
        break;
      }
    }
  }

  return current;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [seedsLine, ...mapLines] = raw.trim().split('\n\n');
  const seeds = seedsLine.replace('seeds: ', '').split(' ').map(toInt);
  const maps = mapLines.map((line) => {
    const [nameLine, ...mapsLine] = line.split('\n');
    const name = nameLine.replace(' map:', '');
    const mapping = mapsLine.map((mappingLine) => {
      const [destination, source, range] = mappingLine.split(' ').map(toInt);
      return { source, destination, range };
    });
    return {
      name,
      mapping,
    };
  });

  let part1 = seeds.map((seed) => transform(seed, maps));
  console.log('Part 1:', Math.min(...part1));

  // BRUTE FORCE PART 2
  // let min = Infinity;
  // for (let i = 0; i < seeds.length; i += 2) {
  //   for (let j = seeds[i]; j <= seeds[i] + seeds[i + 1] - 1; j++) {
  //     const transformed = transform(j, maps);
  //     min = Math.min(min, transformed);
  //   }
  // }

  // console.log('Part 2:', min);

  // CLEVER PART 2
  let seedRanges = seeds.reduce((acc, cur, index) => {
    if (index % 2 !== 0) {
      return acc;
    }

    let next = seeds[index + 1];
    return acc.concat([[cur, cur + next]]);
  }, [] as Interval[]);

  for (const map of maps) {
    let newSeedRanges: Interval[] = [];
    while (seedRanges.length) {
      const [start, end] = seedRanges.pop();
      let found = false;
      for (const mapping of map.mapping) {
        let overlapStart = Math.max(start, mapping.source);
        let overlapEnd = Math.min(end, mapping.source + mapping.range);

        if (overlapStart < overlapEnd) {
          newSeedRanges.push([
            overlapStart - mapping.source + mapping.destination,
            overlapEnd - mapping.source + mapping.destination,
          ]);
          if (overlapStart > start) {
            seedRanges.push([start, overlapStart]);
          }
          if (overlapEnd < end) {
            seedRanges.push([overlapEnd, end]);
          }
          found = true;
          break;
        }
      }

      if (!found) {
        newSeedRanges.push([start, end]);
      }
    }
    seedRanges = newSeedRanges;
  }

  console.log('Part 2:', Math.min(...seedRanges.map((v) => v[0])));
}

run().catch((e) => console.error(e));
