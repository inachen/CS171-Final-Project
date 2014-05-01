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
var map_width = 600;
var map_height = 500;
var centered;

var container = L.DomUtil.get('mapVis');

var graphVis = {
    x: 100,
    y: 10,
    w: width - map_width + 20,
    h: 700
};

var mapVis = {
    x: 10,
    y: 10,
    w: map_width,
    h: height 
}

var graphCanvas = d3.select("#graphVis").append("svg").attr({
    width: graphVis.w +200+ margin.left + margin.right,
    height: map_height + margin.top + margin.bottom
    })

// var mapCanvas = d3.select("#mapVis").append("svg").attr({
//     width: map_width + margin.left + margin.right,
//     height: height 
// })

var map = new L.Map(container, {center: [38.934156, -77.05386], zoom: 10, maxZoom: 15, minZoom: 9})
    .addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/998/256/{z}/{x}/{y}.png"));
//     .on('click', function(e) {
//        mapVis.panTo(L.mouseEventToLatLng(e));
// });
var mapCanvas = d3.select(map.getPanes().overlayPane).append("svg"),
    mapsvg = mapCanvas.append("g").attr("class", "leaflet-zoom-hide");


var graphsvg = graphCanvas.append("g")
.attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

// var mapsvg = mapCanvas.append("g")
    // .attr({
    //     transform: "translate(" + margin.left + "," + margin.top + ")"
    // });

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

var convertToInt = function(s) {
    return parseInt(s.replace(/,/g, ""), 10);
};

// -----------------------------------
// map vis
// -----------------------------------

// var projection = d3.geo.mercator().scale(1).precision(.1);//.translate([width / 2, height / 2])
// var path = d3.geo.path().projection(projection);


// initial display preferences
var mapRider = "Casual";
var mapMetric = "distance";
var mapCity = "boston";

var classes = 9, scheme_id = "BuPu",
    scheme = colorbrewer[scheme_id][classes];

var stations_layer;

var transform;
var path;

var radius_scale;

var station_tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .direction('e')
  .html(function(d) {
    return d['name'];
  })

var neigh_tip = d3.tip()
  .attr('class', 'd3-neigh-tip')
  .html(function(d) {
    // console.log(d);
    return d['properties']['name'];
  })
  .offset([0, 10])
  .direction('e');

mapsvg.call(station_tip);
mapsvg.call(neigh_tip);

function circle_style(circles) {
            // if (!(extent && scale)) {
            //     extent = d3.extent(circles.data(), function (d) { return d.properties.depth; });
            //     scale = d3.scale.log()
            //             .domain(reverse ? extent.reverse() : extent)
            //             .range(d3.range(classes));
            // }

            circles.attr('opacity', 0.4)
                .attr('stroke', scheme[classes - 1])
                .attr('stroke-width', 1)
                .attr('fill', scheme[4])
                // function (d) {
                //     if (weekdata[d["id"].toString()]!= null) 
                //         {return scheme[4];}
                //     else
                //         {
                //             return 'lightgrey';
                //         }});
                // // .attr('class', 'station');

                //     function (d) {
                //     return scheme[(scale(d.properties.depth) * 10).toFixed()];
                // });

            circles.on('click', function (d, i) {
                L.DomEvent.stopPropagation(d3.event);

                var t = '<h3><%- name %></h3>' +
                        '<ul>' +
                        '<li>id: <%- id %></li>' +
                        '</ul>';

                var data = {
                        id: d.id,
                        name: d.properties.name,
                    };

                L.popup()
                    .setLatLng([d.geometry.coordinates[1], d.geometry.coordinates[0]])
                    .setContent(_.template(t, data))
                    .openOn(map);

            });
        }

function updateMap(typekey, subkey) {

    // console.log(map);

    map.removeLayer(stations_layer);

    loadStats(subkey, typekey);

    mapRider = subkey;
    mapMetric = typekey;

    // console.log(map);

    // loadStats(subkey, typekey);

    // // console.log(stations_layer.options.radius);
    // stations_layer.options.radius = function(d){
    // // console.log(d["id"]);
    // // console.log(weekdata[d["id"].toString()][subkey]); 
    //             if (weekdata[d["id"].toString()] != null) 
    //                 {return radius_scale(weekdata[d["id"].toString()][subkey][typekey]['avg']);} 
    //             else 
    //                 {return 1;}}

    // // console.log(stations_layer.options.radius);




}


