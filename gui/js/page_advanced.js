$(document).ready(function() {


    $("#advanced_header").on("click", function() {
        $("#advanced_panel").slideToggle(300);
    });

    $("#sim_type").on("change", async function() {
        const simType = $(this).val();
        // TODO: Handle simulation type change
        $("#helpbar").css("color", "#ffffff");
        $("#helpbar").text("Simulation type changed to " + simType);
    });
});