let layerNum;

let debug;

let residual = [];

const PLOT_PADDING = [-0,-20,-30,-20];
const TARGET_PROPERTY = [["C",0],["C",1],["K",0],["K",1],["G",0]]

$(document).ready(async function() {


    drawMaterial()
    drawAxis("error_plot", PLOT_PADDING)
    drawAxis( "temp_plot", PLOT_PADDING);

    $("#start").on("click", startFitting);

    const filename = await eel.getDataFilename()();
    $("#data_file").val(filename ? filename : (await eel.loadPath()()));

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
    layerNum = $(this).index();
    const layers = await eel.getLayers()();
    $("#layer_lbl").text("Layer selected " + (layerNum) + ":");
    $("#layer_lbl").append("<span style='margin-left: 10px'>" + layers[layerNum-1].name + "</span>");
    if ($("#target").val() >= 0) {
        const target = TARGET_PROPERTY[$("#target").val()];
        $("#start_point").val(layers[layerNum][target[0]][target[1]]);
    }


}

async function startFitting() {

    const fun = $("#function").val();
    const point = parseFloat($("#start_point").val());
    const target = [layerNum-1].concat(TARGET_PROPERTY[$("#target").val()]);
    const datafile = $("#data_file").val();
    const depth = parseFloat($("#depth").val());
    debug = await eel.fitSetup( fun, target, point, depth, datafile)()
}

async function update() {

    out = await eel.fitRun()();
    
    time_sim = out.plot[0]
    temp_sim = out.plot[1]
    time_exp = out.plot[2]
    temp_exp = out.plot[3]

    temp_sim = temp_sim.map(T => T - 300)
    dataX = time_exp.map(t => t / time_sim.slice(-1)[0])
    dataY = temp_exp.map(T => 0.9 * (T - 300) / Math.max(...temp_sim))

    drawCurve( temp_sim, true, "#ff5555", 0.9, PLOT_PADDING)
    drawDots(dataX, dataY, "#55ff55", 0.9, PLOT_PADDING)

}