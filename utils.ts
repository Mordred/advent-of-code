export const sum = (a: number[]) => a.reduce((cur, acc) => acc + cur, 0);

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
  return arr.reduce((acc, cur) => {
    acc[cur] ??= 0;
    acc[cur]++;
    return acc;
  }, {} as Record<string, number>);
}

export const IS_DEBUG = process.argv.includes('--debug');
