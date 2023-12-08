import fs from 'fs/promises';
import { lcm } from 'mathjs';

type Map = {
  [key: string]: {
    left: string;
    right: string;
  };
};

function processInstruction(instruction: string, current: string, map: Map) {
  switch (instruction) {
    case 'L':
      current = map[current].left;
      break;
    case 'R':
      current = map[current].right;
      break;
  }
  return current;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [instructions, nodesLines] = raw.trim().split('\n\n');

  const map = nodesLines
    .trim()
    .split('\n')
    .reduce((acc, line) => {
      const [node, children] = line.trim().split(' = ');
      const [left, right] = children.split(', ');
      acc[node] = {
        left: left.substring(1),
        right: right.substring(0, right.length - 1),
      };
      return acc;
    }, {} as Map);

  let part1 = 0;
  let current = 'AAA';
  while (current !== 'ZZZ') {
    current = processInstruction(instructions[part1 % instructions.length], current, map);
    part1++;
  }
  console.log('Part 1:', part1);

  let current2 = Object.keys(map).filter((key) => key.endsWith('A'));
  let countsToZ = current2.map((c) => {
    let count = 0;
    while (!c.endsWith('Z')) {
      c = processInstruction(instructions[count % instructions.length], c, map);
      count++;
    }
    return count;
  });
  console.log('Part 2:', countsToZ.reduce((acc, cur) => lcm(acc, cur), 1));
}

run().catch((e) => console.error(e));
