let currentQuestion = 0
let score = 0
let quizQuestions = []
let quizData = {}
let timer
let timeLeft = 15
let selectedTopic = ''

const startScreen = document.getElementById('start-screen')
const quizContainer = document.getElementById('quiz-container')
const startBtn = document.getElementById('start-btn')
const categoryCards = document.querySelectorAll('.category-card')

const questionText = document.getElementById('question-text')
const questionNumber = document.getElementById('question-number')
const optionsContainer = document.getElementById('options-container')
const scoreDisplay = document.getElementById('score')
const nextBtn = document.getElementById('next-btn')
const timerDisplay = document.getElementById('timer')
const progressBar = document.querySelector('.progress-bar')
const quizTopicDisplay = document.getElementById('quiz-topic')
const leaderboard = document.getElementById('leaderboard')
const leaderboardList = document.getElementById('leaderboard-list')
const backToStartBtn = document.getElementById('back-to-start')

fetch('quiz-data.json')
  .then((response) => response.json())
  .then((data) => {
    quizData = data
  })
  .catch((error) => {
    console.error('Error loading quiz data:', error)
  })

categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    categoryCards.forEach((c) => c.classList.remove('selected'))

    card.classList.add('selected')
    selectedTopic = card.dataset.topic
    startBtn.disabled = false
  })
})

startBtn.onclick = () => {
  if (!selectedTopic) return alert('Please select a category.')

  quizQuestions = shuffleArray(quizData[selectedTopic]).slice(0, 10)
  currentQuestion = 0
  score = 0

  scoreDisplay.textContent = 'Score: 0'
  progressBar.style.width = '0%'
  nextBtn.style.display = 'inline-block'
  startScreen.style.display = 'none'
  quizContainer.style.display = 'block'
  quizTopicDisplay.textContent = selectedTopic

  loadQuestion()
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function loadQuestion() {
  clearInterval(timer)
  timeLeft = 15
  updateTimerDisplay()

  const q = quizQuestions[currentQuestion]
  questionText.textContent = q.question
  questionNumber.textContent = `Question ${currentQuestion + 1} of ${
    quizQuestions.length
  }`
  optionsContainer.innerHTML = ''
  nextBtn.disabled = true

  q.choices.forEach((choice) => {
    const btn = document.createElement('button')
    btn.textContent = choice
    btn.className = 'option-btn'
    btn.onclick = () => handleAnswer(btn, choice)
    optionsContainer.appendChild(btn)
  })

  startTimer()
}

function handleAnswer(button, selected) {
  clearInterval(timer)
  const q = quizQuestions[currentQuestion]
  const isCorrect = selected === q.answer

  if (isCorrect) {
    button.style.backgroundColor = '#a8e6a1'
    score++
    scoreDisplay.textContent = `Score: ${score}`
  } else {
    button.style.backgroundColor = '#f8a1a1'
    ;[...optionsContainer.children].find(
      (btn) => btn.textContent === q.answer
    ).style.backgroundColor = '#a8e6a1'
  }

  ;[...optionsContainer.children].forEach((btn) => (btn.disabled = true))
  nextBtn.disabled = false
}

nextBtn.onclick = () => {
  currentQuestion++
  if (currentQuestion < quizQuestions.length) {
    updateProgress()
    loadQuestion()
  } else {
    showFinalScore()
  }
}

function updateProgress() {
  const percent = (currentQuestion / quizQuestions.length) * 100
  progressBar.style.width = `${percent}%`
}

function startTimer() {
  timerDisplay.textContent = `Time Left: ${timeLeft}s`
  timer = setInterval(() => {
    timeLeft--
    updateTimerDisplay()

    if (timeLeft === 0) {
      clearInterval(timer)
      autoFailQuestion()
    }
  }, 1000)
}

function updateTimerDisplay() {
  timerDisplay.textContent = `Time Left: ${timeLeft}s`
}

function autoFailQuestion() {
  const q = quizQuestions[currentQuestion]
  const correctBtn = [...optionsContainer.children].find(
    (btn) => btn.textContent === q.answer
  )
  correctBtn.style.backgroundColor = '#a8e6a1'
  ;[...optionsContainer.children].forEach((btn) => (btn.disabled = true))
  nextBtn.disabled = false
}

function showFinalScore() {
  questionText.textContent = `Quiz Complete! Final Score: ${score}/${quizQuestions.length}`
  questionNumber.textContent = ''
  optionsContainer.innerHTML = ''
  timerDisplay.textContent = ''
  progressBar.style.width = '100%'

  nextBtn.style.display = 'none'

  saveScore(selectedTopic, score)
  showLeaderboard()
}

function saveScore(topic, score) {
  const playerName =
    prompt('Enter your name for the leaderboard:') || 'Anonymous'
  const savedScores = JSON.parse(localStorage.getItem('leaderboard')) || []

  savedScores.push({ name: playerName, topic, score })
  savedScores.sort((a, b) => b.score - a.score)
  localStorage.setItem('leaderboard', JSON.stringify(savedScores))
}

function showLeaderboard() {
  quizContainer.style.display = 'none'
  leaderboard.style.display = 'block'
  leaderboardList.innerHTML = ''

  const savedScores = JSON.parse(localStorage.getItem('leaderboard')) || []
  savedScores.forEach((entry, index) => {
    const li = document.createElement('li')
    li.textContent = `${index + 1}. ${entry.name} (${entry.topic}) - ${
      entry.score
    }`
    leaderboardList.appendChild(li)
  })
}

backToStartBtn.onclick = () => {
  leaderboard.style.display = 'none'
  startScreen.style.display = 'block'
  categoryCards.forEach((c) => c.classList.remove('selected'))
  selectedTopic = ''
  startBtn.disabled = true
}
