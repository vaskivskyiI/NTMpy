let layer_num = 0;

$(document).ready( function(){

    drawMaterial();

    $("#insert_header").on("click", function() {
        $("#modify_panel").slideUp(300);
        $("#insert_panel").slideToggle(300);
    });

    $("#modify_header").on("click", function() {
        if (layer_num > 0) {
            $("#insert_panel").slideUp(300);
            $("#modify_panel").slideToggle(300);    
        }
    });

    $("#insert_panel #submit").on("click", addLayer);
    $("#moveL").on("click", function() {moveLayer(-1);})
    $("#moveR").on("click", function() {moveLayer(+1);})
    $("#update") .on("click", function() {updateLayer();})
    $("#destroy").on("click", function() {eel.remove_layer(layer_num-1); drawMaterial();})
    $(".canvas > div").on("click", selectLayer);


    console.log("ready");
  

});

async function drawMaterial() {
    layers = await eel.getLayers()();

    let labels = [];
    layers.forEach(function(layer) {labels.push(layer.name);});
    await drawMaterial_core(labels);
    $(".canvas > div").on("click", selectLayer);
};

async function addLayer() {

    let complete = true;
    $("#insert_panel input").each(function() {complete &= ($(this).val() != '')})

    const length = parseFloat($("#insert_panel .leng_input").val());
    const density = parseFloat($("#insert_panel .dens_input").val());
    let valid = (length > 0) && (density > 0);
    
    if (complete && valid) {
        
        console.log("Adding a new layer: " +  $("#insert_panel .name_input").val());
        
        let layer = {
            name:   $("#insert_panel .name_input").val(),
            length: length,
            rho:    density,
            K: [$("#insert_panel .K_input:eq(0)").val(), $("#insert_panel .K_input:eq(1)").val()],
            C: [$("#insert_panel .C_input:eq(0)").val(), $("#insert_panel .C_input:eq(1)").val()],
            G: $("#insert_panel .G_input:eq(0)").val()
        };

    
        await eel.setLayers(layer);
        await drawMaterial();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Layer added correctly");
        $("#insert_panel input").val("");

    }
    else if (!valid) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot add the layer: length and density must be positive numbers");
    }
    else if (!complete) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot add the layer: Some material properties are missing");
    }


}


function selectLayer() {

    layer_num = $(this).index();

    $("#modify_header").text("Modify Layer " + layer_num + " Menu: " + layers[layer_num - 1].name)
    $("#modify_panel").slideDown(300);
    $("#insert_panel").slideUp(300);

    $("#modify_panel .name_input").val(layers[layer_num - 1].name  )
    $("#modify_panel .leng_input").val(layers[layer_num - 1].length)
    $("#modify_panel .dens_input").val(layers[layer_num - 1].rho   )

    $("#modify_panel .K_input:eq(0)").val(layers[layer_num - 1].K[0])
    $("#modify_panel .K_input:eq(1)").val(layers[layer_num - 1].K[1])
    $("#modify_panel .C_input:eq(0)").val(layers[layer_num - 1].C[0])
    $("#modify_panel .C_input:eq(1)").val(layers[layer_num - 1].C[1])
    $("#modify_panel .G_input:eq(0)").val(layers[layer_num - 1].G)

}

async function moveLayer(move) {
    
    if (layer_num + move > 0 && layer_num + move < layers.length + 1) {  
        await eel.move_layer( layer_num - 1, layer_num - 1 + move);
        layer_num += move;
    }

    await drawMaterial();    
    $("#modify_header").text("Modify Layer " + layer_num + " Menu: " + layers[layer_num - 1].name)


}


async function updateLayer() {

    let complete = true;
    $("#modify_panel input").each(function() {complete &= ($(this).val() != '')})

    const length = parseFloat($("#modify_panel .leng_input").val());
    const density = parseFloat($("#modify_panel .dens_input").val());
    let valid = (length > 0) && (density > 0);
    
    if (complete && valid) {
        
        console.log("Adding a new layer: " +  $("#modify_panel .name_input").val());
        
        let layer = {
            name:   $("#modify_panel .name_input").val(),
            length: length,
            rho:    density,
            K: [$("#modify_panel .K_input:eq(0)").val(), $("#modify_panel .K_input:eq(1)").val()],
            C: [$("#modify_panel .C_input:eq(0)").val(), $("#modify_panel .C_input:eq(1)").val()],
            G: $("#modify_panel .G_input:eq(0)").val()
        };

    await eel.setLayers(layer, layer_num - 1);
    await drawMaterial();
    $("#modify_header").text("Modify Layer " + layer_num + " Menu: " + layers[layer_num - 1].name)

    $("#helpbar").css("color","#ffffff");
    $("#helpbar").text("Layer modified correctly");
    //$("#modify_panel input").val("");
    }
    else if (!valid) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the layer: length and density must be positive numbers");
    }
    else if (!complete) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the layer: Some material properties are missing");
    }

}
