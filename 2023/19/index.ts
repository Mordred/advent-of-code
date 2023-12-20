import { toInt } from '#aoc/utils.js';
import fs from 'fs/promises';
import { sum } from 'mathjs';

type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
};

type Rule = {
  key?: 'x' | 'm' | 'a' | 's';
  cmp?: '<' | '>';
  value?: number;
  target: string;
};

function applyRules(part: Part, rules: Record<string, Rule[]>): string {
  let workflow = 'in';
  while (workflow !== 'R' && workflow !== 'A') {
    for (let rule of rules[workflow]) {
      const { cmp, key, value, target } = rule;
      const result = cmp ? (cmp === '>' ? part[key] > value : part[key] < value) : true;
      if (result) {
        workflow = target;
        break;
      }
    }
  }
  return workflow;
}

type Range = [number, number];

function count(ranges: Record<Rule['key'], Range>, rules: Record<string, Rule[]>, workflow = 'in') {
  // If rejected - stop counting
  if (workflow === 'R') {
    return 0;
  }

  // If accepted -> sum all possible combinations
  if (workflow === 'A') {
    let product = 1;
    for (let [lo, hi] of Object.values(ranges)) {
      product *= hi - lo + 1;
    }
    return product;
  }

  let total = 0;
  for (let rule of rules[workflow]) {
    // Fallback
    if (rule.key === undefined) {
      total += count(ranges, rules, rule.target);
      break;
    }

    const [lo, hi] = ranges[rule.key];
    let trueRange: Range, falseRange: Range;
    // Split range for given key to true and false branches
    if (rule.cmp === '<') {
      trueRange = [lo, rule.value - 1];
      falseRange = [rule.value, hi];
    } else {
      falseRange = [lo, rule.value];
      trueRange = [rule.value + 1, hi];
    }

    // For true branch -> add count
    if (trueRange[0] <= trueRange[1]) {
      total += count({ ...ranges, [rule.key]: trueRange }, rules, rule.target);
    }
    // For false branch -> update current range
    if (falseRange[0] <= falseRange[1]) {
      ranges = { ...ranges, [rule.key]: falseRange };
    } else {
      break;
    }
  }

  return total;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const [workflowsData, partsData] = raw.split('\n\n');
  const workflows = workflowsData.split('\n').reduce((acc, line) => {
    const [name, rules] = line.split('{');
    acc[name.trim()] = rules
      .slice(0, -1)
      .split(',')
      .map((rule) => {
        const parts = rule.split(':');
        if (parts.length !== 2) {
          return { target: parts[0] };
        } else {
          const [key, value] = parts[0].split(/<|>/);
          return {
            key: key as Rule['key'],
            value: toInt(value),
            target: parts[1],
            cmp: parts[0].includes('<') ? ('<' as const) : ('>' as const),
          };
        }
      });
    return acc;
  }, {} as Record<string, Rule[]>);

  const parts = partsData.split('\n').map((line) => {
    return line
      .slice(1, -1)
      .split(',')
      .reduce(
        (acc, cur) => {
          const [key, value] = cur.split('=');
          acc[key] = toInt(value);
          return acc;
        },
        { x: 0, m: 0, a: 0, s: 0 } as Part,
      );
  });

  const accepted = parts.filter((part) => {
    return applyRules(part, workflows) === 'A';
  });

  console.log(
    'Part 1:',
    accepted.reduce((acc, cur) => acc + sum(Object.values(cur)), 0),
  );

  console.log('Part 2:', count({ x: [1, 4000], m: [1, 4000], a: [1, 4000], s: [1, 4000] }, workflows));
}

run().catch((e) => console.error(e));
