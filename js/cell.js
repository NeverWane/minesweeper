'use strict'

let gCellClasses = {
    isShown: 'shown',
    isMine: 'mine',
    isMarked: 'marked',
}

function createCell(pos, isShown = false, isMine = false, isMarked = false, mineNegs = '') {
    return {pos, isShown, isMine, isMarked, mineNegs}
}

function getCellHTML(cell, i, j) {
    let cellHTML = '<td class="cell'
    for (let key in gCellClasses) {
        if (cell[key]) {
            cellHTML += ` ${gCellClasses[key]}`
        }
    }
    cellHTML += `" id="cell-${i}-${j}" data-i="${i}" data-j="${j}" oncontextmenu="onMarkCell(this, this.dataset.i, this.dataset.j)" onclick="onClickCell(this, this.dataset.i, this.dataset.j)"></td>`
    return cellHTML
}

function canClickCell(cell) {
    return cell && !cell.isShown && !cell.isMarked
}

function isCellMine(cell) {
    return cell && cell.isMine
}

function getCellId(pos) {
    return `cell-${pos.i}-${pos.j}`
}