import fs from 'fs/promises';

const transposeFn = (matrix) =>matrix[0].map((_, i) => matrix.map((r) => r[i]));
const sumFn = (vals) => vals.reduce((acc, cur) => acc + cur, 0);


async function run() {
  const values = (await fs.readFile('./input.txt', 'utf-8'))
    .trim()
    .split('\n');

  const matrix = values.map((v) => v.split('').map((v) => parseInt(v, 2)));
  const transpose = transposeFn(matrix);

  let gamma = '';
  let epsilon = '';
  for (const row of transpose) {
    const sum = sumFn(row);
    gamma += sum >= row.length - sum ? '1' : '0';
    epsilon += sum >= row.length - sum ? '0' : '1';
  }

  console.log('Part 1:', parseInt(gamma, 2) * parseInt(epsilon, 2));

  let O2 = [...values];

  let index = 0;
  while (O2.length > 1) {
    const sum = sumFn(O2.map((row) => parseInt(row[index], 2)));
    O2 = O2.filter((b) => b[index] === (sum >= O2.length - sum ? '1' : '0'))
    index++;
  }

  let CO2 = [...values];
  index = 0;
  while (CO2.length > 1) {
    const sum = sumFn(CO2.map((row) => parseInt(row[index], 2)));
    CO2 = CO2.filter((b) => b[index] === (sum >= CO2.length - sum ? '0' : '1'))
    index++;
  }

  console.log('Part 2:', parseInt(O2[0], 2) * parseInt(CO2[0], 2));
}

run().catch((e) => console.error(e));
