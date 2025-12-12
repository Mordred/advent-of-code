import fs from 'fs/promises';

type Devices = Record<string, string[]>;

function paths(data: Devices, start: string, end: string, needToVisit: Set<string> = new Set(), memory: Record<string, number> = {}) {
  const key = `${start}|${[...needToVisit].sort().join(',')}`;
  if (memory[key] !== undefined) {
    return memory[key];
  }

  let count = 0;
  for (const next of data[start] || []) {
    if (next === end && needToVisit.size === 0) {
      count++;
    } else {
      count += paths(data, next, end, needToVisit.difference(new Set([next])), memory);
    }
  }

  memory[key] = count;
  return count;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').reduce((acc, cur) => {
    const parts = cur.trim().split(':');
    acc[parts[0]] = parts[1].trim().split(' ');
    return acc;
  }, {} as Devices);

  console.log('Part 1:', paths(data, 'you', 'out'));
  console.log('Part 2:', paths(data, 'svr', 'out', new Set(['fft', 'dac'])));
}

run().catch((e) => console.error(e));
