import './App.css'
import React from 'react'
import { clsx } from 'clsx'
import Confetti from 'react-confetti'

import { characters } from './characters'
import { getQuestionById, getQuestions, type Question } from './words'

const STORAGE_KEY = 'stranger-things-game:v2'
const PERSIST_TTL_MS = 1000 * 60 * 60 * 6
type PersistedGameState = {
  v: 2
  questionId: number
  guessedLetters: string[]
  savedAt: number
}

function clearPersistedGameState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function loadPersistedGameState(): PersistedGameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const obj = parsed as Partial<PersistedGameState>
    if (obj.v !== 2) return null
    if (typeof obj.questionId !== 'number' || !Number.isFinite(obj.questionId)) return null
    if (!Array.isArray(obj.guessedLetters)) return null
    if (typeof obj.savedAt !== 'number' || !Number.isFinite(obj.savedAt)) return null

    if (Date.now() - obj.savedAt > PERSIST_TTL_MS) {
      clearPersistedGameState()
      return null
    }

    const cleaned = obj.guessedLetters
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.toLowerCase())
      .filter((s) => /^[a-z]$/.test(s))

    return {
      v: 2,
      questionId: obj.questionId,
      guessedLetters: Array.from(new Set(cleaned)),
      savedAt: obj.savedAt,
    }
  } catch {
    return null
  }
}

const KILL_MESSAGE_TEMPLATES: Array<(name: string) => string> = [
  (name) => `${name} is gone... the Upside Down spreads.`,
  (name) => `The lights flicker... ${name} didn’t make it.`,
  (name) => `Vecna’s curse hit ${name}.`,
  (name) => `Not ${name}! Try another letter.`,
  (name) => `${name} vanished into the shadows.`,
  (name) => `Hawkins just got darker... goodbye ${name}.`,
]

function getStableKillMessage(answerNormalized: string, wrongGuessCount: number, name: string): string {
  const seed = (answerNormalized?.length || 0) + wrongGuessCount * 17 + (answerNormalized?.charCodeAt(0) || 0)
  const idx = ((seed % KILL_MESSAGE_TEMPLATES.length) + KILL_MESSAGE_TEMPLATES.length) % KILL_MESSAGE_TEMPLATES.length
  return KILL_MESSAGE_TEMPLATES[idx]!(name)
}

function getWindowSize(): { width: number; height: number } {
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }
}

