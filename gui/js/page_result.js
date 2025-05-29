let data;
let result_set;
let maxTemperature;

let animation_set = false;
let animation_running = false;
let timer;

let multiplier;
let finalTime;
let animationTime = 0;

const FRAME_PER_SECOND = 30;
const ANIMATION_DURATION = 10;
const TOTAL_FRAMES = ANIMATION_DURATION * FRAME_PER_SECOND;
const FRAME_DURATION = 1000 / FRAME_PER_SECOND;

$(document).ready(async function() {

    $(".canvas").remove();

    result_set = await eel.getFlags("result_set")();
    if (result_set) finalTime = await eel.getTime("simulation")();

    $("#plot_time").on("click", plotTemperature);
    $("#plot_anim").on("click", setupAnimation);
    $("#anim_play").on("click", playAnimation);
    $("#anim_stop").on("click", () => { clearInterval(timer); animation_running = false; });
    
    drawAxis();

    if (!result_set) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available: you should run the simulation on the main menu before looking at the results");
    }

});

async function plotTemperature() {

    if (result_set) {
        data = await eel.getResultsTime()();

        Telectron = data[1].map(T => T- 295);
        Tlattice  = data[2].map(T => T- 295);

        const TmaxElectron = Math.max(...Telectron);
        const TmaxLattice  = Math.max(...Tlattice );
        const scaleE = 0.9 * TmaxElectron / Math.max(TmaxElectron, TmaxLattice);
        const scaleL = 0.9 * TmaxLattice  / Math.max(TmaxElectron, TmaxLattice);

        drawCurve(Telectron,  true, "#ee5555", scaleE);
        drawCurve( Tlattice, false, "#5555ee", scaleL);
        //drawLabels();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Temperature plotted") 
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("No results available")
    }
}

async function setupAnimation() {
    clearInterval(timer);
    animation_running = false;

    if (result_set) {
        maxTemperature = await eel.getMaxTemperature()() - 295;
        data = await eel.getResultsSpace(0)();
        
        const Telectron = data[1].map(T => T- 295);
        const Tlattice  = data[2].map(T => T- 295);

        const scaleE = 0.9 * Math.max(...Telectron) / maxTemperature;
        const scaleL = 0.9 * Math.max(...Tlattice ) / maxTemperature;

        drawCurve(Telectron,  true, "#ee5555", scaleE);
        drawCurve( Tlattice, false, "#5555ee", scaleL);
        
        animationStep = 0;
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

async function animateStep() {
    
    data = await eel.getResultsSpace(animationTime)();
    
    const Telectron = data[1].map(T => T- 295);
    const Tlattice  = data[2].map(T => T- 295);

    const scaleE = 0.9 * Math.max(...Telectron) / maxTemperature;
    const scaleL = 0.9 * Math.max(...Tlattice ) / maxTemperature;

    drawCurve(Telectron,  true, "#ee5555", scaleE);;

    drawCurve(Telectron,  true, "#ee5555", scaleE);
    drawCurve( Tlattice, false, "#5555ee", scaleL);

    const timeStep = finalTime / TOTAL_FRAMES;
    animationTime += timeStep * multiplier;
    
    if (animationTime < 0 || animationTime > finalTime) {
        clearInterval(timer);
        animation_set = false;
        $("#helpbar").css("color","#00ff00");
        $("#helpbar").text("Animation ended")
    }
}
