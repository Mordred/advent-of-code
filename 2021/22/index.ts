import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);

type Cube = [[number, number], [number, number], [number, number]];
type Step = [boolean, Cube];

function isOverlapping(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[1] && a[1] >= b[0];
}

function intersection(a: Cube, b: Cube): Cube {
  if (isOverlapping(a[0], b[0]) && isOverlapping(a[1], b[1]) && isOverlapping(a[2], b[2])) {
    return [
      [Math.max(a[0][0], b[0][0]), Math.min(a[0][1], b[0][1])],
      [Math.max(a[1][0], b[1][0]), Math.min(a[1][1], b[1][1])],
      [Math.max(a[2][0], b[2][0]), Math.min(a[2][1], b[2][1])],
    ];
  }

  return null;
}

function volume(cube: Cube) {
  return cube.reduce((acc, cur) => acc * (cur[1] - cur[0] + 1), 1);
}

function calculate(steps: Step[]): number {
  const on: Cube[] = [];
  const off: Cube[] = [];
  let litCount = 0;

  for (const step of steps) {
    const onAppend = [];
    const offAppend = [];

    const [state, cube] = step;

    if (state) {
      onAppend.push(cube);
      litCount += volume(cube);
    }

    for (const onCube of on) {
      const inter = intersection(cube, onCube);
      if (inter) {
        litCount -= volume(inter);
        offAppend.push(inter);
      }
    }

    for (const offCube of off) {
      const inter = intersection(cube, offCube);
      if (inter) {
        litCount += volume(inter);
        onAppend.push(inter);
      }
    }

    on.push(...onAppend);
    off.push(...offAppend);
  }

  return litCount;
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const steps = data.split('\n').map((l) => {
    const [state, coords] = l.split(' ');
    return [state === 'on', coords.split(',').map((v) => v.split('=')[1].split('..').map(toInt))] as Step;
  });

  console.log(
    'Part 1:',
    calculate(
      steps.reduce((acc, [s, c]) => {
        const inter = intersection(c, [
          [-50, 50],
          [-50, 50],
          [-50, 50],
        ]);
        if (inter) {
          acc.push([s, inter]);
        }
        return acc;
      }, []),
    ),
  );
  console.log('Part 2:', calculate(steps));
}

run().catch((e) => console.error(e));
