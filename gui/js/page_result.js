let data;
let maxTemperature;

let animation_set = false;
let animation_running = false;
let timer;

let multiplier;
let finalTime;
let animationTime = 0;

let spinTemp;

const FRAME_PER_SECOND = 20;
const ANIMATION_DURATION = 10;
const TOTAL_FRAMES = ANIMATION_DURATION * FRAME_PER_SECOND;
const FRAME_DURATION = 1000 / FRAME_PER_SECOND;

const MIN_TEMP = 295;
const INIT_TEMP = 300;

const PLOT_OFFSET = 25;


$(document).ready(async function() {
    plot_offset = PLOT_OFFSET;

    $(".canvas").remove();

    const result_set = await eel.getFlags("result_set")();
    if (result_set) finalTime = await eel.getTime("simulation")();

    if (await eel.getFlags("spin_temp")()) {
        $("#legend").append("<div style='height:4px; width: 20px; background-color:rgb(172, 238, 85);'></div>")
        $("#legend").append("<label  style='margin: 0 10 0 10;'>Spin temperature</label>");
    }

    $("#plot_time").on("click", plotTemperature);
    $("#plot_anim").on("click", setupAnimation);
    $("#anim_play").on("click", playAnimation);
    $("#anim_stop").on("click", stopAnimation);
    $("#plot_expdat" ).on("click", plotExperiment);
    $("#plot_python").on("click", plotPython);
    filename = await eel.getDataFilename()();
    filename = filename ? filename : (await eel.loadPath()())
    filename = filename == "./data/models/" ? "./data/expdata/" : filename
    $("#data_file").val(filename);

    $("#extend_sim").on("click", () => {$("#helpbar").css("color","#aaaaff"); $("#helpbar").text("not implemented yet :(");});
    

    drawAxis();

    if (!result_set) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available: you should run the simulation on the main menu before looking at the results");
    }

});

async function plotTemperature() {

    const result_set = await eel.getFlags("result_set")();

    if (result_set) {
        let penetration = 0;
        $("#time_val").text("");
        if ($("#plot_exp").prop("checked")) {
            penetration = parseFloat($("#penetration").val()) * 1e-9;
            if (isNaN(penetration) || penetration <= 0) {
                $("#helpbar").css("color","#ff5555");
                $("#helpbar").text("Penetration depth must be a positive number");
                return;
            }
        }
        data = await eel.getResultsTime(penetration)();

        Telectron = data[1].map(T => T- INIT_TEMP);
        Tlattice  = data[2].map(T => T- INIT_TEMP);

        const TmaxElectron = Math.max(...Telectron);
        const TmaxLattice  = Math.max(...Tlattice );
        const absoluteMax = Math.max(TmaxElectron, TmaxLattice);
        const scaleE = 0.9 * TmaxElectron / absoluteMax;
        const scaleL = 0.9 * TmaxLattice  / absoluteMax;

        drawCurve(Telectron,  true, "#ee5555", scaleE);
        drawCurve( Tlattice, false, "#5555ee", scaleL);

        if (data.length == 4) {
            const Tspin = data[3].map(T => T - INIT_TEMP);
            const TmaxSpin  = Math.max(...Tspin );
            const scaleS = 0.9 * TmaxSpin  / absoluteMax;
            drawCurve( Tspin, false, "#acee55", scaleS);
        }

        timeStep = 1e12 * data[0][1] / 4;
        timeArray = Array.from({length: 5}, (_, i) => (i*timeStep).toFixed(1) + " ps");
        timeArray[0] = "";
        drawLabelsX(timeArray);

        const labels = Array.from({length: 3}, (_, i) => (INIT_TEMP + i/1.8*absoluteMax).toFixed(0) + " K")
        drawLabelsY(labels);

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Temperature plotted");
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available");
    }
}

async function plotExperiment() {

    const result_set = await eel.getFlags("result_set")();

    if (result_set) {
        await plotTemperature();
        if ($("#plot_exp").prop("checked") && !isNaN(parseFloat($("#penetration").val()))) {
            penetration = parseFloat($("#penetration").val());
        } else {penetration = 0;}
        data = await eel.getExperimental($("#data_file").val(), penetration)();
        if (data instanceof Array) {
            data[1] = data[1].map(R => R*0.9);
            drawDots(data[0], data[1], "#88ff00");
            $("#helpbar").css("color","#ffffff");
            $("#helpbar").text("Temperature and experimental values plotted");    
        } else {
            $("#helpbar").css("color","#ff5555");
            $("#helpbar").text(data)
        }
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available")
    }

}


