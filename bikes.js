var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var view = {
    w: 1060,
    h: 800
}

var width = view.w - margin.left - margin.right;
var height = view.h - margin.bottom - margin.top;
var buttonh = 200;
var centered;

var graphVis = {
    x: 100,
    y: 10,
    w: width,
    h: height
};

var mapVis = {
    x: 10,
    y: 10,
    w: width,
    h: height 
}

var graphCanvas = d3.select("#graphVis").append("svg").attr({
    width: width,
    height: height - buttonh
    })

var mapCanvas = d3.select("#mapVis").append("svg").attr({
    width: width,
    height: height - buttonh
})

var graphsvg = graphCanvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var mapsvg = mapCanvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });