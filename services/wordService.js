const config = require('./config')

// ─── Helpers ───────────────────────────────────────────────────

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ─── Word Bank Access ──────────────────────────────────────────

function getWordBank() {
  const app = getApp()
  return app.globalData.wordBank.words || []
}

/**
 * Find full word info by word string.
 * @param {string} word
 * @returns {object|null}
 */
function getWordInfo(word) {
  const allWords = getWordBank()
  return allWords.find(w => w.word === word) || null
}

// ─── Word Selection ────────────────────────────────────────────

/**
 * Select a word at a specific CEFR level (1-6).
 * @param {number} levelIndex - 1=A1, 2=A2, ..., 6=C2
 * @param {Set} alreadySelected - words to avoid
 * @returns {object} word object
 */
function selectWordAtLevel(levelIndex, alreadySelected = new Set()) {
  const allWords = getWordBank()
  const level = levelIndex - 1  // word.level is 0-indexed

  // Find words at exact level
  let candidates = allWords.filter(w => w.level === level && !alreadySelected.has(w.word))

  // If not enough, include adjacent levels
  if (candidates.length < 3) {
    candidates = allWords.filter(w => {
      const diff = Math.abs(w.level - level)
      return diff <= 1 && !alreadySelected.has(w.word)
    })
  }

  // If still not enough, include any remaining words
  if (candidates.length < 3) {
    candidates = allWords.filter(w => !alreadySelected.has(w.word))
  }

  if (candidates.length === 0) {
    // Fallback: just pick any word not selected
    const fallback = allWords.filter(w => !alreadySelected.has(w.word))
    if (fallback.length === 0) {
      return { word: 'vocabulary', word_zh: '词汇', level: 2 }
    }
    return fallback[Math.floor(Math.random() * fallback.length)]
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Determine question level based on question index and user level.
 * Timer cycles: 0 → 1 → 0 → 1 → ...
 * Timer 0: position 2 = harder (+1)
 * Timer 1: positions 1,3 = harder (+1 or +2)
 * @param {number} questionIndex - current question index (0-based)
 * @param {number} currentLevel - user's current level (1-6)
 * @returns {number} targetLevel for the question
 */
function getNextQuestionLevel(questionIndex, currentLevel) {
  const batchIdx = Math.floor(questionIndex / 5)
  const posInBatch = questionIndex % 5
  const timer = batchIdx % 2  // 0 or 1

  let targetLevel = currentLevel

  if (timer === 0 && posInBatch === 2) {
    // Harder question: +1 level
    targetLevel = Math.min(6, Math.max(1, currentLevel + 1))
  } else if (timer === 1 && posInBatch === 1) {
    // Harder question: +1 level
    targetLevel = Math.min(6, Math.max(1, currentLevel + 1))
  } else if (timer === 1 && posInBatch === 3) {
    // Harder question: +1 or +2 level (random)
    const randomOffset = Math.random() < 0.5 ? 1 : 2
    targetLevel = Math.min(6, Math.max(1, currentLevel + randomOffset))
  }

  return targetLevel
}

/**
 * Get wrong word options from the same level as the correct word.
 * @param {string} correctWord
 * @param {number} correctLevel - level index 1-6
 * @param {number} count - number of wrong options
 * @returns {string[]}
 */
function getWrongWords(correctWord, correctLevel, count = 2) {
  const allWords = getWordBank()
  const level = correctLevel - 1

  // Filter to same level only, excluding correct word
  const sameLevel = allWords.filter(w => w.level === level && w.word !== correctWord)

  // Shuffle and pick
  const shuffled = shuffle(sameLevel)
  const result = shuffled.slice(0, count).map(w => w.word)

  // If not enough, fill from adjacent levels
  while (result.length < count) {
    const adjacent = allWords.filter(w => {
      const diff = Math.abs(w.level - level)
      return diff <= 1 && w.word !== correctWord && !result.includes(w.word)
    })
    if (adjacent.length === 0) break
    const pick = adjacent[Math.floor(Math.random() * adjacent.length)]
    result.push(pick.word)
  }

  return shuffle(result)
}

// ─── Exports ────────────────────────────────────────────────────

module.exports = {
  selectWordAtLevel,
  getNextQuestionLevel,
  getWrongWords,
  getWordBank,
  getWordInfo,
  shuffle
}
