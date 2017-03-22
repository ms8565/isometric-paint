class Triangle {
    //Type 0 is a right facing triangle, type 1 is a left facing triangle
    constructor(x, y, type, id){
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = "#ffffff";
        this.strokeColor = "#D4D4D4";
        this.id = id;

        this.highlight = false;
        this.highlightColor = "#000000";

        //Create positions of vertices
        this.length1 = 40;
        this.length2 = 60;
        this.x1 = this.x;
        this.y1 = this.y;

        //set up other vertices based on length
        if(this.type == 0){
            this.x2 = this.x1;
            this.y2 = this.y1 + this.length1;
            this.x3 = this.x1 + this.length2/2;
            this.y3 = this.y1 + this.length1/2;
        }
        else{
            this.x2 = this.x1 + this.length2/2;
            this.y2 = this.y1 - this.length1/2;
            this.x3 = this.x1 + this.length2/2;
            this.y3 = this.y1 + this.length1/2;
        }
    }
    //Check if a point is inside the triangle
    containsPoint(posX, posY){
        //Point precheck
        if(posX > this.x+100 || posX < this.x-100 || posY > this.y+100 || posY < this.y-100 ){
            return false;
        }

        const a = ((this.y2-this.y3)*(posX-this.x3) + (this.x3-this.x2)*(posY-this.y3)) / ((this.y2-this.y3)*(this.x1- this.x3) + (this.x3-this.x2)*(this.y1-this.y3));
        const b = ((this.y3-this.y1)*(posX-this.x3) + (this.x1-this.x3)*(posY-this.y3)) / ((this.y2-this.y3)*(this.x1-this.x3) + (this.x3-this.x2)*(this.y1-this.y3));
        const c = 1 - a - b;

        return (0<=a) && (a<=1) && (0<=b) && (b<=1) && (0<=c) && (c<=1);
    }
    draw(linesOn){
        ctx.save();
        ctx.strokeStyle = this.strokeColor;
        if(this.highlight){
            ctx.fillStyle = this.highlightColor;
        }
        else{
            ctx.fillStyle = this.color;
        }

        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.lineTo(this.x3, this.y3);
        ctx.fill();
        ctx.closePath();
        if(linesOn) {
            ctx.stroke();
        }

        ctx.restore();
    }
    highlightOn(highlightColor){
        this.highlight = true;
        this.highlightColor = highlightColor;
    }
    highlightOff(){
        this.highlight = false;
    }
    setColor(newColor){
        this.color = newColor;
    }
    getColor(){
        return this.color;
    }
};