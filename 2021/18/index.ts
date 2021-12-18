import fs from 'fs/promises';

const isArray = Array.isArray;

class Base {
  public parent: Pair;
  public leftMost: Num;
  public rightMost: Num;
  public isLeft: boolean;

  public rightNum: Num;
  public leftNum: Num;

  public update() {}
}

class Num extends Base {
  constructor(public value: number) {
    super();
    this.leftMost = this;
    this.rightMost = this;
  }

  public magnitude(): number {
    return this.value;
  }

  public toJSON() {
    return this.value;
  }
}

class Pair extends Base {
  private _left: Pair | Num;
  private _right: Pair | Num;

  constructor(left: Pair | Num, right: Pair | Num) {
    super();
    this._left = left;
    this._right = right;
    this.leftMost = left.leftMost;
    this.rightMost = right.rightMost;

    this.left = left;
    this.right = right;
  }

  set left(value: Pair | Num) {
    this._left = value;
    this._left.parent = this;
    this._left.isLeft = true;
    this.leftMost = this._left.leftMost;
    this._left.rightMost.rightNum = this._right.leftMost;
  }

  get left() {
    return this._left;
  }

  set right(value: Pair | Num) {
    this._right = value;
    this._right.parent = this;
    this._right.isLeft = false;
    this.rightMost = this._right.rightMost;
    this._right.leftMost.leftNum = this._left.rightMost;
  }

  get right() {
    return this._right;
  }

  get depth() {
    if (this.left instanceof Pair && this.right instanceof Pair) {
      return Math.max(this.left.depth, this.right.depth);
    } else if (this.left instanceof Pair) {
      return this.left.depth + 1;
    } else if (this.right instanceof Pair) {
      return this.right.depth + 1;
    } else {
      return 1;
    }
  }

  public update() {
    this.left.update();
    this.right.update();
    this.leftMost = this.left.leftMost;
    this.rightMost = this.right.rightMost;
    this.left.rightMost.rightNum = this.right.leftMost;
    this.right.leftMost.leftNum = this.left.rightMost;
  }

  public add(pair: Pair): Pair {
    const res = new Pair(this, pair);
    res.reduce();
    return res;
  }

  public explode(current: Pair | Num = this, depth = 0): boolean {
    if (current instanceof Num) {
      return false;
    } else if (current.left instanceof Num && current.right instanceof Num && depth >= 4) {
      if (current.left.leftNum) {
        current.left.leftNum.value += current.left.value;
      }
      if (current.right.rightNum) {
        current.right.rightNum.value += current.right.value;
      }
      if (current.isLeft) {
        current.parent.left = new Num(0);
      } else {
        current.parent.right = new Num(0);
      }
      this.update();
      return true;
    } else {
      return this.explode(current.left, depth + 1) || this.explode(current.right, depth + 1);
    }
  }

  public split(current: Pair | Num = this): boolean {
    if (current instanceof Num) {
      if (current.value >= 10) {
        const left = Math.floor(current.value / 2);
        const right = Math.ceil(current.value / 2);
        if (current.isLeft) {
          current.parent.left = new Pair(new Num(left), new Num(right));
        } else {
          current.parent.right = new Pair(new Num(left), new Num(right));
        }
        this.update();
        return true;
      } else {
        return false;
      }
    } else {
      return this.split(current.left) || this.split(current.right);
    }
  }

  public reduce() {
    while (this.explode() || this.split()) {}
  }

  public magnitude(): number {
    return 3 * this.left.magnitude() + 2 * this.right.magnitude()
  }

  public toJSON() {
    return [this.left, this.right];
  }
}

function toPair(data: number | number[]): Pair | Num {
  if (isArray(data)) {
    return new Pair(toPair(data[0]), toPair(data[1]));
  } else {
    return new Num(data);
  }
}

async function run() {
  const data = (await fs.readFile('./input.txt', 'utf-8')).trim();
  const lines = data.split('\n').map((l) => JSON.parse(l));

  let sum = toPair(lines[0]) as Pair;
  for (let i = 1; i < lines.length; i++) {
    sum = sum.add(toPair(lines[i]) as Pair);
  }

  console.log('Part 1:', sum.magnitude());

  let max = 0;
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines.length; j++) {
      if (i === j) {
        continue;
      }

      const first = toPair(lines[i]) as Pair;
      const second = toPair(lines[j]) as Pair;
      const sum = first.add(second);
      const mag = sum.magnitude();
      if (mag > max) {
        max = mag;
      }
    }
  }

  console.log('Part 2:', max);
}

run().catch((e) => console.error(e));
