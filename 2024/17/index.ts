import fs from 'fs/promises';

const bigIntMin = (...args: bigint[]) => args.reduce((m, e) => e < m ? e : m);

const REGISTER_RE = /([A-Z]): (\d+)/;

interface Registers {
  A: bigint;
  B: bigint;
  C: bigint;
  pc: number;
  out: bigint[];
}

function combo(reg: Registers, operand: bigint): bigint {
  switch (operand) {
    case 0n:
    case 1n:
    case 2n:
    case 3n:
      return BigInt(operand);
    case 4n:
      return reg.A;
    case 5n:
      return reg.B;
    case 6n:
      return reg.C;
    default:
      throw new Error('Invalid operand');
  }
}


const OPCODES = {
  // adv - division
  0: (reg: Registers, operand: bigint) => {
    reg.A = reg.A / (1n << combo(reg, operand));
    reg.pc += 2;
  },
  // blx - bitwise XOR
  // NOTE: Use BigInt because 721988246 ^ 0 === -1370052125 in JavaScript
  1: (reg: Registers, operand: bigint) => {
    reg.B = reg.B ^ operand;
    reg.pc += 2;
  },
  // bst - module 8
  2: (reg: Registers, operand: bigint) => {
    reg.B = combo(reg, operand) % 8n;
    reg.pc += 2;
  },
  // jnz
  3: (reg: Registers, operand: bigint) => {
    if (reg.A === 0n) {
      reg.pc += 2;
      return;
    }

    reg.pc = Number(operand);
  },
  // bxc
  4: (reg: Registers, operand: bigint) => {
    reg.B = reg.B ^ reg.C;
    reg.pc += 2;
  },
  // out
  5: (reg: Registers, operand: bigint) => {
    reg.pc += 2;
    return combo(reg, operand) % 8n;
  },
  // bdv
  6: (reg: Registers, operand: bigint) => {
    reg.B = reg.A / (1n << combo(reg, operand));
    reg.pc += 2;
  },
  // cdv
  7: (reg: Registers, operand: bigint) => {
    reg.C = reg.A / (1n << combo(reg, operand));
    reg.pc += 2;
  },
};

function execute(reg: Registers, program: bigint[]) {
  while (reg.pc < program.length) {
    const opcode = Number(program[reg.pc]);
    const operand = program[reg.pc + 1];
    if (!OPCODES[opcode]) {
      throw new Error('Invalid opcode');
    }

    const out = OPCODES[opcode](reg, operand);
    if (out !== undefined) {
      reg.out.push(out);
    }
  }

  return reg.out;
}

function *solve(program: bigint[], A: bigint, required: bigint[]) {
  A *= 8n;
  for (let i = 0n; i < 8n; i++) {
    const output = execute({  A: A + i, B: 0n, C: 0n, pc: 0, out: [] }, program);
    if (output.join(',') === required.join(',')) {
      yield A + i;
    }
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [rawRegisters, rawProgram] = raw.split('\n\n');
  const registers = rawRegisters.split('\n').reduce(
    (acc, cur) => {
      const match = REGISTER_RE.exec(cur);
      if (!match) {
        throw new Error('Invalid register');
      }

      acc[match[1]] = BigInt(match[2]);
      return acc;
    },
    { A: 0n, B: 0n, C: 0n, pc: 0, out: [] } as Registers,
  );
  const program = rawProgram.replace('Program: ', '').split(',').map((v) => BigInt(v));

  const part1 = execute(structuredClone(registers), program);
  console.log('Part 1:', part1.join(','));

  // Program is always returing to 0 if A is not zero at the end (3,0)
  // Also it is dividing A by 8 each round (0,3)
  // So try to guess each number in the ouput in reverse order
  // and if we know that A can be 0-7, we can try all 8 possibilities
  const reversed = program.toReversed();
  let options = new Set<bigint>([0n]);
  let required: bigint[] = [];
  for (const v of reversed) {
    required.splice(0, 0, v);
    const newOptions = new Set<bigint>();
    for (const regA of options) {
      for (const A of solve(program, regA, required)) {
        newOptions.add(A);
      }
    }
    options = newOptions;
  }

  if (!options.size) {
    throw new Error('No solution found');
  }
  console.log('Part 2:', bigIntMin(...options));
}

run().catch((e) => console.error(e));
