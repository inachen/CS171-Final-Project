 /*
 *Taken from http://bl.ocks.org/tnightingale/4718717
 */

L.PointsLayer = L.Class.extend({
    includes: L.Mixin.Events,

    options: {
        minZoom: 0,
        maxZoom: 18,
        padding: 100,
        radius: 3,
        zoom: 11, 
    },

    initialize: function (data, options) {
        var options = L.setOptions(this, options);
        this._data = data;
        this._path = d3.geo.path().projection(this._project.bind(this))
            .pointRadius(this._radius.bind(this));
    },

    onAdd: function (map) {
        this._map = map;

        // Create a container for svg.
        this._initContainer();

        // Set up events
        map.on({
            'moveend': this._update
        }, this);

        this._update();
    },

    onRemove: function (map) {

        this._container.remove();

        // console.log(this._container.remove());
        // this._container.parentNode.removeChild(this._container);

        map.off({
            'moveend': this._update
        }, this);

        this._container = null;
        this._map = null;
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },

    _initContainer: function () {
        var overlayPane = this._map.getPanes().overlayPane;
        if (!this._container || overlayPane.empty) {
            this._container = d3.select(overlayPane)
                .append('svg').attr('class', 'leaflet-layer leaflet-zoom-hide')
                .attr('pointer-events','none');

            this._layer = this._container.append("g");

            var circles = this._layer.selectAll(".circle")
                .data(this._data.features).enter()
                .append("path")
                .attr("class", "circle")
                .attr('pointer-events','auto');

            this._applyStyle(circles);
        }
    },

    _update: function () {

        if (!this._map) { return; }

        var zoom = this._map.getZoom();

        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }

        var padding = this.options.padding,
            bounds = this._translateBounds(d3.geo.bounds(this._data), padding);
            dimensions = bounds.getSize();

        this._container.attr("width", dimensions.x).attr("height", dimensions.y)
            .style("margin-left", bounds.min.x + "px").style("margin-top", bounds.min.y + "px");

        this._layer.attr("transform", "translate(" + -bounds.min.x+ "," + -bounds.min.y+ ")")

        this._layer.selectAll(".circle").attr("d", this._path);

        var curr_r = this.options.radius;

        this.options.radius = function (d){ 
                if (weekdata[d["id"].toString()] != null) 
                    {return radius_scale(weekdata[d["id"].toString()][this.options.subkey][this.options.typekey]['avg']* zoom / this.options.zoom);} 
                else 
                    {return 1 * zoom / this.options.zoom;}} 

        // console.log(this._layer.selectAll(".cicle").attr('r'));

        // console.log(this.options.radius);

        // this.options.radius = curr_r * zoom / this.options.zoom;

        this.options.zoom = zoom;

        // console.log(this.options.subkey);

        // console.log(zoom);
        // console.log(this.options.radius);
    },

    _applyStyle: function (circles) {
        if ('applyStyle' in this.options) {
            this.options.applyStyle.call(this, circles);
        }
    },

    _radius: function (d) {
        if (typeof this.options.radius == 'function') {
            return this.options.radius.call(this, d);
        }
        return this.options.radius;
    },

    _project: function (x) {
        var point = this._map.latLngToLayerPoint([x[1], x[0]]);
        return [point.x, point.y];
    },

    _translateBounds: function (d3_bounds, padding) {
        var nw = this._project([d3_bounds[0][0], d3_bounds[1][1]]),
            se = this._project([d3_bounds[1][0], d3_bounds[0][1]]);

        nw[0] -= padding, nw[1] -= padding;
        se[0] += padding, se[1] += padding;

        return L.bounds(nw, se);
    }

});

// L.pointsLayer = function (data, options) {
//     return new L.PointsLayer(data, options);
// };