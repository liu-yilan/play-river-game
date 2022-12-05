import { Cell, Stone } from "./objects.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const COLS = 3;
const ROWS = 12; // has to be even number
canvas.width = window.innerWidth * 0.17;
canvas.height = window.innerHeight * 0.75;

const riverHeight = canvas.height * 0.1;
const cellWidth = canvas.width / COLS;
const cellHeight = (canvas.height - riverHeight) / ROWS; 

const stoneRadius = Math.min((cellWidth / 2) * 0.4, (cellHeight / 2) * 0.75);

const goFirstButton = document.getElementById('goFirst');
const goSecondButton = document.getElementById('goSecond');

goFirstButton.addEventListener('click', startGameFirst);
goSecondButton.addEventListener('click', startGameSecond);

let gameGrid = [];
let wStones = [];
let bStones = [];
let moveCount = 0; 
let whiteTurn = true;
let distance = [];

function drawBackground() {
    if (canvas.getContext) {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function delineateGrid(){
    var rowIndex = 0; 
    for (let y = 0; y < canvas.height - riverHeight; y += cellHeight) {
        for (let x = 0; x < canvas.width; x += cellWidth){
            if(rowIndex < (ROWS / 2)) {
                gameGrid.push(new Cell(x, y));
            }
            else {
                gameGrid.push(new Cell(x, (y + riverHeight)));
                console.log(y + riverHeight);
            }
        }
        rowIndex++;
    }
}

function drawGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

function drawBoard() {
    drawBackground();
    delineateGrid();
    drawGameGrid();
}

function delineateInitStones(){
    for(let i = 0; i < canvas.width; i += cellWidth) {
        wStones.push(new Stone(i, canvas.height - cellHeight, "white"));
        console.log(canvas.height - cellHeight);
        bStones.push(new Stone(i, 0, "black"));
    }
}

function drawInitStones() {
    drawBoard();
    delineateInitStones(); 
    for(let i = 0; i < COLS; i++) {
        wStones[i].draw(); 
        bStones[i].draw();
    }

    // hard-coding the stoneStatus of initially occupied grids 
    for(let i = 0; i < COLS; i++) {
        gameGrid[i].stone = true;
    }

    for(let i = gameGrid.length; i > gameGrid.length - COLS; i--) {
        gameGrid[i - 1].stone = true;
    }
}

let selectedWhiteStoneIndex = null; 
let isDragging = false; 
let initialMouseX;
let initialMouseY;
let destMouseX; 
let destMouseY;

function mouseInWhiteStone(mouse_xcoor, mouse_ycoor, indexOfStone) {
    if(Math.sqrt(
        Math.pow(mouse_xcoor - wStones[indexOfStone].x, 2) + 
        Math.pow(mouse_ycoor - wStones[indexOfStone].y, 2)
        ) <= stoneRadius) {
        return true; 
    }
    else {
        return false; 
    }
}

let mouse_down = function(event) {
    event.preventDefault(); 
    initialMouseX = parseInt(event.clientX) - canvas.offsetLeft; //coordinates are adjusted to be relative to canvas
    initialMouseY = parseInt(event.clientY) - canvas.offsetTop;

    //iterate over every piece we have 
    //this initialMouseX and initialMouseY are the coordinates of our mouse
    for (let i = 0; i < wStones.length; i++) {
        if (mouseInWhiteStone(initialMouseX, initialMouseY, i)) {
            selectedWhiteStoneIndex = i;
            isDragging = true; 
            return; 
        }
    }
}

let mouse_up = function(event) {
    if(!isDragging) {
        return;
    }
    else { // just finished dragging
        event.preventDefault(); 
        console.log("closestDestGridIndex: " + findClosestDestGrid());
        
        let closestInitGridIndex = findClosestInitGrid();
        
        console.log("closestInitGridIndex: " + closestInitGridIndex);

        if((closestInitGridIndex != findClosestDestGrid())) {
            moveCount++;
            whiteTurn = false;
        }
        initialMouseX = destMouseX; 
        initialMouseY = destMouseY;

        isDragging = false; 

        console.log("moveCount: " + moveCount);
    }
    test();
}

let mouse_out = function(event) {
    if(!isDragging) {
        return;
    }

    event.preventDefault(); 
}

let mouse_move = function(event) {
    destMouseX = parseInt(event.clientX) - canvas.offsetLeft;
    destMouseY = parseInt(event.clientY) - canvas.offsetTop;
    if(!isDragging) {
        return;
    }
    else {
        event.preventDefault();

        console.log(destMouseX);
        console.log(destMouseY);
        console.log("closestDestGridIndex: " + findClosestDestGrid());
        let closestDestGridIndex = findClosestDestGrid();

        wStones[selectedWhiteStoneIndex].x = gameGrid[closestDestGridIndex].centerx;
        wStones[selectedWhiteStoneIndex].y = gameGrid[closestDestGridIndex].centery; 
        wStones[selectedWhiteStoneIndex].gridIndex = 
            findGridIndexOfStone(wStones[selectedWhiteStoneIndex].x, 
                wStones[selectedWhiteStoneIndex].y);
        gameGrid[closestDestGridIndex].stone = true;

        drawNewStones();
    }
}

function drawNewStones() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); 

    //drawing board:
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }

    for(let i = 0; i < COLS; i++) {
        wStones[i].draw(); 
        bStones[i].draw();
    }
}

