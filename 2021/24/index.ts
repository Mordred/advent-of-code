import 'colors';
import fs from 'fs/promises';

const toInt = (v: string) => parseInt(v, 10);

interface Complex {
  '': number;
  [x: string]: number;
}

type Register = Complex;

interface State {
  w: Register;
  x: Register;
  y: Register;
  z: Register;
  input: number;
  possible: [[Complex, number], [Complex, number]][];
}

function remove(arr: string[], value: string): string[] {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function complexToString(num: Complex): string {
  return (
    Object.keys(num)
      .sort()
      .reduce((acc, cur) => {
        if (num[cur] === 0) {
          return acc;
        }

        if (cur === '') {
          acc.push(num[cur].toString());
        } else if (num[cur] === 1) {
          acc.push(cur.green);
        } else {
          acc.push(`${num[cur]}*${cur.green}`);
        }
        return acc;
      }, [])
      .join('+') || '0'
  );
}

function complexToNum(num: Complex, input: number[]): number {
  return Object.keys(num)
    .sort()
    .reduce((acc, cur, i) => {
      if (num[cur] === 0) {
        return acc;
      }

      if (cur === '') {
        acc.push(num[cur]);
        return acc;
      }

      if (num[cur] === 1) {
        acc.push(input[i - 1]);
      } else {
        acc.push(num[cur] * input[i - 1]);
      }
      return acc;
    }, [])
    .reduce((acc, cur) => acc + cur, 0);
}

function* range(length: number): Generator<number> {
  if (length === 0) {
    return;
  }

  const start = toInt('1'.repeat(length));
  const end = toInt('9'.repeat(length));
  for (let i = start; i <= end; i++) {
    if (i.toString().includes('0')) {
      continue;
    }

    yield i;
  }
}

const registers = ['w', 'x', 'y', 'z'];

function wrap(state: State, instruction: string[]): State[] {
  const newState = { ...state };
  const result: State[] = [];
  switch (instruction[0]) {
    case 'inp': {
      newState[instruction[1]] = { [`x${state.input}`]: 1, '': 0 } as Complex;
      newState.input = state.input + 1;
      break;
    }
    case 'add': {
      const a: Complex = state[instruction[1]];
      const b: Complex = registers.includes(instruction[2]) ? state[instruction[2]] : { '': toInt(instruction[2]) };
      newState[instruction[1]] = Object.keys(b).reduce((acc, cur) => {
        const res = (acc[cur] ?? 0) + b[cur];
        if (cur === '' || res !== 0) {
          acc[cur] = res;
        }
        return acc;
      }, a);
      break;
    }
    case 'mul': {
      const a: Complex = state[instruction[1]];
      const b: Complex = registers.includes(instruction[2]) ? state[instruction[2]] : { '': toInt(instruction[2]) };
      newState[instruction[1]] = Object.keys(a).reduce((acc, cur) => {
        Object.keys(b).forEach((cur2) => {
          const res = (a[cur] ?? 1) * (b[cur2] ?? 1);
          const key = [...cur.split('*'), ...cur2.split('*')].filter(Boolean).sort().join('*');
          if (key === '' || res !== 0) {
            acc[key] = res;
          }
        });
        return acc;
      }, {});
      break;
    }
    case 'div': {
      const a: Complex = state[instruction[1]];
      const b: Complex = registers.includes(instruction[2]) ? state[instruction[2]] : { '': toInt(instruction[2]) };
      newState[instruction[1]] = Object.keys(a).reduce((acc, cur) => {
        Object.keys(b).forEach((cur2) => {
          const res = Math.floor((a[cur] ?? 1) / (b[cur2] ?? 1));
          const segments = remove([...cur.split('*'), ...cur2.split('*')].filter(Boolean), cur2);
          const key = segments.sort().join('*');
          if (key === '' || res !== 0) {
            acc[key] = res;
          }
        });
        return acc;
      }, {});
      break;
    }
    case 'mod': {
      const a: Complex = state[instruction[1]];
      // B is always int
      const b: number = toInt(instruction[2]);
      newState[instruction[1]] = Object.keys(a).reduce((acc, cur) => {
        const res = (a[cur] ?? 1) % b;
        if (cur !== '' && res !== 0 && res !== 1) {
          throw new Error('Implement modulo ');
        }
        if (cur === '' || res !== 0) {
          acc[cur] = res;
        }
        return acc;
      }, {});
      break;
    }
    case 'eql': {
      const a: Complex = state[instruction[1]];
      const b: Complex = registers.includes(instruction[2]) ? state[instruction[2]] : { '': toInt(instruction[2]) };
      const aKeys = Object.keys(a)
        .filter((k) => a[k] !== 0)
        .filter((k) => k !== '');
      const bKeys = Object.keys(b)
        .filter((k) => b[k] !== 0)
        .filter((k) => k !== '');
      const aValues = {};
      const bValues = {};
      if (aKeys.length) {
        for (const i of range(aKeys.length)) {
          aValues[complexToNum(a, i.toString().split('').map(toInt))] = [a, i];
        }
      } else {
        aValues[complexToNum(a, [])] = [a, -1];
      }
      if (bKeys.length) {
        for (const i of range(bKeys.length)) {
          bValues[complexToNum(b, i.toString().split('').map(toInt))] = [b, i];
        }
      } else {
        bValues[complexToNum(b, [])] = [b, -1];
      }

      const aVals = Object.keys(aValues);
      const bVals = Object.keys(bValues);

      if (aKeys.length === 0 && bKeys.length === 0) {
        // Comparing two integers
        newState[instruction[1]] = aVals[0] === bVals[0] ? { '': 1 } : { '': 0 };
      } else {
        // Comparing at least one complex number
        const intersect = aVals.filter((v) => bVals.includes(v));
        const diff = aVals.filter((v) => !bVals.includes(v)).concat(bVals.filter((v) => !aVals.includes(v)));
        const truePairs = intersect.reduce((acc, cur) => {
          acc.push([aValues[cur], bValues[cur]]);
          return acc;
        }, []);
        const falsePairs = diff.reduce((acc, cur) => {
          acc.push([aValues[cur], bValues[cur]]);
          return acc;
        }, []);

        if (intersect.length) {
          // Try true-path
          if (diff.length) {
            result.push({ ...newState, [instruction[1]]: { '': 0 }, possible: [...newState.possible, ...falsePairs] });
          }
          newState[instruction[1]] = { '': 1 };
          newState.possible = [...newState.possible, ...truePairs];
        } else {
          // Never true
          newState[instruction[1]] = { '': 0 };
        }
      }

      break;
    }
  }

  result.push(newState);
  return result;
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const instructions = data
    .split('\n')
    .filter(Boolean)
    .map((x) => x.split(' '));

  let states: State[] = [
    {
      w: { '': 0 },
      x: { '': 0 },
      y: { '': 0 },
      z: { '': 0 },
      input: 0,
      possible: [],
    },
  ];

  for (const i in instructions) {
    console.log((+i + 1).toString().yellow.bold, instructions[i].join(' ').padEnd(20, ' ').yellow);
    const newStates = [];
    for (const state of states) {
      newStates.push(...wrap(state, instructions[i]));
    }
    states = newStates;
    newStates.forEach((state) => {
      console.log(
        `w=${complexToString(state.w)}, x=${complexToString(state.x)}, y=${complexToString(
          state.y,
        )}, z=${complexToString(state.z)}`,
      );
    });
  }

  const possibles = states.find((s) => s.z[''] === 0).possible;
  const possibleValues = possibles.flat().reduce((acc, [complex, v]) => {
    const x = Object.keys(complex).filter(Boolean)[0];
    acc[x] = acc[x] ?? [];
    acc[x].push(v);
    return acc;
  }, {});

  console.log('Part 1:', Array.from({ length: 14 }).map((v, i) => possibleValues[`x${i}`].sort((a, b) => b - a).at(0)).join(''));
  console.log('Part 2:', Array.from({ length: 14 }).map((v, i) => possibleValues[`x${i}`].sort((a, b) => a - b).at(0)).join(''));
}

run().catch((e) => console.error(e));
