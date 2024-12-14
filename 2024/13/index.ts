import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';

const round = (n: number, digits: number) => Math.round(n * 10 ** digits) / 10 ** digits;

type Coords = [number, number];

interface Machine {
  A: Coords;
  B: Coords;
  prize: Coords;
}

const BUTTON_RE = /X\+(\d+), Y\+(\d+)/;
const PRICE_RE = /X=(\d+), Y=(\d+)/;

// A * Ax + B * Bx = Px
// A * Ay + B * By = Py
function solve(machine: Machine) {
  const M = [
    [machine.A[0], machine.B[0]],
    [machine.A[1], machine.B[1]],
  ];

  const determinant = machine.A[0] * machine.B[1] - machine.A[1] * machine.B[0];
  if (determinant === 0) {
    return null;
  }

  const invM = [
    [M[1][1] / determinant, -M[0][1] / determinant],
    [-M[1][0] / determinant, M[0][0] / determinant],
  ];

  // Round to prevent floating point errors
  const A = round(invM[0][0] * machine.prize[0] + invM[0][1] * machine.prize[1], 3);
  const B = round(invM[1][0] * machine.prize[0] + invM[1][1] * machine.prize[1], 3);

  if (Number.isInteger(A) && Number.isInteger(B) && A >= 0 && B >= 0) {
    return { A, B };
  }

  return null;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('\n\n').map((block) => {
    const [a, b, price] = block.split('\n');
    const Amatch = BUTTON_RE.exec(a);
    const Bmatch = BUTTON_RE.exec(b);
    const Pmatch = PRICE_RE.exec(price);
    if (!Amatch || !Bmatch || !Pmatch) {
      throw new Error('Invalid block');
    }

    return {
      A: [toInt(Amatch[1]), toInt(Amatch[2])] as Coords,
      B: [toInt(Bmatch[1]), toInt(Bmatch[2])] as Coords,
      prize: [toInt(Pmatch[1]), toInt(Pmatch[2])] as Coords,
    } as Machine;
  });

  let part1 = 0;
  for (const machine of data) {
    const result = solve(machine);
    if (result) {
      part1 += result.A * 3 + result.B;
    }
  }

  console.log('Part 1:', part1);

  let part2 = 0;
  for (const machine of data) {
    const result = solve({
      ...machine,
      prize: [machine.prize[0] + 10000000000000, machine.prize[1] + 10000000000000] as Coords,
    });
    if (result) {
      part2 += result.A * 3 + result.B;
    }
  }

  console.log('Part 2:', part2);
}

run().catch((e) => console.error(e));
