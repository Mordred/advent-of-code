import fs from 'fs/promises';

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8'));
  const [config, moves] = raw.split('\n\n').map((s) => s.split('\n'));

  const stacksPart1: string[][] = [];
  const stacksPart2: string[][] = [];
  const stackLabels = config.pop().trim().split(/\s+/);

  for (const row of config) {
    for (let index = 0; index < stackLabels.length; index++) {
      stacksPart1[index] = stacksPart1[index] ?? [];
      stacksPart2[index] = stacksPart2[index] ?? [];
      const crate = row[index * 4 + 1].trim();
      if (crate) {
        stacksPart1[index].push(row[index * 4 + 1])
        stacksPart2[index].push(row[index * 4 + 1])
      }
    }
  }

  for (const move of moves) {
    const [_, count, from, to] = /move (\d+) from (\d+) to (\d+)/.exec(move);
    let deleted = stacksPart1[+from - 1].splice(0, +count);
    deleted.reverse();
    stacksPart1[+to - 1].unshift(...deleted);

    deleted = stacksPart2[+from - 1].splice(0, +count);
    stacksPart2[+to - 1].unshift(...deleted);
  }

  let part1 = '';
  let part2 = '';
  for (let index = 0; index < stackLabels.length; index++) {
    part1 += stacksPart1[index][0];
    part2 += stacksPart2[index][0];
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
