import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';
import { prod } from 'mathjs';

// https://pressbooks.bccampus.ca/algebraintermediate/chapter/solve-quadratic-equations-using-the-quadratic-formula/
// x * (time - x) = distance
// -x^2 + time * x = distance
// (x^2)/(-1) + (time * x) / (-1) = distance / (-1)
// x^2 + (time / (-1)) * x = distance / (-1)
// x^2 + (time / 2) * x + ((time * time) / (4 * (-1) ^ 2)) = distance / (-1) + ((time * time) / (4 * (-1) ^ 2))
// (x + (time / 2 * (-1))) ^ 2 = distance / (-1) + ((time * time) / (4 * (-1) ^ 2))
// (x + (time / 2 * (-1))) ^ 2 = -distance + (time * time) / 4
// x + (time / 2 * (-1)) = sqrt(-distance + (time * time) / 4)
// x = sqrt(-distance + (time * time) / 4) + (time / 2)
// x = (time / 2) +/- sqrt((time * time) / 4 - distance)
function upper(time: number, distance: number) {
  const solution = (time / 2) + Math.sqrt((time * time) / 4 - distance);
  // No decimals -> decrement
  return solution === Math.floor(solution) ? solution - 1 : Math.floor(solution);
}

function lower(time: number, distance: number) {
  const solution = (time / 2) - Math.sqrt((time * time) / 4 - distance);
  // No decimals -> increment
  return solution === Math.ceil(solution) ? solution + 1 : Math.ceil(solution);
}

function solution(time: number, distance: number) {
  return upper(time, distance) - lower(time, distance) + 1;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [timesLine, distancesLine] = raw.trim().split('\n');
  const times = timesLine.replace('Time: ', '').trim().split(/\s+/).map(toInt);
  const distances = distancesLine.replace('Distance: ', '').trim().split(/\s+/).map(toInt);

  console.log('Part 1:' ,prod(times.map((t, i) => solution(t, distances[i]))))
  console.log('Part 2:', solution(toInt(times.join('')), toInt(distances.join(''))));
}

run().catch((e) => console.error(e));