function loadStations(subkey, typekey) {

    // d3.csv("/data/dc-stations.csv", function(collection) {
    //         L.pointsLayer(collection, {
    //             radius: 2,
    //             applyStyle: circle_style
    //         }).addTo(mapVis);
    //     });

    d3.json("/data/dc-stations.json", function(collection) {
        // console.log("hi");
        // console.log(collection);
        stations_layer = new L.PointsLayer(collection, {
            radius: function(d){ 
                if (weekdata[d["id"].toString()] != null && weekdata[d["id"].toString()][subkey][typekey]['avg'] != 0 ) 
                    {return radius_scale(weekdata[d["id"].toString()][subkey][typekey]['avg']);} 
                else 
                    {return 1;}},
            applyStyle: circle_style,
            subkey: subkey,
            typekey: typekey
        }).addTo(map);

    });

            // var chart = timeseries_chart(scheme)
            //         .x(get_time).xLabel("Earthquake origin time")
            //         .y(get_magnitude).yLabel("Magnitude")
            //         .brushmove(on_brush);

            // d3.select("body").datum(collection.features).call(chart);
        // });

        
    // d3.csv("/data/dc-stations.csv",function(error,data){
    //     stations = mapsvg.selectAll(".station")
    //         .data(data)
    //     .enter().append("circle")
    //     .filter(function(d) { return (map.latLngToLayerPoint(new L.LatLng(+d["lat"], +d["long"])) != null ) })  
    //       .attr("class", "station hasData")
    //       .attr("cx", function(d) { coords = map.latLngToLayerPoint(new L.LatLng(+d["lat"], +d["long"]));
    //             console.log(coords);
    //             if (coords != null){return coords.x }})
    //      .attr("cy", function(d) { coords = map.latLngToLayerPoint(new L.LatLng(+d["lat"], +d["long"]));
    //             if (coords != null){return coords.y }})
    //      .attr("r", 5)
    //      .attr("fill",  scheme[5])
    //      .attr('stroke', scheme[classes - 1])
    //      .attr('stroke-width', 1)
    //     .on('mouseover', station_tip.show)
    //     .on('mouseout', station_tip.hide);

          // map.on("viewreset", reset);
          // reset();

          // Reposition the SVG to cover the features.
       //    function reset() {

       //      var bounds = path.bounds(stations),
       //          topLeft = bounds[0],
       //          bottomRight = bounds[1];

       //      // console.log(bounds)

       //      mapCanvas .attr("width", bottomRight[0] - topLeft[0])
       //          .attr("height", bottomRight[1] - topLeft[1])
       //          .style("left", topLeft[0] + "px")
       //          .style("top", topLeft[1] + "px");

       //      mapsvg   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

       //  stations.attr("cx", function (d) { return map.latLngToLayerPoint(new L.LatLng(+d["lat"], +d["long"])).x; })
       // .attr("cy", function (d) { return map.latLngToLayerPoint(new L.LatLng(+d["lat"], +d["long"])).y; });
   // }
    // });
}

function loadStats(subkey, typekey){
 d3.json("/data/dc_map_weekday_stats.json", function(error,data){
        weekdata = data;

        var max = Math.max.apply(null,
                        Object.keys(data).map(function(e) {
                                return data[e][subkey][typekey]["avg"];
                        }).filter(function (value) {
        return (value != 0);
    }));
        var min = Math.min.apply(null,
                        Object.keys(data).map(function(e) {
                                return data[e][subkey][typekey]["avg"];
                        }).filter(function (value) {
        return (value != 0);
    }));

        radius_scale = d3.scale.linear().domain([min, max]).range([3, 10]);

        // console.log(radius_scale);

        // console.log(radius_scale(1));
        
        loadStations(subkey, typekey);
    })
}

