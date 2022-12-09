import fs from 'fs/promises';

type Coords = [number, number];
type Dir = 'R' | 'L' | 'U' | 'D';

const isTouching = (h: Coords, t: Coords) =>
  (h[0] === t[0] - 1 && h[1] === t[1] - 1) ||
  (h[0] === t[0] && h[1] === t[1] - 1) ||
  (h[0] === t[0] + 1 && h[1] === t[1] - 1) ||
  (h[0] === t[0] - 1 && h[1] === t[1]) ||
  (h[0] === t[0] && h[1] === t[1]) ||
  (h[0] === t[0] + 1 && h[1] === t[1]) ||
  (h[0] === t[0] - 1 && h[1] === t[1] + 1) ||
  (h[0] === t[0] && h[1] === t[1] + 1) ||
  (h[0] === t[0] + 1 && h[1] === t[1] + 1);

const follow = (h: Coords, t: Coords): Coords => {
  if (isTouching(h, t)) {
    return t;
  }

  const dx = h[0] - t[0];
  const dy = h[1] - t[1];

  if (h[0] === t[0]) {
    if (h[1] < t[1]) {
      return [h[0], h[1] + 1];
    } else {
      return [h[0], h[1] - 1];
    }
  } else if (h[1] === t[1]) {
    if (h[0] < t[0]) {
      return [h[0] + 1, h[1]];
    } else {
      return [h[0] - 1, h[1]];
    }
  } else if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
    return [
      t[0] + (dx < 0 ? -1 : 1),
      t[1] + (dy < 0 ? -1 : 1)
    ]
  }
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('\n').map((r) => {
    const [dir, steps] = r.split(' ');
    return [dir, +steps] as [Dir, number];
  });

  let part1 = new Set<string>();
  let part2 = new Set<string>();

  let head: Coords = [0, 0];
  let tail: Coords = [0, 0];
  let knots: Coords[] = Array.from({ length: 10 }, () => [0, 0]);

  for (const [dir, steps] of data) {
    for (let step = 1; step <= steps; step++) {
      switch (dir) {
        case 'R': {
          head = [head[0] + 1, head[1]];
          break;
        }
        case 'L': {
          head = [head[0] - 1, head[1]];
          break;
        }
        case 'U': {
          head = [head[0], head[1] + 1];
          break;
        }
        case 'D': {
          head = [head[0], head[1] - 1];
          break;
        }
      }

      tail = follow(head, tail);
      knots[0] = head
      for (let i = 1; i < knots.length; i++) {
        knots[i] = follow(knots[i - 1], knots[i]);
      }


      part1.add(tail.join(','));
      part2.add(knots.at(-1).join(','));
    }
  }

  console.log('Part 1', part1.size);
  console.log('Part 2', part2.size);
}

run().catch((e) => console.error(e));
