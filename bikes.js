var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

var view = {
    w: 1160,
    h: 700
}

var width = view.w - margin.left - margin.right;
var height = view.h - margin.bottom - margin.top;
var map_width = 500;
var centered;

var graphVis = {
    x: 100,
    y: 10,
    w: width - map_width,
    h: height
};

var mapVis = {
    x: 10,
    y: 10,
    w: map_width,
    h: height 
}

var graphCanvas = d3.select("#graphVis").append("svg").attr({
    width: graphVis.w +200+ margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var mapCanvas = d3.select("#mapVis").append("svg").attr({
    width: map_width + margin.left + margin.right,
    height: height 
})

var graphsvg = graphCanvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

var mapsvg = mapCanvas.append("g")
    // .attr({
    //     transform: "translate(" + margin.left + "," + margin.top + ")"
    // });

// -----------------------------------
// map vis
// -----------------------------------

var projection = d3.geo.mercator().scale(1).precision(.1);//.translate([width / 2, height / 2])
var path = d3.geo.path().projection(projection);

var station_tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .direction('e')
  .html(function(d) {
    return d['name'];
  })

mapsvg.call(station_tip);

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

function loadStations() {
    d3.csv("/data/dc-stations.csv",function(error,data){
        mapsvg.selectAll(".station")
            .data(data)
        .enter().append("circle")
        .filter(function(d) { return (projection([+d["long"], +d["lat"]]) != null ) })  
          .attr("class", "station hasData")
          .attr("cx", function(d) { coords = projection([+d["long"], +d["lat"]]);
                if (coords != null){return coords[0] }})
         .attr("cy", function(d) { coords = projection([+d["long"], +d["lat"]]); 
                if (coords != null){return coords[1] }})
         .attr("r", 2)
        .on('mouseover', station_tip.show)
        .on('mouseout', station_tip.hide)
    });
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 3;
    centered = d;
  } else {
    x = mapVis.w / 2;
    y = mapVis.h / 2;
    k = 1;
    centered = null;
  }

  mapsvg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  mapsvg.transition()
      .duration(750)
      .attr("transform", "translate(" + mapVis.w / 2 + "," + mapVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1/k + "px");
}

// boston
// d3.json("/data/boston.json", function(error, data) {

//     // console.log(data);
//     projection.scale(100000).center([-71.090813, 42.309228]);

//     var cityMap = topojson.feature(data,data.objects.boston).features;
//     // console.log(cityMap);

//     mapsvg.selectAll(".city").data(cityMap).enter().append("path")
//         .attr("class", "city")
//         .attr("d", path).on("click", clicked);
//     // see also: http://bl.ocks.org/mbostock/4122298

// });

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
d3.json("/data/washington.json", function(error, data) {

    // console.log(data);
    projection.scale(80000).center([-77.05386, 38.954156]).translate([mapVis.w/2, mapVis.h/2]);

    var cityMap = topojson.feature(data,data.objects.washington).features;
    // console.log(cityMap);

    mapsvg.selectAll(".city").data(cityMap).enter().append("path")
        .attr("class", "city")
        .attr("d", path).on("click", clicked);

    loadStations();

});


// console.log(screencoord[2])
// Source links
// https://github.com/CityOfBoston/BRA_webmap_static (not used)
// https://github.com/codeforamerica/click_that_hood/
// convert geojson to topojson: https://github.com/mbostock/topojson/wiki/Command-Line-Reference
// chose mercator (good for cities)
// finding long-lat: http://itouchmap.com/latlong.html
// zooming map: http://bl.ocks.org/mbostock/4122298

// -----------------------------------
// graph vis
// -----------------------------------

var pointRadius = 2

var xScaleGraph, yScaleGraph;

var dc_data = {};

interpolateLinear = function(point_arr) {
  return point_arr.join("L");
}

createGraph = function(param,type) {
    jQuery.ajax({url:"dc_stats.json",async:false,success:function(data)  
    {
        
        dc_data = data;

        console.log(dc_data);

        var dates = Object.keys(data).sort()
        var objs = dates.map(function(d) {return data[d]})
        var points = objs.map(function(d) {return d[param][type]})


        xScaleGraph = d3.time.scale()
                        .domain([new Date(dates[0]),new Date(dates[dates.length-1])])
                        .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
        yScaleGraph = d3.scale.linear()
            .domain([(points.min()*0.9),(points.max()*1.1)])
            .range([graphVis.y+graphVis.h-margin.top-300,graphVis.y+margin.top])



        var point_pairs = points.map(function(d,i) {return [xScaleGraph(new Date(dates[i])),yScaleGraph(d)]})


        var xAxisGraph = d3.svg.axis()
          .scale(xScaleGraph)
          .orient("bottom");

        var yAxisGraph = d3.svg.axis()
          .scale(yScaleGraph)
          .orient("left");


        graphCanvas.selectAll('circle')
            .data(objs)
            .enter()
            .append('circle')
            .classed('dc',true)
            .attr({
                r: pointRadius,
                cx: function(d){return xScaleGraph(new Date(d.date))},
                cy: function(d){return yScaleGraph(d[param][type])},
                fill: 'black'
            })

        graphCanvas.append('path')
            .classed('dc',true)
            .attr('d','M' + interpolateLinear(point_pairs))
            .attr('fill','none')
            .attr('stroke','black')

        graphCanvas.append("g")
            .classed("axis",true)
            .classed("xaxis",true)
            .call(xAxisGraph)
            .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")");


        graphCanvas.append("g")
            .classed("axis",true)
            .classed("yaxis",true)
            .call(yAxisGraph)
            .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")");


    }})
}


