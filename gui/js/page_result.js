let data;

$(document).ready(async function() {

    $(".canvas").remove();

    drawAxis();
    data = await eel.getResults()();
    drawCurve(data[1].map(T => T- 290),  true, "#ee5555");
    drawCurve(data[2].map(T => T- 290), false, "#5555ee");
    
});


