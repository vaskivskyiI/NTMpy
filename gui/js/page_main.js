
$(document).ready( function(){

    drawMaterial();
    console.log("ready");
  

});

async function drawMaterial() {
    layers = await eel.getLayers()();

    let labels = [];
    layers.reduce(function(dummy, layer) {labels.push(layer.name);}, 0);
    await drawMaterial_core(labels);
    $(".canvas > div").on("click", selectLayer);
};

