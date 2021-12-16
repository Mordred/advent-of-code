import fs from 'fs/promises';

const hexToBits = (v: string) => parseInt(v, 16).toString(2).padStart(4, '0');
const bitsToInt = (v: string | string[]) => parseInt(Array.isArray(v) ? v.join('') : v, 2);
const sumArray = (vals: number[]) => vals.reduce((acc, cur) => acc + cur, 0);
const prodArray = (vals: number[]) => vals.reduce((acc, cur) => acc * cur, 1);

type VersionSum = number;
type Value = number;
type Packet = [VersionSum, Value];

function literalValue(bits: string[]): number {
  let ret: string[] = [];
  let shouldContinue = false;
  do {
    const [group, ...rest] = bits.splice(0, 5);
    ret.push(...rest);
    shouldContinue = group === '1';
  } while (shouldContinue);

  return bitsToInt(ret);
}

function operator(bits: string[]): Packet[] {
  const lengthTypeId = bits.splice(0, 1);
  const packets: Packet[] = [];
  if (lengthTypeId[0] === '0') {
    const length = bitsToInt(bits.splice(0, 15));
    const literalsBits = bits.splice(0, length);
    while (literalsBits.length) {
      packets.push(readPacket(literalsBits));
    }
  } else {
    const subpackets = bitsToInt(bits.splice(0, 11));
    for (let i = 0; i < subpackets; i++) {
      packets.push(readPacket(bits));
    }
  }

  return packets;
}

function readPacket(bits: string[]): Packet {
  const version = bitsToInt(bits.splice(0, 3));
  const type = bitsToInt(bits.splice(0, 3));

  if (type === 4) {
    const literal = literalValue(bits);
    return [version, literal];
  } else {
    const packets = operator(bits);
    const packetVersion = version + sumArray(packets.map((p) => p[0]));
    const packetValues = packets.map((p) => p[1]);
    let result: Packet[1];
    switch (type) {
      case 0:
        result = sumArray(packetValues);
        break;
      case 1:
        result = prodArray(packetValues);
        break;
      case 2:
        result = Math.min(...packetValues);
        break;
      case 3:
        result = Math.max(...packetValues);
        break;
      case 5:
        result = packetValues[0] > packetValues[1] ? 1 : 0;
        break;
      case 6:
        result = packetValues[0] < packetValues[1] ? 1 : 0;
        break;
      case 7:
        result = packetValues[0] === packetValues[1] ? 1 : 0;
        break;
    }
    return [packetVersion, result];
  }
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  let bits = data.split('').map(hexToBits).join('').split('');

  const result = readPacket(bits);

  console.log('Part 1:', result[0]);
  console.log('Part 2:', result[1]);
}

run().catch((e) => console.error(e));
