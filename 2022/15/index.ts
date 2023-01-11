import fs from 'fs/promises';
import { toInt } from '#aoc/utils.js';

type Coords = [number, number];
type IntervalWithY = [number, number, number];
type Interval = [number, number];
interface Data {
  sensor: Coords;
  beacon: Coords;
}

const MAX = 4000000;
const MIN = 0;

function* area([x, y]: Coords, distance: number): Generator<IntervalWithY> {
  for (let i = 0; i <= distance; i++) {
    yield [x - i, x + i, y - (distance - i)];
    if (i !== distance) {
      yield [x - i, x + i, y + (distance - i)];
    }
  }
}

function isOverlapping(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[1] && a[1] >= b[0];
}

function inRange(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function merge(intervals: Interval[]) {
  return intervals.reduce((acc, cur) => {
    const overlaps = acc
      .filter((a) => isOverlapping(a, [cur[0], cur[1]]))
      .concat([cur[0], cur[1]])
      .flat();
    return acc
      .filter((a) => !isOverlapping(a, [cur[0], cur[1]]))
      .concat([[Math.min(...overlaps), Math.max(...overlaps)]]);
  }, [])
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('\n').map((l) => {
    const match = /Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/.exec(l);
    return {
      sensor: [toInt(match[1]), toInt(match[2])],
      beacon: [toInt(match[3]), toInt(match[4])],
    } as Data;
  });

  const part1Intervals: Interval[] = [];
  const part2Grid: { [y: number]: Interval[] } = {};

  for (const d of data) {
    const distance = Math.abs(d.sensor[1] - d.beacon[1]) + Math.abs(d.sensor[0] - d.beacon[0]);
    for (let [x1, x2, y] of area(d.sensor, distance)) {
      if (y === 2000000) {
        part1Intervals.push([x1, x2]);
      }

      if (y >= MIN && y <= MAX) {
        part2Grid[y] = (part2Grid[y] ?? []);
        part2Grid[y].push([inRange(x1, MIN, MAX), inRange(x2, MIN, MAX)]);
      }
    }
  }

  console.log('Part 1', merge(part1Intervals).reduce((acc, cur) => acc + (cur[1] - cur[0]), 0));

  for (let i = 0; i <= 4000000; i++) {
    const intervals = merge(part2Grid[i])
    // What if multiple points found?
    if (intervals.length > 1) {
      console.log('Part 2', (intervals[0][1] + 1) * 4000000 + i);
    }
  }
}

run().catch((e) => console.error(e));
