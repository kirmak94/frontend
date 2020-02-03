const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
const Row = 'R';
const Col = 'C';
const LeftDiag = 'LD';
const RightDiag = 'RD';
let EndOfGame = false;
let currentPlayer;
let dimension;
let Grid;
let filledCellsCount;
const container = document.getElementById('fieldWrapper');

startGame();
addResetListener();
addResizeListener();

function startGame(dimension = 3) {
    EndOfGame = false;
    currentPlayer = CROSS;
    filledCellsCount = 0;
    initGrid(dimension);
    renderGrid(dimension);
}

function ResizeField() {
    let newDimension = Grid.length + 2;
    let newColumn = []

    for (let i = 0; i < newDimension; i++)
        newColumn[i] = EMPTY;

    for (let i = 0; i < Grid.length; i++) {
        Grid[i].unshift(EMPTY);
        Grid[i].push(EMPTY);
    }

    Grid.unshift(newColumn);
    Grid.push(newColumn);

    renderGrid(newDimension);
}

function initGrid(dimension) {
    Grid = [];
    for (let i = 0; i < dimension; i++) {
        Grid[i] = [];
        for (let j = 0; j < dimension; j++)
            Grid[i][j] = EMPTY;
    }
}

function renderGrid(dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = Grid[i][j];
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}



function cellClickHandler(row, col, winnerInfo) {

    console.log(`Clicked on cell: ${row}, ${col}`);
    if (EndOfGame || Grid[row][col] != EMPTY) {
        return;

    }
    filledCellsCount++;
    Grid[row][col] = currentPlayer;
    renderSymbolInCell(currentPlayer, row, col);
    var winner = winnerInfo === undefined ? checkWinner(row, col) : winnerInfo;
    if (winner) {
        alert(`Победил ${currentPlayer}`);
        changeColor(winner.winType, winner.startRow, winner.startCol);
        EndOfGame = true;
        return;
    }
    if (!anyPossibleMovesLeft()) {
        alert(`Победила дружба`);
        EndOfGame = true;
        return;
    }
    if (filledCellsCount > Math.pow(Grid.length, 2) / 2)
        ResizeField();
    currentPlayer = currentPlayer === ZERO ? CROSS : ZERO;
    if (currentPlayer === ZERO) {
        callAI();
    }

}

function anyPossibleMovesLeft() {
    for (let i = 0; i < Grid.length; i++) {
        for (let j = 0; j < Grid[i].length; j++)
            if (Grid[i][j] === EMPTY) {
                return true;
            }
    }
    return false;
}

function checkWinner(row, col) {

    var winByDiag = checkDiagonals(row, col);
    if (winByDiag) {
        return winByDiag
    }

    var winByLine = checkLines(row, col);
    if (winByLine) {
        return winByLine;
    }
    return false;
}

function callAI() {
    let EmptyCells = getEmptyCells();
    for (let cell of EmptyCells) {
        Grid[cell.row][cell.col] = ZERO;
        var winPosition = checkWinner(cell.row, cell.col);
        Grid[cell.row][cell.col] = EMPTY;
        if (winPosition) {
            cellClickHandler(cell.row, cell.col, winPosition);
            return;
        }
    }
    let randomCell = EmptyCells[Math.floor(Math.random() * Math.floor(EmptyCells.length))];
    cellClickHandler(randomCell.row, randomCell.col)
}

function getEmptyCells() {
    let EmptyCells = []
    var dimension = Grid.length;
    for (let i = 0; i < dimension; i++)
        for (let j = 0; j < dimension; j++) {
            if (Grid[i][j] == EMPTY) {
                EmptyCells.push({ row: i, col: j });
            }
        }
    return EmptyCells;

}

function checkDiagonals(row, col) {
    let leftDiagonalCount = 0;
    let rightDiagonalCount = 0;
    for (let i = -2; i < 3; i++) {
        var isRowUndefined = Grid[row + i] === undefined;

        if (isRowUndefined || Grid[row + i][col + i] !== currentPlayer)
            leftDiagonalCount = 0;
        else if (++leftDiagonalCount > 2)
            return { winType: LeftDiag, startRow: row + i - 2, startCol: col + i - 2 };

        if (isRowUndefined || Grid[row + i][col - i] !== currentPlayer)
            rightDiagonalCount = 0;
        else if (++rightDiagonalCount > 2)
            return { winType: RightDiag, startRow: row + i - 2, startCol: col - i + 2 };
    }
    return false;
}

function checkLines(row, col) {
    let rowCount = 0;
    let colCount = 0;
    for (let i = -2; i < 3; i++) {

        if (Grid[row][col + i] !== currentPlayer)
            rowCount = 0;
        else if (++rowCount > 2)
            return { winType: Row, startRow: row, startCol: col + i - 2 };

        if (Grid[row + i] === undefined || Grid[row + i][col] !== currentPlayer)
            colCount = 0;
        else if (++colCount > 2)
            return { winType: Col, startRow: row + i - 2, startCol: col };
    }
    return false;
}

function renderSymbolInCell(symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);
    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

function changeColor(winType, startRow, startCol) {
    for (let i = 0; i < 3; i++) {
        switch (winType) {
            case Row:
                changeColorInCell(startRow, startCol + i);
                break;
            case Col:
                changeColorInCell(startRow + i, startCol);
                break
            case LeftDiag:
                changeColorInCell(startRow + i, startCol + i);
                break;
            case RightDiag:
                changeColorInCell(startRow + i, startCol - i)
                break
            default:
                break;
        }
    }
}

function changeColorInCell(row, col, color = '#F00') {
    const targetCell = findCell(row, col);
    targetCell.style.color = color;
}

function findCell(row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}
function addResizeListener() {
    const resizeButton = document.getElementById('resize');
    resizeButton.addEventListener('click', resizeClickHandler);
}

function resizeClickHandler() {
    const dimension = document.getElementById('dimensionInput').value;
    console.log('resize!');
    startGame(dimension || 3);
}

function resetClickHandler() {
    const dimension = document.getElementById('dimensionInput').value;
    console.log('reset!');
    startGame(dimension || 3);

}


/* Test Function */
/* Победа первого игрока */
function testWin() {
    clickOnCell(0, 2);
    clickOnCell(0, 0);
    clickOnCell(2, 0);
    clickOnCell(1, 1);
    clickOnCell(2, 2);
    clickOnCell(1, 2);
    clickOnCell(2, 1);
}

/* Ничья */
function testDraw() {
    clickOnCell(2, 0);
    clickOnCell(1, 0);
    clickOnCell(1, 1);
    clickOnCell(0, 0);
    clickOnCell(1, 2);
    clickOnCell(1, 2);
    clickOnCell(0, 2);
    clickOnCell(0, 1);
    clickOnCell(2, 1);
    clickOnCell(2, 2);
}

function clickOnCell(row, col) {
    findCell(row, col).click();
}
