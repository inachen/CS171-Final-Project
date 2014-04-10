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
    h: height - buttonh
};

var mapVis = {
    x: 10,
    y: 10,
    w: width,
    h: height 
}

var graphCanvas = d3.select("#graphVis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height - buttonh + margin.top + margin.bottom
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

var pointRadius = 2

createGraph = function(param,type) {
    d3.json("dc_stats.json", function(error, data) {
        
        var dates = Object.keys(data).sort()
        var objs = dates.map(function(d) {return data[d]})
        var points = objs.map(function(d) {return d[param][type]})

        var xScaleGraph = d3.time.scale()
                        .domain([new Date(dates[0]),new Date(dates.last())])
                        .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
        var yScaleGraph = d3.scale.linear()
                        .domain([points.min(),points.max()])
                        .range([graphVis.y+graphVis.h-margin.top,graphVis.y+margin.top])

        console.log(objs)

        xAxisGraph = d3.svg.axis()
          .scale(xScaleGraph)
          .orient("bottom");

        yAxisGraph = d3.svg.axis()
          .scale(yScaleGraph)
          .orient("left");
        
        graphCanvas.selectAll('circle')
            .data(objs)
            .enter()
            .append('circle')
            .attr({
                r: pointRadius,
                cx: function(d){return xScaleGraph(new Date(d.date))},
                cy: function(d){return yScaleGraph(d[param][type])},
                fill: 'black'
            })







        console.log(xScaleGraph.range())
        graphCanvas.append("g")
            .classed("axis",true)
            .call(xAxisGraph)
            .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")");


        graphCanvas.append("g")
            .classed("axis",true)
            .call(yAxisGraph)
            .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")");


    })
}

createGraph('rides','Casual');



var convertToInt = function(s) {
    return parseInt(s.replace(/,/g, ""), 10);
};

// method for getting min array element, arr.min()
if (!Array.prototype.min){
    Array.prototype.min = function(){
        return Math.min.apply(null,this);
    };
};

// method for getting max array element,  arr.max()
if (!Array.prototype.max){
    Array.prototype.max = function(){
        return Math.max.apply(null,this);
    };
};

// method for getting last array element
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};