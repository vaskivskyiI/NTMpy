let layerNum = 0;

$(document).ready(async function() {

    $("#source_header").on("click", function() {
        $("#source_panel").slideToggle(300);
        $("#plot_panel").slideUp(300);
    })

    $("#layer_header").on("click", function() {
        $("#layer_panel").slideToggle(300);
        $("#plot_panel").slideUp(300);
    })

    $("#plot_header").on("click", function() {
        $("#plot_panel").slideToggle(300);
        $("#source_panel").slideUp(300);
        $("#layer_panel").slideUp(300);
    })

    $("#check_LBL").on("click", () => {setReflection(false); })
    $("#check_TMM").on("click", () => {setReflection( true); })

    $("#update_layer").on("click", modifyIndexN);
    $("#update_source" ).on("click", setSource);

    $("#plot_space").on("click", plotSpace);
    $("#plot_time" ).on("click", plotTime );

    $("#plot_save" ).on("click", () => {$("#helpbar").css("color","#aaaaff"); $("#helpbar").text("not implemented yet :(");});
    $("#plot_pyplt").on("click", () => {$("#helpbar").css("color","#aaaaff"); $("#helpbar").text("not implemented yet :(");});

    drawMaterial();
    drawMenu();
    drawAxis();

});

async function drawMaterial() {

    let labels = [];

    const reflection = await eel.getFlags("reflection")();
    const layersState = await eel.checkLayers()();
    const nindex = await eel.getIndexN()();
    
    if (reflection) {
        nindex.forEach(function(layer) {
            if (layer.nr !== null && layer.ni !== null){
                labels.push("n = " + layer.nr + " + " + layer.ni + "i");
            }
            else { labels.push(""); }
        });
    } else {
        nindex.forEach(function(layer) {
            if (layer.l !== null) { labels.push("λ = " + (layer.l * 1e9).toFixed(0) + " nm"); }
            else { labels.push(""); }
        });
    }

    await drawMaterial_core(labels, layersState);
    $(".canvas > div").on("click", selectLayer);
};

async function drawMenu() {

    const reflection = await eel.getFlags("reflection")();
    const sourceSet = await eel.getFlags("source_set")();

    let content;

    $("#table_layer tr").remove();
    $("#table_source tr").remove();

    content =   "<tr><td>Fluence [J/m<sup>2</sup>]:</td><td>Pulse Duration (FWHM) [ps]:</td><td>Peak time [ps]:</td></tr>" +
    "<tr><td><input id='input_energy'></td><td><input id='input_fwhm'></td><td><input id='input_delay'></td></tr>"
    
    $("#table_source").append(content);

    if (reflection) {

        content =   "<tr><td>Refractive Index (real)</td><td>Refractive Index (imag)</td></tr>" +
                    "<tr><td style='margin-right: 5px'><input class='n_input'></td>" +
                    "<td style='margin-left: 5px'><input class='n_input'></td></tr>";

        $("#table_layer").append(content);
        $("#check_TMM").prop("checked", true);

        content =   "<tr style='margin-top:4px'><td>Wavelength</td><td>Incidence Angle</td><td>Polarization</td></tr>" +
                    "<tr><td><input class='k_input'></td>" +
                    "<td style=><input class='k_input'></td>" + 
                    "<td style='display:flex;flex-direction: row; align-items: center;'>" +
                    "<div style='flex:1'><input type='radio' name='pol' style='width: 12px' id='checkS'><label>S</label></div>" +
                    "<div style='flex:1'><input type='radio' name='pol' style='width: 12px' id='checkP'><label>P</label>" +
                    "</div></td></tr>";

        $("#table_source").append(content);

    } else {
        content =   "<tr><td>Absorption Length</td></tr>" + 
                    "<tr><td><input class='n_input'></td></tr>";
        
        $("#table_layer").append(content);
        $("#check_LBL").prop("checked", true);
    }

        if (sourceSet) {
        source = await eel.getSource()();
        $("#input_energy").val(source.energy);
        $("#input_fwhm"  ).val((source.fwhm  * 1e12).toFixed(5));
        $("#input_delay" ).val((source.delay * 1e12).toFixed(5));
        if (reflection) {
            $(".k_input:eq(0)").val(source.wavelength);
            $(".k_input:eq(1)").val(source.angle);
            if (source.polarization === "S") { $("#checkS").prop("checked", true); }
            else { $("#checkP").prop("checked", true); }
        }
    }
} 

