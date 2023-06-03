'use strict'

// let gCellClasses = {
//     isShown: 'shown',
//     isMine: 'mine',
//     isMarked: 'marked',
// }

function createCell(cellSize, pos, isShown = false, isMine = false, isMarked = false, isPossible = false, mineNegs = '') {
    return {cellSize, pos, isShown, isMine, isMarked, isPossible, mineNegs}
}

function createCellCopy(cell) {
    // let cellCopy = {
    //     pos: cell.pos,
    //     isShown: cell.isShown,
    //     isMine: cell.isMine,
    //     isMarked: cell.isMarked,
    //     mineNegs: cell.mineNegs
    // }
    return createCell(cell.cellSize, cell.pos, cell.isShown, cell.isMine, cell.isMarked, cell.isPossible, cell.mineNegs)
}

function getCellHTML(cell, i, j) {
    let cellHTML = '<td class="cell'
    let negsText = ''
    if (cell.isShown) {
        cellHTML += ' shown'
        if (cell.isMine) {
            cellHTML += ' mine'
        } else if (cell.mineNegs) {
            negsText = cell.mineNegs
        }
    }
    if (cell.isMarked) {
        cellHTML += ' marked'
        if (cell.isPossible) {
            cellHTML += ' possible'
        }
    }
    cellHTML += ` ${cell.cellSize}" id="cell-${i}-${j}" data-i="${i}" data-j="${j}" oncontextmenu="onMarkCell(this, this.dataset.i, this.dataset.j)" onclick="onClickCell(this, this.dataset.i, this.dataset.j)">${negsText}</td>`
    return cellHTML
}

function canClickCell(cell, timer) {
    if (!cell) {
        return
    }
    return timer || !cell.isShown && !cell.isMarked
}

function isCellMine(cell) {
    return cell && cell.isMine
}

function isValidSafeCell(cell) {
    return cell && !cell.isMine && !cell.isShown
}

function getCellId(pos) {
    return `cell-${pos.i}-${pos.j}`
}