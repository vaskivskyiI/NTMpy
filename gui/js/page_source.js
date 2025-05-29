let layer_num = 0;
let source_set;
let layers_set;
let reflection;
let nindex;
let source = {energy: null, fwhm: null, delay: null, wavelength: null, angle: null};

let data;

$(document).ready(async function() {

    reflection = await eel.getFlags("reflection")();
    nindex = await eel.getIndexN()();
    source_set = await eel.getFlags("source_set")();
    layers_set = await eel.getFlags("layers_set")();

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

    $("#check_LBL").on("click", async function() {
        reflection = false;
        [source_set, layers_set] = await eel.setReflection(false)();
        drawPage();
    })
    $("#check_TMM").on("click", async function() {
        reflection =  true;
        [source_set, layers_set] = await eel.setReflection( true)();
        drawPage();
    })

    $("#update_layer").on("click", modifyIndexN);
    $("#update_source" ).on("click", setSource);

    $("#plot_space").on("click", plotSpace);
    $("#plot_time" ).on("click", plotTime );


    drawPage();

});

async function drawPage() {

    let labels = [];
    
    if (reflection) {
        nindex.forEach(function(layer) {
            if (layer.nr !== null && layer.ni !== null){ labels.push(layer.nr + " + " + layer.ni + "i"); }
            else { labels.push(""); }
        });
    } else {
        nindex.forEach(function(layer) {
            if (layer.l !== null) { labels.push(layer.l); }
            else { labels.push(""); }
        });
    }

    drawMenu();
    drawAxis();

    if (source_set) {
        source = await eel.getSource()();
        $("#input_energy").val(source.energy);
        $("#input_fwhm"  ).val(source.fwhm);
        $("#input_delay" ).val(source.delay);
        if (reflection) {
            $(".k_input:eq(0)").val(source.wavelength);
            $(".k_input:eq(1)").val(source.angle);
            if (source.polarization === "S") { $("#checkS").prop("checked", true); }
            else { $("#checkP").prop("checked", true); }
        }
    }

    
    await drawMaterial_core(labels);
    $(".canvas > div").on("click", selectLayer);



};

function drawMenu() {

    let content;

    $("#table_layer tr").remove();
    $("#table_source tr").remove();

    content =   "<tr><td>Incident Energy:</td><td>Full Width Half Max (Gaussian):</td><td>Delay:</td></tr>" +
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

} 

function selectLayer() {
    layer_num = $(this).index();

    $("#layer_header").text("Properties of Layer " + layer_num);


    if (reflection && nindex[layer_num - 1].nr !== null && nindex[layer_num - 1].ni !== null) {
        $("#table_layer input:eq(0)").val(nindex[layer_num - 1].nr);
        $("#table_layer input:eq(1)").val(nindex[layer_num - 1].ni);
    } else if (!reflection && nindex[layer_num - 1].l !== null) {
        $("#table_layer input:eq(0)").val(nindex[layer_num - 1].l);
    }

}

function setSource() {
    const energy = parseFloat($("#input_energy").val());
    const fwhm   = parseFloat($("#input_fwhm"  ).val());
    const delay  = parseFloat($("#input_delay" ).val());

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
        
        source.energy = energy;
        source.fwhm   = fwhm;
        source.delay  = delay;

        if (reflection) {
            polarization = $("#checkS").prop("checked") ? "S" : "P";
            eel.setWave(wavelength, angle, polarization);
            
            source.angle = angle;
            source.wavelength  = wavelength;
            source_set.polarization = polarization;
        }

        eel.setFlags("source_set", true);
        source_set = true;
        drawPage();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Source added correctly");
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot add the source: Some source properties are missing or invalid");
    }

}


async function modifyIndexN() {

    let complete = true;
    $(".n_input").each(function() {complete &= !isNaN(parseFloat($(this).val()));})

    if (layer_num > 0 && complete) {

        if (reflection) {
            nindex[layer_num - 1].nr = parseFloat($("#table_layer input:eq(0)").val());
            nindex[layer_num - 1].ni = parseFloat($("#table_layer input:eq(1)").val());
            layers_set = await eel.setIndexN( nindex[layer_num - 1].nr, nindex[layer_num - 1].ni, layer_num)();
        } else {
            nindex[layer_num - 1].l = parseFloat($("#table_layer input:eq(0)").val());
            layers_set = await eel.setIndexN( nindex[layer_num - 1].l, 0, layer_num )();
        }

        drawPage();

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Index modified correctly");
    }
    else if (layer_num <= 0) {   
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the index: no layer selected");
    }
    else if (!complete) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot modify the index: some input is not a number");
    }

}

async function plotTime() {
    if (source_set) {
        drawCurve(await eel.plot_src_t()(), true, "#bbbbff");
        timeStep = (source.delay + 2*source.fwhm) / 4;
        timeArray = Array.from({length: 5}, (_, i) => (i*timeStep).toExponential(1));
        drawLabels(timeArray);
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Time plot generated");
    }
    else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot the source: source is not set");
    }
}

async function plotSpace() {

    if (layers_set && (source_set || !reflection)) {
        drawCurve(await eel.plot_src_x()(), true, "#bbbbff");
        spaceStep = layers.reduce((length, layer) => length + layer.length, 0) / 4;
        spaceArray = Array.from({length: 5}, (_, i) => (i*spaceStep).toExponential(1));
        drawLabels(spaceArray);
        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Space plot generated");
    }
    else if (!layers_set){
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot: Some layers' properties are missing");
    }
    else if (!source_set && reflection) {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot plot: When reflection is enabled, the source must be set");
    }
}