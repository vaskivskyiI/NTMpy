const COLORS0 = ['#dd2222','#dd9922','#bbdd22','#22dddd','#2266dd','#7722dd'];
const COLORS1 = ['#bb0000','#bb7700','#99bb00','#00bbbb','#0044bb','#5500bb'];
const COLORS2 = ['#770000','#774400','#668800','#008888','#001188','#220088'];
let layerNum = 0;

$(document).ready( async function(){

    drawMaterial();
    drawMenu();
    loadSavedMaterials();

    $("#load_drop").on("change", function() {
        const selectedMaterial = $(this).val();
        $("#canc_btn").prop("disabled", !selectedMaterial);
    });

    $("#canc_btn").on("click", deleteMaterial);
    $("#insert_header").on("click", function() {
        $("#modify_panel").slideUp(300);
        $("#insert_panel").slideToggle(300);
    });

    $("#modify_header").on("click", function() {
        if (layerNum > 0) {
            $("#insert_panel").slideUp(300);
            $("#modify_panel").slideToggle(300);    
        }
    });

    $("#insert_panel #submit").on("click", addLayer);
    $("#moveL").on("click", function() {moveLayer(-1);})
    $("#moveR").on("click", function() {moveLayer(+1);})
    $("#update") .on("click", function() {updateLayer();})
    $("#destroy").on("click", function() {destroyLayer();})
    $("#duplicate").on("click", function() {eel.duplicateLayer(layerNum-1); drawMaterial();})
    $(".canvas > div").on("click", selectLayer);

    $("#check_2T").on("click", () => {setSpinTemp(false);});
    $("#check_3T").on("click", () => {setSpinTemp( true);})
    $("#load_btn").on("click", loadMaterial)
    $("#save_btn").on("click", saveMaterial)


    console.log("ready");
  

});

async function drawMaterial() {

    const layers = await eel.getLayers()();
    const layersState = await eel.checkLayers()();

    let labels = [];
    layers.forEach(function(layer) { labels.push(layer.name); });
    await drawMaterial_core(labels, layersState);
    $(".canvas > div").on("click", selectLayer);
}

async function drawMenu() {

    const spinTemp = await eel.getFlags("spin_temp")();

    $(".table2 td:nth-child(4)").remove();
    $(".table2 td:nth-child(4)").remove();
    $(".table2 td:nth-child(4)").remove();
    $(".table3").empty();

    if (!spinTemp) {
        $("#check_2T").prop("checked", true);
        $(".table3").append("<label>Coupling:</label><input style='flex: 1;' class='G_input'></input>")

    }
    else if (spinTemp) {
        $("#check_3T").prop("checked", true);
        $(".table2 tr:nth-child(1)").append("<td>Spin</td>");
        $(".table2 tr:nth-child(2)").append("<td><div><input class='K_input'></div></td>");
        $(".table2 tr:nth-child(3)").append("<td><div><input class='C_input'></div></td>");
        $(".table3").append("<label>Coupling EL:</label><input style='flex: 1;' class='G_input'></input>");
        $(".table3").append("<label style='margin-left:12px'>ES:</label><input style='flex: 1;' class='G_input'></input>");
        $(".table3").append("<label style='margin-left:12px'>LS:</label><input style='flex: 1;' class='G_input'></input>");
    } 

}

