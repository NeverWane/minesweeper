'use strict'

/*
Questions:
1) clicking on size starts new game? or only smiley? it does restart
2) onhint show marked cells as well? same for mega hint. they do show
3) undo only last "real" move, or also restores life? hints? mine exterminator? no to all but mine exterminator
4) undo restores time? no
5) undo works after game over? both for life 0 and win? no
*/

const BEGINNER = 'BEGINNER'
const MEDIUM = 'MEDIUM'
const EXPERT = 'EXPERT'
const CUSTOM = 'CUSTOM'
const SECRET = 'SECRET'

const NORMAL = 'NORMAL'
const HINT = 'HINT'
const MHINT = 'MHINT'

let gAmountMap = {
  BEGINNER: 2,
  MEDIUM: 14,
  EXPERT: 32,
  SECRET: 40
}

const gSizeMap = {
  BEGINNER: 4,
  MEDIUM: 8,
  EXPERT: 12,
  SECRET: 16
}
const gLifeMap = {
  BEGINNER: 1,
  MEDIUM: 2,
  EXPERT: 3,
  SECRET: 4
}

//no longer in use. keeping just in case
const gCellSizeMap = {
  BEGINNER: 'huge',
  MEDIUM: 'large',
  EXPERT: 'medium',
  SECRET: 'small'
}

let gBoard
let gSize
let gGame
let gTimeInterval
let gameStates
let savedPos
let clickType = NORMAL
const handleClick = {
  HINT: onHint,
  CUSTOM: onCustom,
  MHINT: onMegaHint,
}

const handleToggle = {
  HINT: onToggleHint,
  CUSTOM: onToggleCustom,
  MHINT: onToggleMHint,
}
let difficulty = BEGINNER

function onInit() {
  gSize = gSizeMap[difficulty]
  savedPos = null
  gameStates = []
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    mineCount: 0,
    gameTimer: 0,
    lives: 3,
    hints: 3,
    safeClicks: 3,
    isCustom: false,
  }
  gBoard = buildBoard()
  if (clickType !== NORMAL) {
    handleToggle[clickType]()
  }
  clickType = NORMAL
  getElementById('mhint').classList.remove('disabled')
  getElementById('undo').classList.add('disabled')
  getElementById('exter').classList.add('disabled')
  toggleTimer(true)
  updateTime(true)
  updateScoreText()
  updateLife(true)
  updateMarks(true)
  updateHints(3)
  updateSafeClicks(true)
  let smiley = '3'
  if (difficulty === SECRET) {
    smiley = '4'
  }
  updateSmiley(smiley)
  renderBoard(gBoard)
}

function onToggleDarkMode() {
  getElement('body').classList.toggle('darkmode')
}

function onClickSize(value) {
  difficulty = value.toUpperCase()
  onInit()
}

function updateScoreText() {
  let scoreText =
    difficulty.charAt(0) + difficulty.toLowerCase().slice(1) + ': '
  let hiScore = getHiScore()
  scoreText += hiScore ? formatTime(hiScore, false) : 'None'
  updateElementIdText('difficulty', scoreText)
}

function getHiScore() {
  let score = localStorage.getItem(difficulty)
  return score
}

function buildBoard() {
  let board = []
  for (let i = 0; i < gSize; i++) {
    let row = []
    for (let j = 0; j < gSize; j++) {
      row.push(createCell(gCellSizeMap[difficulty], { i, j }))
    }
    board.push(row)
  }
  return board
}

//cellSize no longer used. kept just in case
function renderBoard(board) {
  let cellSize = gCellSizeMap[difficulty]
  let innerHTML = createTableHTML(board, cellSize)
  getElement('.board').innerHTML = innerHTML
}

function updateSmiley(state = '') {
  if (!state) {
    state = isGameWin() ? 'win' : `${gGame.lives}`
  }
  let imageURL = `smiley${state}.png`
  updateElementIdImg('smiley', imageURL)
}

