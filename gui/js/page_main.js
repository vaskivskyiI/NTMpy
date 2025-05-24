$(document).ready( function(){

    drawMaterial();
    console.log("ready");
    $("#save_file").on("click", saveFile);
    $("#load_file").on("click", loadFile);
    $("#run_2Tsim").on("click", runSimulation);

    $("#files_header").on("click", function() {
        $("#files_panel").slideToggle(300);
        //$("#sim2T_panel").slideUp(300);
    });
    $("#sim2T_header").on("click", function() {
        $("#sim2T_panel").slideToggle(300);
        //$("#files_panel").slideUp(300);
    });

    explore_files();

});


explore_files = async function() {
    let files = await eel.explore_files()(); // Call the Python function
    console.log("Files: ", files);
    $("#filetable").empty();

    for (let i = 0; i < files.length; i++) {
        if (i % 3 == 0) { $("#filetable").append("<tr></tr>"); }
        let file = files[i];
        $("#filetable tr:last-child").append("<td>" + file + "</td>");
    }
}

async function saveFile() {
    let filename = $("#filename").val();
    let message = await eel.save_file(filename)();
    $("#helpbar").css("color", "#ffffff");
    $("#helpbar").text(message);
}

async function loadFile() {
    let message = await eel.load_file()(); // Call the Python load_file function
    $("#help_message").text(message);
    if (message.startsWith("Successfully loaded")) {
        drawMaterial(); // Redraw material if loading was successful
    }
}



async function runSimulation() {
    let message = await eel.run_simulation()(); // Call the Python function
    alert(message); // Show a success or error message
}

async function drawMaterial() {
    layers = await eel.getLayers()();

    let labels = [];
    layers.reduce(function(dummy, layer) {labels.push(layer.name);}, 0);
    await drawMaterial_core(labels);
};

