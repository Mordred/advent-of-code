import fs from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import chalk from 'chalk';
import { sum, toInt, hashCode, IS_DEBUG } from '#aoc/utils.js'

interface Price {
  ore: number;
  clay: number;
  obsidian: number;
}

interface Bluerprint {
  ore: Price;
  clay: Price;
  obsidian: Price;
  geode: Price;
}

interface State {
  ore: number;
  clay: number;
  obsidian: number;
  geode: number;
  oreRobots: number;
  clayRobots: number;
  obsidianRobots: number;
  geodeRobots: number;
  allowMoreOreRobots: boolean;
  allowMoreClayRobots: boolean;
  allowMoreObsidianRobots: boolean;
}

const toKey = (v: State & { time: number }) => hashCode(JSON.stringify(v, Object.keys(v).sort()));

function canAfford(state: State, price: Price) {
  return state.ore >= price.ore && state.clay >= price.clay && state.obsidian >= price.obsidian;
}

function buyAndForwardTime(state: State, price: Price): State {
  return {
    ...state,
    ore: state.ore - price.ore + state.oreRobots,
    clay: state.clay - price.clay + state.clayRobots,
    obsidian: state.obsidian - price.obsidian + state.obsidianRobots,
    geode: state.geode + state.geodeRobots,
  };
}

function solve(blueprint: Bluerprint, maxTime: number) {
  const maxOre = Math.max(blueprint.ore.ore, blueprint.clay.ore, blueprint.obsidian.ore, blueprint.geode.ore);
  const maxClay = Math.max(blueprint.ore.clay, blueprint.clay.clay, blueprint.obsidian.clay, blueprint.geode.clay);
  const maxObsidian = Math.max(
    blueprint.ore.obsidian,
    blueprint.clay.obsidian,
    blueprint.obsidian.obsidian,
    blueprint.geode.obsidian,
  );

  const cache = new Map<number, number>();
  let hits = 0;
  let miss = 0;
  function traverse(current: State, time: number): number {
    const cacheKey = toKey({ ...current, time });
    if (cache.has(cacheKey)) {
      hits++;
      return cache.get(cacheKey);
    }

    miss++;

    const canAffordGeode = canAfford(current, blueprint.geode);

    if (time === maxTime - 2) {
      const result = current.geode + 2 * current.geodeRobots + (canAffordGeode ? 1 : 0);
      cache.set(cacheKey, result);
      return result;
    }

    if (
      (current.oreRobots >= maxOre && current.ore >= maxOre) ||
      current.ore - maxOre >= (maxOre - current.oreRobots) * (maxTime - time)
    ) {
      current.oreRobots = current.ore = maxOre;
      current.allowMoreOreRobots = false;
    }

    if (
      (current.clayRobots >= maxClay && current.clay >= maxClay) ||
      current.clay - maxClay >= (maxClay - current.clayRobots) * (maxTime - time)
    ) {
      current.clayRobots = current.clay = maxClay;
      current.allowMoreClayRobots = false;
    }

    if (
      (current.obsidianRobots >= maxObsidian && current.obsidian >= maxObsidian) ||
      current.obsidian - maxObsidian >= (maxObsidian - current.obsidianRobots) * (maxTime - time)
    ) {
      current.obsidianRobots = current.obsidian = maxObsidian;
      current.allowMoreClayRobots = false;
    }

    const canAffordOreRobot = canAfford(current, blueprint.ore);
    const canAffordClay = canAfford(current, blueprint.clay);
    const canAffordObsidian = canAfford(current, blueprint.obsidian);

    let value = 0;
    if (canAffordOreRobot && current.allowMoreOreRobots) {
      value = Math.max(
        value,
        traverse(
          {
            ...buyAndForwardTime(current, blueprint.ore),
            oreRobots: current.oreRobots + 1,
          },
          time + 1,
        ),
      );
    }
    if (canAffordClay && current.allowMoreClayRobots) {
      value = Math.max(
        value,
        traverse(
          {
            ...buyAndForwardTime(current, blueprint.clay),
            clayRobots: current.clayRobots + 1,
          },
          time + 1,
        ),
      );
    }
    if (canAffordObsidian && current.allowMoreObsidianRobots) {
      value = Math.max(
        value,
        traverse(
          {
            ...buyAndForwardTime(current, blueprint.obsidian),
            obsidianRobots: current.obsidianRobots + 1,
          },
          time + 1,
        ),
      );
    }
    if (canAffordGeode) {
      value = Math.max(
        value,
        traverse(
          {
            ...buyAndForwardTime(current, blueprint.geode),
            geodeRobots: current.geodeRobots + 1,
          },
          time + 1,
        ),
      );
    }

    // Not buying robot?
    value = Math.max(value, traverse(buyAndForwardTime(current, { ore: 0, clay: 0, obsidian: 0 }), time + 1));

    cache.set(cacheKey, value);
    return value;
  }

  const start = performance.now();
  const maxValue = traverse(
    {
      ore: 0,
      clay: 0,
      obsidian: 0,
      geode: 0,
      oreRobots: 1,
      clayRobots: 0,
      obsidianRobots: 0,
      geodeRobots: 0,
      allowMoreOreRobots: true,
      allowMoreClayRobots: true,
      allowMoreObsidianRobots: true,
    },
    0,
  );
  if (IS_DEBUG) {
    console.log(chalk.green(`Took ${performance.now() - start} ms (cache hit: ${((hits / (hits + miss)) * 100).toFixed(2)}%)`))
  };

  return maxValue;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const blueprints = raw.split('\n').map((l): Bluerprint => {
    const match =
      /Blueprint \d+: Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./.exec(
        l,
      );
    if (!match) {
      console.log(l);
      throw new Error('Cannot match');
    }

    return {
      ore: {
        ore: toInt(match[1]),
        clay: 0,
        obsidian: 0,
      },
      clay: {
        ore: toInt(match[2]),
        clay: 0,
        obsidian: 0,
      },
      obsidian: {
        ore: toInt(match[3]),
        clay: toInt(match[4]),
        obsidian: 0,
      },
      geode: {
        ore: toInt(match[5]),
        clay: 0,
        obsidian: toInt(match[6]),
      },
    };
  });

  console.log('Part 1:', sum(blueprints.map((b, i) => solve(b, 24) * (i + 1))));
  console.log(
    'Part 2:',
    blueprints
      .slice(0, 3)
      .map((b) => solve(b, 32))
      .reduce((acc, cur) => acc * cur, 1),
  );
}

run().catch((e) => console.error(e));
