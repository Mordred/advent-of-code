import fs from 'fs/promises';

type Coords = [number, number];
type NextCoords = (current: Coords) => Coords | null;
type IsVisible = boolean;
type Steps = number;

function isVisible(data: number[][], start: Coords, next: NextCoords): [IsVisible, Steps] {
  let [r, c] = start;
  let height = data[r][c];

  let nextCoords: Coords;
  let steps = 0;

  while ((nextCoords = next([r, c]))) {
    steps++;
    [r, c] = nextCoords;
    if (data[r][c] >= height) {
      return [false, steps];
    }
  }

  return [true, steps];
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('\n').map((r) => r.split('').map((v) => +v));

  let part1 = data[0].length + data.at(-1).length + (data.length - 2) * 2;
  let part2 = 0;

  for (let row = 1; row < data.length - 1; row++) {
    for (let col = 1; col < data[row].length - 1; col++) {
      const top = isVisible(data, [row, col], ([r, c]: Coords) => (r > 0 ? [r - 1, c] : null));
      const left = isVisible(data, [row, col], ([r, c]: Coords) => (c > 0 ? [r, c - 1] : null));
      const bottom = isVisible(data, [row, col], ([r, c]: Coords) => (r < data.length - 1 ? [r + 1, c] : null));
      const right = isVisible(data, [row, col], ([r, c]: Coords) => (c < data[row].length - 1 ? [r, c + 1] : null));

      if (top[0] || left[0] || right[0] || bottom[0]) {
        part1++;
      }

      const viewScore = top[1] * left[1] * bottom[1] * right[1];
      if (viewScore > part2) {
        part2 = viewScore;
      }
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
