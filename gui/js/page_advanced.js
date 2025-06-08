const PLOT_PADDING = [-0,-20,-30,-20];

$(document).ready(function() {


    drawMaterial()
    drawAxis("error_plot", PLOT_PADDING)
    drawAxis( "temp_plot", PLOT_PADDING);
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

}