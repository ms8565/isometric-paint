let colorInput;
let currentSwatches = [];

const setupControls = () => {
    colorInput = document.getElementById('color-input');
    colorInput.addEventListener("change",updateColor);
    currentColor = "#"+colorInput.jscolor;
    
    var tooltipsCheck = document.getElementById('tooltips-toggle')
    tooltipsCheck.addEventListener("click", toggleTooltips);

    var linesBtn = document.getElementById('lines-toggle');
    linesBtn.addEventListener("click",toggleLines);

    var saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener("click",saveCanvas);
    $('save-btn').tooltip();

    var clearBtn = document.getElementById('clear-btn');
    clearBtn.addEventListener("click",createClearDialog);

    var eyedropperBtn = document.getElementById('eyedropper-btn');
    eyedropperBtn.addEventListener("click",toggleEyedropper);
    
    var eraseBtn = document.getElementById('erase-btn');
    eraseBtn.addEventListener("click",function(){
        colorInput.jscolor.fromString("#ffffff");
        updateColor();
    });

    var shadowSwatch = document.getElementById('shadow');
    shadowSwatch.addEventListener("click",function(){
        colorInput.jscolor.fromString(this.value);
        updateColor();
    });

    var highlightSwatch = document.getElementById('highlight');
    highlightSwatch.addEventListener("click",function(){
        colorInput.jscolor.fromString(this.value);
        updateColor();
    });

    for(var i = 0; i < 8; i++){
        var swatch = document.getElementById('swatch-box'+i);

        swatch.addEventListener("click",function(){
            colorInput.jscolor.fromString(this.value);
            updateColor();
        });
    }
    
    //Initialize all JQuery tooltips
    $('#lines-toggle').tooltip();
    $('#save-btn').tooltip();
    $('#eyedropper-btn').tooltip();
    $('#clear-btn').tooltip();
    $('#erase-btn').tooltip();
    $('#color-input').tooltip();
    
    socket.on('updateSwatches', (data) => {
       for(var i = 0; i < data.swatches.length; i++){
           var swatch = document.getElementById('swatch-box'+i);
           swatch.value = data.swatches[i];
           swatch.style.backgroundColor = data.swatches[i];
       }
    });
    
};

const createClearDialog = () => {
    $( "#clear-dialog" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Clear Triangles": function() {
            clearCanvas();
          $( this ).dialog( "close" ); 
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
}

const clearCanvas = () => {
    for(var i = 0; i < triangles.length; i++){
        triangles[i].setColor('#ffffff');
    }
    sendUpdatedTriangles(triangles);
    drawAllTriangles();
};

const saveCanvas = () => {
    var image = canvas.toDataURL("image/png");
    window.open(image);
};

const toggleTooltips = () => {
    let action;
    if(document.getElementById('tooltips-toggle').checked){
        action = "enable";
    }
    else{
        action = "disable";
    }
    $('#lines-toggle').tooltip(action);
    $('#save-btn').tooltip(action);
    $('#eyedropper-btn').tooltip(action);
    $('#clear-btn').tooltip(action);
    $('#erase-btn').tooltip(action);
    $('#color-input').tooltip(action);
}

const toggleLines = () => {
    linesOn = !linesOn;

    //Redraw all triangles
    drawAllTriangles();
    drawAllTriangles();
};

const toggleEyedropper = () => {
    eyedropperMode = !eyedropperMode;
    if(eyedropperMode) {
        canvas.style.cursor = "copy";
    }
    else {
       canvas.style.cursor = "default"; 
    }
}

const updateColor = () => {
    if(eyedropperMode) toggleEyedropper();

    currentColor = "#"+colorInput.jscolor;
    var originalColor = colorInput.jscolor;

    //Create shadow swatch
    var shadowSwatch = colorInput.jscolor;

    //Decrease hue
    var hue = shadowSwatch.hsv[0] - 5;
    if(hue < 0) hue = 0;

    //Saturation stays the same
    var saturation = shadowSwatch.hsv[1];

    //Decrease value
    var value = shadowSwatch.hsv[2] - 15;
    if(value < 0) value = 0;
    shadowSwatch.fromHSV(hue, saturation, value);

    document.getElementById('shadow').value = shadowSwatch.toHEXString();
    document.getElementById('shadow').style.backgroundColor = shadowSwatch.toHEXString();
    colorInput.jscolor.fromString(currentColor);


    //Create Highlight swatch
    var highlightSwatch = colorInput.jscolor;

    //Increase hue
    hue = highlightSwatch.hsv[0] + 5;
    if(hue > 360) hue = 360;

    //Decrease saturation
    saturation = highlightSwatch.hsv[1] - 5;
    if(saturation < 0) saturation = 0;

    //Increase value
    value = highlightSwatch.hsv[2] + 15;
    if(value > 100) value = 100;
    highlightSwatch.fromHSV(hue, saturation, value);

    document.getElementById('highlight').value = highlightSwatch.toHEXString();
    document.getElementById('highlight').style.backgroundColor = highlightSwatch.toHEXString();
    colorInput.jscolor.fromString(currentColor);


    socket.emit("addSwatch", {newColor: currentColor});
};