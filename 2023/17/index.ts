import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';
import Heap from 'mnemonist/heap.js';

type Grid = number[][];

const direction = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

type State = {
  x: number;
  y: number;
  stepsInDirection: number;
  direction: keyof typeof direction;
  heatLoss: number;
};

const hash = ({ x, y, direction, stepsInDirection }: State) => `${x},${y},${direction},${stepsInDirection}`;

function traverse(grid: Grid, minSteps = 0, maxSteps = 3) {
  let seen = new Set<string>();

  const heap = new Heap((a: State, b: State) => a.heatLoss - b.heatLoss);
  heap.push({
    x: 0,
    y: 0,
    stepsInDirection: 0,
    direction: 'right',
    heatLoss: 0,
  });
  heap.push({
    x: 0,
    y: 0,
    stepsInDirection: 0,
    direction: 'down',
    heatLoss: 0,
  });

  const moveAndAddState = (state: State) => {
    let x = state.x + direction[state.direction][0];
    let y = state.y + direction[state.direction][1];
    const heatLoss = grid[y]?.[x];
    if (heatLoss !== undefined) {
      heap.push({
        x,
        y,
        stepsInDirection: state.stepsInDirection + 1,
        direction: state.direction,
        heatLoss: state.heatLoss + heatLoss,
      });
    }
  };

  while (heap.size) {
    const current = heap.pop();

    if (current.x === grid.at(-1).length - 1 && current.y === grid.length - 1 && current.stepsInDirection >= minSteps) {
      return current.heatLoss;
    }

    const h = hash(current);
    if (seen.has(h) || grid[current.y]?.[current.x] === undefined) {
      continue;
    }

    seen.add(h);

    // Continue same direction
    if (current.stepsInDirection < maxSteps) {
      moveAndAddState(current);
    }

    // Turn left or turn right
    if (current.stepsInDirection >= minSteps) {
      switch (current.direction) {
        case 'down':
        case 'up': {
          moveAndAddState({ ...current, direction: 'left', stepsInDirection: 0 });
          moveAndAddState({ ...current, direction: 'right', stepsInDirection: 0 });
          break;
        }
        case 'right':
        case 'left': {
          moveAndAddState({ ...current, direction: 'up', stepsInDirection: 0 });
          moveAndAddState({ ...current, direction: 'down', stepsInDirection: 0 });
          break;
        }
      }
    }
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const grid = raw.split('\n').map((line) => line.split('').map(toInt)) as Grid;

  console.log('Part 1:', traverse(grid));
  console.log('Part 2:', traverse(grid, 4, 10));
}

run().catch((e) => console.error(e));
