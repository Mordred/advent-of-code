import fs from 'fs/promises';

type Grid = string[][];
type direction = 'up' | 'down' | 'left' | 'right';
type Beam = {
  x: number;
  y: number;
  direction: direction;
};

const hash = (beam: Beam) => `${beam.x},${beam.y},${beam.direction}`;
const energizedHash = ({ x, y }: Omit<Beam, 'direction'>) => `${x},${y}`;

function simulate(grid: Grid, x: number, y: number, direction: direction) {
  const beams: Beam[] = [
    {
      x,
      y,
      direction,
    },
  ];
  const seen = new Set<string>();
  const energized = new Set<string>();

  function moveAndAddBeam(beam: Beam) {
    let x: number, y: number;
    switch (beam.direction) {
      case 'right':
        x = beam.x + 1;
        y = beam.y;
        break;
      case 'left':
        x = beam.x - 1;
        y = beam.y;
        break;
      case 'up':
        x = beam.x;
        y = beam.y - 1;
        break;
      case 'down':
        x = beam.x;
        y = beam.y + 1;
        break;
    }

    const nextBeam = { x, y, direction: beam.direction };
    const h = hash(nextBeam);
    if (!seen.has(h)) {
      seen.add(h);
      beams.push(nextBeam);
    }
  }

  while (beams.length) {
    const beam = beams.shift()!;
    const current = grid[beam.y]?.[beam.x];

    if (current === undefined) {
      continue;
    }

    energized.add(energizedHash({ x: beam.x, y: beam.y }));

    switch (current) {
      case '.': {
        moveAndAddBeam({ ...beam, direction: beam.direction });
        break;
      }
      case '/': {
        const nextDirection: direction =
          beam.direction === 'up'
            ? 'right'
            : beam.direction === 'right'
            ? 'up'
            : beam.direction === 'down'
            ? 'left'
            : 'down';
        moveAndAddBeam({ ...beam, direction: nextDirection });
        break;
      }
      case '\\': {
        const nextDirection: direction =
          beam.direction === 'up'
            ? 'left'
            : beam.direction === 'right'
            ? 'down'
            : beam.direction === 'down'
            ? 'right'
            : 'up';
        moveAndAddBeam({ ...beam, direction: nextDirection });
        break;
      }
      case '-': {
        if (beam.direction === 'left' || beam.direction === 'right') {
          moveAndAddBeam({ ...beam, direction: beam.direction });
        } else {
          moveAndAddBeam({ ...beam, direction: 'left' });
          moveAndAddBeam({ ...beam, direction: 'right' });
        }
        break;
      }
      case '|': {
        if (beam.direction === 'up' || beam.direction === 'down') {
          moveAndAddBeam({ ...beam, direction: beam.direction });
        } else {
          moveAndAddBeam({ ...beam, direction: 'up' });
          moveAndAddBeam({ ...beam, direction: 'down' });
        }
        break;
      }
    }
  }

  return energized.size;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split('')) as Grid;

  console.log('Part 1:', simulate(grid, 0, 0, 'right'));

  let max = 0;
  for (let y = 0; y < grid.length; y++) {
    let right = simulate(grid, 0, y, 'right');
    if (right > max) {
      max = right;
    }
    let left = simulate(grid, grid[0].length - 1, y, 'left');
    if (left > max) {
      max = left;
    }
  }
  for (let x = 0; x < grid[0].length; x++) {
    let down = simulate(grid, x, 0, 'down');
    if (down > max) {
      max = down;
    }
    let up = simulate(grid, x, grid.length - 1, 'up');
    if (up > max) {
      max = up;
    }
  }

  console.log('Part 2:', max);
}

run().catch((e) => console.error(e));
