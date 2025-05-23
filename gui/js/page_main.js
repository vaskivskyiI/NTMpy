$(document).ready( function(){

    drawMaterial();
    console.log("ready");
    $("#save_file").on("click", saveFile);
    $("#load_file").on("click", loadFile);
    $("#run_2Tsim").on("click", runSimulation);
});

async function saveFile() {
    let message = await eel.save_file()(); // Call the Python function
    $("#helpbar").css("color","#ffffff");
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
    $(".canvas > div").on("click", selectLayer);
};

