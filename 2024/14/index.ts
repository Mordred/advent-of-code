import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';
import { prod } from 'mathjs';

const X = 101;
const Y = 103;
const MID_X = Math.floor(X / 2);
const MID_Y = Math.floor(Y / 2);

type Coords = [number, number];

const hash = (coords: Coords) => coords.join(',');

interface Robot {
  position: Coords;
  velocity: Coords;
  quadrant: number;
}

const ROBOT_RE = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;

function toImage(robots: Robot[]) {
  const lines: string[] = [];
  const map: Record<string, Robot[]> = {};
  for (const robot of robots) {
    const key = hash(robot.position);
    map[key] ??= [];
    map[key].push(robot);
  }

  for (let y = 0; y < Y; y++) {
    let line = '';
    for (let x = 0; x < X; x++) {
      const key = hash([x, y]);
      if (map[key]) {
        line += '#'; // map[key].length;
      } else {
        line += '.';
      }
    }
    lines.push(line);
  }

  return lines.join('\n');
}

function move(robot: Robot): Robot {
  robot.position[0] += robot.velocity[0];
  robot.position[1] += robot.velocity[1];
  if (robot.position[0] < 0) {
    robot.position[0] = X + robot.position[0];
  } else {
    robot.position[0] %= X;
  }

  if (robot.position[1] < 0) {
    robot.position[1] = Y + robot.position[1];
  } else {
    robot.position[1] %= Y;
  }

  robot.quadrant = getQuadrant(robot.position);
  return robot;
}

const getQuadrant = ([x, y]: Coords) => {
  if (x < MID_X && y < MID_Y) {
    return 1;
  } else if (x > MID_X && y < MID_Y) {
    return 2;
  } else if (x < MID_X && y > MID_Y) {
    return 3;
  } else if (x > MID_X && y > MID_Y) {
    return 4;
  } else {
    return 0;
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n').map((line) => {
    const match = ROBOT_RE.exec(line);
    const position = [toInt(match![1]), toInt(match![2])] as Coords;
    return {
      position,
      velocity: [toInt(match![3]), toInt(match![4])] as Coords,
      quadrant: getQuadrant(position),
    };
  });

  let robots = structuredClone(data);
  for (let t = 0; t < 100; t++) {
    for (const robot of robots) {
      move(robot);
    }
  }

  const quadrants = robots.reduce(
    (acc, cur) => {
      if (cur.quadrant === 0) {
        return acc;
      }
      acc[cur.quadrant] ??= 0;
      acc[cur.quadrant]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('Part 1:', prod(Object.values(quadrants)));

  robots = structuredClone(data);
  let i = 0;
  do {
    i++;
    for (const robot of robots) {
      move(robot);
    }

    const image = toImage(robots);
    // If there is a tree -> image must include multiple # in a row
    // Try at least 5 consecutive # in a row --> no visual tree printed
    // Try at least 6 consecutive # in a row - no!
    // Try at least 7 consecutive # in a row - no!
    // Try at least 8 consecutive # in a row - yes!
    if (image.includes('########')) {
      console.log(`\n${image}\n`);
      break;
    }
  } while (true);

  console.log('Part 2:', i);
}

run().catch((e) => console.error(e));
