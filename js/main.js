'use strict'

const BEGINNER = 'BEGINNER'
const MEDIUM = 'MEDIUM'
const EXPERT = 'EXPERT'
const gAmountMap = {
    BEGINNER: 2,
    MEDIUM: 14,
    EXPERT: 32
}
const gSizeMap = {
    BEGINNER: 4,
    MEDIUM: 8,
    EXPERT: 12
}

let gBoard
let gSize
let gGame
let difficulty = BEGINNER

function onInit() {
    gSize = gSizeMap[difficulty]
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        startTime: 0,
        lives: 3
    }
    gBoard = buildBoard()
    updateSmiley()
    updateLife(true)
    renderBoard(gBoard)
}

function onClickSize(value) {
    difficulty = value.toUpperCase()
}

function buildBoard() {
    let board = []
    for (let i = 0; i < gSize; i++) {
        let row = []
        for (let j = 0; j < gSize; j++) {
            row.push(createCell({ i, j }))
        }
        board.push(row)
    }
    return board
}

function renderBoard(board) {
    let innerHTML = createTableHTML(board)
    getElement('.board').innerHTML = innerHTML
}

function updateSmiley() {
    let imageURL = 'smiley'
    imageURL += isGameWin() ? 'win' : `${gGame.lives}`
    imageURL += '.png'
    updateElementIdImg('smiley', imageURL)
}

function onClickCell(elCell, i, j) {
    let pos = { i, j }
    if (!gGame.isOn || !elCell) {
        return
    }
    let cell = getCellByPos(pos)
    if (!canClickCell(cell)) {
        return
    }
    showCell(elCell, cell)
    if (isCellMine(cell)) {
        onClickMine(elCell)
        return
    }
    let count = getMineNegsCount(cell)
    if (count) {
        elCell.innerText = count
    } else {
        for (let neg of getNegsArray(gBoard, pos)) {
            if (neg && !(isCellMine(neg))) {
                let elNeg = getCellElement(neg.pos)
                onClickCell(elNeg, neg.pos.i, neg.pos.j)
            }
        }
    }
}

function onMarkCell(elCell, i, j) {
    if (!gGame.isOn) {
        return
    }
    let pos = {i, j}
    let cell = getCellByPos(pos)
    if (!canMarkCell(cell)) {
        return
    }
    cell.isMarked = !cell.isMarked
    gGame.markedCount += cell.isMarked ? 1 : -1
    elCell.classList.toggle('marked')
    if (isGameOver()) {
        gameOver()
    }
}

function canMarkCell(cell) {
    return cell.isMarked || gGame.markedCount < gAmountMap[difficulty] && !cell.isShown
}

function showCell(elCell, cell) {
    cell.isShown = true
    elCell.classList.add('shown')
    if (!gGame.shownCount) {
        addMines()
    }
    gGame.shownCount++
    if (isGameOver()) {
        gameOver()
    }
}

function onClickMine(elCell) {
    elCell.classList.add('mine')
    updateLife()
    gGame.markedCount++
    gGame.shownCount--
    if (isGameOver()) {
        gameOver()
    } else {
        updateSmiley()
    }
}

function isGameOver() {
    return isGameLoss() || isGameWin()
}

function isGameLoss() {
    return gGame.lives === 0
}

function isGameWin() {
    return gGame.shownCount + gGame.markedCount === gSize ** 2
}

function gameOver() {
    gGame.isOn = false
    updateSmiley()
    console.log('game over')
}

function updateLife(reset = false) {
    if (reset) {
        gGame.lives = 3
    } else {
        gGame.lives--
    }
    updateElementText('.lives span', gGame.lives)
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

function getMineNegsCount(cell) {
    if (cell.mineNegs !== 0 && !cell.mineNegs) {
        let negsArray = getNegsArray(gBoard, cell.pos)
        cell.mineNegs = getCellsByCond([negsArray], isCellMine).length
    }
    return cell.mineNegs
}

function addMines() {
    let mineAmount = gAmountMap[difficulty]
    let posArray = shuffleArray(getCellsByCond(gBoard, (cell) => {return !cell.isShown}))
    for (let i = 0; i < mineAmount; i++) {
        addMine(posArray.pop())
    }
    setMinesNegsCount
}

function addMine(pos) {
    getCellByPos(pos).isMine = true
}

//used for testing
function addMineDOM(pos) {
    let elCell = getCellElement(pos)
    elCell.classList.add('mine')
}

function getCellByPos(pos) {
    return gBoard[pos.i][pos.j]
}

function getCellElement(pos) {
    return getElementById(getCellId(pos))
}

function createTableHTML(board) {
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