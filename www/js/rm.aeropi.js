class RouteManager {
    constructor (nd, settingsMgr, opts = {}) {
        this.nd = nd;
        this.currentRoute = null;
        this.currentRouteActivated = null;
        this.currentRouteInverse = false;
        this.currentWaypoint = -1;
        this.selectedRoute = null;
        this.currentDirectTo = null;
        this.routes = [];
        this.sMgr = settingsMgr;

        this.settings = {
            rmLoadLastRouteOnStartup: false,
            rmChangeWaypointThreshold: 0.4, //400 meters
        };
        this.sMgr.addDefaultSettings(this.settings);

        this.options = {};
        $.extend(true, this.options, opts);

        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=get_routes',
            dataType: 'json'
        }).done(data => {
            $.each(data.routes, (key, value) => {
                let route = new Route(value);
                this.routes.push(route);
            })
        });

        $('#routeManagerModal').on('show.bs.modal', e => {
            this.refreshRouteList();
        });

        this.terrain = new Terrain('#terrainPreview', settingsMgr, {
            url: "ajax.php?command=get_terrain_elevation",
            pathProvider: () => {
                return this.selectedRoute ? {coords: this.selectedRoute.getWaypoints(), length: null} : null;
            },
            debug: true,
        });
        this.terrain.update(true);
        this.terrain.stop();

        this.nd.setChangeWaypointCallback(() => { return this.selectNextWaypoint(); });
    }

    createRoute() {
        $('#createRouteModal').modal({
            backdrop: 'static',
            keyboard: false,
        }).modal('show');

        $('#myModal').on('hide.bs.modal', e => {
            this.saveRouteName();
        });

        this.nd.createRoute({
            onFinish: e => { this.onRouteFinish(e) },
            onUpdate: e => { this.onRouteUpdate(e) },
        });
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=create_route',
            dataType: 'json'
        }).done(data => {
            let newRoute = new Route(data.route);
            this.currentRoute = newRoute;
            this.routes.push(newRoute);
        });
    }

    onRouteFinish(event) {
        this.saveRoute();
    }

    onRouteUpdate(event) {
        this.saveRoute();
    }

    saveRoute(routeObj = null) {
        if(routeObj == null && this.currentRoute == null) return;

        let route = null;

        if(routeObj) {
            route = routeObj;
        } else {
            route = this.currentRoute;
            let geojson = this.nd.getRouteAsGeoJson();
            route.fromGeoJson(geojson);

            const index = this.routes.indexOf(route);
            if(index == -1) {
                this.routes.push(route);
            }    
        }

        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=post_route',
            data: {
                id: route.getId(),
                user_id: route.getUserId(),
                name: route.getName(),
                comment: route.getComment(),
                geojson: route.asGeoJson(),
            },
            dataType: 'json',
        }).done((data) => {
        });
    }

    saveSelectedRoute() {
        if(this.selectedRoute == null) return;
        this.saveRoute(this.selectedRoute);
    }

    loadSelectedRoute() {
        if(this.selectedRoute == null) return;
        this.loadRoute(this.selectedRoute);
    }

    loadRoute(route) {
        let geojson = route.asGeoJson();
        this.nd.setRouteFromGeoJson({
            geojson: geojson,
            onFinish: (event) => { this.onRouteFinish(event) },
            onUpdate: (event) => { this.onRouteUpdate(event) },
        });
        this.currentRoute = route;
    }

    clearRoute() {
        this.nd.clearRoute();
        this.currentRoute = null;
        this.currentWaypoint = -1;
    }

    clearDirectTo() {
        this.nd.clearDirectTo();
        this.currentDirectTo = null;
    }

    setDirectTo(apt) {
        this.nd.setDirectToFromLonlat([
            parseFloat(apt.longitude),
            parseFloat(apt.latitude)
            ]);
        this.currentDirectTo = apt;
    }

    saveRouteNewName() {
        let routeName = $('.routeNewNameInput').val();
        this.currentRoute.setName(routeName);
    }

    updateRouteName() {
        if(this.selectedRoute == null) return;
        let routeName = $('.routeNameInput').val();
        this.selectedRoute.setName(routeName);
        const index = this.routes.indexOf(this.selectedRoute);
        $('.routeList tr:eq('+index+') td.routeNameDisplay').html(routeName);
    }

    updateRouteComment() {
        if(this.selectedRoute == null) return;
        let routeComment = $('.routeCommentInput').val();
        this.selectedRoute.setComment(routeComment);
    }

    refreshRouteList() {
        $('.routeNameInput').val('');
        $('.routeCommentInput').val('');
        let tbody = $('.routeList');
        tbody.empty();
        let index = 1;
        $.each(this.routes, (k, route) => {
            let row  = $('<div>', { 'class': 'row list-group-item' }).css('display', 'inherit');
            let col0 = $('<div>', { 'class': 'col-1' }).html(''+index);
            let col1 = $('<div>', { 'class': 'col-8 routeNameDisplay' }).html(route.name+' <small class="distance">('+route.distance()+' Km)</small>');
            let col3 = $('<div>', { 'class': 'col-1' }).html('<button type="button" class="btn btn-sm"><i class="fa fa-trash-o" aria-hidden="true"></i></button>');

            if(index == 1) row.addClass('active');

            row.click(e => { 
                e.stopPropagation();
                this.refreshWptList(route);
                this.refreshTerrain(route);
                $.each($('.routeList .list-group-item'), (k, elem) => {
                    $(elem).removeClass('active');
                })
                row.addClass('active');
            });
            col3.dblclick(e => { e.stopPropagation(); this.deleteRoute(route, row); });

            row.append(col0);
            row.append(col1);
            row.append(col3);
            tbody.append(row);
            index++;
        });
        this.refreshWptList(this.routes[0]);
        this.refreshTerrain(this.routes[0]);
    }

    refreshWptList(route = null) {
        this.selectedRoute = route;  
        let tbody = $('.waypointList');
        tbody.empty();
        if(route == null) return;

        $('.routeNameInput').val(route.getName());
        $('.routeCommentInput').val(route.getComment());

        let waypoints = route.getWaypoints();
        let index = 1;
        $.each(waypoints, (k, wpt) => {
            let row  = $('<div>', { 'class': 'row list-group-item' }).css('display', 'inherit');
            let col0 = $('<div>', { 'class': 'col-2' }).html(''+index);
            let col1 = $('<div>', { 'class': 'col-4' }).html(wpt[0].toFixed(4));
            let col2 = $('<div>', { 'class': 'col-4' }).html(wpt[1].toFixed(4));
            let col3 = $('<div>', { 'class': 'col-2' });

            if(waypoints.length > 2){
                col3.html('<button type="button" class="btn btn-sm"><i class="fa fa-trash-o" aria-hidden="true"></i></button>');
                col3.dblclick(e => { e.stopPropagation(); this.deleteWaypoint(route, wpt, row); });
            } else {
                col3.html('<button type="button" class="btn btn-sm" disabled><i class="fa fa-trash-o" aria-hidden="true"></i></button>');
            }

            row.append(col0);
            row.append(col1);
            row.append(col2);
            row.append(col3);
            tbody.append(row);
            index++;
        });
    }

    refreshTerrain(route = null) {
        if(route == null) return;
        //this.terrain.start();
        this.terrain.update(true);
    }

    deleteRoute(route, row) {
        $.ajax({
            method: 'POST',
            url: 'ajax.php?command=delete_route',
            data: {
                id: route.getId()
            },
            dataType: 'json'
        });
        row.hide(400, () => {
            const id = this.routes.indexOf(route);
            if(id !== -1) this.routes.splice(id, 1);
            this.refreshRouteList();
        });
    }

    deleteWaypoint(route, waypoint, row) {
        row.hide(400, () => {
            let waypoints = route.getWaypoints();
            const id = waypoints.indexOf(waypoint);
            if(id !== -1) waypoints.splice(id, 1);
            this.refreshWptList(route);
            this.saveRoute(route);
            this.updateRouteDistance(route, row);
        });
    }

    updateRouteDistance(route) {
        const i = this.routes.indexOf(route);
        $('.routeList').find('.row:eq('+i+') .distance').html(route.distance()+' Km');
    }

    toggleLoadLastRouteOnStartup() {

    }

    loadLastRoute() {
        if(this.routes.length > 0)
            this.loadRoute(this.routes[0]);
    }

    activateRoute(inverse = false) {
        if(this.currentRoute == null) return;

        let wpts = this.currentRoute.getWaypoints();
        let wpt = {longitude: wpts[0][0], latitude: wpts[0][1]};

        this.setDirectTo(wpt);
        this.currentRouteActivated = true;
        this.currentRouteInverse = inverse;
        this.nd.activateRoute();
    }

    selectNextWaypoint() {
        if(this.currentRoute == null) return null;

        let wpts = this.currentRoute.getWaypoints();
        if(this.currentRouteInverse) {
            this.currentWaypoint--;
            if(this.currentWaypoint < 0) this.currentWaypoint = wpts.length-1; // Finished inverse route
        } else {
            this.currentWaypoint++;
            if(this.currentWaypoint > wpts.length-1) this.currentWaypoint = 0; // Finished route
        }

        let wpt = {longitude: wpts[this.currentWaypoint][0], latitude: wpts[this.currentWaypoint][1]};

        this.setDirectTo(wpt);

        return this.currentWaypoint;
    }

    selectPrevWaypoint() {
        if(this.currentRoute == null) return;

        let wpts = this.currentRoute.getWaypoints();
        this.currentWaypoint--;
        if(this.currentWaypoint < 0) this.currentWaypoint = wpts.length-1;

        let wpt = {longitude: wpts[this.currentWaypoint][0], latitude: wpts[this.currentWaypoint][1]};

        this.setDirectTo(wpt);
    }
}


