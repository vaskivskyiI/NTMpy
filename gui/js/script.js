const colors = ['#a88924','#2469a8','#a84e24','#44911a','#6319af'];
let layers;

async function drawMaterial_core(labels) {
    
    $(".canvas div").remove();

    const style1 = ' style="text-align:center;color:#000000;height:30px; font-size:24">';
    const style2 = ' style="width:100%; height: 20px; background-color:'

    layers = await eel.getLayers()()

    const total_length = layers.reduce((length, layer) => length + layer.length, 0);
    const layers_percent = layers.map(layer => layer.length / total_length);

    for (let i = 0; i < layers.length; i++) {
        $(".canvas").append('<div style="flex:' + layers_percent[i] + '">' + 
                                '<div' + style1 + labels[i] + '</div>' +
                                '<div' + style2 + colors[i%5] + '"></div>' + 
                            '<div>');
    }

    if (await eel.getFlags("source_set")()) {$("img").css("opacity", "1");}

    return layers.length;
} 