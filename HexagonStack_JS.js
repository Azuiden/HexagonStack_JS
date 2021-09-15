let cols, rows, cellWidth, cellHeight; //grid variables
let radius, hexHoleRnd, translateY, vertSpaceAdj, HorzSpaceAdj; //hexagon variables
let stackNum, stackSmooth, dataMatrix, stackMatrix, hexHoleMatrix; //matrix/stack variables

///COLORS///
let bk, colorMatrix;
let BK = ["#87A5A5", "#BFA8BE", "#D9896D", "#F26666", "#A0DEAE", "#40352C"];
let Color1 = ["#8C3E37", "#5E608C", "#F29B88", "#D9C2AD", "#A64B63", "#537D91"]; //darker colors
let Color2 = ["#BF573F", "#E9F0F2", "#F2CC85", "#F2D6B3", "#F2AB6D", "#DEA895"]; // lighter colors
//The indexes match intended palette so they should be used together (I.E. Color1[0] goes w/ Color2[0])

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0,0);
  canvas.style('z-index', '-1');
  bk = random(BK);
  
  //Hexagon parameters
  radius = 70;
  vertSpaceAdj = 1.6; //adjusts space between columns; bigger number = more space
  HorzSpaceAdj = 1.8; //adjusts space between rows
  hexHoleRnd = 5;
  translateY = 20;
  stackNum = 7;
  stackSmooth = 200;
  
  cellWidth = radius * vertSpaceAdj;
  cellHeight = radius * HorzSpaceAdj;
  cols = int(displayWidth/cellWidth +1);
  rows = int(displayHeight/cellHeight +1);
  
  dataMatrix = new Matrix();
  colorMatrix = dataMatrix.colorMatrix;
  hexHoleMatrix = dataMatrix.hexHoleMatrix;
  stackMatrix = dataMatrix.stackMatrix;
  stackMatrix = dataMatrix.runAverageMultiple(stackSmooth);
  
  noLoop();
}


function draw() {
  background(bk);
  
  for (let r = 0; r < rows; r++){
    
      //EVEN COLUMNS
      //Need to be drawn first so that the offset odd columns are drawn over them
      for (let c = 0; c < cols; c++){ 
        let centerX = c * cellWidth;
        let centerY = r * cellHeight;
        
        if (c % 2 == 0){ 
          print("row: " + r + " column: " + c);
          drawAllHex(centerX, centerY, radius, c, r);
        }
      }
      
      for (let c = 0; c < cols; c++){ //ODD COLUMNS
        let centerX = c * cellWidth;
        let centerY = r * cellHeight + cellHeight/2;
        
        if (c % 2 != 0){
         print("row: " + r + " column: " + c);
         drawAllHex(centerX, centerY, radius, c, r);
        }
      }
      
    }//end of rows for loop
}//end of function draw()

function drawAllHex(centerX, centerY, radius, c, r){
    let shadowColor = Color1[colorMatrix[r][c]];
    let baseColor = Color2[colorMatrix[r][c]];
    //stacking the hexagons
    for (let i = 0; i < stackMatrix[r][c]; i++){
      if (i == 1){
        fill(shadowColor);
        HexagonShadow(centerX, centerY , radius, translateY);
        fill(baseColor);
        Hexagon(centerX, centerY, radius);
        HexHole(centerX, centerY , radius, translateY, shadowColor, bk, hexHoleMatrix[r][c]);
      }
      else if (i > 1){
        fill(shadowColor);
        HexagonShadow(centerX, centerY - (i+1 * translateY) , radius, translateY + 3);
        fill(baseColor);
        Hexagon(centerX, centerY - (i+1 * translateY), radius);
        HexHole(centerX, centerY - (i+1 * translateY), radius, translateY, shadowColor, baseColor, hexHoleMatrix[r][c]);
      }
    }
}//end of drawAllHex()

function HexHole(centerX, centerY, radius, translateY, shadowColor, fillColor, hexChance){
  if (hexChance == 1) //randomly add hole to hexagon
      {
        push();
        translate(centerX, centerY + translateY/2); //translate so that 0,0 is center of shape
        fill(shadowColor);
        rotate(PI); //rotate at 0,0
        scale(1.1,1);
        HexagonShadow(0, 0, radius-(radius/2), translateY);
        fill(fillColor);
        Hexagon(0, 0, radius-(radius/2));
        pop();
      }
}//end HexHole()