function onClickCell(elCell, i, j, timer = 0, saveState = true) {
  let pos = { i, j }
  if (!gGame.isOn || !elCell) {
    return
  }
  if (!gTimeInterval && clickType !== CUSTOM) {
    toggleTimer()
  }
  let cell = getCellByPos(pos)
  if (!canClickCell(cell, timer)) {
    return
  }
  if (clickType !== NORMAL) {
    handleClick[clickType](elCell, pos)
    return
  }
  if (saveState) {
    createSaveState()
  }
  showCell(elCell, cell, timer)
  if (isCellMine(cell)) {
    return
  }
  let count = cell.mineNegs
  if (count) {
    elCell.innerText = count
  }
  if (timer) {
    setTimeout(
      () => {
        if (!cell.isShown) {
          elCell.innerText = ''
        }
      },
      timer,
      cell
    )
  } else if (!timer && !count) {
    for (let neg of getNegsArray(gBoard, pos)) {
      if (neg && !isCellMine(neg)) {
        let elNeg = getCellElement(neg.pos)
        onClickCell(elNeg, neg.pos.i, neg.pos.j, 0, false)
      }
    }
  }
}

function showCell(elCell, cell, timer) {
  elCell.classList.add('shown')
  if (timer) {
    setTimeout(() => {
      if (!cell.isShown) {
        elCell.classList.remove('shown')
      }
    }, timer)
  } else {
    cell.isShown = true
    if (!gGame.shownCount && !gGame.isCustom) {
      addMines(cell.pos)
    }
    gGame.shownCount++
  }
  if (isCellMine(cell)) {
    onClickMine(elCell, cell, timer)
  }
  if (isGameOver()) {
    gameOver()
  }
}

function onClickMine(elCell, cell, timer) {
  elCell.classList.add('mine')
  if (timer) {
    setTimeout(() => {
      if (!cell.isShown) {
        elCell.classList.remove('mine')
      }
    }, timer)
  } else {
    updateLife()
    gGame.markedCount++
    updateMarks()
    gGame.shownCount--
    if (!isGameOver()) {
      updateSmiley()
    }
  }
}

function createSaveState() {
  if (!gameStates.length) {
    getElementById('undo').classList.remove('disabled')
    getElementById('exter').classList.remove('disabled')
  }
  let boardState = []
  let countsState = {
    shownCount: gGame.shownCount,
    markedCount: gGame.markedCount,
    mineCount: gGame.mineCount,
  }
  for (let row of gBoard) {
    let rowCopy = []
    for (let cell of row) {
      rowCopy.push(createCellCopy(cell))
    }
    boardState.push(rowCopy)
  }
  let gameState = { boardState, countsState }
  gameStates.push(gameState)
}

function onToggleMHint(elBtn = null) {
  if (!gGame.isOn || (elBtn && elBtn.classList.contains('disabled'))) {
    return
  }
  if (savedPos) {
    getCellElement(savedPos).classList.remove('hintcell')
    savedPos = null
  }
  clickType = clickType === MHINT ? NORMAL : MHINT
  if (!elBtn) {
    elBtn = getElementById('mhint')
  }
  elBtn.classList.toggle('onhint')
}

function onMegaHint(elCell, pos) {
  if (!elCell || !pos) {
    return
  }
  if (!savedPos) {
    savedPos = pos
    elCell.classList.add('hintcell')
    return
  }
  getCellElement(savedPos).classList.remove('hintcell')
  let minRow = Math.min(savedPos.i, pos.i)
  let minCol = Math.min(savedPos.j, pos.j)
  let maxRow = Math.max(savedPos.i, pos.i)
  let maxCol = Math.max(savedPos.j, pos.j)
  onToggleMHint()
  getElementById('mhint').classList.add('disabled')
  for (let i = minRow; i <= maxRow; i++) {
    for (let j = minCol; j <= maxCol; j++) {
      onClickCell(getCellElement({ i, j }), i, j, 2000, false)
    }
  }
}

function onMineExterminator(elBtn) {
  if (clickType === MHINT) {
    onToggleMHint()
  }
  if (
    !gGame.isOn ||
    !gameStates.length ||
    elBtn.classList.contains('disabled')
  ) {
    return
  }
  getElementById('exter').classList.add('disabled')
  createSaveState()
  let minePositions = shuffleArray(getCellsByCond(gBoard, isCellMine))
  for (let i = 0; i < 3; i++) {
    if (minePositions && minePositions[0]) {
      let mineCell = getCellByPos(minePositions.pop())
      mineCell.isMine = false
      gGame.mineCount--
    }
  }
  updateMarks()
  setMinesNegsCount()
  renderBoard(gBoard)
}

