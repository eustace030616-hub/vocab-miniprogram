const wordBank = require('./data/wordbank.js')
const config = require('./services/config')
const levelService = require('./services/levelService')
const mistakeService = require('./services/mistakeService')
const starService = require('./services/starService')
const wordService = require('./services/wordService')

App({
  globalData: {
    // Word bank
    wordBank: wordBank,

    // Services
    levelService,
    mistakeService,
    starService,
    wordService,
    config,

    // Test settings (from config)
    QKT_QUESTIONS: config.QKT_QUESTIONS
  },

  onLaunch: function() {
    // Load persisted state into services
    levelService.loadLevelScore()
    levelService.loadVocabSize()
    mistakeService.loadMistakeLog()
    starService.loadStars()
  }
})
