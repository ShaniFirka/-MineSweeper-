'use strict'
const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''
var gBoard = []
var gTimeImterval
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIFE: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
    life: gLevel.LIFE,
    minesCells: []
}


function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true,
        life: gLevel.LIFE,
        minesCells: []
    }
}
function startGame() {
    clearTimer()
    initGame()
    clearInterval(gTimeImterval)
    var elSec = document.querySelector('.sec')
    elSec.innerText = '00'
    var elMin = document.querySelector('.min')
    elMin.innerText = '00'
}

function clearTimer() {
    clearInterval(gTimeImterval)
    var elSec = document.querySelector('.sec')
    elSec.innerText = '00'
    var elMin = document.querySelector('.min')
    elMin.innerText = '00'
}
function smileyStart() {
    clearTimer()
    startGame()
}

function startTimer() {
    if (gGame.isOn) {
        gTimeImterval = setInterval(setTimer, 1000)
    }

}

function setTimer() {
    if (!gGame.isOn) return
    //sec
    gGame.secsPassed++
    var elSec = document.querySelector('.sec')
    var currSec = elSec.innerText
    currSec++
    elSec.innerText = currSec
    //min
    var elMin = document.querySelector('.min')
    var currMin = elMin.innerText
    if (currSec > 60) {
        currMin++
        elMin.innerText = currMin
        //need to reset the sec
        currSec = 0
        elSec.innerText = currSec
    }
}

function setLevel(difficulty) {
    switch (difficulty) {
        case ('easy'):
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gLevel.LIFE = 1
            break;
        case ('medium'):
            gLevel.SIZE = 8
            gLevel.MINES = 14
            gLevel.LIFE = 3
            break;
        case ('hard'):
            gLevel.SIZE = 12
            gLevel.MINES = 36
            gLevel.LIFE = 3
            break;
        default:
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gLevel.LIFE = 2
    }
    startGame()
}

function checkGameOver() {
    var totalCells = gLevel.SIZE * gLevel.SIZE
    if (gGame.markedCount + gGame.shownCount === totalCells ||
        totalCells - gGame.shownCount === gLevel.MINES) {
        gGame.isOn = false
        console.log('VICTORY!!')
        revealMines()
        clearTimer()
    }
    if (gGame.life === 0) {
        gGame.isOn = false
        console.log('LOOSER')
        revealMines()
        clearTimer()
    }
}

function cellMarked(elCell, i, j) {
    if (gGame.isOn === false) return
    if (gGame.isFirstClick) {
        startTimer()
        gGame.isFirstClick = false
    }
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (cell.isMarked) {
        var value = EMPTY
        cell.isMarked = false
        if (cell.isMine) gGame.markedCount--
    } else {
        var value = FLAG
        cell.isMarked = true
        if (cell.isMine) {
            gGame.markedCount++
            console.log(i, j, 'MINE')
            checkGameOver()
        }
    }
    renderCell(elCell, value)
}

function cellClicked(elCell, i, j) {
    if (gGame.isOn === false) return
    if (gGame.isFirstClick) {
        startTimer()
        gGame.isFirstClick = false
    }
    var cell = gBoard[i][j]
    if (cell.isMarked) return
    if (cell.isShown) return
    cell.isShown = true
    elCell.classList.add('shown')
    var value = EMPTY
    if (cell.isMine) {
        value = MINE
        gGame.life--
        checkGameOver()
    } else if (cell.minesAroundCount > 0) {
        value = cell.minesAroundCount
        gGame.shownCount++
    } else {
        expand(gBoard, i, j)
        gGame.shownCount++
    }
    renderCell(elCell, value)
}

function renderCell(elCell, value) {
    var elSpan = elCell.querySelector('span')
    elSpan.innerText = value

}
function expand(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            var cell = board[i][j]
            if (cell.minesAroundCount === 0 && cell.isMarked === false) {
                cell.isShown = true
                var elcell = document.querySelector('.cell-' + i + '-' + j)
                elcell.classList.add('shown')
                renderCell(elcell, EMPTY)

            }
        }
    }
}
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var value = EMPTY
            if (cell.isShown) {
                if (cell.isMine) value = MINE
                else if (cell.minesAroundCount > 0) value = cell.minesAroundCount
            }
            var cellData = i + '-' + j

            strHTML += `<td class="cell-${cellData}" oncontextmenu="cellMarked(this,${i},${j})"
             onclick="cellClicked(this,${i},${j})"><span>${value}</span></td> `
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function buildBoard() {
    var board = createBoard()
    putMinesOngBoard(board)
    // update ngs count:
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = countMineNegs(i, j, board)
        }
    }
    return board
}

function createBoard() {
    var board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function putMinesOngBoard(board) {
    var count = gLevel.MINES
    for (var i = 0; i < count; i++) {
        var randI = getRandomInt(0, gLevel.SIZE)
        var randJ = getRandomInt(0, gLevel.SIZE)
        var cell = board[randI][randJ]
        if (cell.isMine) count++
        else {
            cell.isMine = true
            gGame.minesCells.push({ i: randI, j: randJ })
            console.log(gGame.minesCells)
        }

    }
}

function countMineNegs(cellI, cellJ, board) {
    var negsMineCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            var cell = board[i][j]
            if (cell.isMine) negsMineCount++
        }
    }
    return negsMineCount
}

function revealMines() {
    for (var i = 0; i < gGame.minesCells.length; i++) {
        var pos = gGame.minesCells[i] // {i:i, j:j}
        var cell = gBoard[pos.i][pos.j]
        if (cell.isShown) continue
        cell.isShown = true
        var elCell = document.querySelector('.cell-' + i + '-' + j)
        elCell.classList.add('shown')
        renderCell(elCell, MINE)
    }
}

