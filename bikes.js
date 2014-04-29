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

var graphData = {};




var graphType = 'Casual'

var graphStat = 'dist'

interpolateLinear = function(point_arr) {
  return point_arr.join("L");
}

var graphObjs = {};
var graphDates = {};

var dc_dates,dc_objs,dc_points,chi_dates,chi_objs,chi_points,bos_dates,bos_objs,bos_points,dates,points,xScaleGraph,yScaleGraph;

createGraph = function(param,type) {

    jQuery.ajax({url:"./combo_stats.json",async:false,success:function(data)
    {
        var graphPoints= {}
        var graphPointPairs = {}

        graphType = type
        graphStat = param

        graphData['dc'] = data['dc'];
        graphData['chi'] = data['chi'];
        graphData['bos'] = data['bos'];


        console.log(data,Object.keys(graphData));



        for (key in Object.keys(graphData))
        {
            if (typeof graphData[Object.keys(graphData)[key]] == "object")
            {
                key = Object.keys(graphData)[key]
                console.log(key)
                graphDates[key] = Object.keys(graphData[key]).sort()
                graphObjs[key] = graphDates[key].map(function(d) {return graphData[key][d]})
                graphPoints[key] = graphObjs[key].map(function(d) {return d[param][type]})
            }  

        }

        console.log(graphDates,graphObjs,graphPoints)

        var dates_arrs = Object.keys(graphDates).map(function (key) {
            return graphDates[key]
        })

        var dates = [];
        dates = dates.concat.apply(dates, dates_arrs).sort();
        console.log(dates)

        var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })
        console.log(points_arrs)
        var points = [];
        points = points.concat.apply(points, points_arrs).sort();
        console.log(points)

        var xScaleGraph = d3.time.scale()
                        .domain([new Date(dates[0]),new Date(dates[dates.length-1])])
                        .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
        var yScaleGraph = d3.scale.linear()
            .domain([(points.min()*0.95),(points.max())])
            .range([graphVis.y+graphVis.h-margin.top-300,graphVis.y+margin.top])

        var xAxisGraph = d3.svg.axis()
          .scale(xScaleGraph)
          .orient("bottom");

        var yAxisGraph = d3.svg.axis()
          .scale(yScaleGraph)
          .orient("left");

        for (key in Object.keys(graphData))
        {
            if (typeof graphData[Object.keys(graphData)[key]] == "object")
            {
                key = Object.keys(graphData)[key]
                graphPointPairs[key] = graphPoints[key].map(function(d,i) {return [xScaleGraph(new Date(graphDates[key][i])),yScaleGraph(d)]})

                graphCanvas.selectAll('circle.'+key)
                    .data(graphObjs[key])
                    .enter()
                    .append('circle')
                    .classed(key,true)
                    .attr({
                        r: pointRadius,
                        cx: function(d){return xScaleGraph(new Date(d.date))},
                        cy: function(d){return yScaleGraph(d[param][type])},
                        fill: function(d) 
                        {
                            if (key =='dc')
                                return 'red'
                            else if (key =='bos')
                                return 'green'
                            else if (key == 'chi')
                                return 'blue'
                        }
                    })

                graphCanvas.append('path')
                    .classed(key,true)
                    .attr('d','M' + interpolateLinear(graphPointPairs[key]))
                    .attr('fill','none')
                    .attr('stroke',function(d) 
                        {
                            if (key =='dc')
                                return 'red'
                            else if (key =='bos')
                                return 'green'
                            else if (key == 'chi')
                                return 'blue'
                        })
            }
        }

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
    graphType = type
    graphStat = param
    
    var graphPoints= {}
    var graphPointPairs = {}

    for (key in Object.keys(graphData))
    {
        if (typeof graphData[Object.keys(graphData)[key]] == "object")
        {
            key = Object.keys(graphData)[key]
            graphPoints[key] = graphObjs[key].map(function(d) {return d[param][type]})
        }  

    }

    var dates_arrs = Object.keys(graphDates).map(function (key) {
        return graphDates[key]
    })

    var dates = [];
    dates = dates.concat.apply(dates, dates_arrs).sort();
    console.log(dates)


    var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })
    console.log(points_arrs)
    var points = [];
    points = points.concat.apply(points, points_arrs).sort();
    console.log(points)


    xScaleGraph = d3.time.scale()
                    .domain([new Date(dates[0]),new Date(dates.last())])
                    .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
    yScaleGraph = d3.scale.linear()
        .domain([(points.min()*0.95),(points.max())])
        .range([graphVis.y+graphVis.h-margin.top-300,graphVis.y+margin.top])
        
    xAxisGraph = d3.svg.axis()
      .scale(xScaleGraph)
      .orient("bottom");

    yAxisGraph = d3.svg.axis()
      .scale(yScaleGraph)
      .orient("left");

    for (key in Object.keys(graphData))
    {
        if (typeof graphData[Object.keys(graphData)[key]] == "object")
        {
            key = Object.keys(graphData)[key]
            graphPointPairs[key] = graphPoints[key].map(function(d,i) {return [xScaleGraph(new Date(graphDates[key][i])),yScaleGraph(d)]})

            graphCanvas.selectAll('circle.'+key)
                .transition()
                .attr({
                    r: pointRadius,
                    cx: function(d){return xScaleGraph(new Date(d.date))},
                    cy: function(d){return yScaleGraph(d[param][type])},
                    fill: function(d) 
                    {
                        if (key =='dc')
                            return 'red'
                        else if (key =='bos')
                            return 'green'
                        else if (key == 'chi')
                            return 'blue'
                    }
                })


            graphCanvas.selectAll('path.'+key)
                .transition()
                .attr('d','M' + interpolateLinear(graphPointPairs[key]))
 

            console.log(graphPointPairs['dc'])

        }
    }

    d3.selectAll('.xaxis')
        .transition()
        .call(xAxisGraph)
        .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")")

    d3.selectAll('.yaxis')
        .transition()
        .call(yAxisGraph)
        .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")")

}

createGraph('dist','Casual');

//console.log(dc_data)






d3.select("input[value=\"dist\"]").on("click", function(){updateGraph('dist',graphType);});
d3.select("input[value=\"speed\"]").on("click", function(){updateGraph('speed',graphType);});
d3.select("input[value=\"rides\"]").on("click", function(){updateGraph('rides',graphType)});
d3.select("input[value=\"time\"]").on("click", function(){updateGraph('time',graphType)});


d3.select("input[value=\"Subscriber\"]").on("click", function(){updateGraph(graphStat,'Subscriber')});
d3.select("input[value=\"Casual\"]").on("click", function(){updateGraph(graphStat,'Casual')});






