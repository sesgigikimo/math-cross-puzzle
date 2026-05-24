interface Props {
  options: number[];           // 4 個選項（已隨機排序）
  onPick: (value: number) => void;
  disabled?: boolean;
  wrongValues?: number[];      // 已猜錯且還在格內顯示的值，標紅
}

export default function AnswerChoices({ options, onPick, disabled, wrongValues = [] }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
      {options.map((v, i) => {
        const isWrong = wrongValues.includes(v);
        return (
          <button
            key={`${v}-${i}`}
            type="button"
            onClick={() => onPick(v)}
            disabled={disabled}
            className={[
              'h-16 sm:h-20 rounded-2xl border-4 text-2xl sm:text-3xl font-black shadow active:scale-95 transition',
              isWrong
                ? 'bg-red-50 border-red-300 text-red-400 line-through'
                : 'bg-white border-leaf-300 text-leaf-700 hover:bg-leaf-50',
              'disabled:opacity-40 disabled:active:scale-100',
            ].join(' ')}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