function findClosestDestGrid() {
    let closestDestGridIndex = selectedWhiteStoneIndex; //tells you which col we're in
    let occGridIndex = 0;

    for(let i = selectedWhiteStoneIndex; i < (ROWS - 1) * COLS; i += COLS) { 
        if(Math.sqrt(Math.pow(gameGrid[i + COLS].centerx - destMouseX, 2) + 
                     Math.pow(gameGrid[i + COLS].centery - destMouseY, 2)) <
           Math.sqrt(Math.pow(gameGrid[closestDestGridIndex].centerx - destMouseX, 2) + 
                     Math.pow(gameGrid[closestDestGridIndex].centery - destMouseY, 2))) {
            closestDestGridIndex = i + COLS; 
        }
    }
    //prevent user from crossing river on first turn
    if(moveCount < 2) {
        if(closestDestGridIndex < (gameGrid.length / 2)) {
            closestDestGridIndex = (ROWS / 2) * COLS + selectedWhiteStoneIndex 
        }
    }    
    
    // find the grid in which there's another stone occupying that same col
    for(let i = selectedWhiteStoneIndex; i < (ROWS - 1) * COLS; i += COLS) { 
        if((gameGrid[i].stone == true)) {
            occGridIndex = i;
            break;
        }
    }
    console.log("occGridIndex: " + occGridIndex);
    wStones[selectedWhiteStoneIndex].availableMoves = (ROWS - (Math.floor(occGridIndex / COLS) + 1)) - 1;

    if(closestDestGridIndex <= occGridIndex) {
        closestDestGridIndex = occGridIndex + COLS;
    }
    
    return(closestDestGridIndex);
}

function findClosestInitGrid() {
    let closestInitGridIndex = selectedWhiteStoneIndex;
    for(let i = selectedWhiteStoneIndex; i < (ROWS - 1) * COLS; i += COLS) { // increment by COLS
        if(Math.sqrt(Math.pow(gameGrid[i + COLS].centerx - initialMouseX, 2) + 
                     Math.pow(gameGrid[i + COLS].centery - initialMouseY, 2)) <
           Math.sqrt(Math.pow(gameGrid[closestInitGridIndex].centerx - initialMouseX, 2) + 
                     Math.pow(gameGrid[closestInitGridIndex].centery - initialMouseY, 2))) {
            closestInitGridIndex = i + COLS; 
        }
    }

    return(closestInitGridIndex);
}

function test() {
    for(let i = 0; i < gameGrid.length; i++) {
        console.log("gameGrid[" + i + "].stone: " + gameGrid[i].stone);
    }

    for(let j = 0; j < wStones.length; j++) {
        console.log("wStones[" + j + "].gridIndex: " + wStones[j].gridIndex);
        console.log("bStones[" + j + "].gridIndex: " + bStones[j].gridIndex);
    }
}

function findGridIndexOfStone(stoneX, stoneY) {
    let minDist = Math.sqrt(Math.pow(stoneX - gameGrid[0].centerx, 2) + Math.pow(stoneY - gameGrid[0].centery, 2));
    let gameGridIndex = 0;
    
    for(let i = 0; i < gameGrid.length - 1; i++) {
        if(Math.sqrt(Math.pow(stoneX - gameGrid[i + 1].centerx, 2) + Math.pow(stoneY - gameGrid[i + 1].centery, 2)) < minDist) {
            minDist = Math.sqrt(Math.pow(stoneX - gameGrid[i + 1].centerx, 2) + Math.pow(stoneY - gameGrid[i + 1].centery, 2));
            gameGridIndex = i + 1;
        }
    }
    return gameGridIndex;
}

function updateDistBetweenStones() {
    for(let i = 0; i < COLS; i++) {
        distance[i] = wStones[i].gridIndex - bStones[i].gridIndex;
    }
}

function setAdvanceMaxOfStones() {
    for(let i = 0; i < COLS; i++) {
        bStones[i].advanceMax = distance[i] - COLS;
        wStones[i].advanceMax = distance[i] - COLS;
    }
}

