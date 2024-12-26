import fs from 'fs/promises';

type Operation = 'AND' | 'OR' | 'XOR';

interface Gate {
  arg1: string;
  arg2: string;
  output: string;
  op: Operation;
}

type Wires = Record<string, boolean>;

function bytesToNumber(wires: Wires, prefix: string) {
  let output = '';
  let i = 0;
  while (wires[`${prefix}${i.toString().padStart(2, '0')}`] !== undefined) {
    output += Number(wires[`${prefix}${i.toString().padStart(2, '0')}`]);
    i++;
  }

  return parseInt(output.split('').toReversed().join(''), 2);
}

function simulate(wires: Wires, gates: Gate[]) {
  const state = structuredClone(wires);
  const queue = structuredClone(gates);
  while (queue.length > 0) {
    const gate = queue.shift()!;
    if (state[gate.arg1] === undefined || state[gate.arg2] === undefined) {
      queue.push(gate);
      continue;
    }
    switch (gate.op) {
      case 'AND':
        state[gate.output] = state[gate.arg1] && state[gate.arg2];
        break;
      case 'OR':
        state[gate.output] = state[gate.arg1] || state[gate.arg2];
        break;
      case 'XOR':
        state[gate.output] = state[gate.arg1] !== state[gate.arg2];
        break;
    }
  }

  return bytesToNumber(state, 'z');
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [wiresRaw, gatesRaw] = raw.split('\n\n');

  const numBits = wiresRaw.split('\n').length / 2;
  const wires = wiresRaw.split('\n').reduce(
    (acc, cur) => {
      const [name, value] = cur.split(': ');
      acc[name] = value === '1';
      return acc;
    },
    {} as Record<string, boolean>,
  );

  const gates = gatesRaw.split('\n').map((line) => {
    const [first, output] = line.split(' -> ');
    const [arg1, op, arg2] = first.split(' ');
    return { arg1, op, arg2, output } as Gate;
  });

  console.log('Part 1:', simulate(wires, gates));

  const gatesMap: Record<string, Partial<Record<Operation, { out: string; other: string }>>> = {};

  for (const gate of gates) {
    gatesMap[gate.arg1] ??= {};
    gatesMap[gate.arg1][gate.op] = { out: gate.output, other: gate.arg2 };
    gatesMap[gate.arg2] ??= {};
    gatesMap[gate.arg2][gate.op] = { out: gate.output, other: gate.arg1 };
  }

  let z: string[] = [];
  let swaps = new Set<string>();
  let state = structuredClone(wires);

  function expect(arg1: string, op: Operation, arg2: string) {
    let res = gatesMap[arg1]?.[op];
    if (!res) {
      res = gatesMap[arg2]?.[op];
      if (!res) {
        throw new Error('Cannot find gate');
      }
      swaps.add(arg1);
      swaps.add(res.other);
      arg1 = res.other;
    } else if (res.other !== arg2) {
      swaps.add(arg2);
      swaps.add(res.other);
      arg2 = res.other;
    }

    let out = res.out;
    switch (op) {
      case 'AND':
        state[out] = state[arg1] && state[arg2];
        break;
      case 'OR':
        state[out] = state[arg1] || state[arg2];
        break;
      case 'XOR':
        state[out] = state[arg1] !== state[arg2];
        break;
    }
    if (out[0] === 'z') {
      z.unshift(wires[out] ? '1' : '0');
    }

    return { arg1, arg2, out };
  }

  let carry: string = 'x00';
  for (let bit = 0; bit < numBits; bit++) {
    let x = 'x' + bit.toString().padStart(2, '0');
    let y = 'y' + bit.toString().padStart(2, '0');

    let low = expect(x, 'XOR', y).out;
    let newCarry = expect(x, 'AND', y).out;

    if (bit > 0) {
      ({ arg1: carry, arg2: low } = expect(carry, 'XOR', low));

      let cont: string;
      ({ arg1: carry, arg2: low, out: cont } = expect(carry, 'AND', low));
      ({ arg1: newCarry, arg2: cont, out: newCarry } = expect(newCarry, 'OR', cont));
    }

    carry = newCarry;
  }

  console.log('Part 2:', [...swaps].sort().join(","));
}

run().catch((e) => console.error(e));
