//    AllenGUI-Web, a program for modeling temporal patterns
//    Copyright (C) 2019  Sebastian Mate
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 
// Moving of HTML5 elements on the canvas is based on: https://stackoverflow.com/a/28285879

// get canvas related references
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;
var WIDTH = canvas.width;
var HEIGHT = canvas.height;

var isDragging = false;
var isSelecting = false;
var startX;
var startY;
var lastSelected = -1;
var shapes = [];

// Define a few demo intervals. Note: the witdh will be determined automatically.
shapes.push({x: 30, y: 30, width: 1, height: 30, isDragging: false, label: "Surgery", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 70, width: 1, height: 30, isDragging: false, label: "Chemotherapy", isConnector: false, fuzzy: 0});
shapes.push({x: 280, y: 30, width: 1, height: 30, isDragging: false, label: ">= 2 pH < 7.35", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 110, width: 1, height: 30, isDragging: false, label: "1 Year", isConnector: false, fuzzy: 0});
shapes.push({x: 280, y: 70, width: 1, height: 30, isDragging: false, label: "No Metformin", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 150, width: 1, height: 30, isDragging: false, label: "2 Hours 30 Minutes", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 190, width: 1, height: 30, isDragging: false, label: "1983-03-19", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 230, width: 1, height: 30, isDragging: false, label: "1983-03-19 - 2019-11-15", isConnector: false, fuzzy: 0});
shapes.push({x: 30, y: 270, width: 1, height: 30, isDragging: false, label: "1983-03-19 20:15 - 2019-11-15 8:30", isConnector: false, fuzzy: 0});


// listen for mouse events
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;

// call to draw the scene
draw();

function AddInterval() {
	deselectAll();
    shapes.push({x: 10, y: 10, width: 200, height: 30, isDragging: false, label: "New Interval", isConnector: false, isSelected: false, fuzzy: 0});
    draw();
}

function AddConnector() {
	deselectAll();
    shapes.push({x: 10, y: 10, width: 50, height: 10, isDragging: false, label: "New Interval", isConnector: true, isSelected: false, fuzzy: -1});
    draw();
}

function isDuration(label) {
	var l = label.toLowerCase();
	if (l.includes(" year") || l.includes(" month") || l.includes(" week") || l.includes(" day") || 
		l.includes(" hour") || l.includes(" minute") || l.includes(" second")) {
		return true;
	}
	return false;
}

function isTimestamp(label) {
	var l = label.toLowerCase().replace(/[0-9]/g, "").replace(/-/g, "").replace(/:/g, "").trim();
	if (l == "") {
		return true;
	}
	return false;
}

function hasModifier(label) {
	var l = label.toLowerCase();
	if (l.includes(">") || l.includes("<") || l.includes("=")) {
		return true;
	}
	return false;
}

function isExcluded(label) {
	var l = label.toLowerCase();
	if (l.startsWith("no ")) {
		return true;
	}
	return false;
}

function rect(r) {

	// setup font:
	ctx.font = "bold 24px Arial";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	textWidth = ctx.measureText(r.label).width;

	// prevent making the interval smaller than the text:
	if (r.width < textWidth + 40 && r.isConnector == false) {
		r.width = Math.round((textWidth + 40) / 10) * 10;
	}
	if (r.width <= 20) {
		r.width = 20;
	}

    // coloured interval:
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#0000FF";
	
	// Check for different interval colouring:
	if(isTimestamp(r.label)) ctx.fillStyle = "#00AA00";
	if(isDuration(r.label)) ctx.fillStyle = "#333333";	
	if(hasModifier(r.label)) ctx.fillStyle = "#FF00FF";	
	if(isExcluded(r.label)) ctx.fillStyle = "#FF0000";
		
    ctx.fillRect(r.x, r.y, r.width, r.height);

    // brighten it if it's selected:
    if (r.isSelected) {
        ctx.globalAlpha = .6;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(r.x, r.y, r.width, r.height);
    }

    // drag area in the lower right corner:
    ctx.globalAlpha = .5;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(r.x + r.width - 10, r.y + r.height - 10, 10, 10);

    // outer frame:
	ctx.globalAlpha = 0.75;
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(r.x, r.y, r.width, r.height);
    
    // Fuzzyness:
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#FFFFFF";
     if (r.fuzzy == 1 || r.fuzzy == 3) {
        ctx.fillRect(r.x + r.width - 15, r.y+1, 15 + 1, 30-2);
        ctx.fillRect(r.x + r.width - 10, r.y+1, 10 + 1, 30-2);
        ctx.fillRect(r.x + r.width - 5 , r.y+1, 5 + 1, 30-2);
    }
    if (r.fuzzy == 2 || r.fuzzy == 3) {
        ctx.fillRect(r.x - 1, r.y+1, 15, 30-2);
        ctx.fillRect(r.x - 1, r.y+1, 10, 30-2);
        ctx.fillRect(r.x - 1, r.y+1, 5, 30-2);
    }

    ctx.globalAlpha = 1.0;
    
    // text label:
	if(r.isConnector == false) {
		ctx.fillText(r.label, r.x + (r.width / 2), r.y + 23);
	}

}

