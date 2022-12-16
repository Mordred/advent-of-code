import fs from 'fs/promises';

interface Tunels {
  [valve: string]: {
    flow: number;
    next: string[];
  };
}

interface TimeCost {
  [tunelAtunelB: string]: number;
}

interface State {
  tunels: Tunels;
  timeCost: TimeCost;
  current: string;
  canOpen: Set<string>;
  left: number;
}

const toInt = (s: string) => parseInt(s, 10);
const cost = (timeCosts: TimeCost, a: string, b: string) => timeCosts[a < b ? a + b : b + a] ?? Infinity;

function simulate(state: State) {
  if (state.left <= 0) {
    return 0;
  }

  const actualFlow = state.tunels[state.current].flow;
  let best = 0;
  for (const next of state.canOpen.values()) {
    const moveCost = cost(state.timeCost, state.current, next) + 1;
    if (moveCost > state.left) {
      continue;
    }

    const newCanOpen = new Set(state.canOpen);
    newCanOpen.delete(next);
    const result = simulate({
      ...state,
      current: next,
      canOpen: newCanOpen,
      left: state.left - moveCost,
    });
    if (result >= best) {
      best = result;
    }
  }
  return actualFlow * state.left + best;
}

const key = (s: Set<string>) => Array.from(s.values()).sort().join();

function generateSubArrays<T>(items: T[]): T[][] {
  if (items.length === 1) {
    return [items];
  }

  const subarr = generateSubArrays(items.slice(1));
  return subarr.concat(
    subarr.map((e) => e.concat(items[0])),
    [[items[0]]],
  );
}

async function run() {
  const raw = await fs.readFile(process.argv[2], 'utf-8');
  const tunels: Tunels = raw.split('\n').reduce((acc, cur) => {
    const match = /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? /.exec(cur);
    acc[match[1]] = {
      flow: toInt(match[2]),
      next: cur.substring(match[0].length).split(', '),
    };
    return acc;
  }, {});

  const timeCost: TimeCost = {};
  for (const [valveAName, valveA] of Object.entries(tunels)) {
    timeCost[valveAName + valveAName] = 0;
    for (const next of valveA.next) {
      timeCost[valveAName + next] = 1;
      timeCost[next + valveAName] = 1;
    }
  }

  for (const a of Object.keys(tunels)) {
    for (const b of Object.keys(tunels)) {
      for (const c of Object.keys(tunels)) {
        if (cost(timeCost, b, a) + cost(timeCost, a, c) < cost(timeCost, b, c)) {
          timeCost[b + c] = timeCost[c + b] = cost(timeCost, b, a) + cost(timeCost, a, c);
        }
      }
    }
  }

  const canOpen = new Set(Object.keys(tunels).filter((c) => tunels[c].flow > 0));

  const part1 = simulate({
    tunels,
    timeCost,
    current: 'AA',
    canOpen,
    left: 30,
  });
  console.log('Part 1:', part1);

  let part2 = 0;
  const visited = new Set();
  for (const s of [[] as string[]].concat(generateSubArrays(Array.from(canOpen.values())))) {
    const s1 = new Set(s);
    const s2 = new Set([...canOpen].filter((x) => !s1.has(x)));

    const s1Key = key(s1);
    const s2Key = key(s2);

    if (visited.has(s1Key) || visited.has(s2Key)) {
      continue;
    }

    visited.add(s1Key).add(s2Key);

    const me = simulate({
      tunels,
      timeCost,
      current: 'AA',
      canOpen: s1,
      left: 26,
    });
    const elephant = simulate({
      tunels,
      timeCost,
      current: 'AA',
      canOpen: s2,
      left: 26,
    });
    if (me + elephant > part2) {
      part2 = me + elephant;
    }
  }
  console.log('Part 2:', part2)
}

run().catch((e) => console.error(e));
