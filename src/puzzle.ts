// 3x3 純加法縱橫謎題
// 配置（cell index 0..8，row-major）：
//   0   +   1   =   2
//   +       +       +
//   3   +   4   =   5
//   =       =       =
//   6   +   7   =   8
//
// 數學關係（全部用 +）：
//   2 = 0 + 1
//   5 = 3 + 4
//   8 = 6 + 7
//   6 = 0 + 3
//   7 = 1 + 4
//   8 = 2 + 5
// 只要 a=cells[0], b=cells[1], d=cells[3], e=cells[4] 自由設定，其餘
// 由加法推導，則所有等式必然成立（因為 (a+d)+(b+e) = (a+b)+(d+e)）。

// 難度以「最大總和（右下角的 i 值上限）」分級
export type Difficulty = 20 | 50 | 100;

export interface Puzzle {
  solution: number[];      // 長度 9，完整解
  blanks: boolean[];       // 長度 9，true 表示玩家要填
  choices: number[][];     // 長度 9，每格 4 個選項（非 blank 也填，省得分支判斷）
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBlanks(count: number, rng: () => number = Math.random): boolean[] {
  // 從 9 格中隨機選 count 格作為空格
  const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  // Fisher-Yates
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const chosen = new Set(indices.slice(0, count));
  return Array.from({ length: 9 }, (_, i) => chosen.has(i));
}

export function generatePuzzle(difficulty: Difficulty = 20): Puzzle {
  // 單格上限大致 = maxSum / 4，再保險用迴圈把超過 maxSum 的丟掉重抽
  const cellMax: Record<Difficulty, number> = { 20: 5, 50: 12, 100: 25 };
  const blanksCount: Record<Difficulty, number> = { 20: 3, 50: 4, 100: 5 };

  const hi = cellMax[difficulty];
  const maxSum = difficulty;
  let a = 0, b = 0, d = 0, e = 0;
  for (let tries = 0; tries < 200; tries++) {
    a = randInt(1, hi);
    b = randInt(1, hi);
    d = randInt(1, hi);
    e = randInt(1, hi);
    if (a + b + d + e <= maxSum) break;
  }

  const c = a + b;
  const f = d + e;
  const g = a + d;
  const h = b + e;
  const i = c + f; // = g + h = a+b+d+e

  const solution = [a, b, c, d, e, f, g, h, i];
  const blanks = pickBlanks(blanksCount[difficulty]);
  // 用「該格答案 + index」當 seed，每題穩定但題與題之間會變
  const choices = solution.map((v, idx) => buildChoices(v, v * 13 + idx * 101 + Date.now() % 9973));

  return { solution, blanks, choices };
}

export function isCellCorrect(puzzle: Puzzle, index: number, value: number | null): boolean {
  if (value === null) return false;
  return puzzle.solution[index] === value;
}

export function isSolved(puzzle: Puzzle, inputs: (number | null)[]): boolean {
  return puzzle.blanks.every((isBlank, i) => !isBlank || inputs[i] === puzzle.solution[i]);
}

// 為某個答案產生 4 個選項：1 個正確 + 3 個干擾項，隨機排序
// 干擾項：圍繞正確答案 ±1..±5 取 3 個不重複、非負、非正解的整數
export function buildChoices(correct: number, seed: number = correct): number[] {
  // 簡單 LCG 確保同一個 seed 出同一組選項（避免 React render 時順序變動）
  let s = (seed * 9301 + 49297) % 233280;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const candidates = new Set<number>();
  const offsets = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5];
  // 打亂 offsets
  for (let i = offsets.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  for (const off of offsets) {
    const v = correct + off;
    if (v < 0) continue;
    if (v === correct) continue;
    candidates.add(v);
    if (candidates.size >= 3) break;
  }
  // 萬一不夠（極小數），補大一點的數
  let pad = 6;
  while (candidates.size < 3) {
    const v = correct + pad;
    if (v >= 0 && v !== correct) candidates.add(v);
    pad++;
  }

  const arr = [correct, ...Array.from(candidates).slice(0, 3)];
  // Fisher-Yates 打亂
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
