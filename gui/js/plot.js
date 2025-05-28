// Define padding constants
const PADDING_LX = 30; // Left padding
const PADDING_RX = 30; // Right padding
const PADDING_DW = 20; // Bottom padding

function drawAxis() {
    let canvas = document.getElementById("plot") 
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 =  0;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX;
    let x1 = canvas.width - PADDING_RX;

    ctx.lineWidth = 2;
    ctx.setLineDash([2,0]); 

    ctx.beginPath();
    ctx.moveTo( x0, y0);
    ctx.lineTo( x1, y0);
    ctx.lineTo( x1, y1);
    ctx.lineTo( x0, y1);
    ctx.lineTo( x0, y0);

    ctx.stroke()

    ctx.lineWidth = 1;
    ctx.setLineDash([2,4]);  

    ctx.beginPath();
    ctx.moveTo(x0, (y0 + y1)/2);
    ctx.lineTo(x1, (y0 + y1)/2);

    for (k = 1; k < 4; k++) {
        ctx.moveTo((k*x0 + (4-k)*x1)/4, y0);
        ctx.lineTo((k*x0 + (4-k)*x1)/4, y1);
    }

    ctx.stroke();

}

function drawLabels(text) {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    let y0 =  0;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX;
    let x1 = canvas.width - PADDING_RX;

    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "18px Times New Roman";
    for (k = 0; k <= 4; k++) { ctx.fillText(text[k], (k*x1 + (4-k)*x0)/4 - 25, y1 + 20);}
}

function drawCurve(data, clear = true, color = "white") {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 =  0;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX;
    let x1 = canvas.width - PADDING_RX;
    
    // Clear canvas
    if (clear) {ctx.clearRect(0, 0, canvas.width, canvas.height); }
        
    const Ymax = 1.2 * Math.max(...data);
    const Xmax = data.length - 1;
    
    // Plot data
    ctx.setLineDash([2,0]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let x = x0, y = y1;
    ctx.moveTo(x, y);
    data.slice(1).forEach((ydata, xdata) => {
        x = x0 + (xdata/Xmax) * (x1-x0);
        y = y1 - (ydata/Ymax) * (y1-y0);
        ctx.lineTo(x, y);
    });

    ctx.stroke();
    
    drawAxis();
}