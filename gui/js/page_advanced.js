$(document).ready(function() {


    drawMaterial()
    drawAxis("error_plot", [-10,-10,-10,-10])
    drawAxis( "temp_plot", [-10,-10,-10,-10]);
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