async function plotPython() {

    const result_set = await eel.getFlags("result_set")();

    if (result_set) {
        if ($("#plot_exp").prop("checked") && !isNaN(parseFloat($("#penetration").val()))) {
            penetration = parseFloat($("#penetration").val());
        } else {penetration = 0;}
        
        eel.plotPython(penetration)();
    }
    else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available")
    }
}

async function setupAnimation() {

    const result_set = await eel.getFlags("result_set")();

    clearInterval(timer);
    animationTime = 0;
    animation_running = false;

    if (result_set) {
        spinTemp = await eel.getFlags("spin_temp")();
        $("#time_val").text("time = 0.000 ps");
        maxTemperature = await eel.getMaxTemperature()() - MIN_TEMP;
        data = await eel.getResultsSpace(0)();
        
        const Telectron = data[1].map(T => T- MIN_TEMP);
        const Tlattice  = data[2].map(T => T- MIN_TEMP);

        const scaleE = 0.9 * Math.max(...Telectron) / maxTemperature;
        const scaleL = 0.9 * Math.max(...Tlattice ) / maxTemperature;
        
        drawCurve(Telectron,  true, "#ee5555", scaleE);
        drawCurve( Tlattice, false, "#5555ee", scaleL);
        
        if (spinTemp) {
            const Tspin = data[3].map(T => T - MIN_TEMP);
            const scaleS = 0.9 * Math.max(...Tspin ) / maxTemperature;
            drawCurve( Tspin, false, "#acee55", scaleS);
        }

        spaceStep = 1e9 * data[0][1] / 4;
        spaceArray = Array.from({length: 5}, (_, i) => (i*spaceStep).toFixed(1) + " nm");
        spaceArray[0] = "";
        drawLabelsX(spaceArray);

        const labels = Array.from({length: 3}, (_, i) => (MIN_TEMP + i/1.8*maxTemperature).toFixed(0) + " K")
        drawLabelsY(labels);

        animation_set = true;

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Animation ready: press play to start")
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available")
    }
}

async function playAnimation() {
    if (animation_set && !animation_running) {
        multiplier = parseFloat($("#anim_speed").val());
        multiplier = isNaN(multiplier) ? 1 : multiplier;
        timer = setInterval( animateStep, FRAME_DURATION);

        animation_running = true;
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Animation started")
    } else if (!animation_set) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Animation not ready: press on the Animation button to setup")
    } else if (animation_running) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Animation already running")
    }
}

async function stopAnimation() {
    if (animation_running) {
        clearInterval(timer);
        animation_running = false; 
        $("#helpbar").css("color","#ffbbbb");
        $("#helpbar").text("Animation stopped");
    }
    else {
        $("#helpbar").css("color","#ffbbbb");
        $("#helpbar").text("The animation is not running");
    }
    
}

async function animateStep() {
    
    data = await eel.getResultsSpace(animationTime)();

    const Telectron = data[1].map(T => T- MIN_TEMP);
    const Tlattice  = data[2].map(T => T- MIN_TEMP);

    const scaleE = 0.9 * Math.max(...Telectron) / maxTemperature;
    const scaleL = 0.9 * Math.max(...Tlattice ) / maxTemperature;

    drawCurve(Telectron,  true, "#ee5555", scaleE);
    drawCurve( Tlattice, false, "#5555ee", scaleL);

    if (spinTemp) {
        const Tspin = data[3].map(T => T - MIN_TEMP);
        const scaleS = 0.9 * Math.max(...Tspin ) / maxTemperature;
        drawCurve( Tspin, false, "#acee55", scaleS);
    }

    spaceStep = 1e9 * data[0][1] / 4;
    spaceArray = Array.from({length: 5}, (_, i) => (i*spaceStep).toFixed(1) + " nm");
    spaceArray[0] = "";
    drawLabelsX(spaceArray);
    
    const labels = Array.from({length: 3}, (_, i) => (MIN_TEMP + i/1.8*maxTemperature).toFixed(0) + " K")
    drawLabelsY(labels);

    const timeStep = finalTime / TOTAL_FRAMES;
    animationTime += timeStep * multiplier;
    $("#time_val").text("time = " + (1e12*animationTime).toFixed(3) + " ps");
    
    if (animationTime < 0 || animationTime > finalTime) {
        clearInterval(timer);
        animation_set = false;
        $("#helpbar").css("color","#00ff00");
        $("#helpbar").text("Animation ended")
    }
}

