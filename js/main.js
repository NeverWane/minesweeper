'use strict'

const BEGINNER = 'BEGINNER'
const MEDIUM = 'MEDIUM'
const EXPERT = 'EXPERT'

let gBoard
let gSize
let gGame
let difficulty
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

function onInit() {
    difficulty = BEGINNER //get from input later
    gSize = gSizeMap[difficulty]
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        startTime: 0
    }
    gBoard = buildBoard()
    renderBoard(gBoard)

    // // test adding mines
    // let pos1 = { i: 0, j: 1 }
    // let pos2 = { i: 1, j: 3 }
    // addMine(pos1)
    // addMine(pos2)

    // test adding mines randomly
    addMines()

    // test negsCount
    setMinesNegsCount()
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

function onClickCell(elCell, i, j) {
    if (gGame.isOn) {
        let cell = getCellByPos({ i, j })
        elCell.classList.add('shown')
        if (isCellMine(cell)) {
            elCell.classList.add('mine')
        } else {
            let count = getMineNegsCount(cell)
            if (count) {
                elCell.innerText = count
            }
        }
    }
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
    let cellsArray = shuffleArray(matrixToArray(gBoard))
    for (let i = 0; i < mineAmount; i++) {
        addMine(cellsArray.pop().pos)
    }
}

function addMine(pos) {
    getCellByPos(pos).isMine = true
}

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