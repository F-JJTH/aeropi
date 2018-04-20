'use strict';

// Converts from degrees to radians.
Math.radians = function(degrees) { return degrees * Math.PI / 180; }
 
// Converts from radians to degrees.
Math.degrees = function(radians) { return radians * 180 / Math.PI; }

class ND {
    constructor(elementId, settingsMgr, options = {}) {
        let _this = this;
        this.drawEndCallback = function(){};
        this.drawUpdateCallback = function(){};
        this.changeWaypoint = function(){};
        this.followAircraft = true;
        this.mapToNorth = true;
        this.autoZoom   = true;
        this.rotation   = 0;
        this.zoom  = 11;
        this.coord = ol.proj.fromLonLat([5.1,44.02]);
        this.alt   = 0;
        this.hdg   = 0;
        this.track = 0;
        this.gs    = 0;
        this.directToEnabled = false;
        this.currentDestinationWaypointIndex = null;
        //this.predictiveTime = 5; // 5 Minutes
        this.elementId = elementId;
        this.sMgr = settingsMgr;
        
        this.view  = this._createMapView();
        this.map   = this._createMap(this.elementId);
        this.map.setView(this.view);

        this.options = {};
        $.extend(true, this.options, options);

        this.settings = {
            ndAutoZoom: true,
            ndMapToNorth: true,
            ndMinPredictiveSpeed: 20,
            ndDefaultPredictiveLength: 10, // 10 Kms
            ndAircraftCenterOffset: 2.4,
            ndDistanceUnit: 'Km',
            ndPredictiveTime: 5, // 5 Minutes
            ndAdsb: false,
            ndAverageGroundspeed: 140, //140kmh
            ndLayer_cartabossy_2015: false,
            ndLayer_oaci_2017: false,
            ndLayer_appr_2015: false,
            ndLayer_land_2015: false,
            ndLayer_delta_rhone: false,
        };
        this.sMgr.addDefaultSettings(this.settings);
        //this.setMapViewCenter(this.coord);

        // Layers
        //this.map.addLayer(new ol.layer.Tile({
        //    source: new ol.source.OSM()
        //}));

        this.layers = {
            osm: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/osm/{z}/{x}/{y}.png'}),
                visible: true,
                minZoom: 1,
                maxZoom: 8,
                preload: 6,
            }),
            cartabossy_2015: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/cartabossy_2015/{z}/{x}/{y}.png'}),
                visible: this.sMgr.get('ndLayer_cartabossy_2015'),
                minZoom: 4,
                maxZoom: 10,
                preload: 1,
            }),
            oaci_2017: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/oaci_2017/{z}/{x}/{y}.jpg'}),
                visible: this.sMgr.get('ndLayer_oaci_2017'),
                minZoom: 6,
                maxZoom: 11,
                preload: 1,
            }),
            delta_rhone: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/delta_rhone/{z}/{x}/{-y}.png'}),
                visible: this.sMgr.get('ndLayer_delta_rhone'),
                minZoom: 4,
                maxZoom: 12,
                preload: 1,
            }),
            appr_2015: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/appr_2015/{z}/{x}/{-y}.png'}),
                visible: this.sMgr.get('ndLayer_appr_2015'),
                minZoom: 4,
                maxZoom: 12,
                preload: 1,
            }),
            land_2015: new ol.layer.Tile({
                source: new ol.source.XYZ({url: 'maps/land_2015/{z}/{x}/{-y}.png'}),
                visible: this.sMgr.get('ndLayer_land_2015'),
                minZoom: 4,
                maxZoom: 14,
                preload: 1,
            }),
        };

        this.map.addLayer(this.layers.osm);
        this.map.addLayer(this.layers.cartabossy_2015);
        this.map.addLayer(this.layers.oaci_2017);
        this.map.addLayer(this.layers.delta_rhone);
        this.map.addLayer(this.layers.appr_2015);
        this.map.addLayer(this.layers.land_2015);

        this.aircraftFeature = this._createAircraftFeature()
        this.aircraftLayer = this._createAircraftLayer(this.aircraftFeature);
        this.map.addLayer(this.aircraftLayer);

        // Route
        this.routeSource = new ol.source.Vector();
        this.routeLayer = new ol.layer.Vector({
            source: this.routeSource,
            style: (feature) => { return this.routeStyle(feature) },
        });
        this.map.addLayer(this.routeLayer);

        // Direct TO
        this.directToSource = new ol.source.Vector();
        this.directToLayer = new ol.layer.Vector({
            source: this.directToSource,
            style: (feature) => { return this.directToStyle(feature) },
        });
        this.map.addLayer(this.directToLayer);

        // Predictive
        this.predictivePath = null;
        this.predictiveSource = new ol.source.Vector();
        this.predictiveLayer = new ol.layer.Vector({
            source: this.predictiveSource,
            style: this.predictiveStyle,
        });
        this.map.addLayer(this.predictiveLayer);

        /* Controls */
        ol.inherits(this._createControl, ol.control.Control);

        this.followAircraftControl = this._createControl({
            innerHTML: '<img src="img/followAircraft.svg" title="Center on Aircraft"/>',
            handler: function(){
                _this.followAircraft = true;
                //_this.mapToNorth = false;
                _this.setAircraftPositionAndHeading();
            }
        });
        this.map.addControl(this.followAircraftControl);

        this.rotateControl = new ol.control.Rotate({
            resetNorth: function(){
                _this.mapToNorth = true;
                _this.setAircraftPosition();
                _this.setMapViewRotation(0);
            }
        })
        this.map.addControl(this.rotateControl);

        let addWaypointItem = {
            text: 'Add waypoint',
            classname: 'bold',
            //icon: 'img/center.png',
            callback: function(obj){
                let features = _this.routeSource.getFeatures();
                if(features.length == 0) return;
                let geom = features[0].getGeometry();
                geom.appendCoordinate(obj.coordinate);
                _this.drawUpdateCallback();
            }
        };

        let delWaypointItem = {
            text: 'Delete waypoint',
            classname: 'bold',
            //icon: 'img/center.png',
            callback: function(obj){
                _this.routeModifyInteraction.removePoint();
            }
        };

        let directToItem = {
            text: 'DirectTo here',
            classname: 'bold',
            //icon: 'img/directto.png',
            callback: function(obj){
                _this.setDirectTo(obj.coordinate);
            }
        }

        let contextmenu_items = [
            directToItem,
            {
                text: 'Some Actions',
                //icon: 'img/view_list.png',
                items: [
                {
                    text: 'Center map here',
                    //icon: 'img/center.png',
                    callback: function(){console.log('test2');}
                },
                {
                    text: 'Add a Marker',
                    //icon: 'img/pin_drop.png',
                    callback: function(){console.log('test3');}
                }
                ]
            },
            '-' // this is a separator
        ];

        this.contextmenu = new ContextMenu({
            width: 180,
            default_items: true,
            items: contextmenu_items
        });

        this.contextmenu.on('open', function(evt){
            _this.contextmenu.clear();

            if(_this.routeSource.getFeatures().length > 0) {
                _this.contextmenu.push(addWaypointItem);
                _this.contextmenu.push(delWaypointItem);
            }

            _this.contextmenu.extend(contextmenu_items);
            _this.contextmenu.extend(_this.contextmenu.getDefaultItems());
        });

        this.map.addControl(this.contextmenu);

        /* Interactions */
        this.map.on('pointerdrag', function(e){
            _this.followAircraft = false;
            _this.mapToNorth = true;
        });


        this.routeDrawInteraction = new ol.interaction.Draw({
            source: this.routeSource,
            type: 'LineString',
        });

        this.routeDrawInteraction.on('drawend', function(event){
            setTimeout(function () {
                _this.map.removeInteraction(_this.routeDrawInteraction);
                _this.drawEndCallback(event);
            });
        });

        this.routeModifyInteraction = new ol.interaction.Modify({
            source: this.routeSource,
        })

        this.routeModifyInteraction.on('modifyend', function(event){
           setTimeout(function () {
                _this.drawUpdateCallback(event);
            }); 
        })

        this.setAircraftPosition();
    }

    _createMap(elementId) {
        return new ol.Map({
            target: elementId,
            controls: [],
            //controls: [new app.PreferencesControl(), new app.FullScreenControl()]
        });
    }

    _createMapView() {
        let extent = [-180,-90,180,90];
        return new ol.View({
            center: this.coord,
            zoom: this.zoom,
            minZoom: 3,
            maxZoom: 15,
            rotation: Math.radians(this.rotation),
            extent: ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:900913'),
        });
    }

    _createAircraftFeature() {
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" height="72px" width="72px" viewBox="0 0 500 500" preserveAspectRatio="xMinYMin meet"><path d="M250.2,59.002c11.001,0,20.176,9.165,20.176,20.777v122.24l171.12,95.954v42.779l-171.12-49.501v89.227l40.337,29.946v35.446l-60.52-20.18-60.502,20.166v-35.45l40.341-29.946v-89.227l-171.14,49.51v-42.779l171.14-95.954v-122.24c0-11.612,9.15-20.777,20.16-20.777z" fill="#088fff" stroke="black" stroke-width="5"/></svg>';
        let img = new Image();
        img.src = 'data:image/svg+xml,' + escape(svg);
        let style = new ol.style.Style({
            image: new ol.style.Icon({
                rotateWithView: true,
                rotation: this.hdg,
                img: img,
                imgSize: [72, 72]
            })
        });

        let feature = new ol.Feature({
            geometry: new ol.geom.Point(this.coord),
            rotation: this.hdg
        });
        feature.setStyle(style);
        return feature;
    }

    _createAircraftLayer(feature) {
        return new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [feature]
            })
        });
    }

    _createControl(opts) {
        return new ControlFactory({
            instance: this,
            innerHTML: opts.innerHTML,
            handler: opts.handler,
            target: 'top-menu'
        });
    }

    showLayer(layer) {
        this.layers[layer].setVisible(true);
    }

    hideLayer(layer) {
        this.layers[layer].setVisible(false);
    }

    setChangeWaypointCallback(func) {
        this.changeWaypoint = func;
    }

    getGeomLength(geom) {
        let legLength = ol.Sphere.getLength(geom);
        return Math.round(legLength / 1000 * 10) / 10;
    }

    getLegLength(start, end) {
        let geom = new ol.geom.LineString([start, end])
        let legLength = ol.Sphere.getLength(geom);
        return Math.round(legLength / 1000 * 10) / 10;
    }

    getLegDuration(legLength /*km*/, humanReadable = false) {
        let gs = this.gs > 10 ? this.gs : this.sMgr.get('ndAverageGroundspeed'); /*kmh*/
        let rValue = Math.round((legLength / gs) * 60);

        if(humanReadable) {
            return rValue+' min';
        }
        return rValue;
    }

    routeStyle(feature) {
        let styles = [
            // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#ff33cc',
                  width: 5
              })
            })
        ];

        let geometry = feature.getGeometry();
        let coords = geometry.getCoordinates();

        let index = 1;
        $.each(coords, (k, coord) => {
            // Point
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(coord),
                image: new ol.style.Circle({
                    radius: 10,
                    fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 1)'}),
                    stroke: new ol.style.Stroke({color: 'red', width: 1})
                }),
                text: new ol.style.Text({
                    text: ''+index,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    offsetY: 2,
                    font: 'bold 20px Arial',
                }),
            }));

            // Line
            if( k > 0) {
                let startCoord = coords[k-1];
                let endCoord = coords[index-1];
                let geom = new ol.geom.LineString([startCoord, endCoord]);
                let legLength = this.getLegLength(startCoord, endCoord);


                let distanceUnit = this.sMgr.get('ndDistanceUnit');
                let _fontStyle = 'bold 20px Arial';
                let _text = ''+ (distanceUnit == 'Nm' ? (legLength*0.539957).toFixed(1) : legLength) +' '+distanceUnit;
                
                styles.push(new ol.style.Style({
                    geometry: geom,
                    text: new ol.style.Text({
                        text: _text,
                        textAlign: 'left',
                        textBaseline: 'middle',
                        offsetX: 2,
                        fill: new ol.style.Fill({color: '#ff33cc'}),
                        stroke: new ol.style.Stroke({color: 'white', width: 4}),
                        font: _fontStyle,
                    }),
                }));
            }

            index++;
        });

        return styles;
    }

    directToStyle(feature) {
        let styles = [
            // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#ff33cc',
                  width: 5
              })
            })
        ];

        let geometry = feature.getGeometry();
        let coords = geometry.getCoordinates();

        let index = 1;
        $.each(coords, (k, coord) => {
            // Line
            if( k > 0) {
                let startCoord = coords[k-1];
                let endCoord = coords[index-1];
                let geom = new ol.geom.LineString([startCoord, endCoord]);
                let legLength = this.getLegLength(startCoord, endCoord);
                let duration  = this.getLegDuration(legLength, true);

                if(legLength < this.sMgr.get('rmChangeWaypointThreshold')) {
                    this.currentDestinationWaypointIndex = this.changeWaypoint();
                }

                let distanceUnit = this.sMgr.get('ndDistanceUnit');
                let _fontStyle = 'bold 20px Arial';
                let _text = ''+ (distanceUnit == 'Nm' ? (legLength*0.539957).toFixed(1) : legLength) +' '+distanceUnit+' / '+duration;
                
                styles.push(new ol.style.Style({
                    geometry: geom,
                    text: new ol.style.Text({
                        text: _text,
                        textAlign: 'left',
                        textBaseline: 'middle',
                        offsetX: 2,
                        fill: new ol.style.Fill({color: '#ff33cc'}),
                        stroke: new ol.style.Stroke({color: 'white', width: 4}),
                        font: _fontStyle,
                    }),
                }));
            }

            index++;
        });

        return styles;
    }

    predictiveStyle(feature) {
        let styles = [
            // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#088FFF',
                  width: 4
              })
            })
        ];

        let geometry = feature.getGeometry();
        let coords = geometry.getCoordinates();

        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(coords[1]),
            image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({color: '#088FFF'}),
            }),
        }));

        return styles;
    }

    setDirectTo(coords) {
        let destFeature = new ol.Feature({
            geometry: new ol.geom.LineString([this.coord, coords])
        })

        this.directToSource.clear();
        this.directToSource.addFeature(destFeature);
        this.directToEnabled = true;
        this.currentDestinationWaypointIndex = 0;
    }

    setDirectToFromLonlat(coords) {
        this.setDirectTo( ol.proj.fromLonLat(coords) );
    }

    clearDirectTo() {
        this.directToSource.clear();
        this.directToEnabled = false;
    }

    toggleAdsb() {
        console.log('toogleAdsb');
    }

    toggleAutoZoom() {
        this.autoZoom = !this.autoZoom;
    }

    toggleMapToNorth() {
        if(this.sMgr.get('ndMapToNorth')) {
            this.setMapViewRotation(0);
            setTimeout(() => {
                this.setMapViewCenter(this.coord);
            }, 350);
        } else {
            this.setMapViewCenter(this.coord);
            this.setAircraftPositionAndHeading()
        }
        
    }

    toggleLoadLastRouteOnStartup() {

    }

    setAircraftCenterOffset(v) {
        this.setMapViewCenter(this.coord);
    }

    setDistanceUnit(unit) {
        if( unit != 'Nm' && unit != 'Km' ) return;
        this.sMgr.set('ndDistanceUnit', unit);

        this.routeSource.changed();
        this.directToSource.changed();
    }

    updateDirectTo() {
        let features = this.directToSource.getFeatures();
        if(features.length == 0) return;
        let coords = features[0].getGeometry().getCoordinates();
        let newCoords = [
            this.coord,
            coords[1]
        ];
        features[0].getGeometry().setCoordinates(newCoords);
    }

    getDirectToDistance() {
        let features = this.directToSource.getFeatures();
        if(features.length == 0) return 0;
        return this.getGeomLength(features[0].getGeometry());
    }

    getDirectToDuration() {
        return this.getLegDuration(this.getDirectToDistance());
    }

    getRemainingRouteDistance() {
        let remainingDistance = this.getDirectToDistance();

        let features = this.routeSource.getFeatures();
        if(features.length == 0) return;

        let coords = features[0].getGeometry().getCoordinates();
        let remainingRouteCoords = [];
        if(this.currentDestinationWaypointIndex !== null) {
            $.each(coords, (k, v) => {
                if(k >= this.currentDestinationWaypointIndex) {
                    remainingRouteCoords.push(v);
                }
            });

            let remainingRouteLineString = new ol.geom.LineString(remainingRouteCoords);
            remainingDistance += this.getGeomLength(remainingRouteLineString);
        }

        return remainingDistance;
    }

    getRemainingRouteDuration() {
        return this.getLegDuration(this.getRemainingRouteDistance());
    }

    activateRoute() {
        this.currentDestinationWaypointIndex = 0;
    }

    updatePredictive() {
        let gs = this.gs;
        if(gs <= this.sMgr.get('ndMinPredictiveSpeed')) {
            let f = 60 / this.sMgr.get('ndPredictiveTime');
            gs = this.sMgr.get('ndDefaultPredictiveLength')*f;
        }

        let predictedPoint = this.destSphere(this.coord, this.hdg, gs);
        this.predictivePath = new ol.geom.LineString([this.coord, predictedPoint]);
        let destFeature = new ol.Feature({ geometry: this.predictivePath });
        this.predictiveSource.clear();
        this.predictiveSource.addFeature(destFeature);
    }

    destSphere(coord0, hdg, spd) {
        let ll   = ol.proj.toLonLat(coord0);
        let brg  = hdg;
        var R    = 6372.7976; // Earth radius
        let d    = (Math.round(spd) * this.sMgr.get('ndPredictiveTime')) / 60;
        var dist = d.toFixed(4)/R;
        var lat0 = ll[1]*Math.PI/180;
        var lon0 = ll[0]*Math.PI/180;
        var lat1 = Math.asin(Math.sin(lat0)*Math.cos(dist) + Math.cos(lat0)*Math.sin(dist)*Math.cos(brg));
        var lon1 = lon0 + Math.atan2(Math.sin(brg)*Math.sin(dist)*Math.cos(lat0), Math.cos(dist)-Math.sin(lat0)*Math.sin(lat1));
        return ol.proj.fromLonLat([lon1*180/Math.PI, lat1*180/Math.PI]);
    }

    getPredictivePath() {
        if(!this.predictivePath) return null;
        let predictivePath = this.predictivePath.getCoordinates();
        let startPoint = ol.proj.toLonLat(predictivePath[0]);
        let endPoint = ol.proj.toLonLat(predictivePath[1]);
        let rValue = {
            coords: [startPoint, endPoint],
            length: ol.Sphere.getLength(this.predictivePath),
        }
        return rValue;
    }

    setAircraftPositionAndHeading(coord, hdg) {
        this.setAircraftPosition(coord || ol.proj.toLonLat(this.coord));
        this.setAircraftHeading(hdg || Math.degrees(this.hdg));
    }

    setAircraftPosition(coord) {
        this.coord = ol.proj.fromLonLat(coord || ol.proj.toLonLat(this.coord));
        this.aircraftFeature.setGeometry(new ol.geom.Point(this.coord));

        this.updatePredictive();

        if(this.directToEnabled) {
            this.updateDirectTo();
        }

        if(this.followAircraft)
            this.setMapViewCenter(this.coord);
    }

    getAircraftPosition() {
        return ol.proj.toLonLat(this.coord);
    }

    _applyAircraftRotation() {
    	let rotation = this.gs > 5 ? this.track : this.hdg;
    	this.aircraftFeature.getStyle().getImage().setRotation(rotation);
        this.aircraftFeature.setStyle(this.aircraftFeature.getStyle());

        if(this.followAircraft)
            this.setMapViewCenter(this.coord);

        this.updatePredictive();

        if(!this.sMgr.get('ndMapToNorth'))
            this.setMapViewRotation(rotation);
    }

    setAircraftHeading(hdg) {
        this.hdg = Math.radians(hdg);
        this._applyAircraftRotation();
    }

    setAircraftTrack(track) {
    	this.track = Math.radians(track);
        this._applyAircraftRotation();
    }

    setAircraftGroundSpeed(gs) {
        this.gs = gs;

        if(this.sMgr.get('ndAutoZoom')) {
            let zoom = this.view.getZoom();
            if(this.gs < 60)
                zoom = 15;
            if(this.gs >=60 && this.gs < 140) {
                zoom = (-0.0625*this.gs) + 18.75;
            }
            if(this.gs >= 140)
                zoom = 10;

            this.view.setZoom(zoom);
        }
        this.updatePredictive();
    }

    setAverageGroundspeed(gs) {

    }

    setMapViewCenter(coord) {
        let mapSize = this.map.getSize();

        let center = {
            x: mapSize[0]/2,
            y: mapSize[1]/2,
        };

        let offset = {
            x: Math.sin(this.hdg) * center.x,
            y: Math.cos(this.hdg) * center.y,
        };

        let ratio = this.sMgr.get('ndAircraftCenterOffset');

        let x = center.x - offset.x + offset.x/ratio;
        let y = mapSize[1] + offset.y - center.y - offset.y/ratio;

        if(!this.sMgr.get('ndMapToNorth')) {
            x = center.x;
            y = mapSize[1] - center.y/ratio;
        }

        this.view.centerOn(coord, mapSize, [x, y]);
    }

    setMapViewRotation(rotation) {
        this.view.animate({
            rotation: -rotation,
            anchor: this.coord,
            duration: 50,
        });
    }

    createRoute(options) {
        if( this.map.removeInteraction(this.routeDrawInteraction) === undefined ) {
            this.routeSource.clear();
            this.map.addInteraction(this.routeDrawInteraction);
            this.map.addInteraction(this.routeModifyInteraction);
            this.drawEndCallback = options.onFinish;
            this.drawUpdateCallback = options.onUpdate;
        }
    }

    getRouteAsGeoJson() {
        let writer = new ol.format.GeoJSON();
        return writer.writeFeatures(this.routeSource.getFeatures(), {
            featureProjection: 'EPSG:3857',
        });
    }

    setRouteFromGeoJson(options) {
        if(typeof options.geojson === 'string') {
            options.geojson = JSON.parse(options.geojson);
        }
        let features = (new ol.format.GeoJSON()).readFeatures(options.geojson, {
            featureProjection: 'EPSG:3857',
        });
        this.routeSource.clear();
        this.routeSource.addFeatures(features);
        this.map.addInteraction(this.routeModifyInteraction);
        this.drawEndCallback = options.onFinish;
        this.drawUpdateCallback = options.onUpdate;
    }

    clearRoute() {
        this.routeSource.clear();
    }

    updateSize() {
      this.map.updateSize();
      this.setMapViewCenter(this.coord);
    }
}

let ControlFactory = function(opts) {
    var options = opts || {};
    var element = document.createElement('a');
    element.className = 'fh-control';
    element.innerHTML = opts.innerHTML;

    element.addEventListener('click', opts.handler, false);

    var li = document.createElement('li');
    li.appendChild(element);

    ol.control.Control.call(this, {
        element: li,
        target: document.getElementById(opts.target)
    });
};
ol.inherits(ControlFactory, ol.control.Control);