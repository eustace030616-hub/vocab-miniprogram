// Singleton state
let stars = []  // array of { word, word_zh, example_en, example_zh, ... }

/**
 * Load stars from storage. Call once on app launch.
 */
function loadStars() {
  const saved = wx.getStorageSync('stars')
  if (saved) {
    stars = saved.map(s => typeof s === 'string' ? { word: s } : s)
  }
}

/**
 * Persist current stars to storage.
 */
function saveStars() {
  // Store as strings for compatibility
  const forStorage = stars.map(s => typeof s === 'string' ? s : s.word)
  wx.setStorageSync('stars', forStorage)
}

// ─── Public API ────────────────────────────────────────────────

function getStars() {
  return stars
}

function isStarred(word) {
  return stars.some(s => s.word === word)
}

function addStar(wordInfo) {
  if (!isStarred(wordInfo.word)) {
    stars.push(wordInfo)
    saveStars()
  }
}

function removeStar(word) {
  const before = stars.length
  stars = stars.filter(s => s.word !== word)
  if (stars.length !== before) saveStars()
}

function getStarredWords() {
  return stars.map(s => s.word)
}

module.exports = {
  loadStars,
  saveStars,
  getStars,
  isStarred,
  addStar,
  removeStar,
  getStarredWords
}
