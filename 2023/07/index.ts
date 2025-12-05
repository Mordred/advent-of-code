import fs from 'fs/promises';
import { toInt } from '#aoc/utils.ts';
import { sum } from 'mathjs';

const CARDS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
CARDS.reverse();
const PART2_CARDS = ['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J']
PART2_CARDS.reverse();

type CardsCount = Record<string, number>;

function countCards(acc: CardsCount, cur: string): CardsCount {
  acc[cur] ??= 0;
  acc[cur]++;
  return acc;
}

const part1Counts = (counts: CardsCount) => Object.values(counts).sort((a, b) => b - a);
const part2Counts = (counts: CardsCount) => {
  const jokers = counts.J ?? 0;
  delete counts.J;
  const ranks = Object.values(counts).sort((a, b) => b - a);
  ranks[0] = jokers + (ranks[0] ?? 0);
  return ranks;
}

function compare(a: string, b: string, cards: string[], aCounts: number[], bCounts: number[]): number {
  for (let i = 0; i < 5; i++) {
    const d = (aCounts[i] ?? 0) - (bCounts[i] ?? 0);
    if (d !== 0) {
      return d;
    }
  }

  for (let i = 0; i < 5; i++) {
    const d = cards.indexOf(a[i]) - cards.indexOf(b[i]);
    if (d !== 0) {
      return d;
    }
  }

  return 0;
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const cardsAndBids = raw
    .trim()
    .split('\n')
    .map((l) => {
      const [deck, bid] = l.split(' ')
      const counts = deck.split('').reduce(countCards, {});
      return [deck, toInt(bid), part1Counts(counts), part2Counts(counts)] as const;
    });

  const part1 = cardsAndBids.sort((a, b) => compare(a[0], b[0], CARDS, a[2], b[2]));
  console.log('Part 1:', sum(part1.map((c, i) => c[1] * (i + 1))));

  const part2 = cardsAndBids.sort((a, b) => compare(a[0], b[0], PART2_CARDS, a[3], b[3]));
  console.log('Part 2:', sum(part2.map((c, i) => c[1] * (i + 1))));
}

run().catch((e) => console.error(e));
