import { product, toInt } from '#aoc/utils.ts';
import fs from 'fs/promises';

const key = (coords: Coords): string => `${coords[0]},${coords[1]},${coords[2]}`;
const unkey = (k: string): Coords => k.split(',').map(toInt) as Coords;

type Coords = [number, number, number];

function straightLineDistance(a: Coords, b: Coords): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2,
  );
}

async function run() {
  const numberOfConnections = process.argv[3] ? parseInt(process.argv[3], 10) : 10;
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const boxes = raw.split('\n').map((l) => l.split(',').map(toInt)) as Coords[];

  const distances = new Map<string, number>();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i; j < boxes.length; j++) {
      if (i === j) continue;
      const d = straightLineDistance(boxes[i], boxes[j]);
      distances.set([key(boxes[i]), key(boxes[j])].join('-'), d);
    }
  }

  const sorted = Array.from(distances.entries()).toSorted((a, b) => a[1] - b[1]);
  console.log(sorted);

  let circuits: Set<string>[] = boxes.map((b) => new Set([key(b)]));
  const connections = new Set<string>();
  let i = 0;
  let part1Reported = false;

  while (circuits.length > 1) {
    const connection = sorted[i][0];
    const [aKey, bKey] = connection.split('-').map(unkey);

    const aCircuit = circuits.find((circuit) => circuit.has(key(aKey)))!;
    const bCircuit = circuits.find((circuit) => circuit.has(key(bKey)))!;

    circuits = [
      ...circuits.filter((circuit) => circuit !== aCircuit && circuit !== bCircuit),
      aCircuit.union(bCircuit)
    ];
    connections.add(connection);
    i++;

    if (
      !part1Reported && connections.size >= numberOfConnections
    ) {
      part1Reported = true;
      const sortedCircuits = circuits.toSorted((a, b) => b.size - a.size);
      console.log('Part 1:', product(sortedCircuits.slice(0, 3).map((c) => c.size)));
    }
  }

  const lastConnection = sorted[i - 1][0]
  const [aKey, bKey] = lastConnection.split('-').map(unkey);
  console.log('Part 2:', aKey[0] * bKey[0]);
}

run().catch((e) => console.error(e));