//if no cells are shown after undo the game will restart unless it's a custom game
function onUndo() {
  if (clickType === MHINT) {
    onToggleMHint()
  }
  if (!gGame.isOn || !gameStates.length) {
    return
  }
  let gameState = gameStates.pop()
  let counters = gameState.countsState
  gBoard = gameState.boardState
  for (let key in counters) {
    gGame[key] = counters[key]
  }
  if (!gGame.shownCount && !gGame.isCustom) {
    onInit()
    return
  }
  if (!gameStates.length) {
    getElementById('undo').classList.add('disabled')
  }
  updateMarks()
  renderBoard(gBoard)
}

function onMarkCell(elCell, i, j) {
  if (!gGame.isOn || clickType === CUSTOM) {
    return
  }
  let pos = { i, j }
  let cell = getCellByPos(pos)
  if (!canMarkCell(cell)) {
    return
  }
  if (gameStates.length) {
    createSaveState()
  }
  updateCellMark(elCell, cell)
  updateMarks()
  if (isGameOver()) {
    gameOver()
  }
}

function updateCellMark(elCell, cell) {
  if (cell.isPossible) {
    cell.isPossible = false
    cell.isMarked = false
    elCell.classList.remove('marked')
    elCell.classList.remove('possible')
    gGame.markedCount--
  } else if (cell.isMarked) {
    cell.isPossible = true
    elCell.classList.add('possible')
  } else {
    cell.isMarked = true
    elCell.classList.add('marked')
    gGame.markedCount++
  }
}

function canMarkCell(cell) {
  return cell.isMarked || (gGame.markedCount < gGame.mineCount && !cell.isShown)
}

function isGameOver() {
  return isGameLoss() || isGameWin()
}

function isGameLoss() {
  return gGame.lives === 0
}

function isGameWin() {
  return (
    !isGameLoss() &&
    gGame.markedCount === gGame.mineCount &&
    gGame.shownCount + gGame.markedCount === gSize ** 2
  )
}

function gameOver() {
  gGame.isOn = false
  toggleTimer()
  updateSmiley()
  if (isGameWin()) {
    onGameWin()
  } else {
    console.log('game over')
  }
}

function onGameWin() {
  let hiScore = getHiScore()
  let message = 'Victory!'
  if ((!gGame.isCustom && !hiScore) || gGame.gameTimer < getHiScore()) {
    message += '\nNew Hiscore!'
    localStorage.setItem(difficulty, gGame.gameTimer)
    updateScoreText()
  }
  console.log(message)
}

function updateLife(reset = false) {
  gGame.lives = reset ? gLifeMap[difficulty] : gGame.lives - 1
  updateElementText('.lives span', gGame.lives)
}

function updateMarks(reset = false) {
  if (reset) {
    updateElementText('.marks span', gAmountMap[difficulty])
  } else {
    updateElementText('.marks span', gGame.mineCount - gGame.markedCount)
  }
}

function isPosShown(pos) {
  return getCellByPos(pos).isShown
}

function setMinesNegsCount() {
  for (let i = 0; i < gSize; i++) {
    for (let j = 0; j < gSize; j++) {
      let cell = getCellByPos({ i, j })
      cell.mineNegs = getMineNegsCount(cell)
    }
  }
}

function onClickSafe(elBtn) {
  if (!gGame.isOn || !gGame.safeClicks) {
    return
  }
  if (clickType !== NORMAL) {
    handleToggle[clickType]()
    clickType = NORMAL
  }
  let pos = getSafePos()
  if (pos) {
    let elCell = getCellElement(pos)
    elCell.classList.add('safecell')
    setTimeout(() => {
      elCell.classList.remove('safecell')
    }, 2000)
  }
  updateSafeClicks()
}

function updateSafeClicks(reset = false) {
  gGame.safeClicks = reset ? 3 : gGame.safeClicks - 1
  updateElementIdText('safecount', gGame.safeClicks)
  if (reset) {
    getElement('.safe').classList.remove('disabled')
  } else if (!gGame.safeClicks) {
    getElement('.safe').classList.add('disabled')
  }
}

function getSafePos() {
  return shuffleArray(getCellsByCond(gBoard, isValidSafeCell)).pop()
}

function onHint(elCell, pos) {
  onToggleHint(getElement('.onhint'))
  updateHints()
  if (isPosShown(pos)) {
    return
  }
  let elCells = getNegsArray(getElTableMat('.board-container'), pos)
  elCells.push(elCell)
  for (let currCell of elCells) {
    if (currCell) {
      onClickCell(currCell, currCell.dataset.i, currCell.dataset.j, 1000, false)
    }
  }
}

