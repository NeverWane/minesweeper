'use strict'

/*
Questions:
1) clicking on size starts new game? or only smiley?
2) onhint show marked cells as well? same for mega hint
3) undo only last "real" move, or also restores life? hints? mine exterminator?
4) undo restores time?
5) undo works after game over? both for life 0 and win?
*/

const BEGINNER = 'BEGINNER'
const MEDIUM = 'MEDIUM'
const EXPERT = 'EXPERT'
const CUSTOM = 'CUSTOM'

const NORMAL = 'NORMAL'
const HINT = 'HINT'

let gAmountMap = {
    BEGINNER: 2,
    MEDIUM: 14,
    EXPERT: 32
}

const gSizeMap = {
    BEGINNER: 4,
    MEDIUM: 8,
    EXPERT: 12
}
const gLifeMap = {
    BEGINNER: 1,
    MEDIUM: 2,
    EXPERT: 3
}

let gBoard
let gSize
let gGame
let gTimeInterval
let clickType = NORMAL
const handleClick = {
    HINT: onHint,
    CUSTOM: onCustom
}

const handleToggle = {
    HINT: onToggleHint,
    CUSTOM: onToggleCustom
}
let difficulty = BEGINNER

function onInit() {
    gSize = gSizeMap[difficulty]
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        mineCount: 0,
        gameTimer: 0,
        lives: 3,
        hints: 3,
        safeClicks: 3,
        isCustom: false
    }
    gBoard = buildBoard()
    if (clickType !== NORMAL) {
        handleToggle[clickType]()
    }
    clickType = NORMAL
    toggleTimer(true)
    updateTime(true)
    updateScoreText()
    updateLife(true)
    updateSmiley('3')
    updateHints(3)
    updateSafeClicks(true)
    renderBoard(gBoard)
}

function onClickSize(value) {
    difficulty = value.toUpperCase()
    onInit()
}

function updateScoreText() {
    let scoreText = difficulty.charAt(0) + difficulty.toLowerCase().slice(1) + ': '
    let hiScore = getHiScore()
    scoreText += hiScore ? formatTime(hiScore) : 'None'
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

function updateSmiley(state = '') {
    if (!state) {
        state = isGameWin() ? 'win' : `${gGame.lives}`
    }
    let imageURL = `smiley${state}.png`
    updateElementIdImg('smiley', imageURL)
}

function onClickCell(elCell, i, j, timer = 0) {
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
    showCell(elCell, cell, timer)
    if (isCellMine(cell)) {
        return
    }
    let count = getMineNegsCount(cell)
    if (count) {
        elCell.innerText = count
    }
    if (timer) {
        setTimeout(() => {
            if (!cell.isShown) {
                elCell.innerText = ''
            }
        }, timer, cell)
    } else if (!timer && !count) {
        for (let neg of getNegsArray(gBoard, pos)) {
            if (neg && !(isCellMine(neg))) {
                let elNeg = getCellElement(neg.pos)
                onClickCell(elNeg, neg.pos.i, neg.pos.j)
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
        if (gGame.shownCount === 0 && !gGame.isCustom) {
            addMines()
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
        gGame.shownCount--
        if (!isGameOver()) {
            updateSmiley()
        }
    }
}

function onMarkCell(elCell, i, j) {
    if (!gGame.isOn) {
        return
    }
    let pos = { i, j }
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
    let mineCount = gGame.isCustom ? gGame.mineCount : gAmountMap[difficulty]
    return cell.isMarked || gGame.markedCount < mineCount && !cell.isShown
}

function isGameOver() {
    return isGameLoss() || isGameWin()
}

function isGameLoss() {
    return gGame.lives === 0
}

function isGameWin() {
    return !isGameLoss() && gGame.shownCount + gGame.markedCount === gSize ** 2
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
    if (!gGame.isCustom && !hiScore || gGame.gameTimer < getHiScore()) {
        message += '\nNew Hiscore!'
        localStorage.setItem(difficulty, gGame.gameTimer)
        updateScoreText()
    }
    console.log(message)
}

function updateLife(reset = false) {
    gGame.lives = reset? gLifeMap[difficulty] : gGame.lives - 1
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
        setTimeout(() => { elCell.classList.remove('safecell') }, 2000)
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
            onClickCell(currCell, currCell.dataset.i, currCell.dataset.j, 1000)
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
    if (cell.mineNegs !== 0 && !cell.mineNegs) {
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
}

function addMines(posArray = null) {
    let mineAmount
    if (!posArray) {
        posArray = shuffleArray(getCellsByCond(gBoard, (cell) => { return !cell.isShown }))
        mineAmount = gAmountMap[difficulty]
    } else {
        mineAmount = posArray.length
    }
    for (let i = 0; i < mineAmount; i++) {
        addMine(posArray.pop())
    }
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
function formatTime(timeInCenti) {
    let offSet = 11
    if (timeInCenti / 360_000 < 1) {
        offSet += 3
    }
    return new Date(timeInCenti * 10).toISOString().slice(offSet, -2)
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