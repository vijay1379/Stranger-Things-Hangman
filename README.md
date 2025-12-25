## The Upside Down Is Spreading | Stranger Things Game

A Stranger Things themed trivia hangman game with an “alphabet wall” keyboard.

## Tech stack

- React 19 + TypeScript
- Vite (dev server + production build)
- ESLint (with TypeScript + React Hooks rules)
- `clsx` (conditional class names)
- `react-confetti` (win celebration)

## How the game works

- Each round picks a random `{ question, answer }` from `src/words.ts`.
- You guess letters using the alphabet wall keyboard.
- You have **8** wrong guesses maximum.
- Wrong guesses “cost a life” (character chips at the top).
- Win condition: all letters in the answer are revealed.
- Lose condition: wrong guesses reach 8.

Quality-of-life:

- Guessed letters are disabled.
- Wrong letters show a cracked bulb effect.
- A short “farewell” message appears on wrong guesses.
- Game state is saved to `localStorage`, so refresh keeps your current round.

## Running locally

Prerequisites:

- Node.js (recommended: latest LTS)

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Project structure

- `index.html` — SEO/meta tags + app bootstrap
- `public/` — static assets (icons, OG image, manifest)
- `src/main.tsx` — React entry
- `src/App.tsx` — main game UI + logic
- `src/App.css` — styling (alphabet wall keyboard, responsiveness)
- `src/words.ts` — trivia questions dataset
- `src/characters.ts` — “lives” (character chips) dataset

## Editing questions

Add or edit Q&A entries in `src/words.ts`:

```ts
{ id: 31, question: '...', answer: '...' }
```

Notes:

- Answers can include spaces (multi‑word answers are displayed on two lines).
- Letter matching is case-insensitive and ignores non‑letters.
