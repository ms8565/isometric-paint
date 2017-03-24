let triangles = [];
let highlightTri;

let canvas;
let ctx;
let currentColor;
let dragging = false;
let linesOn = true;
let eyedropperMode = false;

const setupCanvas = (e) => {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');

    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmousemove = onMouseMove;
    canvas.onmouseout = onMouseOut;
    
    setupControls();

    socket.on('updateCanvas', (data) => {
        updateTriangles(data);
    });
    socket.on('setupFirstCanvas', (data) => {
       clearCanvas();
       socket.emit("updateTriangles", {triangles: triangles});
    });
    
    setupTriangles();
    socket.emit("initializeTriangles", null);
};

const setupTriangles = (e) => {
    //create the array of triangles
    //populate array with right facing triangles
    var idNum = 0;
    var posX = 0;
    var posY = 0; 
    var rowTrigger = true;

    while(posX<=canvas.width){
        while(posY<=canvas.height){  
            triangles.push(new Triangle(posX,posY,0,idNum));
            idNum++;
            posY+= 39;
        }
        posX+=30;

        if(rowTrigger){
            posY=-20;}
         else{
            posY = 0;
        }
       rowTrigger = !rowTrigger;
    }

    //Populate array with left facing triangles
    rowTrigger = true;
    posX = 0;
    posY = 0; 
    while(posX<=canvas.width){
        while(posY<=canvas.height){  
            triangles.push(new Triangle(posX,posY,1,idNum));
            idNum++;
            posY+= 39;
        }
        posX+=30;

        if(rowTrigger){
            posY=-20;}
        else{
            posY = 0;
        }
       rowTrigger = !rowTrigger;
    }

    highlightTri = triangles[0];

};

const updateTriangles = (data) => {
    //Update canvas using the new data (the other user's array)
    //Fill triangles in with new colors
    let changedTriangles = [];


    for(var i = 0; i < data.triangles.length; i++){
        triangles[data.triangles[i].id].setColor(data.triangles[i].color);
        changedTriangles.push(triangles[data.triangles[i].id]);
    }
    drawChangedTriangles(changedTriangles);
};

const sendUpdatedTriangles = (changedTriangles) => {
    //update is called after a triangle is interacted with
    //send the server the array of triangles
    socket.emit("draw", {triangles: changedTriangles});
};

const drawAllTriangles = (e) => {
    for(var i = 0; i < triangles.length; i++){
        triangles[i].draw(linesOn);   
    }
};
const drawChangedTriangles = (changedTriangles) => {

    for(var i = 0; i < changedTriangles.length; i++){
        changedTriangles[i].draw(linesOn);
    }

};

//Canvas Mouse Functions
const onMouseDown = (e) => {
    var mouse = {};
    mouse.x = e.pageX - e.target.offsetLeft;
    mouse.y = e.pageY - e.target.offsetTop;

    dragging = true;

    var changedTriangles = [];

    //Check if mouse is in triangles
    for(var i = 0; i < triangles.length; i++){
        if(triangles[i].containsPoint(mouse.x, mouse.y)){ 
            if(eyedropperMode){
                console.log(triangles[i].getColor());
                var colorString = triangles[i].getColor().slice(1);
                colorInput.jscolor.fromString(colorString);
                updateColor();
            }
            triangles[i].setColor(currentColor);
            changedTriangles.push(triangles[i]);
            socket.emit("pushAction", {triangles: changedTriangles});
        }
    }

    if(changedTriangles.length != 0) sendUpdatedTriangles(changedTriangles);
};
const onMouseUp = (e) => {
    dragging = false;
};
const onMouseOut = (e) => {
    dragging = false;
    highlightTri.highlightOff();
    sendUpdatedTriangles([highlightTri]);
};
const onMouseMove = (e) => {
    if(!eyedropperMode){
        var mouse = {};
        mouse.x = e.pageX - e.target.offsetLeft;
        mouse.y = e.pageY - e.target.offsetTop;

        var changedTriangles = [];

        //check if mouse is in triangles
        for(var i = 0; i < triangles.length; i++){
            if(triangles[i].containsPoint(mouse.x, mouse.y)){ 
                if(dragging){
                    triangles[i].setColor(currentColor);
                    changedTriangles.push(triangles[i]);
                    socket.emit("pushAction", {triangles: changedTriangles});
                }
                else{
                    //Fix for lines bug
                    if(!linesOn){
                        drawAllTriangles();
                    }
                    if(triangles[i].id != highlightTri.id){
                        //Turn the highlight for the current triangle on
                        triangles[i].highlightOn(currentColor);
                        changedTriangles.push(triangles[i]);

                        //Turn the highlight for the last triangle off
                        highlightTri.highlightOff();
                        changedTriangles.push(highlightTri);

                        //Update hightlighted tri
                        highlightTri = triangles[i];
                    }
                }
            }
        }

        if(changedTriangles.length != 0) sendUpdatedTriangles(changedTriangles);
    }

};