function updateHints(amount = gGame.hints - 1) {
  gGame.hints = amount
  getElementById('hintcount').innerText = amount
  if (!amount) {
    getElement('.hint').classList.add('disabled')
  } else if (amount === 3) {
    getElement('.hint').classList.remove('disabled')
  }
}

function onToggleHint(elBtn) {
  if (!gGame.hints || !gGame.isOn) {
    clickType = NORMAL
    return
  }
  if (!elBtn) {
    elBtn = getElementById('hint')
  }
  if (clickType !== HINT) {
    if (clickType !== NORMAL) {
      handleToggle[clickType]()
    }
    clickType = HINT
  } else {
    clickType = NORMAL
  }
  elBtn.classList.toggle('onhint')
}

function hideCell(elCell, pos) {
  if (!isPosShown(pos)) {
    elCell.classList.remove('shown')
  }
}

function getMineNegsCount(cell) {
  if (cell.mineNegs !== 0) {
    let negsArray = getNegsArray(gBoard, cell.pos)
    cell.mineNegs = getCellsByCond([negsArray], isCellMine).length
  }
  return cell.mineNegs
}

function onToggleCustom(elBtn = null) {
  if (!elBtn) {
    elBtn = getElementById('custom')
  }
  elBtn.classList.toggle('tempmine')
  if (clickType === CUSTOM) {
    clickType = NORMAL
    if (gGame.mineCount === 0) {
      onInit()
      return
    }
    for (let row of gBoard) {
      for (let cell of row) {
        if (cell.isMine) {
          getCellElement(cell.pos).classList.remove('tempmine')
        }
      }
    }
    gGame.isCustom = true
    setMinesNegsCount()
    toggleTimer()
  } else {
    onInit()
    updateMarks()
    clickType = CUSTOM
  }
}

function onCustom(elCell, pos) {
  if (!elCell || !pos) {
    return
  }
  let cell = getCellByPos(pos)
  cell.isMine = !cell.isMine
  gGame.mineCount += cell.isMine ? 1 : -1
  elCell.classList.toggle('tempmine')
  updateMarks()
}

function addMines(startPos) {
  let negs = getNegsArray(gBoard, startPos)
  if (!gGame.isCustom) {
    gGame.mineCount = gAmountMap[difficulty]
  }
  let posArray = shuffleArray(
    getCellsByCond(gBoard, cell => {
      return !cell.isShown && !negs.includes(cell)
    }))
  for (let i = 0; i < gGame.mineCount; i++) {
    if (posArray && posArray[0]) {
      addMine(posArray.pop())
    }
  }
  updateMarks()
  setMinesNegsCount()
}

function addMine(pos) {
  getCellByPos(pos).isMine = true
}

function toggleTimer(reset = false) {
  if (gTimeInterval) {
    clearInterval(gTimeInterval)
    gTimeInterval = null
  } else {
    if (!reset) {
      gTimeInterval = setInterval(updateTime, 10)
    }
  }
}

function updateTime(reset = false) {
  if (!reset) {
    gGame.gameTimer++
  }
  let offSet = 11
  if (gGame.gameTimer / 360_000 < 1) {
    offSet += 3
  }
  let timeText = formatTime(gGame.gameTimer)
  updateElementIdText('timer', timeText)
}

//this time format should work up to 1 day
//note that gameTimer is in centi (10^-2) and not milli (10^-3) seconds
function formatTime(timeInCenti, addTimeText = true) {
  let offSet = 11
  if (timeInCenti / 360_000 < 1) {
    offSet += 3
  }
  let timeText = addTimeText ? 'Time:\n' : ''
  return timeText + new Date(timeInCenti * 10).toISOString().slice(offSet, -2)
}

function getCellByPos(pos) {
  return gBoard[pos.i][pos.j]
}

function getCellElement(pos) {
  return getElementById(getCellId(pos))
}

function createTableHTML(board, cellSize) {
  let innerHTML = ''
  for (let i = 0; i < board.length; i++) {
    innerHTML += '<tr>'
    for (let j = 0; j < board[0].length; j++) {
      innerHTML += getCellHTML(board[i][j], i, j)
    }
    innerHTML += '</tr>'
  }
  return innerHTML
}
