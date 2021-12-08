import fs from 'fs/promises';

const sortStr = (v: string) => v.split('').sort().join();

async function run() {
  const lines = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');

  const data = lines.map((line) => line.split(/\s+\|\s+/).map((d) => d.split(/\s+/g)));

  const digits = {};
  for (const [signal, values] of data) {
    for (const val of values) {
      digits[val.length] = (digits[val.length] ?? 0) + 1;
    }
  }

  console.log('Part 1:', digits[2] + digits[4] + digits[3] + digits[7]);

  let sum = 0;
  for (const [signal, values] of data) {
    const sorted = signal.sort((a, b) => a.length - b.length);
    const one = sorted[0];
    const seven = sorted[1];
    const four = sorted[2];
    const eight = sorted.at(-1);

    const s235 = signal.slice(3, 6);
    const s069 = signal.slice(6, 9);

    const six = s069.find((s) => !one.split('').every((v) => s.includes(v)));
    const three = s235.find((s) => one.split('').every((v) => s.includes(v)));
    const nine = s069.find((s) => three.split('').every((v) => s.includes(v)));
    const zero = s069.find((s) => s !== six && s !== nine);
    const five = s235.find((s) => s !== three && s.split('').every((v) => nine.includes(v)));
    const two = s235.find((s) => s !== three && s !== five);

    const numbers = {
      [sortStr(one)]: 1,
      [sortStr(two)]: 2,
      [sortStr(three)]: 3,
      [sortStr(four)]: 4,
      [sortStr(five)]: 5,
      [sortStr(six)]: 6,
      [sortStr(seven)]: 7,
      [sortStr(eight)]: 8,
      [sortStr(nine)]: 9,
      [sortStr(zero)]: 0,
    };

    const result = values.map((v) => numbers[sortStr(v)]).join('');
    sum += parseInt(result, 10);
  }

  console.log('Part 2:', sum);
}

run().catch((e) => console.error(e));
