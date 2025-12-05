import fs from 'fs/promises';
import { toInt, sum } from '#aoc/utils.ts';
import { prod } from 'mathjs';

interface Card {
  index: number;
  winning: number[];
  deck: number[];
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.trim().split('\n').map((l) => {
    const match = l.match(/^Card +(\d+): /);
    const splitted = l.replace(match[0], '').split(' | ');
    return {
      index: toInt(match[1]),
      winning: splitted[0].trim().split(/ +/).map(toInt),
      deck: splitted[1].trim().split(/ +/).map(toInt),
    }
  });

  let part1 = 0;
  let cardsCounts = Array.from({ length: data.length }, () => 1);
  for (let i = 0; i < data.length; i++) {
    const card = data[i];
    const hits = card.deck.filter((d) => card.winning.includes(d));
    if (hits.length) {
      part1 += 2 ** (hits.length - 1);
    }
    for (let j = 0; j < hits.length; j++) {
      cardsCounts[j + i + 1] += (cardsCounts[i]);
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2', sum(cardsCounts))
}

run().catch((e) => console.error(e));