class Route {
    constructor (data = {}) {
        this.id = data.id || 0;
        this.user_id = data.user_id || 0;
        this.name = data.name || '';
        this.comment = data.comment || '';
        this.waypoints = [];
        this.geojson = {};

        if(data.hasOwnProperty('geojson')) {
            this.fromGeoJson(data.geojson);
        }

        if(data.hasOwnProperty('create_date')) {
            this.create_date = new Date(data.create_date);
        }

        if(data.hasOwnProperty('update_date')) {
            this.update_date = new Date(data.update_date);
        }
    }

    getId () {
        return this.id;
    }

    setUserId (user_id) {
        this.user_id = user_id;
    }

    getUserId () {
        return this.user_id;
    }

    setName (name) {
        this.name = name;
    }

    getName () {
        return this.name;
    }

    setComment (comment) {
        this.comment = comment;
    }

    getComment () {
        return this.comment;
    }

    getWaypoints() {
        return this.waypoints;
    }

    getWaypoint(id) {
        return this.waypoints[id];
    }

    distance() {
        let features = (new ol.format.GeoJSON()).readFeatures(this.asGeoJson(), {
            featureProjection: 'EPSG:3857',
        });
        let distance = ol.Sphere.getLength(features[0].getGeometry());
        return Math.round(distance / 1000 * 10) / 10;
    }

    fromGeoJson (geojson) {
        if(typeof(geojson) === 'string') {
            if(geojson.length == 0) return;
            geojson = JSON.parse(geojson);
        }

        if(geojson === null) return;

        this.geojson = geojson;
        this.waypoints = [];
        let coords = geojson.features[0].geometry.coordinates;
        $.each(coords, (key, coord) => {
            this.waypoints.push( [parseFloat(coord[0]), parseFloat(coord[1])] );
        })
    }

    asGeoJson () {
        let obj = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: this.waypoints,
                    },
                    properties: null,
                }
            ]
        }
        return obj;
    }

    pushWpt (waypoint) {
        this.waypoints.push(waypoint);
    }
}