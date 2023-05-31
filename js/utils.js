'use strict'

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getImage(name, fileType = 'png') {
    return `images/${name}.${fileType}`
}
// function getGhostImage(name, fileType = 'png') {
    // let src = gPacman.isSuper ? PINK_IMG : ghost.img
    // return `<img src="${src}" alt="">`
    // return `images/${name}.${fileType}`
// }

function isObjectKeyValue(object, key, value) {
    return object && object[key] === value
}

function outOfBounds(min, max, value) {
    return value < min || value > max
}

function getCellsByCond(mat, cond, startRow = 0, startCol = 0, endRow = mat.length - 1, endCol = mat[0].length - 1) {
    let cells = []
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            if (mat[i] && mat[i][j]) {
                let currCell = mat[i][j]
                if (cond(currCell)) {
                    cells.push({ i, j })
                }
            }
        }
    }
    return cells
}

function matrixToArray(mat) {
    return [].concat(...mat)
}

function getSubmatrix(mat, startRow = 0, startCol = 0, endRow = mat.length - 1, endCol = mat[0].length - 1) {
    let subMat = []
    for (let i = startRow; i <= endRow; i++) {
        let row = []
        for (let j = startCol; j <= endCol; j++) {
            if (mat[i]) {
                row.push(mat[i][j])
            }
        }
        subMat.push(row)
    }
    return subMat
}

function getNegsArray(mat, pos) {
    let negs = []
    let subMat = getSubmatrix(mat, pos.i - 1, pos.j - 1, pos.i + 1, pos.j + 1)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!(i===1 && j===1)) {
                negs.push(subMat[i][j])
            }
        }
    }
    return negs
}

function getElTableMat(tableKey) {
    let table = []
    let elRows = [...getElement(`${tableKey}`).rows]
    for (let elRow of elRows) {
        let row = []
        for (let elCell of elRow.cells) {
            row.push(elCell)
        }
        table.push(row)
    }
    return table
}

function updateElementText(elementKey, text) {
    getElement(elementKey).innerText = text
}

function updateElementIdImg(elementId, src) {
    getElementById(elementId).src = src
}

function getElement(elementKey) {
    return document.querySelector(elementKey)
}

function getElementById(elementId) {
    return document.getElementById(elementId)
}

function getElements(elementKey) {
    return document.querySelectorAll(elementKey)
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createShuffledArray(start = 1, end = 100, amount = 100) {
    return shuffleArray(createArrayFromIToJ(start, end)).slice(0, amount)
}

function shuffleArray(array, amount = 1000) {
    var len = array.length
    var shuffledArray = array.slice()
    for (var i = 0; i < amount; i++) {
        var index1 = getRandomInt(0, len)
        var index2 = getRandomInt(0, len)
        const val1 = shuffledArray[index1]
        shuffledArray[index1] = shuffledArray[index2]
        shuffledArray[index2] = val1
    }
    return shuffledArray
}

function createArrayFromIToJ(start, end, inc = 1) {
    var nums = []
    for (var i = start; i <= end; i += inc) {
        nums.push(i)
    }
    return nums
}

function getRandomInt(min, max) {
    return (Math.floor(Math.random() * (max - min))) + min
}