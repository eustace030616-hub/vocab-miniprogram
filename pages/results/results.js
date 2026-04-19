const app = getApp()
const levelService = app.globalData.levelService
const mistakeService = app.globalData.mistakeService

Page({
  data: {
    total: 20,
    correctCount: 0,
    correctRate: 0,
    totalPoints: 0,
    levelScore: 1.0,
    levelName: 'A1',
    performance: '',
    mistakeSummary: {},
    weakLevels: [],
    performance: ''
  },

  onLoad: function() {
    // Commit test session - save level and vocab to persistent storage
    if (levelService.isSessionActive()) {
      levelService.commitSession()
    }

    const answers = app.globalData.testAnswers || []
    const total = answers.length
    const correctCount = answers.filter(a => a.isCorrect).length
    const correctRate = total > 0 ? correctCount / total : 0
    const totalPoints = answers.reduce((sum, a) => sum + (a.points || 0), 0)
    const levelScore = levelService.getLevelScore()
    const vocabSize = levelService.getVocabSize()
    const mistakeSummary = mistakeService.getMistakeSummary()
    const weakLevels = mistakeService.getWeakLevels()

    this.setData({
      total: total,
      correctCount: correctCount,
      correctRate: Math.round(correctRate * 100),
      totalPoints: totalPoints,
      levelScore: levelScore,
      levelName: levelService.getCEFR(levelScore),
      vocabSize: vocabSize,
      mistakeSummary: mistakeSummary,
      weakLevels: weakLevels,
      performance: this.getPerformanceMessage(correctRate, weakLevels.length)
    })
  },

  getPerformanceMessage: function(correctRate, weakCount) {
    const percent = Math.round(correctRate * 100)
    if (weakCount > 0) {
      return `Focus on ${weakCount} weak level${weakCount > 1 ? 's' : ''}`
    }
    if (percent >= 90) return 'Excellent! Outstanding performance!'
    if (percent >= 70) return 'Great job! Keep it up!'
    if (percent >= 50) return 'Good effort, keep practicing!'
    return 'Keep learning, you\'ll improve!'
  },

  onRetry: function() {
    wx.redirectTo({ url: '/pages/test/test' })
  },

  onHome: function() {
    wx.redirectTo({ url: '/pages/home/home' })
  }
})
