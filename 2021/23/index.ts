type Positions = [string, string];
type State = Record<'A' | 'B' | 'C' | 'D', Positions>;
type PathCache = Map<string, null | string[]>;
type TraverseResult = [number, [State, number][]];
type ResultCache = Map<string, TraverseResult>;

const COSTS = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

const CROSSROADS = {
  A: 3,
  B: 5,
  C: 7,
  D: 9,
};

const part1ProdStart: State = {
  A: ['B2', 'D1'].sort() as Positions,
  B: ['C1', 'C2'].sort() as Positions,
  C: ['A2', 'D2'].sort() as Positions,
  D: ['A1', 'B1'].sort() as Positions,
};

const part2ProdStart: State = {
  A: ['B4', 'D1', 'D2', 'C3'].sort() as Positions,
  B: ['C1', 'C4', 'C2', 'B3'].sort() as Positions,
  C: ['A4', 'D4', 'B2', 'D3'].sort() as Positions,
  D: ['A1', 'B1', 'A2', 'A3'].sort() as Positions,
};

function isFinal(state: State): Boolean {
  return Object.keys(state).every((r) => state[r].every((p, i) => p[0] === r && p[1] === (i + 1).toString()));
}

function path(cache: PathCache, start: string, end: string): null | string[] {
  const cacheKey = `${start}-${end}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = [];
  const s = parseInt(start.slice(1), 10);
  const e = parseInt(end.slice(1), 10);
  if (start[0] === 'H') {
    // From hall to room
    const c = CROSSROADS[end[0]];
    if (s <= c) {
      for (let i = s + 1; i <= c; i++) {
        result.push(`H${i.toString().padStart(2, '0')}`);
      }
    } else {
      for (let i = s - 1; i >= c; i--) {
        result.push(`H${i.toString().padStart(2, '0')}`);
      }
    }

    for (let i = 1; i <= e; i++) {
      result.push(`${end[0]}${i}`);
    }
  } else {
    for (let i = s - 1; i >= 1; i--) {
      result.push(`${start[0]}${i}`);
    }

    const c = CROSSROADS[start[0]];
    if (e <= c) {
      for (let i = c; i >= e; i--) {
        result.push(`H${i.toString().padStart(2, '0')}`);
      }
    } else {
      for (let i = c; i <= e; i++) {
        result.push(`H${i.toString().padStart(2, '0')}`);
      }
    }
  }

  cache.set(cacheKey, result);
  return result;
}

function pathIsNotBlocked(used: Record<string, 'A' | 'B' | 'C' | 'D'>, path: string[]) {
  return path.every((p) => !used[p]);
}

function* movements(state: State, pathCache: PathCache): Generator<[State, number, string]> {
  if (isFinal(state)) {
    return [state, 0];
  }

  const used = Object.keys(state).reduce((acc, cur) => {
    state[cur].forEach((p) => (acc[p] = cur));
    return acc;
  }, {});
  const roomCount: Record<'A' | 'B' | 'C' | 'D', number> = Object.keys(used).reduce(
    (acc, cur) => {
      if (used[cur] !== cur[0] && cur[0] !== 'H') {
        acc[cur[0]]++;
      }
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0 },
  );

  for (const [item, positions] of Object.entries(state)) {
    let missing: number = 0;
    for (let i = positions.length; i >= 1; i--) {
      if (!positions.includes(`${item}${i}`)) {
        missing = i;
        break;
      }
    }

    // All in own room
    if (missing === 0) {
      continue;
    }

    for (const pos of positions) {
      if (pos[0] === item && parseInt(pos[1], 10) > missing) {
        continue;
      }

      if (pos[0] === 'H') {
        // Move to room
        if (roomCount[item] === 0) {
          // Room is empty or contains only `item` amphipods
          const dest = `${item}${missing}`;
          const p = path(pathCache, pos, dest);
          if (pathIsNotBlocked(used, p)) {
            yield [
              {
                ...state,
                [item]: positions
                  .filter((v) => v !== pos)
                  .concat([dest])
                  .sort() as Positions,
              },
              p.length * COSTS[item],
              `${pos} -> ${dest}`,
            ];
          }
        }
      } else {
        // Move to hall
        const s = CROSSROADS[pos[0]];
        // Move to right from crossroad
        for (let i = s + 1; i <= 11; i++) {
          if (CROSSROADS[item] !== i && (i === 3 || i === 5 || i === 7 || i === 9)) {
            continue;
          }
          const dest = `H${i.toString().padStart(2, '0')}`;
          if (used[dest]) {
            continue;
          }

          const p = path(pathCache, pos, dest);
          if (pathIsNotBlocked(used, p)) {
            yield [
              {
                ...state,
                [item]: positions
                  .filter((v) => v !== pos)
                  .concat([dest])
                  .sort() as Positions,
              },
              p.length * COSTS[item],
              `${pos} -> ${dest}`,
            ];
          }
        }

        // Move to left from crossroad
        for (let i = s - 1; i >= 1; i--) {
          if (CROSSROADS[item] !== i && (i === 3 || i === 5 || i === 7 || i === 9)) {
            continue;
          }

          const dest = `H${i.toString().padStart(2, '0')}`;
          if (used[dest]) {
            continue;
          }

          const p = path(pathCache, pos, dest);
          if (pathIsNotBlocked(used, p)) {
            yield [
              {
                ...state,
                [item]: positions
                  .filter((v) => v !== pos)
                  .concat([dest])
                  .sort() as Positions,
              },
              p.length * COSTS[item],
              `${pos} -> ${dest}`,
            ];
          }
        }
      }
    }
  }
}

const key = (s: State) =>
  Object.keys(s)
    .sort()
    .reduce((acc, cur) => [...acc, `${cur}:${s[cur].join(',')}`], [])
    .join('-');

function traverse(
  state: State,
  states: [State, number][],
  resultCache: ResultCache,
  pathCache: PathCache,
): TraverseResult {
  const k = key(state);

  if (isFinal(state)) {
    return [0, states];
  }

  if (resultCache.has(k)) {
    return resultCache.get(k);
  }

  const result: TraverseResult = [Infinity, []];
  for (const [moveState, moveCost] of movements(state, pathCache)) {
    const [subCost, subStates] = traverse(moveState, [...states, [moveState, moveCost]], resultCache, pathCache);

    if (result[0] > subCost + moveCost) {
      result[0] = subCost + moveCost;
      result[1] = subStates;
    }
  }

  resultCache.set(k, result);
  return result;
}

async function run() {
  const part1 = traverse(part1ProdStart, [[part1ProdStart, 0]], new Map(), new Map());
  console.log('Part 1:', part1[0]);

  const part2 = traverse(part2ProdStart, [[part2ProdStart, 0]], new Map(), new Map());
  console.log('Part 2:', part2[0]);
}

run().catch((e) => console.error(e));