var updateGraph = function(param,type)
{
    var dates = Object.keys(dc_data).sort()
    var objs = dates.map(function(d) {return dc_data[d]})
    var points = objs.map(function(d) {return d[param][type]})

    
    xScaleGraph = d3.time.scale()
                    .domain([new Date(dates[0]),new Date(dates.last())])
                    .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
    yScaleGraph = d3.scale.linear()
        .domain([(points.min()*0.9),(points.max()*1.1)])
        .range([graphVis.y+graphVis.h-margin.top-300,graphVis.y+margin.top])




    graphCanvas.selectAll("circle")
        .transition()
        .attr('cx', function(d){return xScaleGraph(new Date(d.date))})
        .attr('cy', function(d){return yScaleGraph(d[param][type])})
        .attr('fill', 'black')
        .attr('r', 2)
        

    xAxisGraph = d3.svg.axis()
      .scale(xScaleGraph)
      .orient("bottom");

    yAxisGraph = d3.svg.axis()
      .scale(yScaleGraph)
      .orient("left");

    var dc_point_pairs = points.map(function(d,i) {return [xScaleGraph(new Date(dates[i])),yScaleGraph(d)]})

    d3.selectAll('path.dc')
        .transition()
        .attr('d','M' + interpolateLinear(dc_point_pairs))
        .attr('fill','none')
        .attr('stroke','black')


    d3.selectAll('.xaxis')
        .transition()
        .call(xAxisGraph)
        .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")")
        



    d3.selectAll('.yaxis')
        .transition()
        .call(yAxisGraph)
        .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")")
        


}

createGraph('rides','Subscriber');

console.log(dc_data)






d3.select("input[value=\"dist\"]").on("click", function(){updateGraph('dist','Casual');});
d3.select("input[value=\"speed\"]").on("click", function(){updateGraph('speed','Casual');});
d3.select("input[value=\"rides\"]").on("click", function(){updateGraph('rides','Casual')});
d3.select("input[value=\"time\"]").on("click", function(){updateGraph('time','Casual')});


d3.select("input[value=\"Subscriber\"]").on("click", function(){updateGraph('dist','Subscriber')});
d3.select("input[value=\"Casual\"]").on("click", function(){updateGraph('dist','Casual')});