function clicked(d) {
  var x, y, k;

  var centroid = path.centroid(d);
  map.panTo(new L.LatLng(centroid));
  // mapVis.panTo(centroid);

  // console.log(centroid)

    // var bounds = path.bounds(collection),
    //     topLeft = bounds[0],
    //     bottomRight = bounds[1];

    // mapCanvas .attr("width", bottomRight[0] - topLeft[0])
    //     .attr("height", bottomRight[1] - topLeft[1])
    //     .style("left", topLeft[0] + "px")
    //     .style("top", topLeft[1] + "px");

    // mapsvg   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

  // if (d && centered !== d) {
  //   var centroid = path.centroid(d);
  //   x = centroid[0];
  //   y = centroid[1];
  //   k = 3;
  //   centered = d;
  // } else {
  //   x = mapVis.w / 2;
  //   y = mapVis.h / 2;
  //   k = 1;
  //   centered = null;
  // }

  // mapsvg.selectAll("path")
  //     .classed("active", centered && function(d) { return d === centered; });

  // mapsvg.transition()
  //     .duration(750)
  //     .attr("transform", "translate(" + mapVis.w / 2 + "," + mapVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
  //     .style("stroke-width", 1/k + "px");
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
d3.json("/data/washington.geojson", function(collection) {

  transform = d3.geo.transform({point: projectPoint});
      path = d3.geo.path().projection(transform);

  var feature = mapsvg.selectAll("path")
      .data(collection.features)
    .enter().append("path")
    .attr("class", "city")
    .on('mouseover', neigh_tip.show)
    .on('mouseout', neigh_tip.hide);

  map.on("viewreset", reset);
  reset();

  // Reposition the SVG to cover the features.
  function reset() {
    var bounds = path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    // console.log(bounds)

    mapCanvas .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

    mapsvg.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


    feature.attr("d", path);//.on("click", clicked);
  }

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

    loadStats(mapRider, mapMetric);

});


// console.log(screencoord[2])
// Source links
// https://github.com/CityOfBoston/BRA_webmap_static (not used)
// https://github.com/codeforamerica/click_that_hood/
// convert geojson to topojson: https://github.com/mbostock/topojson/wiki/Command-Line-Reference
// chose mercator (good for cities)
// finding long-lat: http://itouchmap.com/latlong.html
// zooming map: http://bl.ocks.org/mbostock/4122298
// http://www.colorcombos.com/
// leaflet and topo view-source:http://calvinmetcalf.github.io/leaflet.d3/
// image overlay http://polymaps.org/ex/overlay.html
// gist example https://gist.github.com/edouard-lopez/10694800
// ***markers on leaflet http://bl.ocks.org/tnightingale/4718717
// leaflet set up https://github.com/mbostock/bost.ocks.org/blob/gh-pages/mike/leaflet/index.html
// http://www.colorcombos.com/

// -----------------------------------
// graph vis
// -----------------------------------

var pointRadius = 1.5;

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


        // console.log(data,Object.keys(graphData));



        for (key in Object.keys(graphData))
        {
            if (typeof graphData[Object.keys(graphData)[key]] == "object")
            {
                key = Object.keys(graphData)[key]
                // console.log(key)
                graphDates[key] = Object.keys(graphData[key]).sort()
                graphObjs[key] = graphDates[key].map(function(d) {return graphData[key][d]})
                graphPoints[key] = graphObjs[key].map(function(d) {return d[param][type]})
            }  

        }

        // console.log(graphDates,graphObjs,graphPoints)

        var dates_arrs = Object.keys(graphDates).map(function (key) {
            return graphDates[key]
        })

        var dates = [];
        dates = dates.concat.apply(dates, dates_arrs).sort();
        // console.log(dates)

        var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })
        // console.log(points_arrs)
        var points = [];
        points = points.concat.apply(points, points_arrs).sort();
        // console.log(points)

        var xScaleGraph = d3.time.scale()
                        .domain([new Date(dates[0]),new Date(dates[dates.length-1])])
                        .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
        var yScaleGraph = d3.scale.linear()
            .domain([(points.min()*0.9),(points.max()*1.1)])
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
                                return '#AA0114'
                            else if (key =='bos')
                                return '#666666'
                            else if (key == 'chi')
                                return '#336699'
                        }
                    })

                graphCanvas.append('path')
                    .classed(key,true)
                    .attr('d','M' + interpolateLinear(graphPointPairs[key]))
                    .attr('fill','none')
                    .attr('stroke',function(d) 
                        {
                            if (key =='dc')
                                return '#AA0114'
                            else if (key =='bos')
                                return '#666666'
                            else if (key == 'chi')
                                return '#336699'
                        })
            }
        }

        graphCanvas.append("g")
            .classed("axis",true)
            .classed("xaxis",true)
            .call(xAxisGraph)
            .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")")
            .selectAll('text')
            .style("text-anchor", "end")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });;


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
    // console.log(dates)


    var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })
    // console.log(points_arrs)
    var points = [];
    points = points.concat.apply(points, points_arrs).sort();
    // console.log(points)


    xScaleGraph = d3.time.scale()
                    .domain([new Date(dates[0]),new Date(dates.last())])
                    .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
    yScaleGraph = d3.scale.linear()
        .domain([(points.min()*0.9),(points.max()*1.1)])
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
                            return '#AA0114'
                        else if (key =='bos')
                            return '#666666'
                        else if (key == 'chi')
                            return '#336699'
                    }
                })


            graphCanvas.selectAll('path.'+key)
                .transition()
                .attr('d','M' + interpolateLinear(graphPointPairs[key]))
 

            // console.log(graphPointPairs['dc'])

        }
    }

    d3.selectAll('.xaxis')
        .transition()
        .call(xAxisGraph)
        .attr("transform", "translate(" + 0 + "," + yScaleGraph.range()[0] + ")")
        .selectAll('text')
            .style("text-anchor", "end")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                });;

    d3.selectAll('.yaxis')
        .transition()
        .call(yAxisGraph)
        .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")")

}

createGraph('dist','Casual');

//console.log(dc_data)



d3.select("input[value=\"dist\"]").on("click", function(){updateGraph('dist',graphType); updateMap('distance', mapRider);});
d3.select("input[value=\"speed\"]").on("click", function(){updateGraph('speed',graphType);updateMap('avg_speed', mapRider);});
d3.select("input[value=\"rides\"]").on("click", function(){updateGraph('rides',graphType); updateMap('rides', mapRider);});
d3.select("input[value=\"time\"]").on("click", function(){updateGraph('time',graphType); updateMap('duration', mapRider);});


d3.select("input[value=\"Subscriber\"]").on("click", function(){updateGraph(graphStat,'Subscriber'); updateMap(mapMetric, "Subscriber");});
d3.select("input[value=\"Casual\"]").on("click", function(){updateGraph(graphStat,'Casual'); updateMap(mapMetric, "Casual");});






