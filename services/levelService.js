const config = require('./config')

// Singleton state
let levelScore = 1.0  // 1-6 (A1-C2)
let pointsContainer = 0  // accumulates points, upgrades at 5
let vocabSize = 0  // cumulative vocabulary size estimate

// Session state - for test session isolation
let sessionActive = false
let sessionLevelScore = 1.0
let sessionPointsContainer = 0
let sessionVocabSize = 0

// ─── Level Names ────────────────────────────────────────────────

const LEVEL_NAMES = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function getCEFR(score) {
  const index = Math.min(6, Math.max(1, Math.round(score)))
  return LEVEL_NAMES[index] || 'A1'
}

function getLevelIndex(score) {
  return Math.min(6, Math.max(1, Math.round(score)))
}

// ─── Points ────────────────────────────────────────────────────

/**
 * Get points based on word level vs user level.
 * Correct: +1 base + (wordLevel - userLevel) bonus
 * Wrong on easier: -2
 * Wrong on same level: -1
 * Wrong on harder: 0
 * @param {number} wordLevel - level of the word (1-6)
 * @param {number} userLevel - user's current level (1-6)
 * @param {boolean} isCorrect
 * @returns {number}
 */
function getPoints(wordLevel, userLevel, isCorrect) {
  if (isCorrect) {
    return 1 + (wordLevel - userLevel)
  } else {
    const gap = wordLevel - userLevel
    if (gap < 0) return -2      // easier
    if (gap === 0) return -1     // same level
    return 0                     // harder
  }
}

/**
 * Add points to container. If >= 5, upgrade level and reset container.
 * @param {number} points - points to add
 * @returns {{ newLevel: number, leveledUp: boolean, container: number }}
 */
function addPoints(points) {
  pointsContainer += points
  let leveledUp = false

  if (pointsContainer >= 5) {
    if (levelScore < 6) {
      levelScore = Math.min(6, levelScore + 1)
      leveledUp = true
      saveLevelScore()
    }
    pointsContainer = 0
    savePointsContainer()
  }

  return {
    newLevel: levelScore,
    leveledUp,
    container: pointsContainer
  }
}

/**
 * Get current points container value.
 * @returns {number}
 */
function getPointsContainer() {
  return pointsContainer
}

// ─── Vocab Size ────────────────────────────────────────────────

/**
 * Get vocabulary size estimate.
 * @returns {number}
 */
function getVocabSize() {
  return vocabSize
}

/**
 * Get random offset in range [0, 200] added to base growth.
 * @param {number} baseGrowth - base growth amount (e.g., 100)
 * @returns {number} - baseGrowth + random offset (0 to 200)
 */
function getRandomOffset(baseGrowth) {
  return baseGrowth + Math.floor(Math.random() * 201)
}

/**
 * Add vocabulary growth with random offset.
 * Level base (700 * level) is reached through accumulated growth, not jumps.
 * @param {number} baseGrowth - base growth per correct answer (e.g., 100 for A1, 200 for A2)
 */
function addVocab(baseGrowth) {
  vocabSize += getRandomOffset(baseGrowth)
  saveVocabSize()
}

/**
 * Set vocabulary size to the base for current level (700 * level).
 * Called when leveling up.
 * @deprecated Kept for compatibility, but level-up now uses addVocab instead.
 */
function setVocabBase() {
  vocabSize = 700 * levelScore
  saveVocabSize()
}

/**
 * Update vocabulary size to current level's base.
 * @deprecated Use setVocabBase() or addVocab() instead.
 */
function updateVocabSize() {
  setVocabBase()
}

// ─── Test Session Management ────────────────────────────────────

/**
 * Begin a test session. Snapshots current state and defers persistence.
 * Call this when starting a test.
 */
function beginSession() {
  sessionActive = true
  sessionLevelScore = levelScore
  sessionPointsContainer = pointsContainer
  sessionVocabSize = vocabSize
}

/**
 * Commit test session. Saves current state to persistent storage.
 * Call this when test is completed (reaching results page).
 */
function commitSession() {
  saveLevelScore()
  savePointsContainer()
  saveVocabSize()
  sessionActive = false
}

/**
 * Rollback test session. Restores to pre-test state.
 * Call this when user exits test without completing.
 */
function rollbackSession() {
  levelScore = sessionLevelScore
  pointsContainer = sessionPointsContainer
  vocabSize = sessionVocabSize
  sessionActive = false
}

/**
 * Check if a test session is active.
 * @returns {boolean}
 */
function isSessionActive() {
  return sessionActive
}

// ─── Persistence ────────────────────────────────────────────────

function saveLevelScore() {
  wx.setStorageSync('levelScore', levelScore)
}

function savePointsContainer() {
  wx.setStorageSync('pointsContainer', pointsContainer)
}

function saveVocabSize() {
  wx.setStorageSync('vocabSize', vocabSize)
}

function loadLevelScore() {
  const saved = wx.getStorageSync('levelScore')
  if (saved) levelScore = saved
}

function loadPointsContainer() {
  const saved = wx.getStorageSync('pointsContainer')
  if (saved) pointsContainer = saved
}

function loadVocabSize() {
  const saved = wx.getStorageSync('vocabSize')
  if (saved) vocabSize = saved
}

/**
 * Reset vocabulary size to 0 (no test taken).
 */
function resetVocabSize() {
  vocabSize = 0
  saveVocabSize()
}

// ─── Init ───────────────────────────────────────────────────────

loadLevelScore()
loadPointsContainer()
loadVocabSize()

// ─── Exports ─────────────────────────────────────────────────────

module.exports = {
  getLevelScore: () => levelScore,
  getCEFR,
  getLevelIndex,
  getPoints,
  addPoints,
  getPointsContainer,
  getVocabSize,
  setVocabBase,
  addVocab,
  resetVocabSize,
  beginSession,
  commitSession,
  rollbackSession,
  isSessionActive,
  setLevelScore: (score) => {
    levelScore = Math.max(1, Math.min(6, score))
    saveLevelScore()
  },
  loadLevelScore,
  loadVocabSize
}
