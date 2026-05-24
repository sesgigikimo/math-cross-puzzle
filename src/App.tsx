import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import PuzzleBoard from './PuzzleBoard';
import AnswerChoices from './AnswerChoices';
import { generatePuzzle, isSolved, type Difficulty, type Puzzle } from './puzzle';

const PRAISE = ['太棒了！🎉', '答對了！⭐', '好厲害！💪', '完美！🌟', '聰明！🧠✨'];

function firstBlank(puzzle: Puzzle): number | null {
  const i = puzzle.blanks.findIndex((b) => b);
  return i >= 0 ? i : null;
}

function nextBlank(puzzle: Puzzle, current: number): number | null {
  for (let step = 1; step <= 9; step++) {
    const i = (current + step) % 9;
    if (puzzle.blanks[i]) return i;
  }
  return null;
}

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>(20);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle(20));
  const [inputs, setInputs] = useState<(number | null)[]>(() => Array(9).fill(null));
  const [selected, setSelected] = useState<number | null>(() => firstBlank(puzzle));
  const [submitted, setSubmitted] = useState(false);
  const [solvedFlag, setSolvedFlag] = useState(false);
  const [praise, setPraise] = useState('');
  const [score, setScore] = useState(0);
  // 對每個 cell 記錄玩家曾經選錯的值（讓選項按鈕灰掉），切題時清空
  const [wrongPicks, setWrongPicks] = useState<Record<number, number[]>>({});

  const startNew = useCallback((d: Difficulty) => {
    const p = generatePuzzle(d);
    setPuzzle(p);
    setInputs(Array(9).fill(null));
    setSelected(firstBlank(p));
    setSubmitted(false);
    setSolvedFlag(false);
    setPraise('');
    setWrongPicks({});
  }, []);

  const handlePick = useCallback(
    (value: number) => {
      if (solvedFlag || selected === null) return;
      const correct = puzzle.solution[selected];
      if (value === correct) {
        const nextInputs = [...inputs];
        nextInputs[selected] = value;
        setInputs(nextInputs);
        setSubmitted(false);
        if (isSolved(puzzle, nextInputs)) {
          setSolvedFlag(true);
          setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
          setScore((s) => s + 1);
        } else {
          const nxt = nextBlank(puzzle, selected);
          if (nxt !== null) setSelected(nxt);
        }
      } else {
        setWrongPicks((prev) => {
          const arr = prev[selected] ?? [];
          if (arr.includes(value)) return prev;
          return { ...prev, [selected]: [...arr, value] };
        });
        setSubmitted(true); // 觸發抖動提示
        setTimeout(() => setSubmitted(false), 400);
      }
    },
    [puzzle, selected, solvedFlag, inputs],
  );

  const currentChoices = useMemo(
    () => (selected !== null ? puzzle.choices[selected] : []),
    [puzzle, selected],
  );

  // 計算目前 selected 空格的提示：橫向、縱向各自能算的都列出
  const hints = useMemo<string[]>(() => {
    if (selected === null) return [];
    const knownValue = (idx: number): number | null => {
      if (!puzzle.blanks[idx]) return puzzle.solution[idx];
      return inputs[idx];
    };
    const row = Math.floor(selected / 3);
    const col = selected % 3;
    const rowEq: [number, number, number] = [row * 3, row * 3 + 1, row * 3 + 2];
    const colEq: [number, number, number] = [col, col + 3, col + 6];
    const result: string[] = [];
    for (const [x, y, z] of [rowEq, colEq]) {
      const xv = knownValue(x);
      const yv = knownValue(y);
      const zv = knownValue(z);
      if (selected === x && yv !== null && zv !== null) result.push(`${zv} − ${yv} = ?`);
      else if (selected === y && xv !== null && zv !== null) result.push(`${zv} − ${xv} = ?`);
      else if (selected === z && xv !== null && yv !== null) result.push(`${xv} + ${yv} = ?`);
    }
    return result;
  }, [selected, puzzle, inputs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 1-4 對應四個選項
      if (e.key >= '1' && e.key <= '4' && currentChoices.length > 0) {
        const idx = Number(e.key) - 1;
        if (idx < currentChoices.length) handlePick(currentChoices[idx]);
      } else if (e.key === 'Enter') {
        if (solvedFlag) startNew(difficulty);
      } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
        if (selected !== null) {
          const n = nextBlank(puzzle, selected);
          if (n !== null) {
            setSelected(n);
            e.preventDefault();
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePick, startNew, difficulty, puzzle, selected, solvedFlag, currentChoices]);

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-6 sm:py-10 gap-6">
      <header className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black text-leaf-700 mb-1">
          數學加法樂園 🌳
        </h1>
        <p className="text-leaf-600 text-sm sm:text-base">
          把空格填上正確數字，讓每一行、每一列都成立！
        </p>
      </header>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {([20, 50, 100] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              startNew(d);
            }}
            className={[
              'px-4 py-2 rounded-full font-bold border-2 transition',
              difficulty === d
                ? 'bg-leaf-500 text-white border-leaf-600 shadow'
                : 'bg-white text-leaf-700 border-leaf-300 hover:bg-leaf-50',
            ].join(' ')}
          >
            總和 ≤ {d}
          </button>
        ))}
        <div className="ml-2 px-4 py-2 rounded-full bg-yellow-100 border-2 border-yellow-300 font-bold text-yellow-700">
          ⭐ 答對 {score} 題
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 w-full max-w-4xl">
        <PuzzleBoard
          puzzle={puzzle}
          inputs={inputs}
          selectedIndex={selected}
          onSelect={setSelected}
          showWrong={false}
        />

        <div className="flex flex-col items-center gap-4 w-full max-w-xs md:pt-2">
          {solvedFlag ? (
            <div className="text-center animate-pop">
              <div className="text-5xl sm:text-6xl mb-2 animate-bounceY">{praise}</div>
              <button
                onClick={() => startNew(difficulty)}
                className="mt-3 px-6 py-3 rounded-2xl bg-leaf-500 hover:bg-leaf-600 text-white text-xl font-black shadow-lg border-4 border-leaf-600"
              >
                下一題 ▶
              </button>
            </div>
          ) : (
            <>
              <div className="text-leaf-700 font-bold text-base text-center">
                {selected !== null ? '請選出正確答案 👇' : '點選一個空格開始'}
              </div>
              <AnswerChoices
                options={currentChoices}
                onPick={handlePick}
                disabled={selected === null}
                wrongValues={selected !== null ? wrongPicks[selected] ?? [] : []}
              />
              <button
                onClick={() => startNew(difficulty)}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-leaf-50 text-leaf-700 text-base font-black shadow border-4 border-leaf-400"
              >
                🔄 換一題
              </button>
              {hints.length > 0 && (
                <div className="px-4 py-3 rounded-2xl bg-yellow-50 border-2 border-yellow-300 text-center w-full">
                  <div className="text-yellow-700 text-xs font-bold mb-1">💡 小提示</div>
                  <div className="flex flex-col gap-1">
                    {hints.map((h, i) => (
                      <div key={i} className="text-leaf-700 text-2xl font-black tracking-wider">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {submitted && (
                <div className="text-red-600 font-bold text-lg animate-shake text-center">
                  再試試看！🔍
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="text-leaf-600 text-xs mt-2">
        小提示：點選空格 → 從右邊 4 個選項挑出正確答案（鍵盤 1～4 也可以）
      </footer>
    </div>
  );
}
