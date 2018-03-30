'use strict';

class Terrain {
    constructor(element, settingsMgr, options = {}) {
        this.gs   = 0;
        this.plot = null;
        this.path = null;
        this.altitude  = 0;
        this.instance  = null;
        this.collision = false;
        this.element   = $(element);
        this.positionHasChanged = true;
        this.sMgr = settingsMgr;

        this.options = {
            pathProvider: () => {},
            url: '',
            updateInterval: 3,
            debug: false,
        }
        $.extend(true, this.options, options);

        this.settings = {
            terrainDistanceUnit: 'Km',
            terrainElevationUnit: 'Ft',
            terrainElevationVisible: false,
        }
        this.sMgr.addDefaultSettings(this.settings);

        this.start();
    }

    start() {
        this.update();
        this.instance = setInterval(() => this.update(), this.options.updateInterval*1000);
    }

    stop() {
        clearInterval(this.instance);
    }

    setDistanceUnit(unit) {
        /*if( unit != 'Nm' && unit != 'Km' ) return;
        this.sMgr.set('terrainDistanceUnit', unit);*/
        this.update(true);
    }

    setElevationUnit(unit) {
        /*if( unit != 'Ft' && unit != 'M' ) return;
        this.sMgr.set('terrainElevationUnit', unit);*/
        this.update(true);
    }

    update(force = false) {
        if(!this.sMgr.get('terrainElevationVisible')) return;
        if(!this.positionHasChanged && !force) return;

        this.path = this.options.pathProvider();
        if(!this.path || this.path.length == 0) return;

        let _path = '';
        this.path.coords.forEach(coord => {
            _path += coord[0]+','+coord[1]+'|';
        });
        _path = _path.substring(0, _path.length - 1);

        $.ajax({
            type: 'POST',
            url: this.options.url,
            cache: false,
            dataType: 'json',
            data: {
                path: _path,
                samples: this.path.length ? Math.round(this.path.length/100) : null, // path.length is in meters
            },
            success: data => {
                this.onSuccess(data.terrain);
            }
        });
    }


    onSuccess(terrain) {
        let altitude = this.altitude;

        if(this.sMgr.get('terrainElevationUnit') == 'M')
            altitude = Math.round(altitude / 3.2808);

        let elevArr = [altitude];
        let elevationData = [];
        $.each(terrain, (index, element) => {
            var distance = element.distance;
            var elevation = Math.round(element.elevation);
            if(this.sMgr.get('terrainDistanceUnit') == 'Nm')
                distance *= 0.539957;
            if(this.sMgr.get('terrainElevationUnit') == 'Ft')
                elevation = Math.round(elevation * 3.2808);

            elevationData.push([distance, elevation]);
            elevArr.push(elevation);
        });

        var yOffset = 200;
        if(this.sMgr.get('terrainElevationUnit') == 'Ft')
            yOffset = 500;

        var xMax = elevationData[elevationData.length-1][0];
        let yMax = elevArr.reduce(function(a, b) {
            return Math.max(a, b);
        });

        if( yMax <= altitude )
            this.collision = true;

        var options = {
            canvas: true,
            series: {
                lines: { show: true },
                points: { show: false },
            },
            xaxis: {
                min: 0,
                max: xMax,
                tickFormatter: v => {
                    var unit = this.sMgr.get('terrainDistanceUnit');
                    return v + " "+unit;
                },
            },
            yaxis: {
                min: 0,
                max: yMax + yOffset,
                tickFormatter: v => {
                    var unit = this.sMgr.get('terrainElevationUnit');
                    return v + " "+unit;
                },
            },
        };

        var currentAlt = [[0, altitude], [xMax, altitude]];
        this.plot = $.plot(this.element, [
            {
                color: "#f00",
                data: elevationData,
                lines:{
                    show: true,
                    fill: true,
                    fillColor: "rgba(0,255,0,0.2)"
                },
                threshold: {
                    below: altitude,
                    color: '#0f0'
                }
            },
            {
                color: "#00f",
                data: currentAlt
            },
        ], options);

        this.positionHasChanged = false;
    }

    updateSize() {
        if(this.isVisible()) {
            this.plot.resize();
            this.plot.setupGrid();
            this.plot.draw();
        }
    }

    show() {
        this.element.show();
        //this.sMgr.set('terrainElevationVisible', true);
        this.update();
    }

    hide() {
        this.element.hide();
        //this.sMgr.set('terrainElevationVisible', false);
        //$(':checkbox[name=terrainToggleCheckbox]').prop('checked', false);
    }

    toggle() {
        this.element.toggle();
        if(this.isVisible())
            this.update();
    }

    isVisible() {
        return this.element.is(':visible');
    }

    setAircraftPosition(position) {
        this.positionHasChanged = true;
        this.position = position;
    }

    setAircraftAltitude(altitude) {
        this.positionHasChanged = true;
        this.altitude = altitude;
    }

    setAircraftGroundSpeed(gs) {
        this.positionHasChanged = true;
        this.gs = gs;
    }

    setAircraftHeading(heading) {
        this.positionHasChanged = true;
        this.heading = heading;
    }

    getTerrainCollision() {
        return this.collision;
    }
}