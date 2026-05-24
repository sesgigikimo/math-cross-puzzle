import type { Puzzle } from './puzzle';

interface Props {
  puzzle: Puzzle;
  inputs: (number | null)[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showWrong: boolean; // 送出時若有錯，閃紅
}

// 5x5 grid（含運算符），cellIndex 對應 9 個圓格的位置
//  0  +  1  =  2
//  +     +     +
//  3  +  4  =  5
//  =     =     =
//  6  +  7  =  8
type GridItem =
  | { kind: 'cell'; cellIndex: number }
  | { kind: 'op'; symbol: '+' | '=' }
  | { kind: 'gap' };

const GRID: GridItem[] = [
  { kind: 'cell', cellIndex: 0 }, { kind: 'op', symbol: '+' }, { kind: 'cell', cellIndex: 1 }, { kind: 'op', symbol: '=' }, { kind: 'cell', cellIndex: 2 },
  { kind: 'op', symbol: '+' },    { kind: 'gap' },              { kind: 'op', symbol: '+' },    { kind: 'gap' },              { kind: 'op', symbol: '+' },
  { kind: 'cell', cellIndex: 3 }, { kind: 'op', symbol: '+' }, { kind: 'cell', cellIndex: 4 }, { kind: 'op', symbol: '=' }, { kind: 'cell', cellIndex: 5 },
  { kind: 'op', symbol: '=' },    { kind: 'gap' },              { kind: 'op', symbol: '=' },    { kind: 'gap' },              { kind: 'op', symbol: '=' },
  { kind: 'cell', cellIndex: 6 }, { kind: 'op', symbol: '+' }, { kind: 'cell', cellIndex: 7 }, { kind: 'op', symbol: '=' }, { kind: 'cell', cellIndex: 8 },
];

export default function PuzzleBoard({ puzzle, inputs, selectedIndex, onSelect, showWrong }: Props) {
  return (
    <div className="rounded-3xl bg-leaf-100 p-6 sm:p-8 shadow-lg border-4 border-leaf-200">
      <div
        className="grid items-center justify-items-center gap-y-2 gap-x-2 sm:gap-y-3 sm:gap-x-3"
        style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
      >
        {GRID.map((item, i) => {
          if (item.kind === 'gap') {
            return <div key={i} />;
          }
          if (item.kind === 'op') {
            // 中間運算符列（index 5..9, 15..19）小一點，省空間
            const isMiddleRow = Math.floor(i / 5) % 2 === 1;
            return (
              <div
                key={i}
                className={`text-leaf-700 font-black select-none ${
                  isMiddleRow ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
                }`}
              >
                {item.symbol}
              </div>
            );
          }
          const idx = item.cellIndex;
          const isBlank = puzzle.blanks[idx];
          const value = isBlank ? inputs[idx] : puzzle.solution[idx];
          const isSelected = selectedIndex === idx;
          const isWrongNow =
            showWrong && isBlank && inputs[idx] !== null && inputs[idx] !== puzzle.solution[idx];

          return (
            <button
              key={i}
              type="button"
              onClick={() => isBlank && onSelect(idx)}
              disabled={!isBlank}
              className={[
                'w-14 h-14 sm:w-20 sm:h-20 rounded-full',
                'flex items-center justify-center',
                'text-2xl sm:text-4xl font-black',
                'border-4 transition-all duration-150',
                isBlank
                  ? value !== null
                    ? 'bg-white text-leaf-700 border-leaf-500'
                    : 'bg-white text-leaf-400 border-dashed border-leaf-400'
                  : 'bg-leaf-50 text-leaf-700 border-leaf-600 cursor-default',
                isSelected ? 'ring-4 ring-orange-400 ring-offset-2 ring-offset-leaf-100 scale-110 shadow-md' : '',
                isWrongNow ? 'border-red-500 text-red-500 animate-shake' : '',
              ].join(' ')}
              aria-label={isBlank ? `空格 ${idx + 1}` : `數字 ${value}`}
            >
              {value ?? ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
