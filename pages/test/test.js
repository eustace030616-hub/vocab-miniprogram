const app = getApp()
const levelService = app.globalData.levelService
const mistakeService = app.globalData.mistakeService
const wordService = app.globalData.wordService
const config = app.globalData.config

Page({
  data: {
    total: 20,
    current: 1,
    progress: 0,
    levelScore: 1.0,
    levelName: 'A1',
    word: '',
    word_zh: '',
    options: [],
    answers: [],
    correctCount: 0,
    totalPoints: 0,

    // Current question info
    questionLevel: 1,

    // Vocab size animation
    vocabAnimating: false,
    vocabDelta: 0
  },

  onLoad: function(options) {
    this.isReturningFromAnswer = false

    const passedIndex = parseInt(options.index)
    const total = config.QKT_QUESTIONS
    const levelScore = levelService.getLevelScore()

    this.setData({
      total: total,
      current: 1,
      currentIndex: 0,
      answers: [],
      correctCount: 0,
      totalPoints: 0,
      levelScore: levelScore,
      levelName: levelService.getCEFR(levelScore),
      vocabSize: levelService.getVocabSize()
    })

    app.globalData.totalQuestions = total

    if (!isNaN(passedIndex) && app.globalData.testAnswers && app.globalData.testAnswers.length > 0) {
      // Resume from previous answers
      this.setData({
        answers: app.globalData.testAnswers,
        current: passedIndex + 1,
        currentIndex: passedIndex
      })
      this.showQuestion(passedIndex)
    } else {
      // Start new test session - beginSession saves checkpoint
      levelService.beginSession()
      this.showQuestion(0)
    }
  },

  onShow: function() {
    if (!this.isReturningFromAnswer) return
    this.isReturningFromAnswer = false

    const nextIndex = this.data.currentIndex + 1
    if (nextIndex < this.data.total) {
      this.showQuestion(nextIndex)
    }
  },

  /**
   * Show question at index, generating word based on current level
   */
  showQuestion: function(index) {
    const currentLevel = levelService.getLevelIndex(levelService.getLevelScore())

    // Get question level from wordService
    const targetLevel = wordService.getNextQuestionLevel(index, currentLevel)

    // Get already selected words from answers
    const selected = new Set()
    for (const answer of this.data.answers) {
      selected.add(answer.word)
    }

    const word = wordService.selectWordAtLevel(targetLevel, selected)
    const wrongWords = wordService.getWrongWords(word.word, targetLevel, 2)
    const options = wordService.shuffle([word.word, ...wrongWords])

    this.setData({
      current: index + 1,
      currentIndex: index,
      word: word.word,
      word_zh: word.word_zh || '',
      options: options,
      correctWord: word.word,
      correctLevel: targetLevel,
      correctLevelName: levelService.getCEFR(targetLevel),
      questionLevel: targetLevel,
      progress: (index / this.data.total) * 100,
      levelScore: levelService.getLevelScore(),
      levelName: levelService.getCEFR(levelService.getLevelScore())
    })
  },

  selectAnswer: function(e) {
    const selectedIndex = parseInt(e.currentTarget.dataset.index)
    const selectedWord = this.data.options[selectedIndex]
    const isCorrect = selectedWord === this.data.correctWord
    this.submitAnswer(isCorrect, selectedWord, false)
  },

  selectNotSure: function() {
    this.submitAnswer(false, 'Not Sure', true)
  },

  submitAnswer: function(isCorrect, selectedWord, isNotSure) {
    const questionLevel = this.data.correctLevel
    const levelName = levelService.getCEFR(questionLevel)

    // Calculate points based on word level vs user level
    const currentLevel = levelService.getLevelIndex(levelService.getLevelScore())
    const points = levelService.getPoints(questionLevel, currentLevel, isCorrect)

    // Add points - handles level up/down internally
    const { newLevel, leveledUp, container } = levelService.addPoints(points)

    // Log mistake/correct for tracking
    if (isCorrect) {
      mistakeService.logCorrect(levelName)
    } else {
      mistakeService.logMistake(levelName, this.data.correctWord)
    }

    const answer = {
      word: this.data.correctWord,
      difficulty: questionLevel,
      levelName: levelName,
      selected: selectedWord,
      isCorrect: isCorrect,
      isNotSure: isNotSure,
      points: points,
      leveledUp: leveledUp,
      pointsContainer: container
    }

    const answers = [...this.data.answers, answer]
    const newTotalPoints = this.data.totalPoints + points

    // Update vocab size - all logic in levelService
    // No jump on level up - just continue growing with addVocab
    const oldVocabSize = levelService.getVocabSize()
    if (isCorrect) {
      levelService.addVocab(questionLevel * 100)
    }
    const newVocabSize = levelService.getVocabSize()
    const vocabDelta = newVocabSize - oldVocabSize

    // Show +xxx animation then new value
    if (vocabDelta > 0) {
      this.setData({ vocabAnimating: true, vocabDelta: '+' + vocabDelta })
      setTimeout(() => {
        this.setData({ vocabAnimating: false, vocabSize: newVocabSize })
      }, 1000)
    }

    this.setData({
      answers: answers,
      correctCount: answers.filter(a => a.isCorrect).length,
      totalPoints: newTotalPoints,
      levelScore: newLevel,
      levelName: levelService.getCEFR(newLevel),
      vocabSize: oldVocabSize
    })

    app.globalData.testAnswers = answers
    this.isReturningFromAnswer = true

    wx.navigateTo({
      url: `/pages/explanation/explanation?word=${encodeURIComponent(this.data.correctWord)}&correct=${isCorrect}&isNotSure=${isNotSure}&index=${this.data.currentIndex}&points=${points}&newLevel=${newLevel.toFixed(1)}`
    })
  },

  exitTest: function() {
    wx.showModal({
      title: 'Exit Test',
      content: 'Exit without saving? Your level and vocab will not be updated.',
      success: (res) => {
        if (res.confirm) {
          levelService.rollbackSession()
          app.globalData.testAnswers = []
          wx.navigateBack()
        }
      }
    })
  }
})
