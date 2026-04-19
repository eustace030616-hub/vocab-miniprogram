// Singleton state
let mistakeLog = {}    // { 'A1': { wrong: 5, total: 50 }, ... }

// ─── Mistake Tracking ───────────────────────────────────────────

/**
 * Log a wrong answer for mistake tracking.
 * @param {string} levelName - CEFR level like 'A1', 'B2'
 * @param {string} word
 */
function logMistake(levelName, word) {
  if (!mistakeLog[levelName]) {
    mistakeLog[levelName] = { wrong: 0, total: 0 }
  }
  mistakeLog[levelName].wrong++
  mistakeLog[levelName].total++
  saveMistakeLog()
}

/**
 * Log a correct answer.
 * @param {string} levelName
 */
function logCorrect(levelName) {
  if (!mistakeLog[levelName]) {
    mistakeLog[levelName] = { wrong: 0, total: 0 }
  }
  mistakeLog[levelName].total++
  saveMistakeLog()
}

/**
 * Get mistake summary for all levels.
 * @returns {object}
 */
function getMistakeSummary() {
  return mistakeLog
}

/**
 * Get levels that need strengthening (accuracy < 70%).
 * @returns {Array} array of { level, accuracy, needsWork }
 */
function getWeakLevels() {
  const result = []
  for (const [level, data] of Object.entries(mistakeLog)) {
    if (data.total >= 5) {  // Only consider if enough samples
      const accuracy = (data.total - data.wrong) / data.total
      if (accuracy < 0.7) {
        result.push({ level, accuracy: Math.round(accuracy * 100) + '%', needsWork: true })
      }
    }
  }
  return result
}

// ─── Persistence ────────────────────────────────────────────────

function saveMistakeLog() {
  wx.setStorageSync('mistakeLog', mistakeLog)
}

function loadMistakeLog() {
  const saved = wx.getStorageSync('mistakeLog')
  if (saved) mistakeLog = saved
}

function resetMistakeLog() {
  mistakeLog = {}
  saveMistakeLog()
}

// ─── Init ───────────────────────────────────────────────────────

loadMistakeLog()

// ─── Exports ─────────────────────────────────────────────────────

module.exports = {
  logMistake,
  logCorrect,
  getMistakeSummary,
  getWeakLevels,
  resetMistakeLog,
  loadMistakeLog
}
