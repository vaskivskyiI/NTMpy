let layer_num = 0;
let source_set;
let reflection;
let nindex;
let source;

let data;

$(document).ready(async function() {

    reflection = await eel.getFlags("reflection")();
    nindex = await eel.getIndexN()();
    source_set = await eel.getFlags("source_set")();

    $("#time_header").on("click", function() {
        $("#time_panel").slideToggle(300);
        $("#plot_panel").slideUp(300);
    })

    $("#space_header").on("click", function() {
        $("#space_panel").slideToggle(300);
        $("#plot_panel").slideUp(300);
    })

    $("#plot_header").on("click", function() {
        $("#plot_panel").slideToggle(300);
        $( "#time_panel").slideUp(300);
        $("#space_panel").slideUp(300);
    })

    $("#check_LBL").on("click", function() {reflection = false; eel.setFlags("reflection", false); drawPage();})
    $("#check_TMM").on("click", function() {reflection =  true; eel.setFlags("reflection",  true); drawPage();})

    $("#update_space").on("click", modifyIndexN);
    $("#update_time" ).on("click", setSource);

    $("#plot_space").on("click", plotSpace);
    $("#plot_time" ).on("click", plotTime );


    drawPage();

});

async function drawPage() {

    let labels = [];
    
    if (reflection) {
        nindex.reduce(function(dummy, layer) {labels.push(layer.nr + " + " + layer.ni + "i");}, 0);
    } else {
        nindex.reduce(function(dummy, layer) {labels.push(layer.l);}, 0);
    }

    if (source_set||true) {
        source = await eel.getSource()();
        $("#table_time input:eq(0)").val(source.energy);
        $("#table_time input:eq(1)").val(source.fwhm);
        $("#table_time input:eq(2)").val(source.delay);
    }

    
    await drawMaterial_core(labels);
    $(".canvas > div").on("click", selectLayer);

    drawMenu();
    drawAxis();

};

function drawMenu() {

    let content;

    if (reflection) {
        content =   "<tr>" +
                        "<td>Refractive Index (real)</td>" + 
                        "<td>Refractive Index (imag)</td>" +
                    "</tr>" +
                    "<tr><td><input></td><td><input></td></tr>";
        $("#check_TMM").prop("checked", true);
    } else {
        content =   "<tr><td>Absorption Length</td></tr>" + 
                    "<tr><td><input></td></tr>";
        $("#check_LBL").prop("checked", true);
    }

    $("#table_space tr").remove();
    $("#table_space").prepend(content);

} 

function selectLayer() {
    layer_num = $(this).index();

    $("#space_panel div label:eq(0)").text("Properties of Layer " + layer_num);

    if (reflection) {
        $("#table_space input:eq(0)").val(nindex.nr);
        $("#table_space input:eq(1)").val(nindex.ni);
    } else {
        $("#table_space input:eq(0)").val(nindex.l);
    }

}

function setSource() {
    energy = parseFloat($("#table_time input:eq(0)").val());
    fwhm   = parseFloat($("#table_time input:eq(1)").val());
    delay  = parseFloat($("#table_time input:eq(2)").val());

    valid = (energy > 0) && (fwhm > 0) && !isNaN(delay); 


    if (valid) {
        eel.setSource(energy, fwhm, delay);
        eel.setFlags("source_set", true);
        
        source.energy = energy;
        source.fwhm   = fwhm;
        source.delay  = delay;

        $("#helpbar").css("color","#ffffff");
        $("#helpbar").text("Source added correctly");
    } else {
        $("#helpbar").css("color","#ff5555");
        $("#helpbar").text("Cannot add the source: Some source properties are invalid");
    }

}

function modifyIndexN() {
    console.log(layer_num)
    if (reflection) {
        nr = $("#table_space input:eq(0)").val();
        ni = $("#table_space input:eq(0)").val();
        eel.setIndexN( nr, ni, layer_num)
    } else {
        lambda = $("#table_space input:eq(0)").val();
        eel.setIndexN( lambda, 0, layer_num)
    }

    drawPage()
}

async function plotTime() {

    drawCurve(await eel.plot_src_t()());
    timeStep = (source.delay + 2*source.fwhm) / 4;
    timeArray = Array.from({length: 5}, (_, i) => (i*timeStep).toExponential(1));
    drawLabels(timeArray)
}

async function plotSpace() {

    data = await eel.plot_src_x()();
    drawCurve(await eel.plot_src_x()());
    drawLabels()
}