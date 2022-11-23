import { cellWidth, cellHeight, ctx, ROWS, findGridIndexOfStone, stoneRadius } from "./index.js";

class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellWidth;
        this.height = cellHeight;
        this.centerx = x + (cellWidth / 2);
        this.centery = y + (cellHeight / 2);
        this.stone = false;
    }
    draw(){
        ctx.strokeStyle = "black";
        ctx.fillStyle = "#b58326";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Stone {
    constructor(x, y, color){
        this.x = x + (cellWidth / 2); //x-coor of circle's center
        this.y = y + (cellHeight / 2); //y-coor of circle's center
        this.width = cellWidth;
        this.height = cellHeight;
        this.color = color;
        this.availableMoves = ROWS - 2;
        this.gridIndex = findGridIndexOfStone(this.x, this.y);
        this.advanceMax = ROWS - 2; 
        this.retreatMax = 0; 
    }
    draw(){
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, stoneRadius, 0, 2 * Math.PI, false);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }
}

export { Cell, Stone };