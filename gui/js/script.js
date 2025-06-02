const colors = ['#a88924','#2469a8','#a84e24','#44911a','#6319af'];
let layers;

async function drawMaterial_core(labels) {
    
    $(".canvas div").remove();

    const style1 = ' style="text-align:center;color:#000000;height:30px; font-size:24">';
    const style2 = ' style="height: 20px; border: 1px solid black; background-color:'

    layers = await eel.getLayers()()

    let total_length = layers.reduce((length, layer) => length + layer.length, 0);
    let layers_percent = layers.map(layer => 100 * layer.length / total_length);

    const substrate =  layers_percent.slice(-1)[0] > 90 && layers.length > 1;

    if (substrate) {
        total_length = layers.slice(0,-1).reduce((length, layer) => length + layer.length, 0);
        layers_percent = layers.slice(0,-1).map(layer => 10 * layer.length / total_length);
    }

    for (let i = 0; i < layers.length; i++) {
        $(".canvas").append('<div style="flex:' + layers_percent[i] + '">' + 
                                '<div' + style1 + labels[i] + '</div>' +
                                '<div' + style2 + colors[i%5] + '"></div>' + 
                            '<div>');
    }

    if (substrate) {
        const style = "linear-gradient(to right, " + colors[(layers.length-1)%5] + ", transparent)"
        $(".canvas > div:last-child").css("flex", "none");
        $(".canvas > div:last-child").css("width", "150px");
        $(".canvas > div:last-child > div:nth-child(2)").css("border-right-style", "hidden");
        $(".canvas > div:last-child > div:nth-child(2)").css("background", style);
    }


    if (await eel.getFlags("source_set")()) {$("img").css("opacity", "1");}

    return layers.length;
} 