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

// -----------------------------------
// map vis
// -----------------------------------

var projection = d3.geo.mercator().scale(1).precision(.1);//.translate([width / 2, height / 2])
var path = d3.geo.path().projection(projection);

// var screencoord = projection([-71.074778, 42.349278]);

// graphsvg.append("circle")
//     .attr("cx", screencoord[0])
//     .attr("cy", screencoord[1])
//     .attr("r", 3)


// boston
d3.json("/data/boston.json", function(error, data) {

    // console.log(data);
    projection.scale(100000).center([-71.090813, 42.309228]);

    var cityMap = topojson.feature(data,data.objects.boston).features;
    // console.log(cityMap);

    mapsvg.selectAll(".city").data(cityMap).enter().append("path")
        .attr("class", "city")
        .attr("d", path).on("click", clicked);
    // see also: http://bl.ocks.org/mbostock/4122298

});

// chicago
// d3.json("/data/chicago.json", function(error, data) {

//     // console.log(data);
//     projection.scale(40000).center([-87.684631, 41.817225]);

//     var cityMap = topojson.feature(data,data.objects.chicago).features;
//     // console.log(cityMap);

//     mapsvg.selectAll(".city").data(cityMap).enter().append("path")
//         .attr("class", "city")
//         .attr("d", path).on("click", clicked);
//     // see also: http://bl.ocks.org/mbostock/4122298

// });

// washington
// d3.json("/data/washington.json", function(error, data) {

//     // console.log(data);
//     projection.scale(100000).center([-77.00386, 38.894156]);

//     var cityMap = topojson.feature(data,data.objects.washington).features;
//     // console.log(cityMap);

//     mapsvg.selectAll(".city").data(cityMap).enter().append("path")
//         .attr("class", "city")
//         .attr("d", path).on("click", clicked);
//     // see also: http://bl.ocks.org/mbostock/4122298

// });

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  mapsvg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  mapsvg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1/k + "px");
}

// console.log(screencoord[2])
// Source links
// https://github.com/CityOfBoston/BRA_webmap_static (not used)
// https://github.com/codeforamerica/click_that_hood/
// convert geojson to topojson: https://github.com/mbostock/topojson/wiki/Command-Line-Reference
// chose mercator (good for cities)
// finding long-lat: http://itouchmap.com/latlong.html

// -----------------------------------
// graph vis
// -----------------------------------

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