// clear the canvas
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// redraw the scene
function draw() {
    clear();

    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#CCCCCC";
    for (var x = 0; x < 1400; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
    }
    for (var y = 0; y < 1000; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1400, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // redraw each shape in the shapes[] array
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].width) {
            rect(shapes[i]);
        };
    }
}


// handle mousedown events
function myDown(e) {

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

	// count selected intervals:
	var selectedItems = 0;
	for (var i = 0; i < shapes.length; i++) {
        if (shapes[i].isSelected) {
			selectedItems++;
		}
	}

    // get the current mouse position
    var mx = parseInt(e.clientX - offsetX);
    var my = parseInt(e.clientY - offsetY);

    // test each shape to see if mouse is inside
    isDragging = false;
	doUnselect = true;

    for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        s.isScaling = false;
        // decide if the shape is a rect or circle               

        if (s.width) {
            // test if the mouse is inside this rect
            if (mx >= s.x && mx <= s.x + s.width && my >= s.y && my <= s.y + s.height) {
                if (mx >= s.x + s.width - 10 && my >= s.y + s.height - 10) { // scaling	 
                    deselectAll();
					isDragging = true;
                    s.isScaling = true;
                    s.isDragging = false;
					s.isSelected = false;
					
                } else { // dragging
                    if(!e.shiftKey && selectedItems < 2) {
						deselectAll();
					}
					isDragging = true;
                    s.isDragging = true;
                    s.isSelected = true;
                    s.isScaling = false;
                }
				lastSelected = i;
            }
        }
    }

	if(!isDragging) {
		deselectAll();
		isSelecting = true;
	}

    draw();
    // save the current mouse position
    startX = mx;
    startY = my;
}

function deselectAll() {
	for (var i = 0; i < shapes.length; i++) {
			var s = shapes[i];
		    s.isSelected = false;
	}
}

// handle mouseup events
function myUp(e) {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    isDragging = false;
    for (var i = 0; i < shapes.length; i++) {
        shapes[i].isDragging = false;
    }
	
	if (isSelecting) {
		
        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);
		
		// swap start and end coordinates if necessary:
		if (mx < startX) mx = [startX, startX = mx][0];
		if (my < startY) my = [startY, startY = my][0];

		for (var i = 0; i < shapes.length; i++) {
			var s = shapes[i];
			s.isSelected = false;
			if (s.x > startX && s.y > startY && s.x + s.width < mx && s.y + s.height < my) {
					s.isSelected = true;
			}
		}
		
		isSelecting = false;
	}
	
    draw();
}

// handle mouse moves
function myMove(e) {
    // if we're dragging anything...
    
	if (isDragging) {

        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

        mx = Math.round(mx / 10) * 10;
        my = Math.round(my / 10) * 10;

        // calculate the distance the mouse has moved
        // since the last mousemove
        
		var dx = mx - startX;
        var dy = my - startY;

        dx = Math.round(dx / 10) * 10;
        dy = Math.round(dy / 10) * 10;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
		
        for (var i = 0; i < shapes.length; i++) {
            var s = shapes[i];
            if (s.isDragging || s.isSelected) {
                s.x += dx;
                s.y += dy;
            }
            if (s.isScaling) {
                s.width += dx;
            }
        }

        // redraw the scene with the new rect positions
        draw();

        // reset the starting mouse position for the next mousemove
        startX = mx;
        startY = my;
		
    }
	
	if (isSelecting) {
		
		// tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

		draw();

		ctx.globalAlpha = 0.1;
		ctx.fillStyle = "#000000";
		ctx.fillRect(startX, startY, mx-startX, my-startY);
		ctx.setLineDash([4]);
		ctx.globalAlpha = 0.75;
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(startX, startY, mx-startX, my-startY);
		ctx.setLineDash([0]);
	}
}

function SetFuzzyness(fuzz) {
    for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        if (s.isSelected) {
            s.fuzzy = fuzz;
        }
    }
    draw();
}

function Rename() {
    for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        if (s.isSelected) {
            var clabel = window.prompt("Enter new interval label: ", s.label);
            s.label = clabel;
        }
    }
    draw();
}

function Delete() {
    for (var i = shapes.length; i --;) {
        var s = shapes[i];
        if (s.isSelected) {
			//delete shapes[i];
			shapes.splice(i, 1);
		}
    }
    draw();
}

