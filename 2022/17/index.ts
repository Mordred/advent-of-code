import fs from 'fs/promises';

const ROCKS = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ], // Horizontal
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ], // Plus
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
  ], // Backwards L
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ], // Vertical
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ], // Square
];

const getRock = (t: number, y: number) => {
  // starting at 2
  return ROCKS[t % ROCKS.length].map(([rx, ry]) => [rx + 2, ry + y]);
};

const ITER = 1000000000000;

const left = (walls: Set<string>, rock: number[][]) => {
  const newRock = rock.map(([x, y]) => [x - 1, y]);
  if (newRock.some((v) => walls.has(v.join()) || v[0] < 0)) {
    return rock;
  }

  return newRock;
};

const right = (walls: Set<string>, rock: number[][]) => {
  const newRock = rock.map(([x, y]) => [x + 1, y]);
  if (newRock.some((v) => walls.has(v.join()) || v[0] > 6)) {
    return rock;
  }

  return newRock;
};

// Keep only 30 height
function signature(walls: Set<string>, top: number) {
  return Array.from(walls.values())
    .reduce((acc, cur) => {
      const [x, y] = cur.split(',');
      const newY = top - +y;
      if (newY <= 30) {
        acc.push([x, newY].join());
      }
      return acc;
    }, [] as string[])
    .sort()
    .join(' ');
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const data = raw.split('');

  const walls = new Set<string>(Array.from({ length: 7 }, (v, i) => [i, 0].join()));

  let t = 0;
  let i = 0;
  let top = 0;
  let added = 0;
  let seen: { [key: string]: [number, number] } = {};
  while (t < ITER) {
    let rock = getRock(t, top + 4);
    while (true) {
      if (data[i] === '<') {
        rock = left(walls, rock);
      } else {
        rock = right(walls, rock);
      }
      i = (i + 1) % data.length;

      // Move down
      const newRock = rock.map(([x, y]) => [x, y - 1]);
      if (newRock.some((v) => walls.has(v.join()))) {
        rock.forEach((v) => {
          if (v[1] > top) {
            top = v[1];
          }
          walls.add(v.join());
        });

        const key = `${i};${t % ROCKS.length};${signature(walls, top)}`;
        if (seen[key] && t >= 2022) {
          const [oldT, oldTop] = seen[key];
          const dy = top - oldTop;
          const dt = t - oldT;
          const amt = Math.floor((ITER - t) / dt);
          added += amt * dy;
          t += amt * dt;
          if (t > ITER) {
            throw new Error(`Bad ${t}`);
          }
        }

        seen[key] = [t, top];
        break;
      }
      rock = newRock;
    }

    t++;
    if (t === 2022) {
      console.log('Part 1:', top);
    }
  }
  console.log('Part 2:', top + added);
}

run().catch((e) => console.error(e));
