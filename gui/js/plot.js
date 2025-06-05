// Define padding constants
const PADDING_LX = 40; // Left padding
const PADDING_RX = 50; // Right padding
const PADDING_DW = 35; // Bottom padding
const PADDING_UP = 10; // Top padding
let plot_offset = 0;

function drawAxis() {
    let canvas = document.getElementById("plot") 
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 = PADDING_UP;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX + plot_offset;
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

function drawLabelsX(text) {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    let y0 = PADDING_UP;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX + plot_offset;
    let x1 = canvas.width - PADDING_RX;

    ctx.strokeStyle = "white";

    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "18px Times New Roman";
    for (k = 0; k <= 4; k++) { ctx.fillText(text[k], (k*x1 + (4-k)*x0)/4 - 30, y1 + 20);}
}

function drawLabelsY(text) {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    let y0 = PADDING_UP;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX + plot_offset;
    let x1 = canvas.width - PADDING_RX;

    ctx.strokeStyle = "white";

    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "18px Times New Roman";
    for (k = 0; k <= 2; k++) { ctx.fillText(text[k], x0 - 50, (k*y0 + (2-k)*y1)/2 + 5);}
}

function drawCurve(data, clear = true, color = "white", scale = 0.9) {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 =  0;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX + plot_offset;
    let x1 = canvas.width - PADDING_RX;
    
    // Clear canvas
    if (clear) {ctx.clearRect(0, 0, canvas.width, canvas.height); }
        
    const Ymax = Math.max(...data) / scale;
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

function drawDots(dataX, dataY, color = "white", scale = 0.9) {
    let canvas = document.getElementById("plot"); 
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 =  0;
    let y1 = canvas.height - PADDING_DW;
    let x0 = PADDING_LX + plot_offset;
    let x1 = canvas.width - PADDING_RX;
    
    
    // Plot data
    ctx.setLineDash([2,0]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // code to draw the dots
    for (var i = 0; i < dataX.length; i++) {
        x = x0 + dataX[i] * (x1-x0);
        y = y1 - dataY[i] * (y1-y0);

        // Draw a dot at each data point
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI); 
        ctx.fillStyle = color;
        ctx.fill();
    };

}