async function addLayer() {

    const spinTemp = eel.getFlags("spin_temp")();

    let complete = true;
    $("#insert_panel input").each(function() {complete &= ($(this).val() != '')})

    const length = parseFloat($("#insert_panel .leng_input").val()) * 1e-9;
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
            G: [$("#insert_panel .G_input:eq(0)").val()]
        };

        if (spinTemp) {
            layer.K.push($("#insert_panel .K_input:eq(2)").val());
            layer.C.push($("#insert_panel .C_input:eq(2)").val());
            layer.G.push($("#insert_panel .G_input:eq(1)").val());
            layer.G.push($("#insert_panel .G_input:eq(2)").val());
        }

    
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

    layerNum = $(this).index();
    spinTemp = eel.getFlags("spin_temp")();

    $("#modify_header").text("Modify Layer " + layerNum + " Menu: " + layers[layerNum - 1].name)
    $("#modify_panel").slideDown(300);
    $("#insert_panel").slideUp(300);

    $("#modify_panel .name_input").val(layers[layerNum - 1].name  )
    $("#modify_panel .leng_input").val((layers[layerNum - 1].length * 1e9).toFixed(5))
    $("#modify_panel .dens_input").val(layers[layerNum - 1].rho   )

    $("#modify_panel .K_input:eq(0)").val(layers[layerNum - 1].K[0])
    $("#modify_panel .K_input:eq(1)").val(layers[layerNum - 1].K[1])
    $("#modify_panel .C_input:eq(0)").val(layers[layerNum - 1].C[0])
    $("#modify_panel .C_input:eq(1)").val(layers[layerNum - 1].C[1])
    $("#modify_panel .G_input:eq(0)").val(layers[layerNum - 1].G[0])

    if (spinTemp) {
        $("#modify_panel .K_input:eq(2)").val(layers[layerNum - 1].K[2])
        $("#modify_panel .C_input:eq(2)").val(layers[layerNum - 1].C[2])
        $("#modify_panel .G_input:eq(1)").val(layers[layerNum - 1].G[1])
        $("#modify_panel .G_input:eq(2)").val(layers[layerNum - 1].G[2])
    }

    const color1 = "linear-gradient(180deg," + COLORS1[(layerNum - 1) % 6] + ", " + COLORS2[(layerNum - 1) % 6] + ")"
    const color2 = "linear-gradient(180deg," + COLORS0[(layerNum - 1) % 6] + ", " + COLORS1[(layerNum - 1) % 6] + ")"
    $("#modify_header").css("background-image", color1);
    $("#modify_header").mouseenter(()=>{$("#modify_header").css("background-image", color2);})
    $("#modify_header").mouseout  (()=>{$("#modify_header").css("background-image", color1);})
    $("#update").css("background-image", color1);
    $("#update").mouseenter(()=>{$("#update").css("background-image", color2);})
    $("#update").mouseout  (()=>{$("#update").css("background-image", color1);})

}

async function destroyLayer() {
    eel.removeLayer(layerNum-1);
    
    const color1 = "linear-gradient(180deg, #747474, #414141)"
    const color2 = "linear-gradient(180deg, #969696, #747474)"
    $("#modify_header").css("background-image", color1);
    $("#modify_header").mouseenter(()=>{$("#modify_header").css("background-image", color2);})
    $("#modify_header").mouseout  (()=>{$("#modify_header").css("background-image", color1);})
    $("#update").css("background-image", color1);
    $("#update").mouseenter(()=>{$("#update").css("background-image", color2);})
    $("#update").mouseout  (()=>{$("#update").css("background-image", color1);})
    layerNum = 0;

    $("#modify_header").text("Click on a layer to modify it");

    drawMaterial();
}



async function moveLayer(move) {
    
    if (layerNum + move > 0 && layerNum + move < layers.length + 1) {  
        await eel.move_layer( layerNum - 1, layerNum - 1 + move);
        layerNum += move;
    }

    await drawMaterial();    
    $("#modify_header").text("Modify Layer " + layerNum + " Menu: " + layers[layerNum - 1].name)

    const color1 = "linear-gradient(180deg," + COLORS1[(layerNum - 1) % 6] + ", " + COLORS2[(layerNum - 1) % 6] + ")"
    const color2 = "linear-gradient(180deg," + COLORS0[(layerNum - 1) % 6] + ", " + COLORS1[(layerNum - 1) % 6] + ")"
    $("#modify_header").css("background-image", color1);
    $("#modify_header").mouseenter(()=>{$("#modify_header").css("background-image", color2);})
    $("#modify_header").mouseout  (()=>{$("#modify_header").css("background-image", color1);})
    $("#update").css("background-image", color1);
    $("#update").mouseenter(()=>{$("#update").css("background-image", color2);})
    $("#update").mouseout  (()=>{$("#update").css("background-image", color1);})

}

async function updateLayer() {

    let complete = true;
    $("#modify_panel input").not("#save_name").each(function() {complete &= ($(this).val() != '')})

    const length = parseFloat($("#modify_panel .leng_input").val()) * 1e-9;
    const density = parseFloat($("#modify_panel .dens_input").val());
    let valid = (length > 0) && (density > 0);
    
    if (complete && valid && layerNum > 0) {
        
        console.log("Adding a new layer: " +  $("#modify_panel .name_input").val());
        
        let layer = {
            name:   $("#modify_panel .name_input").val(),
            length: length,
            rho:    density,
            K: [$("#modify_panel .K_input:eq(0)").val(), $("#modify_panel .K_input:eq(1)").val()],
            C: [$("#modify_panel .C_input:eq(0)").val(), $("#modify_panel .C_input:eq(1)").val()],
            G: [$("#modify_panel .G_input:eq(0)").val()]
        };

        if (spinTemp) {
            layer.K.push($("#modify_panel .K_input:eq(2)").val());
            layer.C.push($("#modify_panel .C_input:eq(2)").val());
            layer.G.push($("#modify_panel .G_input:eq(1)").val());
            layer.G.push($("#modify_panel .G_input:eq(2)").val());
        }

    await eel.setLayers(layer, layerNum - 1);
    await drawMaterial();
    $("#modify_header").text("Modify Layer " + layerNum + " Menu: " + layers[layerNum - 1].name)

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
    else if (layerNum <= 0) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the layer: No layer selected");
    }

}