async function selectLayer() {

    layerNum = $(this).index();

    const reflection = await eel.getFlags("reflection")();
    const nindex = await eel.getIndexN()();

    $("#layer_header").text("Properties of Layer " + layerNum);


    if (reflection && nindex[layerNum - 1].nr !== null && nindex[layerNum - 1].ni !== null) {
        $("#table_layer input:eq(0)").val(nindex[layerNum - 1].nr);
        $("#table_layer input:eq(1)").val(nindex[layerNum - 1].ni);
    } else if (!reflection && nindex[layerNum - 1].l !== null) {
        $("#table_layer input:eq(0)").val(nindex[layerNum - 1].l);
    }

}

async function setReflection(reflection){
    eel.setFlags("reflection", reflection);
    eel.setFlags("result_set", false);
    await eel.checkSource()();
    await eel.checkLayers()();
    drawMaterial();
    drawMenu();
}

async function setSource() {

    const reflection = await eel.getFlags("reflection")();

    const energy = parseFloat($("#input_energy").val());
    const fwhm   = parseFloat($("#input_fwhm"  ).val()) * 1e-12;
    const delay  = parseFloat($("#input_delay" ).val()) * 1e-12;

    let wavelength, angle, polarization;

    let valid = (energy > 0) && (fwhm > 0) && !isNaN(delay); 

    if (reflection) {
        wavelength = parseFloat($(".k_input:eq(0)").val());
        angle      = parseFloat($(".k_input:eq(1)").val());
        valid &= (wavelength > 0) && (angle >= 0) && (angle < 90);
        valid &= ($("#checkS").prop("checked") || $("#checkP").prop("checked"));
    }

    if (valid) {
        eel.setSource(energy, fwhm, delay);

        if (reflection) {
            polarization = $("#checkS").prop("checked") ? "S" : "P";
            eel.setWave(wavelength, angle, polarization);
        }

        eel.setFlags("source_set", true);
        sourceSet = true;
        drawMaterial();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Source added correctly");
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot add the source: Some source properties are missing or invalid");
    }

}

async function modifyIndexN() {

    const reflection = await eel.getFlags("reflection")();

    let complete = true;
    $(".n_input").each(function() {complete &= !isNaN(parseFloat($(this).val()));})

    if (layerNum > 0 && complete) {

        if (reflection) {
            const nreal = parseFloat($("#table_layer input:eq(0)").val());
            const nimag = parseFloat($("#table_layer input:eq(1)").val());
            await eel.setIndexN( nreal, nimag, layerNum)();
        } else {
            const lambda = parseFloat($("#table_layer input:eq(0)").val());
            await eel.setIndexN( lambda, 0, layerNum )();
        }

        drawMaterial();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Index modified correctly");
    }
    else if (layerNum <= 0) {   
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the index: no layer selected");
    }
    else if (!complete) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the index: some input is not a number");
    }

}

async function plotTime() {

    const sourceSet = await eel.getFlags("source_set")();

    if (sourceSet) {
        source = await eel.getSource()();
        drawCurve(await eel.plotSourceTime()(), true, "#bbbbff");
        timeStep = 1e12*((source.delay + source.fwhm) / 2);
        timeArray = Array.from({length: 5}, (_, i) => (i*timeStep).toFixed(1) + " ps");
        drawLabelsX(timeArray);
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Time plot generated");
    }
    else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot the source: source is not set");
    }
}

async function plotSpace() {

    const layersSet = await eel.getFlags("almost_set")();
    const sourceSet = await eel.getFlags("source_set")();
    const reflection = await eel.getFlags("reflection")();

    if (layersSet && (sourceSet || !reflection)) {
        drawCurve(await eel.plotSourceSpace()(), true, "#bbbbff");
        spaceStep = layers.reduce((length, layer) => length + 1e9*layer.length, 0) / 4;
        spaceArray = Array.from({length: 5}, (_, i) => (i*spaceStep).toFixed(1) + " nm");
        drawLabelsX(spaceArray);
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Space plot generated");
    }
    else if (!layersSet){
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot: Some layers' properties are missing");
    }
    else if (!sourceSet && reflection) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot: When reflection is enabled, the source must be set");
    }
}
