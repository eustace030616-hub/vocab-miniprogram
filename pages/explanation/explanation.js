const app = getApp()
const levelService = app.globalData.levelService
const starService = app.globalData.starService

Page({
  data: {
    word: '',
    correct: false,
    isCorrect: false,
    isNotSure: false,
    index: 0,
    total: 20,
    isStarred: false,
    isLast: false,
    canContinue: false,
    levelScore: 1.0,
    levelName: 'A1',
    points: 0,
    totalPoints: 0
  },

  onLoad: function(options) {
    const word = decodeURIComponent(options.word || '')
    const isCorrect = options.correct === 'true'
    const index = parseInt(options.index) || 0
    const total = app.globalData.totalQuestions || 20
    const newLevel = parseFloat(options.newLevel) || levelService.getLevelScore()
    const points = parseInt(options.points) || 0

    const answers = app.globalData.testAnswers || []

    this.setData({
      word: word,
      correct: isCorrect,
      isCorrect: isCorrect,
      isNotSure: false,
      index: index,
      total: total,
      isLast: index >= total - 1,
      canContinue: false,
      levelScore: newLevel,
      levelName: levelService.getCEFR(newLevel),
      points: points,
      totalPoints: answers.reduce((sum, a) => sum + (a.points || 0), 0),
      isStarred: starService.isStarred(word)
    })
  },

  toggleStar: function() {
    const word = this.data.word
    const answers = app.globalData.testAnswers || []
    const answer = answers[this.data.index] || {}
    const wordInfo = answer.wordInfo || { word: word }

    if (this.data.isStarred) {
      starService.removeStar(word)
      wx.showToast({ title: 'Removed', icon: 'none' })
    } else {
      starService.addStar(wordInfo)
      wx.showToast({ title: 'Saved', icon: 'success' })
    }

    this.setData({ isStarred: !this.data.isStarred })
  },

  nextQuestion: function(e) {
    const action = e ? e.currentTarget.dataset.action : null

    if (action === 'finish') {
      wx.redirectTo({ url: '/pages/results/results' })
      return
    }

    const nextIndex = this.data.index + 1
    if (nextIndex >= this.data.total) {
      wx.redirectTo({ url: '/pages/results/results' })
    } else {
      wx.navigateBack()
    }
  }
})