async function setSpinTemp(spinTemp) {
    await eel.setFlags("spin_temp" , spinTemp);
    await eel.setFlags("result_set", false);
    drawMenu();
    drawMaterial();
    loadSavedMaterials()
}

async function loadSavedMaterials() {
    const materials = await eel.getMaterialsDB()();
    
    $("#load_drop").empty();
    $("#load_drop").append('<option value="">Select a material...</option>');
    
    materials.forEach(material => {
        $("#load_drop").append(`<option value="${material}">${material}</option>`);
    });
}

async function loadMaterial() {
    const materialName = $("#load_drop").val();
    
    if (!materialName) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Please select a material to load");
        return;
    }
    
    const result = await eel.loadMaterialFromDB(materialName)();
    
    if (result.success) {
        const material = result.material;
        
        // Update the insert panel fields with the loaded material
        $("#insert_panel .name_input").val(material.name);
        $("#insert_panel .leng_input").val((material.length * 1e9).toFixed(5));
        $("#insert_panel .dens_input").val(material.rho);
        
        // Set thermal conductivity values
        $("#insert_panel .K_input:eq(0)").val(material.K[0]);
        $("#insert_panel .K_input:eq(1)").val(material.K[1]);
        if (material.K.length > 2) {
            $("#insert_panel .K_input:eq(2)").val(material.K[2]);
        }
        
        // Set thermal capacity values
        $("#insert_panel .C_input:eq(0)").val(material.C[0]);
        $("#insert_panel .C_input:eq(1)").val(material.C[1]);
        if (material.C.length > 2) {
            $("#insert_panel .C_input:eq(2)").val(material.C[2]);
        }
        
        // Set coupling values
        $("#insert_panel .G_input:eq(0)").val(material.G[0]);
        if (material.G.length > 1) {
            $("#insert_panel .G_input:eq(1)").val(material.G[1]);
            $("#insert_panel .G_input:eq(2)").val(material.G[2]);
        }
        
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text(`Material ${materialName} loaded successfully`);
        
        // Reset the dropdown
        $("#load_drop").val("");
        
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text(result.message);
    }
}

async function deleteMaterial() {
    const materialName = $("#load_drop").val();
    
    if (!materialName) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Please select a material to delete");
        return;
    }
    
    const result = await eel.deleteMaterialFromDB(materialName)();
    
    if (result.success) {
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text(result.message);
        loadSavedMaterials();  // Refresh the materials list
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text(result.message);
    }
}

async function saveMaterial() {
    let complete = true;
    $("#modify_panel input").each(function() {complete &= ($(this).val() != '')})

    const saveName = $("#save_name").val();

    if (layerNum <= 0) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot save material: No layer selected");
    }
    else if (!saveName) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot save material: Please provide a name");
    }
    else if (!complete) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot save material: Some material properties are missing");
    }
    else if (complete && saveName) {
        // Get all the material properties
        const material = {
            id: saveName,
            num_temp: await eel.getFlags("spin_temp")() ? 3 : 2,
            name: $("#modify_panel .name_input").val(),
            rho:  $("#modify_panel .dens_input").val(),
            K: [$("#modify_panel .K_input:eq(0)").val(), $("#modify_panel .K_input:eq(1)").val()],
            C: [$("#modify_panel .C_input:eq(0)").val(), $("#modify_panel .C_input:eq(1)").val()],
            G: [$("#modify_panel .G_input:eq(0)").val()]
        };
    
        if (material.num_temp == 3) {
            material.K.push($("#modify_panel .K_input:eq(2)").val());
            material.C.push($("#modify_panel .C_input:eq(2)").val());
            material.G.push($("#modify_panel .G_input:eq(1)").val());
            material.G.push($("#modify_panel .G_input:eq(2)").val());
        }
    
        // Save the material
        const result = await eel.saveMaterialToDB(saveName, material)();
        
        if (result.success) {
            $("#helpbar").css("color","#ffffff");
            $("#helpbar").text(result.message);
            loadSavedMaterials();
        } else if (!result.success) {
            $("#helpbar").css("color","#ff5555");
            $("#helpbar").text(result.message);
        }
    }
}