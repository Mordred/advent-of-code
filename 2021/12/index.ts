import fs from 'fs/promises';

type VisitedTest = (visited: Record<string, number>, next: string) => boolean;

function search(
  caveMap: Record<string, string[]>,
  path: string[],
  visited: Record<string, number>,
  visitedTest: VisitedTest,
): string[][] {
  let current = path.at(-1);
  if (current === 'end') {
    return [path];
  }
  visited[current] = (visited[current] ?? 0) + 1;
  let paths: string[][] = [];
  for (const next of caveMap[current] ?? []) {
    if (next.toLowerCase() === next && visitedTest(visited, next)) {
      continue;
    }
    paths = [...paths, ...search(caveMap, [...path, next], { ...visited }, visitedTest)];
  }

  return paths;
}

const smallCaveOnlyOnce = (visited: Record<string, number>, next: string): boolean => visited[next] === 1;
const oneSmallCaveVisitedTwice = (visited: Record<string, number>, next: string): boolean => {
  if (next === 'start') {
    return true;
  }
  const isSomeVisitedTwice = Object.keys(visited)
    .filter((v) => v.toLocaleLowerCase() === v)
    .some((v) => visited[v] === 2);

  return visited[next] === 2 || (visited[next] && isSomeVisitedTwice);
};

async function run() {
  const lines = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');

  const caveMap: Record<string, string[]> = lines.reduce((acc, line) => {
    const [start, end] = line.split('-');
    acc[start] = (acc[start] ?? []).concat([end]);
    acc[end] = (acc[end] ?? []).concat([start]);
    return acc;
  }, {});

  let paths: string[][] = [];
  for (const start of caveMap.start) {
    paths = [...paths, ...search(caveMap, ['start', start], { start: 1 }, smallCaveOnlyOnce)];
  }

  console.log('Part 1:', paths.length);

  paths = [];
  for (const start of caveMap.start) {
    paths = [...paths, ...search(caveMap, ['start', start], { start: 1 }, oneSmallCaveVisitedTwice)];
  }

  console.log('Part 2:', paths.length);
}

run().catch((e) => console.error(e));
