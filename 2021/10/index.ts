import fs from 'fs/promises';

const PAIRS = {
  '(': ')',
  '{': '}',
  '[': ']',
  '<': '>',
};

const CORRUPT_SCORE = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

const INCOMPLETE_SCORE = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

async function run() {
  const lines = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');

  let errors: number = 0;
  let incompletes: number[] = [];
  for (const line of lines) {
    const stack: string[] = [];
    let corrupt = false;
    for (const char of line) {
      if (PAIRS[char]) {
        stack.push(PAIRS[char]);
      } else if (char === stack.at(-1)) {
        stack.pop();
      } else {
        errors += CORRUPT_SCORE[char];
        corrupt = true;
        break;
      }
    }

    if (!corrupt && stack.length) {
      incompletes.push(stack.reduceRight((acc, cur) => acc * 5 + INCOMPLETE_SCORE[cur], 0));
    }
  }

  console.log('Part 1:', errors);
  incompletes.sort((a, b) => a - b);
  console.log('Part 2:', incompletes[Math.floor(incompletes.length / 2)]);
}

run().catch((e) => console.error(e));
