const colors = ['#bb0000','#bb7700','#99bb00','#00bbbb','#0044bb','#5500bb'];
let layers;

async function drawMaterial_core(labels, labelStates) {
    
    $(".canvas div").remove();

    const style1 = (valid) => ` style="text-align:center;color:${valid ? '#000000' : '#ff0000'};height:30px; font-size:20">`;
    const style2 = ' style="height: 20px; border: 1px solid black; background-color:'

    layers = await eel.getLayers()()

    let total_length = layers.reduce((length, layer) => length + layer.length, 0);
    let layers_percent = layers.map(layer => 100 * layer.length / total_length);

    const substrate = await eel.getFlags("substrate")();

    if (substrate) {
        total_length = layers.slice(0,-1).reduce((length, layer) => length + layer.length, 0);
        layers_percent = layers.slice(0,-1).map(layer => 10 * layer.length / total_length);
    }
    for (let i = 0; i < layers.length; i++)
    {
        const isValid = labelStates ? labelStates[i] : true;
        $(".canvas").append('<div style="flex:' + layers_percent[i] + '">' + 
                                '<div' + style1(isValid) + labels[i] + '</div>' +
                                '<div' + style2 + colors[i%6] + '"></div>' + 
                            '<div>');
    }

    if (substrate) {
        const style = "linear-gradient(to right, " + colors[(layers.length-1)%6] + ", transparent)"
        $(".canvas > div:last-child").css("flex", "none");
        $(".canvas > div:last-child").css("width", "150px");
        $(".canvas > div:last-child > div:nth-child(2)").css("border-right-style", "hidden");
        $(".canvas > div:last-child > div:nth-child(2)").css("background", style);
    }

    if (await eel.getFlags("source_set")()) {$("img").css("opacity", "1");}
    else {$(".canvas img").css("opacity", "0.5");}

} 