function setRetreatMaxOfStones() {
    for(let i = 0; i < COLS; i++) {
        bStones[i].retreatMax = -1 * (Math.floor(bStones[i].gridIndex / COLS));
        wStones[i].retreatMax = (wStones[i].gridIndex - ((gameGrid.length - 1) - (COLS - (i + 1)))) / 3;
        for(let i = 0; i < COLS; i++){
            console.log("wStones[" + i + "].retreatMax: " + wStones[i].retreatMax);
        }
    }
}

function randNumber(min, max) {
    return(Math.round(Math.random() * (max - min) + min));
}

function checkForBlackLoss() {
    let tally = 0;
    for(let i = 0; i < COLS; i++) {
        if((bStones[i].retreatMax == 0) && (bStones[i].advanceMax == 0)) {
            tally++;
        }
    }
    if(tally == COLS) {
        return true;
    }
    else {
        return false;
    }
}

function checkForWhiteLoss() {
    let tally = 0;
    for(let i = 0; i < COLS; i++) {
        if((wStones[i].retreatMax == 0) && (wStones[i].advanceMax == 0)) {
            tally++;
        }
    }
    if(tally == COLS) {
        return true;
    }
    else {
        return false;
    }
}

function updateGameGrid() {
    //setting every grid to false first
    for(let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].stone = false; 
    }
    for(let j = 0; j < COLS; j++) {
        gameGrid[wStones[j].gridIndex].stone = true;
        gameGrid[bStones[j].gridIndex].stone = true;
    }
}

function updateBStoneY(stoneInd, newStoneGridInd) {
    bStones[stoneInd].y = gameGrid[newStoneGridInd].centery;
}

function updateBStoneGridInd(stoneInd, gridsToMove){
    bStones[stoneInd].gridIndex += gridsToMove;
}

function isBadMove(move, stoneInd){
    if(move == 0){
        return true;
    }
    else{
        let tempDist = [];

        for(let i = 0; i < COLS; i++) {
            if(i == stoneInd) {
                tempDist[i] = distance[i] - move;
            }
            else {
                tempDist[i] = distance[i];
            }
        }

        if(tempDist[0] == tempDist[1]) {
            return true;
        }
        else if(tempDist[0] == tempDist[2]) {
            return true;
        }
        else if(tempDist[1] == tempDist[2]) {
            return true;
        }
        else if(tempDist[stoneInd] == 0){
            return true; 
        }
        else {
            return false;
        }
    }
}

