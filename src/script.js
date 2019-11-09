// Source code based on: https://stackoverflow.com/a/28285879

// get canvas related references
var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");
var BB=canvas.getBoundingClientRect();
var offsetX=BB.left;
var offsetY=BB.top;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

// drag related variables
var dragok = false;
var startX;
var startY;

// an array of objects that define different shapes
var shapes=[];
// define 2 rectangles
shapes.push({x:10,y:10,width:200,height:30,fill:"#0000FF",isDragging:false});
shapes.push({x:10,y:50,width:200,height:30,fill:"#333333",isDragging:false});

// listen for mouse events
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;

// call to draw the scene
draw();

function Add() {
    shapes.push({x:0,y:0,width:200,height:30,fill:"#0000FF",isDragging:false});
    draw();
}

// draw a single rect
function rect(r) {
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle="#000000";
  ctx.strokeRect(r.x,r.y,r.width,r.height);
  ctx.fillStyle=r.fill;
  ctx.fillRect(r.x,r.y,r.width,r.height);

  if(r.isSelected) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle="#FFFFFF";
        ctx.fillRect(r.x,r.y,r.width,r.height);
        //ctx.globalAlpha = 1;
        //ctx.lineWidth = 3;
        //ctx.strokeStyle="#FFFF00";
        //ctx.strokeRect(r.x,r.y,r.width,r.height);
  }

  ctx.globalAlpha = 1.0;
  ctx.lineWidth = 1;
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("My Interval", r.x + (r.width / 2), r.y + 23); 
}

// clear the canvas
function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// redraw the scene
function draw() {
  clear();
  
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle="#CCCCCC";
    for(var x=0;x<1400;x+=10){
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke(); 
    }
    for(var y=0;y<1000;y+=10){
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1400, y);
        ctx.stroke(); 
    }
    ctx.globalAlpha = 1.0;
  
  // redraw each shape in the shapes[] array
  for(var i=0;i<shapes.length;i++){
    if(shapes[i].width){
      rect(shapes[i]);
    };
  }
}


// handle mousedown events
function myDown(e){

  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();

  // get the current mouse position
  var mx=parseInt(e.clientX-offsetX);
  var my=parseInt(e.clientY-offsetY);

  // test each shape to see if mouse is inside
  dragok=false;
  for(var i=0;i<shapes.length;i++){
    var s=shapes[i];
	if (!e.shiftKey) {
		s.isSelected=false;
	}
    // decide if the shape is a rect or circle               
    if(s.width){
      // test if the mouse is inside this rect
      if(mx>s.x && mx<s.x+s.width && my>s.y && my<s.y+s.height){
        // if yes, set that rects isDragging=true
        dragok=true;
        s.isDragging=true;
        s.isSelected=true;
        }
    }
  }

  draw();
  // save the current mouse position
  startX=mx;
  startY=my;
}


// handle mouseup events
function myUp(e){
  // tell the browser we're handling this mouse event
  e.preventDefault();
  e.stopPropagation();

  // clear all the dragging flags
  dragok = false;
  for(var i=0;i<shapes.length;i++){
    shapes[i].isDragging=false;
  }
  draw();
}

// handle mouse moves
function myMove(e){
  // if we're dragging anything...
  if (dragok){

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    var mx=parseInt(e.clientX-offsetX);
    var my=parseInt(e.clientY-offsetY);
    
    mx = Math.round(mx / 10) * 10;
    my = Math.round(my / 10) * 10;
        
    // calculate the distance the mouse has moved
    // since the last mousemove
    var dx=mx-startX;
    var dy=my-startY;
    
    dx = Math.round(dx / 10) * 10;
    dy = Math.round(dy / 10) * 10;

    // move each rect that isDragging 
    // by the distance the mouse has moved
    // since the last mousemove
    for(var i=0;i<shapes.length;i++){
      var s=shapes[i];
      if(s.isDragging || s.isSelected){
        s.x+=dx;
        s.y+=dy;
      }
    }

    // redraw the scene with the new rect positions
    draw();

    // reset the starting mouse position for the next mousemove
    startX=mx;
    startY=my;

  }
}

 
function Hello() {
   alert("Hello, World");
}
