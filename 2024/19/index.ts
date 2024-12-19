import fs from 'fs/promises';

const cache = new Map<string, number>([['', 0]]);
function isPossible(design: string, towels: string[]) {
  if (cache.has(design)) {
    return cache.get(design)!;
  }

  if (design === '') {
    return 0;
  }

  let variants: number = 0;
  for (const towel of towels) {
    if (!design.startsWith(towel)) {
      continue;
    }

    const subdesign  = design.slice(towel.length);
    if (subdesign === '') {
      variants++;
    }

    variants += isPossible(subdesign, towels);
  }

  cache.set(design, variants);
  return variants;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [rawTowels, rawDesigns] = raw.split('\n\n');
  const towels = rawTowels.trim().split(', ');
  const designs = rawDesigns.trim().split('\n');

  const part1 = new Set<string>(towels);
  let part2 = 0;
  for (const design of designs) {
    const variants = isPossible(design, Array.from(part1.values()));
    if (variants > 0) {
      part1.add(design)
    }

    part2 += variants
  }

  console.log('Part 1:', part1.size - towels.length);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