function setBNextMove() {
    if (moveCount < 2) {
        // randomly select a black stone to move
        let selectedInd = (Math.round(Math.random() * (COLS - 1)));
        console.log("selectedIndex: " + selectedInd);
        console.log(Math.random());

        //preventing the stone from randomly landing in same grid
        let gridsToMove = 0;
        while(gridsToMove == 0){
            gridsToMove = ((Math.round(Math.random() * ((ROWS / 2) - 1))) * COLS);
        }

        updateBStoneGridInd(selectedInd, gridsToMove);
        updateBStoneY(selectedInd, bStones[selectedInd].gridIndex);
    }
    else {
        for(let j = 0; j < COLS; j++) {
            console.log("distance[" + j + "]: " + distance[j]);
        }
        
        let zIndex = null;
        let zFlag = 0;
        for(let i = 0; i < COLS; i++) {
            if(distance[i] == COLS) {
                zFlag++;
                zIndex = i;
            }
        }
        console.log("zFlag: " + zFlag);

        if(zFlag == 1){
            let filteredDistArray = distance.filter(num => num != COLS);

            for(let l = 0; l < filteredDistArray.length; l++) {
                console.log("filteredDistArray" + l + ": " + filteredDistArray[l]);
            }

            let minDist = filteredDistArray[0]; 
            for(let j = 0; j < filteredDistArray.length - 1; j++) {
                if(filteredDistArray[j + 1] < filteredDistArray[j]) {
                    minDist = filteredDistArray[j + 1];
                }
            }
            
            console.log("minDist: " + minDist);

            let minDistInd = null;
            for(let k = 0; k < COLS; k++) {
                if(distance[k] == minDist) {
                    minDistInd = k;
                    break;
                }
            }
            
            console.log("minDistInd: " + minDistInd);

            let randInd = null;
            while((randInd == null) || (randInd == zIndex) || (randInd == minDistInd)) {
                randInd = Math.round(Math.random() * (COLS - 1));
            }

            let gridsToCover = (distance[randInd]) - (distance[minDistInd]);
            console.log("gridsToCover: " + gridsToCover);

            if(gridsToCover == 0) {
                gridsToCover += COLS;
            }
            
            bStones[randInd].gridIndex += gridsToCover;
            updateBStoneY(randInd, bStones[randInd].gridIndex);
        }
        else if (zFlag == COLS - 1) { 
            let targetInd = null;

            for(let i = 0; i < COLS; i++) {
                if(distance[i] > COLS) {
                    targetInd = i;
                }
            }

            bStones[targetInd].gridIndex += distance[targetInd] - COLS;
            bStones[targetInd].y = gameGrid[bStones[targetInd].gridIndex].centery;
        }
        else if (zFlag == COLS) {
            for(let i = 0; i < COLS; i++) {
                if(bStones[i].retreatMax != 0) {
                    bStones[i].gridIndex -= COLS;
                    bStones[i].y = gameGrid[bStones[i].gridIndex].centery;
                    break;
                }
            }
        }
        else {    
            if(distance[0] == distance[1]){
                bStones[2].gridIndex += bStones[2].advanceMax; 
                updateBStoneY(2, bStones[2].gridIndex);
            }
            else if(distance[0] == distance[2]){
                bStones[1].gridIndex += bStones[1].advanceMax; 
                updateBStoneY(1, bStones[1].gridIndex);
            }
            else if(distance[1] == distance[3]){
                bStones[0].gridIndex += bStones[0].advanceMax; 
                updateBStoneY(0, bStones[0].gridIndex);
            }
            else {
                let randBlackStoneInd = Math.round(Math.random() * (COLS - 1));

                let gridsToCover = randNumber(bStones[randBlackStoneInd].advanceMax, 
                                              bStones[randBlackStoneInd].retreatMax);
                
                let adjGridsToCover = Math.round(gridsToCover / COLS) * COLS;
                console.log("adjGridsToCover: " + adjGridsToCover);
     
                if(adjGridsToCover == 0) {
                    adjGridsToCover += COLS;
                } 
                while(isBadMove(adjGridsToCover, randBlackStoneInd)) {
                    randBlackStoneInd = Math.round(Math.random() * (COLS - 1));

                    gridsToCover = randNumber(bStones[randBlackStoneInd].advanceMax, 
                                              bStones[randBlackStoneInd].retreatMax);
                
                    adjGridsToCover = Math.round(gridsToCover / COLS) * COLS;
                }

                bStones[randBlackStoneInd].gridIndex += adjGridsToCover;
                updateBStoneY(randBlackStoneInd, bStones[randBlackStoneInd].gridIndex);
            }
        }
    }
}

function animate() {
    // console.log("whiteTurn: " + whiteTurn)
    updateDistBetweenStones();
    if(whiteTurn) {
        canvas.addEventListener('mousedown', mouse_down);
        canvas.addEventListener('mouseup', mouse_up);
        canvas.addEventListener('mouseout', mouse_out);
        canvas.addEventListener('mousemove', mouse_move); 
        window.addEventListener('mouseup', mouse_up);
        // console.log("mouse is on")
    }
    else { 
        canvas.removeEventListener('mousedown', mouse_down);
        canvas.removeEventListener('mouseup', mouse_up);
        canvas.removeEventListener('mouseout', mouse_out);
        canvas.removeEventListener('mousemove', mouse_move);
        window.removeEventListener('mouseup', mouse_up);
        // console.log("mouse is off")
        
        setBNextMove();

        setTimeout(function(){
            drawNewStones();
        }, 200);
        test();
        moveCount++;
        whiteTurn = true;
    }
    updateGameGrid();
    updateDistBetweenStones();
    setAdvanceMaxOfStones();
    setRetreatMaxOfStones();

    if(!checkForBlackLoss() && !checkForWhiteLoss()) {
        requestAnimationFrame(animate);
    }
    else if(checkForBlackLoss()) {
        setTimeout(function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            var endText = 'YOU HAVE WON';
            var endTextWidth = ctx.measureText(endText).width;
            ctx.fillText(endText, (canvas.width / 2) - (endTextWidth / 2), canvas.height / 2);
        }, 1200);
        
    }
    else { 
        setTimeout(function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            var endText = 'GAME OVER';
            var endTextWidth = ctx.measureText(endText).width;
            ctx.fillText(endText, (canvas.width / 2) - (endTextWidth / 2), canvas.height / 2);
        }, 1200);
    }
}

function startGameFirst(){
    goFirstButton.style.display = 'none';
    goSecondButton.style.display = 'none';
    drawInitStones();
    animate();
}
function startGameSecond(){
    whiteTurn = false;
    console.log("whiteTurn in starGameSecond:" + whiteTurn)
    goFirstButton.style.display = 'none';
    goSecondButton.style.display = 'none';
    drawInitStones();
    animate();
}

export { cellWidth, cellHeight, ctx, ROWS, findGridIndexOfStone, stoneRadius };