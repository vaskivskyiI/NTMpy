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

    curr_file = await eel.get_filename()();
    $("#filename").val(curr_file);

    dirname = await eel.load_path()();
    $("#pathname").val(dirname);
    exploreFiles();

    $("#goto").on("click", async function() {
        await exploreFiles($("#pathname").val());
    });

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
}

async function saveFile() {
    let filename = $("#filename").val();
    let message = await eel.save_file(filename)();
    $("#helpbar").css("color", "#ffffff");
    $("#helpbar").text(message);
    explore_files();
}

async function loadFile() {
    let message = await eel.load_file(selectedFile)();
    $("#filename").val(selectedFile);
    $("#helpbar").css("color", "#ffffff");
    $("#helpbar").text(message);
    drawMaterial(); 
}

async function delFile() {
    if (!selectedFile) return;
    
    if (confirm(`Delete ${selectedFile}?`)) {
        await eel.delete_file(selectedFile)();
        explore_files();
    }
}

async function runSimulation() {
    let message = await eel.run_simulation()(); // Call the Python function
    alert(message); // Show a success or error message
}

async function drawMaterial() {
    layers = await eel.getLayers()();

    let labels = [];
    layers.forEach(function(layer) {labels.push(layer.name);});
    await drawMaterial_core(labels);
};



