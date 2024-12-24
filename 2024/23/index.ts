import fs from 'fs/promises';

function* cycle(graph: Record<string, string[]>) {
  const sortedKeys = Object.keys(graph).sort();
  for (const key of sortedKeys) {
    for (const next1 of graph[key]) {
      if (next1 > key) {
        const intersect = graph[key].filter((v) => graph[next1].includes(v));
        for (const next2 of intersect) {
          if (next2 > next1) {
            yield [key, next1, next2];
          }
        }
      }
    }
  }
}

function *allConnected(graph: Record<string, string[]>, current: Set<string>, index: number) {
  if (index > Object.keys(graph).length) {
    yield current;
    return
  }

  yield *allConnected(graph, current, index + 1);

  const next = Object.keys(graph)[index];
  if (current.values().some((v) => !graph[v].includes(next))) {
    return;
  }

  yield *allConnected(graph, new Set([...current, next]), index + 1);
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw
    .split('\n')
    .map((l) => l.split('-'))
    .reduce((acc, cur) => {
      acc[cur[0]] ??= [];
      acc[cur[0]].push(cur[1]);
      acc[cur[1]] ??= [];
      acc[cur[1]].push(cur[0]);
      return acc;
    }, {});

  let part1 = 0;
  for (const path of cycle(data)) {
    if (path.some((c) => c.startsWith('t'))) {
      part1++;
    }
  }

  console.log('Part 1:', part1);

  let part2 = new Set();
  for (const path of allConnected(data, new Set<string>(), 0)) {
    if (part2.size < path.size) {
      part2 = path;
    }
  }

  console.log('Part 2:', part2.values().toArray().toSorted().join(','));
}

run().catch((e) => console.error(e));
