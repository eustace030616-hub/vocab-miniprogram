const app = getApp()
const levelService = app.globalData.levelService
const starService = app.globalData.starService

Page({
  data: {
    levelScore: 1.0,
    levelName: 'B1',
    totalPoints: 0
  },

  onShow: function() {
    this.setData({
      levelScore: levelService.getLevelScore(),
      levelName: levelService.getCEFR(levelService.getLevelScore()),
      vocabSize: levelService.getVocabSize()
    })
  },

  onQuickTest() {
    wx.navigateTo({ url: '/pages/test/test' })
  },

  onUserInfo() {
    wx.navigateTo({ url: '/pages/userinfo/userinfo' })
  },

  onStarCollection() {
    wx.navigateTo({ url: '/pages/stars/stars' })
  }
})
