let cols, rows, rowAdj, colAdj, cellWidth, cellHeight; //grid variables
let numPoints, translateY, xDiv, xDiv2, yDiv,vertSpaceAdj; //hexagon variables
let stackNum, stackSmooth, stackHex, stackMatrix; //matrix/stack variables

let radius;
///COLORS///
let bk;
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
  vertSpaceAdj = 1; //adjusts the space between columns
  numPoints = 6;
  translateY = 20;
  stackNum = 7;
  stackSmooth = 200;
  
  xDiv = 2;//default 2
  xDiv2 = 2; //default 2
  yDiv = 2; //default 2
  
  noLoop();
}


function draw() {
  background(bk);
  
  //add or subtract from these to control space between rows/columns
  cols = round(windowWidth/(radius*2) +2);
  rows = round(windowHeight/(radius*2) -1);
  cellWidth = width/cols;
  cellHeight = height/rows;
  rowAdj = rows + round(vertSpaceAdj);
  colAdj = cols;
  stackHex = new Matrix();
  //printMatrix(stackHex.matrix);
  //print("--------");
  stackMatrix = stackHex.stackMatrix;
  stackMatrix = stackHex.runAverageMultiple(stackSmooth);
  //printMatrix(stackHex.matrix);
  
  for(let r = 0; r < rowAdj; r++){
      for(let c = 0; c < colAdj; c++){ //EVEN COLUMNS
        let rndColor = intRandom(Color1.length);
        let color1 = Color1[rndColor];
        let color2 = Color2[rndColor];
        
        let centerX = c * cellWidth + cellWidth/xDiv;
        let centerY = r * cellHeight;
        
        //EVEN COLUMNS
        if(c % 2 == 0){ 
          print("row: " + r + " column: " + c);
          //stacking the hexagons
          let x = 0;
          drawAllHex(centerX, centerY, radius, color1, color2, x, c, r);
        }
      }
      
      for(let c = 0; c < colAdj; c++){ //ODD COLUMNS
        let rndColor = intRandom(Color1.length);
        let color1 = Color1[rndColor];
        let color2 = Color2[rndColor];
      
        let centerX = c * cellWidth + cellWidth/xDiv2;
        let centerY = r * cellHeight + cellHeight/yDiv;
        
        //ODD COLUMNS
        if(c % 2 != 0){
         print("row: " + r + " column: " + c);
         //stacking the hexagons
         let x = 0;
         drawAllHex(centerX, centerY, radius, color1, color2, x, c, r);
        }
      }
      
    }//end of rows for loop
}//end of function draw()

function drawAllHex(centerX, centerY, radius, color1, color2, x, c, r){
    //stacking the hexagons
    for (let i = 0; i < stackMatrix[r][c]; i++){
      if (i == 1){
        fill(color1);
        Polygon2(centerX, centerY , radius, translateY);
        fill(color2);
        Polygon(centerX, centerY, radius);
        polyHole(centerX, centerY , radius, translateY, color1, bk);
      }
      else if (i > 1){
        fill(color1);
        Polygon2(centerX, centerY - ((x * translateY) + translateY) , radius, translateY +2);
        fill(color2);
        Polygon(centerX, centerY - ((x * translateY) + translateY), radius);
        polyHole(centerX, centerY - ((x * translateY) + translateY), radius, translateY, color1, color2);
        x++;
      }
    }
}//end of drawAllHex()

function polyHole(centerX, centerY, radius, translateY, color1, fillColor){
  if(random(5) < 1) //randomly add hole to hexagon
      {
        push();
        translate(centerX, centerY+translateY/2); //translate so that 0,0 is center of shape
        fill(color1);
        rotate(PI); //rotate at 0,0
        scale(1.1,1);
        Polygon2(0, 0, radius-(radius*0.5), translateY);
        fill(fillColor);
        Polygon(0, 0, radius-(radius*0.5));
        pop();
      }
}//end polyHole()

function Polygon(centerX, centerY, radius) {
  noStroke();
  beginShape();
  //While a < TWO_PI (full circumference of a circle)
  //Increment by angle value, which will increment for the number of verticies originally given
  for (let a = 0; a < TWO_PI; a += TWO_PI / numPoints) {
    let sx = centerX + cos(a) * radius;
    let sy = centerY + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function Polygon2(centerX, centerY, radius, translateY) {
  //creates a dropshadow  for polygon() by creating the same polygon offset by specified amount
  //then drawing a rectangle 
 Polygon(centerX,centerY + translateY,radius); 
 noStroke();
 //the 4 coordinates of the quad
 //Could plug these into the quad() but this is easier to read the point values for me
 let xy1 = [centerX + radius,centerY]; //TL
 let xy2 = [centerX + radius,centerY + translateY]; //TR
 let xy3 = [centerX - radius,centerY]; //BL
 let xy4 = [centerX - radius,centerY + translateY]; //BR
 quad(xy1[0],xy1[1],xy2[0],xy2[1],xy3[0],xy3[1],xy4[0],xy4[1]);
}

/////////MATRIX CLASS/////////

class Matrix{ //matrix class

  constructor(){ //constructor for generating random numbers in matrix
    this.stackMatrix = new Array(rowAdj);
    for(let r = 0; r < rowAdj; r++) {
      this.stackMatrix[r] = new Array(colAdj);
      for(let c = 0; c < colAdj; c++) {
        let rndNum = intRandom(stackNum);
        this.stackMatrix[r][c] = rndNum;
      }
    }
  }//end of Matrix(rows,cols)
  
  runAverageMultiple(num){
    for (let i = 0; i < num; i++){
      this.AverageValues();
    }
    return this.stackMatrix;
  }
  
  AverageValues(){
    let rndRow = intRandom(rowAdj);
    let rndCol = intRandom(colAdj);
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
      
      if ((searchMatrix[i][0] >= 0 && searchMatrix[i][0] < rowAdj) && (searchMatrix[i][1] >= 0 && searchMatrix[i][1] < colAdj)){
      
        //checks if searched value is lower, higher, or the same as the selected value and tallies result
        if(this.stackMatrix[searchMatrix[i][0]][searchMatrix[i][1]] < this.stackMatrix[rndRow][rndCol]){
          low++;
        }
        else if(this.stackMatrix[searchMatrix[i][0]][searchMatrix[i][1]] > this.stackMatrix[rndRow][rndCol]){
          high++;
        }
        else { 
          mid++;
        }

      }
    }//end of for loop
  
    if(low > mid){
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
     let result = round(random(input));
     if (result >= input){
      result = input - 1; 
     }
     return result;
   }
   
   function windowResized(){
     resizeCanvas(windowWidth, windowHeight);
   }
