import fs from 'fs/promises';
import { lcm } from 'mathjs';

type Mod = {
  type: '&' | '%' | '';
  destinations: string[];
  process: (input: string, high: boolean) => boolean | null;
};

function initialize(raw: string) {
  const connections: Record<string, Set<string>> = {};
  const modules = raw.split('\n').reduce((acc, line) => {
    const [name, dest] = line.split(' -> ');
    const type = name.startsWith('&') ? '&' : name.startsWith('%') ? '%' : '';
    const rName = name.replace(/^[&|%]/, '');
    const destinations = dest.split(', ');

    // Track inputs for given module
    connections[rName] ??= new Set();
    for (const d of destinations) {
      connections[d] ??= new Set();
      connections[d].add(rName);
    }

    if (type === '&') {
      const memory = {};
      const inputs = connections[rName];

      acc[rName] = {
        type,
        destinations,
        process: (input: string, high: boolean) => {
          memory[input] = high;
          for (const inp of inputs) {
            if (!memory[inp]) return true;
          }

          return false;
        },
      };
    } else if (name[0] === '%') {
      let state = false;
      acc[rName] = {
        type,
        destinations,
        process: (input: string, high: boolean) => {
          if (high) {
            return null;
          }

          if (!high) {
            state = !state;
          }

          return state;
        },
      };
    } else {
      acc[rName] = {
        type,
        destinations,
        process: (input: string, high: boolean) => {
          return high;
        },
      };
    }

    return acc;
  }, {} as Record<string, Mod>);
  return { modules, connections };
}

type Signal = { name: string; high: boolean; from: string };
type OnSignal = (signal: Signal) => void;

function broadcast(modules: Record<string, Mod>, onSignal: OnSignal) {
  // Process signals in queue
  const signals: Signal[] = [{ name: 'broadcaster', high: false, from: 'button' }];
  while (signals.length) {
    // Take first signal
    const signal = signals.shift();
    onSignal(signal);
    const mod = modules[signal.name];
    if (!mod) {
      continue;
    }
    const nextPulse = mod.process(signal.from, signal.high);
    if (nextPulse !== null) {
      // If pulse -> add destination to queue
      for (const d of mod.destinations) {
        signals.push({ name: d, high: nextPulse, from: signal.name });
      }
    }
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  let part1 = initialize(raw).modules;

  let hi = 0,
    lo = 0;
  for (let i = 0; i < 1000; i++) {
    broadcast(part1, ({ high }) => {
      if (high) hi++;
      else lo++;
    });
  }
  console.log('Part 1:', hi * lo);

  let part2 = initialize(raw);
  // Find input for 'rx'
  const feed = part2.connections['rx'].values().next().value;
  // Track if we saw all inputs for conjuction module which outputs to 'rx'
  const seen = Array.from(part2.connections[feed].values()).reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});
  // Track how many cycles it took to see all inputs
  const cycleLength = {};
  let pressed = 0;
  let found = false;
  while (true) {
    pressed++;
    broadcast(part2.modules, ({ name, high, from }) => {
      // If there was high signal on conjuction module for 'rx' output
      // Track how many button presses it took
      if (name === feed && high) {
        seen[from] += 1;

        if (cycleLength[from] === undefined) {
          cycleLength[from] = pressed;
        }

        // If we saw all inputs -> stop
        if (Object.values(seen).every((v: number) => v > 0)) {
          found = true;
        }
      }
    });
    if (found) {
      break;
    }
  }

  console.log(
    'Part 2:',
    // Calculate LCM (least common multiple) of all cycle lengths
    Object.values(cycleLength).reduce((acc: number, cur: number) => lcm(acc, cur), 1),
  );
}

run().catch((e) => console.error(e));
