import fs from 'fs/promises';

const SIZE = 5;

interface Cell {
  value: number;
  picked: boolean;
}

type Row = Cell[];
type Board = Row[];

const toInt = (v: string) => parseInt(v, 10);
const hasRow = (row: Row) => row.every((v) => v.picked);
const sumFn = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);

function markPicked(board: Board, pick: number): void {
  for (const row of board) {
    for (const cell of row) {
      if (cell.value === pick) {
        cell.picked = true;
      }
    }
  }
}

function hasWon(board: Board): Row {
  for (let i = 0; i < SIZE; i++) {
    if (hasRow(board[i])) {
      return board[i];
    }

    const col = board.map((r) => r[i]);
    if (hasRow(col)) {
      return col;
    }
  }
}

function calculateAnswer(board: Board, pick: number): number {
  return (
    sumFn(
      board
        .flat()
        .filter((v) => !v.picked)
        .map((v) => v.value),
    ) * pick
  );
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim().split('\n');
  const picked = data[0].split(',').map(toInt);

  const boards: Board[] = [];
  for (let i = 2; i < data.length; i += SIZE + 1) {
    const board: Board = [];
    for (let j = 0; j < SIZE; j++) {
      board.push(
        data[i + j]
          .trim()
          .split(/\s+/g)
          .map(toInt)
          .map((v) => ({ value: v, picked: false })),
      );
    }
    boards.push(board);
  }

  const winningBoards: Board[] = [];
  const winningPicks: number[] = [];
  let copiedBoards = [...boards];
  for (const pick of picked) {
    for (const board of copiedBoards) {
      markPicked(board, pick);

      const won = hasWon(board);
      if (won && !winningBoards.includes(board)) {
        winningBoards.push(board);
        winningPicks.push(pick);
        copiedBoards = copiedBoards.filter((b) => b !== board);
      }
    }
  }

  console.log('Part 1:', calculateAnswer(winningBoards[0], winningPicks[0]));
  console.log('Part 2:', calculateAnswer(winningBoards.at(-1), winningPicks.at(-1)));
}

run().catch((e) => console.error(e));
