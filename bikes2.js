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

var brushVis = {
    x: 100,
    y: 10*margin.top,
    w: width - map_width + 20,
    h: 70
};

// var classes = 9, scheme_id = "BuPu",
//     scheme = colorbrewer[scheme_id][classes],
//     container = L.DomUtil.get('mapVis');

var graphVis = {
    x: 100,
    y: (brushVis.h + brushVis.y),
    w: width - map_width + 20,
    h: 750
};


var mapVis = {
    x: 10,
    y: 10,
    w: map_width,
    h: height 
}

var graphCanvas = d3.select("#graphVis").append("svg").attr({
    width: graphVis.w +200+ margin.left + margin.right,
    height: ((map_height + margin.top + margin.bottom) > (graphVis.y + graphVis.h - brushVis.y + margin.top + margin.bottom)) ? (map_height + margin.top + margin.bottom) : (graphVis.y + graphVis.h - brushVis.y + margin.top + margin.bottom)
    //height: map_height + margin.top + margin.bottom
});

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

var metric_info = {
    "distance":{
        text: "Average Distance Traveled per Trip"
    },
    "avg_speed":{
        text: "Average Speed of Rides"
    },
    "rides":{
        text: "Number of Rides"
    },
    "duration":{
        text: "Average Duration of Trips"

    }
}

// city info
var city_info = {
    "boston": { 
        zoomlat: 42.329228,
        zoomlong: -71.090813,
        zoomlvl: 11, 
        mapfile: "/data/boston.geojson",
        datafile: "/data/bos_map_weekday_stats.json",
        stationfile: "/data/bos-stations.json",
        loaded: false
    },
    "chicago": {
        zoomlat: 41.817225,
        zoomlong: -87.684631,
        zoomlvl: 10,
        mapfile: "/data/zchicago.geojson",
        datafile: "/data/chi_map_weekday_stats.json",
        stationfile: "/data/chi-stations.json",
        loaded: false
    },
    "dc": {
        zoomlat: 38.934156,
        zoomlong: -77.05386,
        zoomlvl: 10,
        mapfile: "/data/washington.geojson",
        datafile: "/data/dc_map_weekday_stats.json",
        stationfile: "/data/dc-stations.json",
        loaded: false
    }
}



var classes = 9, scheme_id = "BuPu",
    scheme = colorbrewer[scheme_id][classes];

var mapLoaded = false;

var stations_layer;

var transform;
var path;

var radius_scale;

var mapFeatures;
var mapCollection;

// var popup_data;

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
  .offset([0, 1])
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

                // popup_data = weekdata[d["id"].toString()][mapRider][mapMetric]["days"];

                var t = '<h3><%- name %></h3>' +
                        '<ul>' +
                        '<li><%- metric %>, <%- type %> riders</li>' +
                        '</ul>' +
                        '<div class="tip-weekday-chart"></div>' +
                        '<div class="curr_pop" id=<%- id %> > </div>';

                var data = {
                        metric: metric_info[mapMetric].text,
                        type: mapRider,
                        name: d.properties.name,
                        id: d["id"]
                    };


                
                // selectAll("div").data(popup_data)
                // .enter().append("div")
                // .attr("height", function(d) { return d * 10 + "px"; })
                // .attr("width", 5)
                // .attr("x", function(d,i){return i * 6})
                // .attr("y", 0)
                // .attr("fill", "black")

                // console.log(L.popup().options)

                L.popup()
                    .setLatLng([d.geometry.coordinates[1], d.geometry.coordinates[0]])
                    .setContent(_.template(t, data))
                    .openOn(map);

            });
        }

// add weekly chart to popup
map.on('popupopen', function(e){
    var pop_id = document.querySelectorAll(".curr_pop")[0].getAttribute("id");

    var pop_data = weekdata[pop_id.toString()][mapRider][mapMetric]["days"];

    var pop_yScale = d3.scale.linear().domain([0, pop_data.max()])
        .rangeRound([100, 10]);
    var pop_xScale = d3.scale.ordinal().domain(['Su', 'M', 'T', 'W', 'Th', 'F', 'S'])
        .range([50, 70, 90, 110, 130, 150, 170, 190]);

    var weeks = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S']

    var pop_yAxis = d3.svg.axis().scale(pop_yScale).orient("left").ticks(6).tickFormat(d3.format(".2f"));
    var pop_xAxis = d3.svg.axis().scale(pop_xScale).orient("bottom");

    console.log(pop_xScale('M'));
    console.log(pop_data);

    var pop_svg = d3.select("div.tip-weekday-chart").append("svg")
        .attr("width", 200)
        .attr("height", 130)

    pop_svg.selectAll("rect")
       .data(pop_data)
       .enter()
       .append("rect")
       .attr("x", function(d, i){return pop_xScale(weeks[i])})
       .attr("y", function(d){return pop_yScale(d);})
       .attr("width", 19)
       .attr("height", function (d){return (100 - pop_yScale(d));});

    pop_svg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0,105)")
        .call(pop_xAxis)
        .selectAll("text")
        .attr("transform", "translate(10, 0)");

    pop_svg.append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(45,0)")
        .call(pop_yAxis);


})

