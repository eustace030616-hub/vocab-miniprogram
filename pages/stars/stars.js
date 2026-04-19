const app = getApp()
const starService = app.globalData.starService
const wordService = app.globalData.wordService

Page({
  data: {
    stars: [],
    isEmpty: true,
    holdingIndex: -1
  },

  onShow: function() {
    const stars = starService.getStars()
    const allWords = wordService.getWordBank()

    const starsWithInfo = stars.map(item => {
      const wordInfo = allWords.find(w => w.word === item.word)
      return {
        word: item.word,
        word_zh: wordInfo ? wordInfo.word_zh : 'No translation',
        example: wordInfo ? wordInfo.example : ''
      }
    })

    this.setData({
      stars: starsWithInfo,
      isEmpty: stars.length === 0
    })
  },

  onStart: function(e) {
    this.setData({ holdingIndex: e.currentTarget.dataset.index })
  },

  onEnd: function() {
    this.setData({ holdingIndex: -1 })
  },

  removeStar: function(e) {
    const word = e.currentTarget.dataset.word
    starService.removeStar(word)
    this.setData({
      stars: this.data.stars.filter(s => s.word !== word),
      isEmpty: starService.getStars().length === 0
    })
    wx.showToast({ title: 'Removed', icon: 'none' })
  },

  onBack: function() {
    wx.navigateBack()
  }
})