function Hexagon(centerX, centerY, radius) {
  noStroke();
  beginShape();
  //While a < TWO_PI (full circumference of a circle)
  //Increment by angle value, which will increment for the number of verticies originally given
  for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
    let sx = centerX + cos(a) * radius;
    let sy = centerY + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}//end Hexagon()

function HexagonShadow(centerX, centerY, radius, translateY) {
  //creates a dropshadow  for Hexagon() by creating the same hexagon offset by specified amount
  //then drawing a rectangle 
 Hexagon(centerX, centerY + translateY, radius); 
 noStroke();
 //the 4 coordinates of the quad
 //Could plug these into the quad() but this is easier to read the point values for me
 let xy1 = [centerX + radius, centerY]; //TL
 let xy2 = [centerX + radius, centerY + translateY]; //TR
 let xy3 = [centerX - radius, centerY]; //BL
 let xy4 = [centerX - radius, centerY + translateY]; //BR
 quad(xy1[0],xy1[1],xy2[0],xy2[1],xy3[0],xy3[1],xy4[0],xy4[1]);
}//end HexagonShadow()

/////////MATRIX CLASS/////////

class Matrix{ //matrix class

  constructor(){ //constructor for generating random numbers in matrix
    this.stackMatrix = new Array(rows);
    this.colorMatrix = new Array(rows);
    this.hexHoleMatrix = new Array(rows);
    
    for (let r = 0; r < rows; r++) {
      this.stackMatrix[r] = new Array(cols);
      this.colorMatrix[r] = new Array(cols);
      this.hexHoleMatrix[r] = new Array(cols);
      
      for (let c = 0; c < cols; c++) {
        let rndNum = intRandom(stackNum);
        let rndColor = intRandom(Color1.length);
        let rndHole = intRandom(hexHoleRnd);
        
        this.stackMatrix[r][c] = rndNum;
        this.colorMatrix[r][c] = rndColor;
        this.hexHoleMatrix[r][c] = rndHole;
      }//end column
    }//end row
  }//end of Matrix(rows,cols)
  
  runAverageMultiple(num){
    for (let i = 0; i < num; i++){
      this.AverageValues();
    }
    return this.stackMatrix;
  }
  
  AverageValues(){
    let rndRow = intRandom(rows);
    let rndCol = intRandom(cols);
    //print("rndRow: " + rndRow)
  
    //all the indexes that need to be checked
    let searchMatrix = [
      [rndRow-1, rndCol], //above
      [rndRow, rndCol-1], //left1
      [rndRow-1, rndCol-1], //left1
      [rndRow, rndCol+1], //right1
      [rndRow+1, rndCol+1], //right2
      [rndRow+1, rndCol] //below
    ];
    let low = 0;
    let mid = 0;
    let high = 0;
    
    for (let i = 0; i < 6; i++){
      //checking for out of bounds values
      if ((searchMatrix[i][0] >= 0 && searchMatrix[i][0] < rows) && (searchMatrix[i][1] >= 0 && searchMatrix[i][1] < cols)){
        //checks if searched value is lower, higher, or the same as the selected value and tallies result
        if (this.stackMatrix[searchMatrix[i][0]][searchMatrix[i][1]] < this.stackMatrix[rndRow][rndCol]){
          low++;
        }
        else if (this.stackMatrix[searchMatrix[i][0]][searchMatrix[i][1]] > this.stackMatrix[rndRow][rndCol]){
          high++;
        }
        else { 
          mid++;
        }
      }//end if
    }//end of for loop
  
    if (low > mid){
      this.stackMatrix[rndRow][rndCol]--;
    }
    else if (high > mid){
      this.stackMatrix[rndRow][rndCol]++; 
    }
  }//end of AverageValues()
}//End of Matrix() class

/////////// Utility Functions ///////////

  function printMatrix(givenarray){ //print matrix for testing values
    for (let i = 0; i < givenarray.length; i++) {
        for (let j = 0; j < givenarray[i].length; j++) {
          System.out.print( givenarray[i][j]  + "\t");
         }
         System.out.print();
       }
   }
   
   function intRandom(input){
     return int(random(input));
   }
   
   function windowResized(){
     resizeCanvas(windowWidth, windowHeight);
   }