function updateMap(typekey, subkey) {

    // console.log(map);

    map.removeLayer(stations_layer);

    mapRider = subkey;
    mapMetric = typekey;

    loadStats(subkey, typekey, mapCity);

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


function loadStations(subkey, typekey, city) {

    // d3.csv("/data/dc-stations.csv", function(collection) {
    //         L.pointsLayer(collection, {
    //             radius: 2,
    //             applyStyle: circle_style
    //         }).addTo(mapVis);
    //     });



    // console.log(stationfile);

    d3.json(city_info[city].stationfile, function(collection) {
        // console.log("hi");
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

}

function loadStats(subkey, typekey, city){


     d3.json(city_info[city].datafile, function(error,data){

        // console.log(data);
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
            
            loadStations(subkey, typekey, city);
        })
}

function clicked(d) {
  var x, y, k;

  var centroid = path.centroid(d);
  map.panTo(new L.LatLng(centroid));
  // mapVis.panTo(centroid);

}


// washington
function loadMap(city){

    city_info[city].loaded = true;

    map.panTo(new L.LatLng(city_info[city].zoomlat, city_info[city].zoomlong));
    map.setZoom(city_info[city].zoomlvl);

    // console.log(curr_city)

    d3.json(city_info[city].mapfile, function(collection) {

    // console.log(collection);

      transform = d3.geo.transform({point: projectPoint});
          path = d3.geo.path().projection(transform);

      mapFeatures = mapsvg.selectAll("path")
          .data(collection.features)
        .enter().append("path")
        .attr("class", "city")
        .on('mouseover', neigh_tip.show)
        .on('mouseout', neigh_tip.hide);

      mapCollection = collection;

      mapLoaded = true;

      reset();

      // Use Leaflet to implement a D3 geometric transformation.
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }

        loadStats(mapRider, mapMetric, mapCity);
        // loadStations(mapRider, mapMetric, mapCity);

    });
}

function changeMap(city)
{
    map.removeLayer(stations_layer);
    mapsvg.selectAll("path").remove();

    mapCity = city;
    loadMap(city);

    // if (city_info[city].loaded)
    // {
    //     mapCity = city;
    //     map.panTo(new L.LatLng(city_info[city].zoomlat, city_info[city].zoomlong));
    //     map.setZoom(city_info[city].zoomlvl);
    //     updateMap(mapMetric, mapRider);

    // }

    // else
    // {
    //     mapCity = city;
    //     loadMap(city);
    // }

}

map.on("viewreset", reset);

// Reposition the SVG to cover the features.
function reset() {
    if (mapLoaded)
    {
        var bounds = path.bounds(mapCollection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        // console.log(bounds)

        mapCanvas .attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        mapsvg.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


        mapFeatures.attr("d", path);//.on("click", clicked);
    }
}

loadMap(mapCity);
// loadStats(mapRider, mapMetric, mapCity);


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

var dc_dates,dc_objs,dc_points,chi_dates,chi_objs,chi_points,bos_dates,bos_objs,bos_points,dates,points,xScaleGraph,yScaleGraph,xScaleBrush,brush, area_detail, path_detail;

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



        for (key in Object.keys(graphData))
        {
            if (typeof graphData[Object.keys(graphData)[key]] == "object")
            {
                key = Object.keys(graphData)[key]

//                 // console.log(key)
//                 graphDates[key] = Object.keys(graphData[key]).sort()
//                 graphObjs[key] = graphDates[key].map(function(d) {return graphData[key][d]})
//                 graphPoints[key] = graphObjs[key].map(function(d) {return d[param][type]})

                //console.log(key)
                if (key == 'bos' || key == 'chi')
                {
                    //console.log(Object.keys(graphData[key]).sort())
                    graphDates[key] = Object.keys(graphData[key]).sort().map(function(d)
                    { 
                        var date = new Date(d)
                        date.setTime(date.getTime() +  (1 * 24 * 60 * 60 * 1000));
                        return date
                    })

                    // console.log(graphDates[key][0],graphDates[key].last())
                }

                else
                {
                    graphDates[key] = Object.keys(graphData[key]).sort().map(function(d) { return new Date(d); })
                }
                graphObjs[key] = Object.keys(graphData[key]).sort().map(function(d) { return d; }).map(function(d) {return graphData[key][d]})
                graphPoints[key] = graphObjs[key].map(function(d) {return d[param][type]})  


            }  

        }


        var dates_arrs = Object.keys(graphDates).map(function (key) {
            return graphDates[key]
        })

        var dates = [];

        dates = dates.concat.apply(dates, dates_arrs)
        dates = dates.sort(function(date1,date2)
            {
              if (date1 > date2) return 1;
              if (date1 < date2) return -1;
              return 0;
            });

        // console.log(dates)


        var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })


        // console.log(points_arrs)
        var points = [];
        points = points.concat.apply(points, points_arrs).sort();
        // console.log(points)

        xScaleGraph = d3.time.scale()
                        .domain([dates[0],dates.last()])
                        .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
        
        xScaleBrush = d3.time.scale()
                        .domain([dates[0],dates[dates.length-1]])
                        .range([0,(graphVis.w)])

        brush = d3.svg.brush()
            .x(xScaleBrush)
            .on("brush", brushed);

        yScaleGraph = d3.scale.linear()
            .domain([(points.min()*0.9),(points.max()*1.1)])
            .range([graphVis.y+graphVis.h-margin.top-300,graphVis.y+margin.top])

        var xAxisGraph = d3.svg.axis()
          .scale(xScaleGraph)
          .orient("bottom");

        var yAxisGraph = d3.svg.axis()
          .scale(yScaleGraph)
          .orient("left");

        var xAxisBrush = d3.svg.axis()
          .scale(xScaleBrush)
          .orient("bottom");



        for (key in Object.keys(graphData))
        {
            if (typeof graphData[Object.keys(graphData)[key]] == "object")
            {
                key = Object.keys(graphData)[key]
                graphPointPairs[key] = graphPoints[key].map(function(d,i) {return [xScaleGraph(graphDates[key][i]),yScaleGraph(d)]})

                graphCanvas.selectAll('circle.'+key)
                    .data(graphObjs[key])
                    .enter()
                    .append('circle')
                    .classed(key,true)
                    .attr({
                        r: pointRadius,
                        cx: function(d,i){return xScaleGraph(new Date(d.date))},
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
            .classed("brusher",true)
            .call(xAxisBrush)
            .attr("transform", "translate(" + (brushVis.x) + "," + (brushVis.y) + ")")
            .selectAll('text')
            .style("text-anchor", "end")
            .attr("transform", function(d) {
                return "rotate(-65)" 
                })
            //.on('brush',brushed)


        graphCanvas.append("g")
            .classed("axis",true)
            .classed("yaxis",true)
            .call(yAxisGraph)
            .attr("transform", "translate("+ xScaleGraph.range()[0] +"," + 0 + ")");

        var overview = graphCanvas.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + brushVis.x + "," + brushVis.y + ")");

        var thisBrush = overview.append("g")
          .attr("class", "x brush")
          .call(brush);

        thisBrush.selectAll("rect")
          .attr("y", -6)
          .attr("height", brushVis.h + 10);

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
        // filter out methods at end of array
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


    var points_arrs = Object.keys(graphPoints).map(function (key) {
            return graphPoints[key]
        })

    // console.log(points_arrs)
    var points = [];
    points = points.concat.apply(points, points_arrs).sort();
    // console.log(points)


/*
    xScaleGraph = d3.time.scale()
                    .domain([new Date(dates[0]),new Date(dates.last())])
                    .range([(graphVis.x+margin.left),(margin.left + graphVis.x+graphVis.w-margin.right)])
*/      
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
            graphPointPairs[key] = graphPoints[key].map(function(d,i) {return [xScaleGraph(graphDates[key][i]),yScaleGraph(d)]})

            graphCanvas.selectAll('circle.'+key)
                .transition()
                .attr({
                    r: pointRadius,
                    cx: function(d){
                        if (key == 'chi' || key == 'bos')
                        {
                            var date = new Date(d.date)
                            date.setTime(date.getTime() +  (1 * 24 * 60 * 60 * 1000));
                            return xScaleGraph(date)
                        }
                        else
                            return xScaleGraph(new Date(d.date))
                    },
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

// brush function for mouse
function brushed() {
    //console.log(brush.empty() ? xScaleGraph.domain() : brush.extent())
    xScaleGraph.domain(brush.empty() ? xScaleGraph.domain() : brush.extent());
    updateGraph(graphStat,graphType)}

d3.select("input[value=\"dist\"]").on("click", function(){updateGraph('dist',graphType); updateMap('distance', mapRider);});
d3.select("input[value=\"speed\"]").on("click", function(){updateGraph('speed',graphType);updateMap('avg_speed', mapRider);});
d3.select("input[value=\"rides\"]").on("click", function(){updateGraph('rides',graphType); updateMap('rides', mapRider);});
d3.select("input[value=\"time\"]").on("click", function(){updateGraph('time',graphType); updateMap('duration', mapRider);});


d3.select("input[value=\"Subscriber\"]").on("click", function(){updateGraph(graphStat,'Subscriber'); updateMap(mapMetric, "Subscriber");});
d3.select("input[value=\"Casual\"]").on("click", function(){updateGraph(graphStat,'Casual'); updateMap(mapMetric, "Casual");});

d3.select("input[value=\"boston\"]").on("click", function(){changeMap('boston');});
d3.select("input[value=\"chicago\"]").on("click", function(){changeMap('chicago');});
d3.select("input[value=\"dc\"]").on("click", function(){changeMap('dc');});

// old stuff


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
