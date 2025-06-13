// Define padding constants
const PADDING_LX = 40; // Left padding
const PADDING_RX = 50; // Right padding
const PADDING_DW = 35; // Bottom padding
const PADDING_UP = 10; // Top padding
let plot_offset = 0;

function drawAxis(id = "plot", margin = [0, 0, 0, 0]) {
    let canvas = document.getElementById(id)
    if (!canvas) canvas =  document.getElementById("temp_plot");
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];

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

function drawLabelsX(text, margin = [0, 0, 0, 0]) {
    let canvas = document.getElementById("plot");
    let ctx = canvas.getContext("2d");
    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];

    ctx.strokeStyle = "white";

    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "18px Times New Roman";
    for (k = 0; k <= 4; k++) { ctx.fillText(text[k], (k*x1 + (4-k)*x0)/4 - 30, y1 + 20);}
}

function drawLabelsY(text, margin = [0, 0, 0, 0]) {
    let canvas = document.getElementById("plot");
    let ctx = canvas.getContext("2d");
    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];

    ctx.strokeStyle = "white";

    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    ctx.font = "18px Times New Roman";
    for (k = 0; k <= 2; k++) { ctx.fillText(text[k], x0 - 50, (k*y0 + (2-k)*y1)/2 + 5);}
}

function drawCurve(data, clear = true, color = "white", scale = 0.9, margin = [0, 0, 0, 0]) {
    let canvas = document.getElementById("plot");
    if (!canvas) canvas =  document.getElementById("temp_plot");
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];
    
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
    
    drawAxis("plot", margin);
}

function drawDots(dataX, dataY, color = "white", scale = 0.9, margin = [0,0,0,0]) {
    let canvas = document.getElementById("plot");
    if (!canvas) canvas =  document.getElementById("temp_plot");
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];
    
    
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

function drawErr(data, color = "red", margin = [0, 0, 0, 0]) {
    let canvas = document.getElementById("error_plot");
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";

    let y0 = PADDING_UP + margin[0];
    let y1 = canvas.height - PADDING_DW - margin[1];
    let x0 = PADDING_LX + plot_offset + margin[2];
    let x1 = canvas.width - PADDING_RX - margin[3];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        
    const Ymax = Math.max(...data);
    const Ymin = Math.min(...data);
    const Xmax = data.length - 1;
    
    // Plot data
    ctx.setLineDash([2,0]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data = data.map(e => 0.1 + 0.8 * (e-Ymin)/(Ymax-Ymin))

    let x = x0, y = y1 - data[0] * (y1-y0);
    ctx.moveTo(x, y);
    data.slice(1).forEach((ydata, xdata) => {
        x = x0 + (1+xdata) / Xmax * (x1-x0);
        y = y1 - ydata * (y1-y0);
        ctx.lineTo(x, y);
    });

    ctx.stroke();
    
    drawAxis("error_plot", margin);
}