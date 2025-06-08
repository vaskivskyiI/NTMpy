let selectedFile = null;

$(document).ready(async function(){

    drawMaterial();

    $("#new_file" ).on("click", newFile);
    $("#save_file").on("click", saveFile);
    $("#load_file").on("click", loadFile);
    $("#del_file" ).on("click", delFile);
    $("#run_2Tsim").on("click", runSimulation);

    $("#files_header").on("click", function() {
        $("#files_panel").slideToggle(300);
    });
    $("#sim2T_header").on("click", function() {
        $("#sim2T_panel").slideToggle(300);
    });

    let currentFile = await eel.getFilename()();
    $("#filename").val(currentFile);

    const dirname = await eel.loadPath()();
    $("#pathname").val(dirname);
    exploreFiles();

    $("#goto").on("click", async function() {
        path = $("#pathname").val();
        if (!path.endsWith("/")) { path += "/"; }
        $("#pathname").val(path);
        await exploreFiles(path);
    });

    if (await eel.getTime("simulation")() > 0)
    {    $("#sim_time").val(((await eel.getTime("simulation")())*1e12).toFixed(3)); }
    if (await eel.getFlags("result_set")())
    {   $("#comp_time").text((await eel.getTime("computation")()).toExponential(3) + " seconds"); }
    
    $("#step_mode").on("click", changeMode)

    checkFlags();

});

async function exploreFiles(path = null) {
    let files = await eel.exploreFiles(path)();

    $("#filetable td").remove();
    $("#filetable tr").remove();
    $("#filetable").append("<tr><td>📁 ..</td></tr>");

    for (let i = 0; i < files.length; i++) {
        if (i % 4 === 3) { $("#filetable").append("<tr></tr>"); }
        let file = files[i];
        let icon = file.endsWith('.json') ? '📄' : '📁';
        $("#filetable tr:last-child").append(`<td>${icon} ${file}</td>`);
    }
    if (path) { eel.savePath(path); }

    $("#filetable td").on("click", async function() {
        const item = $(this).text();
        
        if (item.startsWith('📁')) {
            // Handle folder click
            const folderName = item.slice(2).trim();
            const currentPath = await eel.loadPath()();
            if (folderName === "..") {
                newPath = currentPath.slice(0,-1);
                if (newPath.endsWith("..") || !newPath.includes("/")) {
                    newPath = newPath + "/../";
                } else {
                    newPath = newPath.slice(0, newPath.lastIndexOf("/")) + "/"
                }
                
            }
            else {
                newPath = currentPath + folderName + "/";
            }

            $("#pathname").val(newPath);
            await exploreFiles(newPath);
        } else {
            $("td").removeClass("selected");
            $(this).addClass("selected");
            selectedFile = item.slice(2).trim();
        }
    });
}

async function newFile() {
    await eel.newFile()();
    $("#helpbar").css("color", "#ffffff");
    $("#helpbar").text("New simulation file created");
    drawMaterial();
    checkFlags();
}

async function saveFile() {
    const filename = $("#filename").val();
    const pathname = $("#pathname").val()
    const message = await eel.saveFile(filename, pathname)();
    const color = message.toLowerCase().includes("error")? "#ff0000" : "#ffffff";
    $("#helpbar").css("color", color);
    $("#helpbar").text(message);
    exploreFiles();
}

async function loadFile() {
    if (selectedFile) {
        const message = await eel.loadFile(selectedFile)();
        selectedFile = selectedFile.slice(0, selectedFile.lastIndexOf(".json"));
        $("#filename").val(selectedFile);
        const color = message.toLowerCase().includes("error")? "#ff0000" : "#ffffff";
        $("#helpbar").css("color", color);
        $("#helpbar").text(message);
        $("td").removeClass("selected");
        drawMaterial();
    } else {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("No file selected");
    }

    checkFlags();
}

async function delFile() {
    if (selectedFile) {
        if (confirm("Delete "+ selectedFile + "?")) {
            const message = await eel.deleteFile(selectedFile)();
            const color = message.toLowerCase().includes("error")? "#ff0000" : "#ffffff";
            $("#helpbar").css("color", color);
            $("#helpbar").text(message);
            exploreFiles();
        }
    }
}

async function runSimulation() {
    let finalTime;
    if ($("#step_mode").is(":checked")) { finalTime = parseFloat($("#sim_time").val()); }
    else { finalTime = parseInt($("#sim_time").val())*1e-12; }
    const sourceSet = await eel.getFlags("source_set")();
    const layersSet = await eel.getFlags("layers_set")();
    
    // Validate final time
    if (!isNaN(finalTime) && finalTime > 0 && sourceSet && layersSet) {
        $("#helpbar").css("color", "#ffffff");
        $("#helpbar").text("Running simulation...");
        error = await eel.runSimulation(finalTime)();
        if (error) {
            $("#helpbar").css("color", "#ff0000");
            $("#helpbar").text(error);
            return;
        }
        $("#comp_time").text((await eel.getTime("computation")()).toExponential(4) + " seconds");
        $("#step_mode").prop("checked",false)
        $("#helpbar").css("color", "#00ff00");
        $("#helpbar").text("Simulation finished");
    }
    else if (!finalTime > 0 || isNaN(finalTime)) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("Final simulation time is not set or not valid");
    } else if (!sourceSet && !layersSet) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("The material and source are not set");
    } else if (!sourceSet) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("The source is not set");
    } else if (!layersSet) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("Some material's properties are not set");
    }
    
    checkFlags();
}

async function drawMaterial() {

    const layers = await eel.getLayers()();
    const layersState = await eel.checkLayers()();

    let labels = [];
    layers.forEach(function(layer) { labels.push(layer.name); });
    await drawMaterial_core(labels, layersState);
}

async function checkFlags() {
    if (await eel.getFlags("source_set")()) {
        $("#sourceStatus .light").css("background-color","#00ff00")
        $("#sourceStatus .text" ).text("Source configured");
    } else {
        $("#sourceStatus .light").css("background-color","#ff0000")
        $("#sourceStatus .text" ).text("Source not configured");
    }
    if (await eel.getFlags("layers_set")()) {
        $("#layersStatus .light").css("background-color","#00ff00")
        $("#layersStatus .text" ).text("Material configured");
    } else {
        $("#layersStatus .light").css("background-color","#ff0000")
        $("#layersStatus .text" ).text("Material not configured");
    }
    if (await eel.getFlags("result_set")()) {
        $("#resultStatus .light").css("background-color","#00ff00")
        $("#resultStatus .text" ).text("Results available");
        $("#comp_time").text((await eel.getTime("computation")()).toExponential(4) + " seconds");
        $( "#sim_time").val(((await eel.getTime("simulation" )())*1e12).toFixed(3));
    } else {
        $("#resultStatus .light").css("background-color","#ff0000")
        $("#resultStatus .text" ).text("Results not available");
        $("#comp_time").text("Never run");
    }
    
}

function changeMode() {
    const stepMode = $(this).is(":checked");
    if (stepMode) {
        $("#sim_type").text("Total simulation steps");
        $("#helpbar").css("color", "#ffffff");
        $("#helpbar").text("Step mode enabled");
    } else {
        $("#sim_type").text("Total simulation time [ps]");
        $("#helpbar").css("color", "#ffffff");
        $("#helpbar").text("Step mode disabled");
    }
}