export default function App() {
  const [{ width: windowWidth, height: windowHeight }, setWindowSize] = React.useState(() => getWindowSize())

  React.useEffect(() => {
    function onResize() {
      setWindowSize(getWindowSize())
    }

    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [currentQuestion, setCurrentQuestion] = React.useState<Question>(() => {
    const saved = loadPersistedGameState()
    if (!saved) return getQuestions()
    return getQuestionById(saved.questionId) ?? getQuestions()
  })

  const [guessedLetters, setGuessedLetters] = React.useState<string[]>(() => {
    const saved = loadPersistedGameState()
    return saved?.guessedLetters ?? []
  })
  const [statusOverride, setStatusOverride] = React.useState<string | null>(null)

  const numGuessesLeft = 8
  const answerRaw = currentQuestion?.answer ?? ''
  const questionText = currentQuestion?.question ?? ''
  const answerNormalized = answerRaw.toLowerCase().replace(/[^a-z]/g, '')

  const wrongGuessCount = guessedLetters.filter((letter) => !answerNormalized.includes(letter)).length
  const isGameWon = answerNormalized.length > 0 && answerNormalized.split('').every((letter) => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= numGuessesLeft
  const isGameOver = isGameWon || isGameLost
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = Boolean(lastGuessedLetter) && !answerNormalized.includes(lastGuessedLetter ?? '')

  function addGuessedLetter(letter: string) {
    if (isGameOver) return
    setGuessedLetters((currentLetters) => (currentLetters.includes(letter) ? currentLetters : [...currentLetters, letter]))
  }

  function pickNextQuestion(excludeId?: number): Question {
    let next = getQuestions()
    if (excludeId == null) return next
    for (let i = 0; i < 12 && next.id === excludeId; i++) {
      next = getQuestions()
    }
    return next
  }

  function startNewGame() {
    setCurrentQuestion(pickNextQuestion(currentQuestion.id))
    setGuessedLetters([])
    setStatusOverride(null)
  }

  React.useEffect(() => {
    try {
      const payload: PersistedGameState = {
        v: 2,
        questionId: currentQuestion.id,
        guessedLetters,
        savedAt: Date.now(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Ignore quota / privacy mode issues
    }
  }, [currentQuestion.id, guessedLetters])

  const charactersEle = characters.map((character, index) => {
    const isLost = index < wrongGuessCount
    return (
      <span
        key={character.name}
        className={clsx('characters', isLost && 'lost')}
        style={{ backgroundColor: character.backgroundColor, color: character.color }}
      >
        {character.name + ' '}
      </span>
    )
  })

  const keyboardRows = ['ABCDEFGH', 'IJKLMNOPQ', 'RSTUVWXYZ']
  const bulbColors = ['blue', 'red', 'yellow', 'green'] as const

  function getAnswerDisplayLines(): [string, string?] {
    const parts = answerRaw.trim().split(/\s+/).filter(Boolean)
    if (parts.length <= 1) return [answerRaw]
    return [parts[0]!, parts.slice(1).join(' ')]
  }

  function renderAnswerBoxes(text: string, keyPrefix: string): React.ReactElement[] {
    return text.split('').map((ch, index) => {
      if (ch === ' ') {
        return <span key={`${keyPrefix}-gap-${index}`} className="letter-gap" aria-hidden="true" />
      }

      if (!/[a-z]/i.test(ch)) {
        return (
          <span key={`${keyPrefix}-p-${index}`} className="letter-box" aria-hidden="true">
            {ch}
          </span>
        )
      }

      const lower = ch.toLowerCase()
      const shouldReveal = isGameLost || guessedLetters.includes(lower)
      const missed = isGameLost && !guessedLetters.includes(lower)

      return (
        <span key={`${keyPrefix}-${index}`} className={clsx('letter-box', missed && 'missed-letter')}>
          {shouldReveal ? ch.toUpperCase() : ''}
        </span>
      )
    })
  }

  const isKillMessageActive = Boolean(statusOverride) && !isGameOver

  const gameStatusClass = clsx('game-status', {
    won: isGameWon,
    lost: isGameLost,
    farewell: isKillMessageActive,
  })

  React.useEffect(() => {
    if (isGameOver) {
      setStatusOverride(null)
      return
    }

    if (!isLastGuessIncorrect) return
    if (wrongGuessCount <= 0) return

    const justLostCharacter = characters[Math.max(0, wrongGuessCount - 1)]
    const msg = getStableKillMessage(answerNormalized, wrongGuessCount, justLostCharacter?.name || 'Someone')
    setStatusOverride(msg)

    const timer = window.setTimeout(() => {
      setStatusOverride(null)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [wrongGuessCount, isLastGuessIncorrect, isGameOver, answerNormalized])

  function renderGameStatus(): React.ReactNode {
    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    }

    if (isGameLost) {
      const lastCharacter = characters[characters.length - 1]
      const secondLastCharacter = characters[characters.length - 2]
      return (
        <>
          <h2>Game over!</h2>
          <p>
            please don't kill {lastCharacter?.name} and {secondLastCharacter?.name} , go rewatch Stranger Things
          </p>
        </>
      )
    }

    if (statusOverride) {
      return <p className="farewell-message">{statusOverride}</p>
    }

    return (
      <>
        <h2>{questionText}</h2>
      </>
    )
  }

  return (
    <main>
      {isGameWon && (
        <Confetti
          recycle={false}
          numberOfPieces={800}
          width={windowWidth}
          height={windowHeight}
          style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }}
        />
      )}
      <button
        type="button"
        className="btn-refresh"
        onClick={() => {
          clearPersistedGameState()
          window.location.reload()
        }}
        aria-label="Refresh game"
        title="Refresh"
      >
        <svg
          className="btn-refresh-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M21 12a9 9 0 0 1-15.45 6.36l-1.4 1.4a1 1 0 0 1-1.7-.71V15a1 1 0 0 1 1-1h3.34a1 1 0 0 1 .71 1.7l-1.2 1.2A7 7 0 1 0 5 7h1a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1.7-.71L6.1 4.7A9 9 0 0 1 21 12Z"
          />
        </svg>
      </button>
      <header>
        <h1 className="title">The Upside Down Is Spreading</h1>
        <p>Every wrong letter costs one life, you have eight chances before the Upside Down claims them all.</p>
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="characters">{charactersEle}</section>

      <section className="letter-section">
        {(() => {
          const [line1, line2] = getAnswerDisplayLines()
          return (
            <>
              {renderAnswerBoxes(line1, 'ans-0')}
              {line2 ? <span className="letter-line-break" aria-hidden="true" /> : null}
              {line2 ? renderAnswerBoxes(line2, 'ans-1') : null}
            </>
          )
        })()}
      </section>

      <section className="sr-only" aria-live="polite" role="status">
        {lastGuessedLetter && (
          <>
            <p>
              {answerNormalized.includes(lastGuessedLetter)
                ? `Correct! The letter ${lastGuessedLetter} is in the word.`
                : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}{' '}
              You have {Math.max(0, numGuessesLeft - wrongGuessCount)} attempts left.
            </p>
            <p>
              Answer:{' '}
              {answerRaw
                .split('')
                .map((ch) => {
                  if (!/[a-z]/i.test(ch)) return ch === ' ' ? 'space.' : `${ch}.`
                  return guessedLetters.includes(ch.toLowerCase()) ? ch.toLowerCase() + '.' : 'blank.'
                })
                .join(' ')}
            </p>
          </>
        )}
      </section>

      <section className="keyboard">
        <div className="wall">
          {keyboardRows.map((rowString) => (
            <div className="row" key={rowString}>
              {rowString.split('').map((char, index) => {
                const letter = char.toLowerCase()
                const isGuessed = guessedLetters.includes(letter)
                const isCorrect = isGuessed && answerNormalized.includes(letter)
                const isWrong = isGuessed && !answerNormalized.includes(letter)
                const color = bulbColors[char.charCodeAt(0) % bulbColors.length]
                const rotationDeg = ((index * 7) % 20) - 10

                return (
                  <div
                    key={char}
                    className={clsx('letter-container', (isGameOver || isGuessed) && 'disabled')}
                    onClick={() => {
                      if (isGameOver || isGuessed) return
                      addGuessedLetter(letter)
                    }}
                  >
                    <div
                      className={`light${isCorrect ? ' lit' : ''}${isWrong ? ' cracked' : ''}`}
                      data-color={color}
                    />
                    <button
                      type="button"
                      className={`letter-btn${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
                      style={{ transform: `rotate(${rotationDeg}deg)` }}
                      disabled={isGameOver || isGuessed}
                      aria-disabled={isGameOver || isGuessed}
                      aria-label={`Letter ${char}`}
                      tabIndex={-1}
                    >
                      {char}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      {isGameOver && (
        <button className="btn-new-game" onClick={startNewGame}>
          New Game
        </button>
      )}
    </main>
  )
}
