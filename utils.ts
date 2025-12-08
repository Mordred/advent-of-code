export const sum = (a: number[]) => a.reduce((cur, acc) => acc + cur, 0);

export const product = (a: number[]) => a.reduce((cur, acc) => acc * cur, 1);

export const toInt = (v: string) => parseInt(v, 10);

export function hashCode(v: string) {
  let hash = 0;
  let i: number;
  let chr: number;

  if (v.length === 0) return hash;
  for (i = 0; i < v.length; i++) {
    chr = v.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function counts(arr: string[] | number[]): Record<string, number> {
  return arr.reduce(
    (acc, cur) => {
      acc[cur] ??= 0;
      acc[cur]++;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export const IS_DEBUG = process.argv.includes("--debug");

// floor division
// a = (a // b) * b + (a % b)
export function intDivide(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}

// modulo that handles negative numbers correctly
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export type Coords = [number, number];

export function* neighborhood<T>(grid: T[][], x: number, y: number): Generator<Coords> {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) {
        continue;
      }
      const y2 = y + i;
      const x2 = x + j;

      if (y2 >= grid.length || y2 < 0) {
        continue;
      }

      if (x2 >= grid[y2].length || x2 < 0) {
        continue;
      }

      yield [x2, y2];
    }
  }
}

export function printGrid<T>(grid: T[][]): void {
  for (const row of grid) {
    console.log(row.join(''));
  }
  console.log('')
}

export type Range = [number, number];

export function isOverlapping(a: Range, b: Range): boolean {
  return a[0] <= b[1] && a[1] >= b[0];
}

export function mergeRanges(intervals: Range[]) {
  return intervals.reduce((acc, cur) => {
    const overlaps = acc
      .filter((a) => isOverlapping(a, [cur[0], cur[1]]))
      .concat([cur[0], cur[1]])
      .flat();
    return acc
      .filter((a) => !isOverlapping(a, [cur[0], cur[1]]))
      .concat([[Math.min(...overlaps), Math.max(...overlaps)]]);
  }, [] as Range[])
}

export function transpose<T>(grid: T[][]): T[][] {
  return grid[0].map((_, i) => grid.map((row) => row[i]));
}
