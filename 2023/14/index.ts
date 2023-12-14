import fs from 'fs/promises';

type Grid = string[][];
type Coords = [number, number];

const directions = {
  N: [0, -1],
  W: [-1, 0],
  S: [0, 1],
  E: [1, 0],
} as const;
type Side = keyof typeof directions;

function roll(grid: Grid, [x, y]: Coords, side: Side): Grid {
  const [dx, dy] = directions[side];
  // We found a rock
  if (grid[y][x] === 'O') {
    let localCoords = [x, y];
    let nextCoords = [x + dx, y + dy];
    // Roll it in the direction if we have a space
    while (grid[nextCoords[1]]?.[nextCoords[0]] === '.') {
      grid[nextCoords[1]][nextCoords[0]] = 'O';
      grid[localCoords[1]][localCoords[0]] = '.';
      localCoords = nextCoords;
      nextCoords = [localCoords[0] + dx, localCoords[1] + dy];
    }
  }

  // Run again with next item
  let nextCoord: Coords = [x - dx, y - dy];
  if (grid[nextCoord[1]]?.[nextCoord[0]]) {
    return roll(grid, nextCoord, side);
  }

  return grid;
}

function rollGrid(grid: Grid, side: Side): Grid {
  switch (side) {
    case 'N': {
      // Move all to top side
      for (let i = 0; i < grid.length; i++) {
        grid = roll(grid, [i, 0], side);
      }
      return grid;
    }
    case 'S': {
      // Move all to bottom side
      for (let i = grid.length - 1; i >= 0; i--) {
        grid = roll(grid, [i, grid.length - 1], side);
      }
      return grid;
    }
    case 'E': {
      // Move all to left side
      for (let i = grid[0].length - 1; i >= 0; i--) {
        grid = roll(grid, [grid[0].length - 1, i], side);
      }
      return grid;
    }
    case 'W': {
      // Move all to right side
      for (let i = 0; i < grid[0].length; i++) {
        grid = roll(grid, [0, i], side);
      }
      return grid;
    }
  }
  return grid;
}

function gridToString(grid: Grid): string {
  return grid.map((line) => line.join('')).join('\n');
}

function cycle(grid: Grid): Grid {
  grid = rollGrid(grid, 'N');
  grid = rollGrid(grid, 'W');
  grid = rollGrid(grid, 'S');
  grid = rollGrid(grid, 'E');
  return grid;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split('')) as Grid;

  let rolled = rollGrid([...grid.map((l) => [...l])], 'N');
  let part1 = rolled.reduce((acc, line, index) => {
    return acc + line.filter((v) => v === 'O').length * (grid.length - index);
  }, 0);
  console.log('Part 1:', part1);

  let i = 0;
  let iterations = [gridToString(rolled)];

  rolled = [...grid.map((l) => [...l])];
  while (i < 1000000000) {
    i++;
    rolled = cycle(rolled);
    const gridString = gridToString(rolled);
    // Break early if we've seen this grid before
    if (iterations.includes(gridString)) {
      break;
    }
    iterations.push(gridString);
  }
  // Find the first time we saw this grid
  let first = iterations.indexOf(gridToString(rolled));
  // Roll forward next i - first cycles
  rolled = iterations[((1000000000 - first) % (i - first)) + first].split('\n').map((line) => line.split('')) as Grid;
  let part2 = rolled.reduce((acc, line, index) => {
    return acc + line.filter((v) => v === 'O').length * (grid.length - index);
  }, 0);
  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
