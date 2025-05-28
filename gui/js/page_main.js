let selectedFile = null;

$(document).ready(async function(){

    drawMaterial();
    console.log("ready");
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

    let currentFile = await eel.get_filename()();
    currentFile = currentFile[0].slice(0, currentFile[0].lastIndexOf(".json"));
    $("#filename").val(currentFile);

    const dirname = await eel.load_path()();
    $("#pathname").val(dirname);
    exploreFiles();

    $("#goto").on("click", async function() {
        await exploreFiles($("#pathname").val());
    });

    checkFlags();

});

async function exploreFiles(path = null) {
    let files = await eel.explore_files(path)();

    $("#filetable").empty();
    $("#filetable").append("<tr><td>📁 ..</td></tr>");

    for (let i = 0; i < files.length; i++) {
        if (i % 4 === 3) { $("#filetable").append("<tr></tr>"); }
        let file = files[i];
        let icon = file.endsWith('.json') ? '📄' : '📁';
        $("#filetable tr:last-child").append(`<td>${icon} ${file}</td>`);
    }
    if (path) { eel.save_path(path); }

    $("#filetable").on("click", "td", async function() {
        const item = $(this).text();
        
        if (item.startsWith('📁')) {
            // Handle folder click
            const folderName = item.slice(2).trim();
            const currentPath = await eel.load_path()();
            let newPath;
            if (folderName === "..") { newPath = currentPath.slice(0, currentPath.lastIndexOf("/")); }
            else { newPath = currentPath + "/" + folderName; }

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
    await eel.new_file()();
    $("#helpbar").css("color", "#ffffff");
    $("#helpbar").text("New simulation file created");
    drawMaterial();
    checkFlags();
}

async function saveFile() {
    const filename = $("#filename").val();
    const message = await eel.save_file(filename)();
    const color = message.toLowerCase().includes("error")? "#ff0000" : "#ffffff";
    $("#helpbar").css("color", color);
    $("#helpbar").text(message);
    exploreFiles();
}

async function loadFile() {
    if (selectedFile) {
        const message = await eel.load_file(selectedFile)();
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
            const message = await eel.delete_file(selectedFile)();
            const color = message.toLowerCase().includes("error")? "#ff0000" : "#ffffff";
            $("#helpbar").css("color", color);
            $("#helpbar").text(message);
            exploreFiles();
        }
    }
}

async function runSimulation() {
    const finalTime = parseFloat($("#sim_time").val());
    const sourceSet = await eel.getFlags("source_set")();
    const layersSet = await eel.getFlags("layers_set")();
    console.log(finalTime);
    
    // Validate final time
    if (finalTime > 0 && sourceSet && layersSet) {
        $("#helpbar").css("color", "#ffffff");
        $("#helpbar").text("Running simulation...");
        let message = await eel.run_simulation(finalTime)();
        //alert(message);
        $("#helpbar").css("color", "#00ff00");
        $("#helpbar").text("Simulation finished");
    }
    else if (!finalTime > 0) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("Final simulation time is not set or not valid");
    } else if (!souceSet) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("The source is not set");
    } else if (!layersSet) {
        $("#helpbar").css("color", "#ff0000");
        $("#helpbar").text("Some material's properties are not set");
    }
    
    checkFlags();
}

async function drawMaterial() {
    layers = await eel.getLayers()();

    let labels = [];
    layers.forEach(function(layer) {labels.push(layer.name);});
    await drawMaterial_core(labels);
};

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
    
}

