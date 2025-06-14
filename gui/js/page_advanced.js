let layerNum = 0;
let target_selected = false;
let running = false;

const PLOT_PADDING = [-0,-20,-30,-20];
const TARGET_PROPERTY = [["C",0],["K",0],["C",1],["K",1],["G",0]]

$(document).ready(async function() {


    drawMaterial();
    drawAxis("error_plot", PLOT_PADDING);
    drawAxis( "temp_plot", PLOT_PADDING);

    setupMenu();

    $("#start").on("click", startFitting);
    filename = await eel.getDataFilename()();
    filename = filename ? filename : (await eel.loadPath()())
    filename = filename == "./data/models/" ? "./data/expdata/" : filename
    $("#data_file").val(filename);


    $("#target").change(setTarget);
    $("#stop").on("click", stopFit);
    $("#start_point").change(() => {eel.resetFit(); $("iteration").val(20)})
    $("#function   ").change(() => {eel.resetFit(); $("iteration").val(20)})
    $("#apply").on("click", applyChange)

});


async function drawMaterial() {

    const layers = await eel.getLayers()();
    const layersState = await eel.checkLayers()();

    let labels = [];
    layers.forEach(function(layer) { labels.push(layer.name); });
    await drawMaterial_core(labels, layersState);
    $(".canvas > div").on("click", selectLayer);
}

async function selectLayer() {
    if ($(this).index() != layerNum) {eel.resetFit();}
    layerNum = $(this).index();
    const layers = await eel.getLayers()();
    $("#layer_lbl").text("Layer selected " + (layerNum) + ":");
    $("#layer_lbl").append("<span style='margin-left: 10px'>" + layers[layerNum-1].name + "</span>");
    if ($("#target").val() >= 0) {
        const target = TARGET_PROPERTY[$("#target").val()];
        $("#start_point").val(layers[layerNum-1][target[0]][target[1]]);
    }


}

async function startFitting() {

    const fun = $("#function").val();
    const point = $("#start_point").val();
    const target = [layerNum-1].concat(TARGET_PROPERTY[$("#target").val()]);
    const datafile = $("#data_file").val();
    const depth = parseFloat($("#depth").val());
    $("#helpbar").css("color","#ffffff");
    $("#helpbar").text("Initializing the fitting...");
    result = await eel.fitSetup( fun, target, point, depth, datafile)()

    if (result.success) {
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text(result.message);
        running = true;
        while (running && parseInt($("#iteration").val()) > 0) {
            $("#helpbar").text("Fitting in progress...");
            await update();
            $("#iteration").val(parseInt($("#iteration").val()) - 1);
        }
        running = false;
        $("#helpbar").text("Fitting cycles ended");
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text(result.message);
    }

}

async function update() {

    await eel.fitRun()();
    data = await eel.getFitPlots()()

    data.temp_sim = data.temp_sim.map(T => T - 300)
    dataX = data.time_exp.map(t => t / data.time_sim.slice(-1)[0])
    dataY = data.temp_exp.map(T => 0.9 * (T - 300) / Math.max(...data.temp_sim))

    drawCurve( data.temp_sim, true, "#ff5555", 0.9, PLOT_PADDING)
    drawDots(dataX, dataY, "#55ff55", 0.9, PLOT_PADDING)
    drawErr(data.residual.slice(1), "#ff5555", PLOT_PADDING)

    $("#result1").text((await eel.getFitValue()()).toExponential(6))
    //$("#result2").text(data.residual.slice(-1)[0].toFixed(4))
}

async function setTarget() {
    if ($("#target").val() >= 0 && !target_selected)
    {   $("#target option:first-child").remove(); target_selected = true;}
    await eel.resetFit();
    if (layerNum > 0) {
        const layers = await eel.getLayers()();
        const target = TARGET_PROPERTY[$("#target").val()];
        $("#start_point").val(layers[layerNum-1][target[0]][target[1]]);
    }
}

async function applyChange() {
    eel.applyFitted();
}

async function setupMenu() {
    data = await eel.getFitData()();
    if (data.init) {
        target_selected = true;
        option = TARGET_PROPERTY.findIndex((x) => x[0] == data.target[1] && x[1] == data.target[2]);
        $("#target option[value=" + option + "]").prop("selected", true);
        $("#target option:first-child").remove();

        layerNum = data.target[0] + 1;
        const layers = await eel.getLayers()();
        $("#layer_lbl").text("Layer selected " + (layerNum) + ":");
        $("#layer_lbl").append("<span style='margin-left: 10px'>" + layers[layerNum-1].name + "</span>");

       $("#function").val(data.function)

        data = await eel.getFitPlots()()

        data.temp_sim = data.temp_sim.map(T => T - 300)
        dataX = data.time_exp.map(t => t / data.time_sim.slice(-1)[0])
        dataY = data.temp_exp.map(T => 0.9 * (T - 300) / Math.max(...data.temp_sim))

        drawCurve( data.temp_sim, true, "#ff5555", 0.9, PLOT_PADDING)
        drawDots(dataX, dataY, "#55ff55", 0.9, PLOT_PADDING)
        drawErr(data.residual.slice(1), "#ff5555", PLOT_PADDING)

        value = await eel.getFitValue()();
        $("#result1").text(value.toExponential(6))
        $("#start_point").val(value.toExponential(3))
    }
}

async function stopFit() {
    $("#helpbar").css("color","#ffffff");
    $("#helpbar").text("Arresting the fit procedure...");
    running= false;
    $("#iteration").val(0);
    await eel.resetFit()();
    $("#iteration").val(20);
    $("#helpbar").text("Fit procedure arrested");
}
