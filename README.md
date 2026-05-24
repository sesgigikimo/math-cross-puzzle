# 數學加法樂園 🌳

3×3 縱橫加法謎題小遊戲 — 為國小低年級設計的數學加法練習。

🎮 **線上試玩：https://sesgigikimo.github.io/math-cross-puzzle/**

## 玩法

每橫列與每直行都是一道加法等式（`a + b = c`）。隨機產生一題後挖空 3–5 格，玩家從右側 4 個選項（1 個正確 + 3 個干擾項）挑出每個空格的正確答案。

- 點空格 → 從右邊 4 選 1
- 答對自動跳下一空格；答錯該選項變紅刪除線
- 全部答對播放鼓勵動畫
- 三檔難度：簡單（1–5）／中等（1–9）／困難（2–12）

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Vite + React + TypeScript + Tailwind CSS。
