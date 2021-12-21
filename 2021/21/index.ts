function* deterministicDice(): Generator<number> {
  let counter = 0;
  while (true) {
    counter++;
    counter %= 100;
    yield counter;
  }
}

function part1(player1Start: number, player2Start: number) {
  const playersPositions = [player1Start, player2Start];
  const playersScores = [0, 0];

  let player = 0;
  let counter = 0;
  const dDice = deterministicDice();
  while (playersScores[0] < 1000 && playersScores[1] < 1000) {
    const move = (dDice.next().value + dDice.next().value + dDice.next().value) % 10;
    counter += 3;
    playersPositions[player] += move;
    playersPositions[player] %= 10;
    playersScores[player] += playersPositions[player] || 10;
    player = (player + 1) % 2;
  }

  console.log('Part 1:', Math.min(...playersScores) * counter);
}

const ROLLS = {
  3: 1,
  4: 3,
  5: 6,
  6: 7,
  7: 6,
  8: 3,
  9: 1,
};

function part2(player1Start: number, player2Start: number) {

  // number[player][score][position]
  const playersScores = [
    Array.from({ length: 10 }, () => Array.from({ length: 21 }, () => 0)),
    Array.from({ length: 10 }, () => Array.from({ length: 21 }, () => 0)),
  ];

  playersScores[0][player1Start][0] = 1;
  playersScores[1][player2Start][0] = 1;

  let player = 0;
  const wins = [0, 0];
  while (playersScores.some((s) => s.some((p) => p.some((c) => c !== 0)))) {
    const newScores = Array.from({ length: 10 }, () => Array.from({ length: 21 }, () => 0));
    const universesIfWin = playersScores[(player + 1) % 2].reduce(
      (acc, cur) => acc + cur.reduce((acc2, cur2) => acc2 + cur2, 0),
      0,
    );

    for (const [roll, count] of Object.entries(ROLLS)) {
      for (let position = 0; position < 10; position++) {
        const currentScores = playersScores[player][position];
        let newPosition = (position + parseInt(roll, 10)) % 10;
        for (let score = 0; score < 21; score++) {
          const newScore = score + (newPosition || 10);
          if (newScore >= 21) {
            wins[player] += currentScores[score] * universesIfWin * count;
          } else {
            newScores[newPosition][newScore] += (currentScores[score] ?? 0) * count;
          }
        }
      }
    }

    playersScores[player] = newScores;
    player = (player + 1) % 2;
  }

  console.log('Part 2:', Math.max(...wins));
}

async function run() {
  // part1(4, 8);
  // part2(4, 8);
  part1(6, 1);
  part2(6, 1);
}

run().catch((e) => console.error(e));
