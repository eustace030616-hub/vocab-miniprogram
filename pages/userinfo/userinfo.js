const app = getApp()
const levelService = app.globalData.levelService
const starService = app.globalData.starService

Page({
  data: {
    levelScore: 1.0,
    levelName: 'B1',
    starsCount: 0
  },

  onShow: function() {
    this.loadUserData()
  },

  loadUserData: function() {
    const levelScore = levelService.getLevelScore()
    this.setData({
      levelScore: levelScore,
      levelName: levelService.getCEFR(levelScore),
      starsCount: starService.getStars().length
    })
  },

  resetAll: function() {
    wx.showModal({
      title: 'Reset All Data',
      content: 'This will reset your level and delete all starred words. Are you sure?',
      success: (res) => {
        if (res.confirm) {
          levelService.setLevelScore(1.0)
          levelService.resetVocabSize()
          const stars = starService.getStars()
          stars.forEach(s => starService.removeStar(s.word))
          this.loadUserData()
          wx.showToast({ title: 'All data reset', icon: 'none' })
        }
      }
    })
  },

  resetLevel: function() {
    wx.showModal({
      title: 'Reset Level',
      content: 'This will reset your level to A1 (1.0). Are you sure?',
      success: (res) => {
        if (res.confirm) {
          levelService.setLevelScore(1.0)
          levelService.resetVocabSize()
          this.loadUserData()
          wx.showToast({ title: 'Level reset', icon: 'none' })
        }
      }
    })
  },

  resetStars: function() {
    wx.showModal({
      title: 'Reset Stars',
      content: 'This will delete all your starred words. Are you sure?',
      success: (res) => {
        if (res.confirm) {
          const stars = starService.getStars()
          stars.forEach(s => starService.removeStar(s.word))
          this.loadUserData()
          wx.showToast({ title: 'Stars reset', icon: 'none' })
        }
      }
    })
  },

  onBack: function() {
    wx.navigateBack()
  }
})
