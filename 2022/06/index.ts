import fs from 'fs/promises';

class UniqSeqDetector {
  #buffer: string[] = [];
  #length: number;
  #uniqueCount: number = 0;

  constructor(length: number) {
    this.#length = length;
  }

  push(char: string): boolean {
    this.#uniqueCount += this.#buffer.includes(char) ? 0 : 1;
    this.#buffer.push(char)

    if (this.#buffer.length > this.#length) {
      const removed = this.#buffer.shift();
      this.#uniqueCount += this.#buffer.includes(removed) ? 0 : -1;
      if (this.#uniqueCount === this.#length) {
        return true;
      }
    }

    return false;
  }
}

async function run() {
  const raw = (await fs.readFile(process.argv[2], 'utf-8')).trim();
  const data = raw.split('');

  const part1Detector = new UniqSeqDetector(4);
  const part2Detector = new UniqSeqDetector(14);

  let part1 = -1;
  let part2 = -1;

  for (let index = 0; index < data.length; index++) {
    const char = data[index];

    if (part1Detector.push(char) && part1 === -1) {
      part1 = index + 1;
    }

    if (part2Detector.push(char) && part2 === -1) {
      part2 = index + 1;
    }

    if (part1 !== -1 && part2 !== -1) {
      break;
    }
  }

  console.log('Part 1', part1);
  console.log('Part 2', part2);
}

run().catch((e) => console.error(e));
