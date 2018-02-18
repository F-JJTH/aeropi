'use strict';

class AeroPi {
    constructor(data = {}) {
        this.rm  = null;
        this.ems = null;
        this.nd  = null;
        this.terrain  = null;
        this.settings = null;

        this.init();
    }
    init() {}
    postInit() {}
    update() {}
}

let settingsMgr = new SettingsManager({
    userManagerModal: '#userManagerModal',
    createUserModal: 'createUserModal',
    onSettingsLoaded: settings => {
        console.log(settings);
        if(settings.terrainElevationVisible) {
            terrain.show();
        } else {
            terrain.hide();
        }
        $(':checkbox[name=terrainElevationVisible]').prop('checked', settings.terrainElevationVisible);
        $(':checkbox[name=terrainDistanceUnit]').prop('checked', (settings.terrainDistanceUnit == 'Km'));
        $(':checkbox[name=terrainElevationUnit]').prop('checked', (settings.terrainElevationUnit == 'M'));

        if(settings.rmLoadLastRouteOnStartup) {
            rm.loadLastRoute();
        }
        $(':checkbox[name=rmLoadLastRouteOnStartup]').prop('checked', settings.rmLoadLastRouteOnStartup);

        $(':checkbox[name=ndAdsb]').prop('checked', settings.ndAdsb);
        $(':checkbox[name=ndMapToNorth]').prop('checked', settings.ndMapToNorth);
        $(':checkbox[name=ndDistanceUnit]').prop('checked', (settings.ndDistanceUnit == 'Km'));
        $(':input[name=ndAircraftCenterOffset]').val(settings.ndAircraftCenterOffset);
        $(':checkbox[name=ndAutoZoom]').prop('checked', settings.ndAutoZoom);
        nd.setAircraftCenterOffset(settings.ndAircraftCenterOffset);
        $(':input[name=ndAverageGroundspeed]').val(settings.ndAverageGroundspeed);
        $(':checkbox[name=ndLayer_cartabossy_2015]').prop('checked', settings.ndLayer_cartabossy_2015);
        if(settings.ndLayer_cartabossy_2015) nd.showLayer('cartabossy_2015');
        $(':checkbox[name=ndLayer_oaci_2017]').prop('checked', settings.ndLayer_oaci_2017);
        if(settings.ndLayer_oaci_2017) nd.showLayer('oaci_2017');
        $(':checkbox[name=ndLayer_land_2015]').prop('checked', settings.ndLayer_land_2015);
        if(settings.ndLayer_land_2015) nd.showLayer('land_2015');
        $(':checkbox[name=ndLayer_appr_2015]').prop('checked', settings.ndLayer_appr_2015);
        if(settings.ndLayer_appr_2015) nd.showLayer('appr_2015');
        $(':checkbox[name=ndLayer_delta_rhone]').prop('checked', settings.ndLayer_delta_rhone);
        if(settings.ndLayer_delta_rhone) nd.showLayer('delta_rhone');

        $(':checkbox[name=efisVisible]').prop('checked', settings.efisVisible);
        $(':checkbox[name=efisSpeedUnit]').prop('checked', (settings.efisSpeedUnit == 'Km/h'));
        $(':checkbox[name=efisAltitudeUnit]').prop('checked', (settings.efisAltitudeUnit == 'M'));
        $(':checkbox[name=efisQnhUnit]').prop('checked', (settings.efisQnhUnit == 'Mb'));
        efis.setCalibration({pitch:settings.efisPitchOffset, roll:settings.efisRollOffset});
        efis.setSpeedLimit('vne', settings.vne);
        efis.setSpeedLimit('vfe', settings.vfe);
        efis.setSpeedLimit('vn0', settings.vn0);
        efis.setSpeedLimit('vs0', settings.vs0);
        efis.setSpeedLimit('vs', settings.vs);
        efis.setSpeedTickSpacing(settings.efisTickSpeed);
        efis.setAltitudeTickSpacing(settings.efisTickAlt);
        efis.setSpeedUnit(settings.efisSpeedUnit);
        efis.setAltitudeUnit(settings.efisAltitudeUnit);
        efis.setQnhUnit(settings.efisQnhUnit);
        $(':input[name=vs]').val(settings.vs);
        $(':input[name=vs0]').val(settings.vs0);
        $(':input[name=vn0]').val(settings.vn0);
        $(':input[name=vfe]').val(settings.vfe);
        $(':input[name=vne]').val(settings.vne);
        $(':input[name=speedTickSpacing]').val(settings.efisTickSpeed);
        $(':input[name=altitudeTickSpacing]').val(settings.efisTickAlt);
        
        $(':checkbox[name=emsTemperatureUnit]').prop('checked', (settings.emsTemperatureUnit == 'C'));
        ems.setTemperatureUnit(settings.emsTemperatureUnit);

        $(':checkbox[name=summerTime]').prop('checked', settings.summerTime);
        $(':checkbox[name=clockZone]').prop('checked', (settings.clockZone == 'UTC'));
        $(':input[name=timeZone]').val(settings.timeZone);
        setTimeZoneUI(settings.timeZone);
        selectLayout(settings.layout);

        nd.setAircraftGroundSpeed(0);

        connect();
    },
    onSettingSaved: setting => {
        //console.log(setting);
    }
});

let currentDate = new Date();

let ems  = new EMS({
    amp:       'ampGauge',
    rpm:       'rpmGauge',
    map:       'mapGauge',
    volt:      'voltGauge',
    cylTemp:   'cylTempGauge',
    oilTemp:   'oilTempGauge',
    fuelQty:   'fuelQtyGauge',
    fuelFlow:  'fuelFlowGauge',
    oilPress:  'oilPressGauge',
    fuelPress: 'fuelPressGauge',
}, settingsMgr, {});
let nd   = new ND('map', settingsMgr, {});
let rm   = new RouteManager(nd, settingsMgr, {});
let efis = $('#efis').efis(settingsMgr);
let terrain = new Terrain('#terrainElevation', settingsMgr, {
    url: "ajax.php?command=get_terrain_elevation",
    pathProvider: () => {
        return nd.getPredictivePath();
    }
});

settingsMgr.addDefaultSettings({
    timeZone: 0,
    clockZone: 'UTC',
    summerTime: false,
    layout: 'nav-ems',
});

settingsMgr.init();

$('#map').on('click', function(e){
    console.log('clicked');
});

let toggleFullscreen = () => {
    var element = document.documentElement;
    if(element.requestFullscreen){
        element.requestFullscreen();
    }else if(element.mozRequestFullScreen){
        element.mozRequestFullScreen();
    }else if(element.webkitRequestFullscreen){
        element.webkitRequestFullscreen();
    }else if(element.msRequestFullscreen){
        element.msRequestFullscreen();
    }
}

let changeEfisTickSpeed = e => {
    let v = $(e).val();
    efis.setSpeedTickSpacing(v);

    settingsMgr.set('efisTickSpeed', v);
}

let changeEfisTickAlt = e => {
    let v = $(e).val();
    efis.setAltitudeTickSpacing(v);

    settingsMgr.set('efisTickAlt', v);
}

let setEfisSpeed = (k, e) => {
    let v = $(e).val();

    efis.setSpeedLimit(k, v);
    settingsMgr.set(k, v);
}

let calibrateAttitudeIndicator = () => {
    let attitude = efis.getAttitude();
    efis.setCalibration(attitude);
    efis.setAttitude({pitch:0, roll:0});

    settingsMgr.set('efisPitchOffset', attitude.pitch);
    settingsMgr.set('efisRollOffset', attitude.roll);
}

let toggleSummerTime = function(e) {
    let k = 'summerTime';
    $(':checkbox[name='+k+']').prop('checked', settingsMgr.toggle(k));
    setUIDate(currentDate);
}

let toggleClockZone = function(e) {
    let k = 'clockZone';
    let rValue = 'UTC';
    if(settingsMgr.get(k) == 'UTC') {
        rValue = 'TZ';
    }
    settingsMgr.set(k, rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'UTC'));
    setUIDate(currentDate);
}

let setTimeZone = function(e) {
    let v = $(e).val();
    settingsMgr.set('timeZone', v);
    setUIDate(currentDate);
    setTimeZoneUI(v);
}

let setTimeZoneUI = function(v) {
    let html = v > 0 ? '+'+v : v;
    $('#timeZoneOutput').html(html);
}

$.typeahead({
    input: '.searchDirectToInput',
    order: "asc",
    minLength: 0,
    dynamic: true,
    template: function (query, item) {
        return '<div class="row">' +
            '<div class="col-12">{{name}} <small style="color: #777;">({{ident}})</small></div>' +
        "</div>"
    },
    emptyTemplate: "No result for {{query}}",
    source: {
        airport: {
            display: ["name", "ident"],
            ajax: function (query) {
                return {
                    type: "POST",
                    url: "ajax.php?command=search_airport",
                    path: "airports",
                    data: {
                        q: "{{query}}"
                    }
                }
            }
        }
    },
    callback: {
        onClick: function (node, a, item, event) {
            let apt = JSON.stringify(item);
            $('.searchDirectToInputSelected').val(apt);
            // AJAX for user history ?
        },
    }
});

let reboot = function() {
    $.ajax({
        type: 'POST',
        url: 'ajax.php?command=reboot',
    });
}

let shutdown = function() {
    $.ajax({
        type: 'POST',
        url: 'ajax.php?command=shutdown',
    });
}

let reload = function() {
    window.location = '/';
}

let formatDate = function(date) {
    return ''+('0' + date.getUTCDate()).slice(-2)+'/'+('0' + (date.getUTCMonth()+1)).slice(-2)+'/'+date.getUTCFullYear();
}

let formatTime = function(date) {
    let hour = date.getUTCHours();
    if( settingsMgr.get('clockZone') == 'TZ' ) {
        hour += parseInt(settingsMgr.get('timeZone'));
    }

    if( settingsMgr.get('summerTime') ) {
        hour += 1;
    }

    return ''+('0' + hour).slice(-2) +'h'+('0' + date.getUTCMinutes()).slice(-2)+ (settingsMgr.get('clockZone') == 'UTC' ? " UTC" : "");
}

let setUIDate = function(date) {
    $('span.date').html(' '+formatDate(date));
    //$('span.date').html(' 18/02/2018');
    $('span.time').html(' '+formatTime(date));
    //$('span.time').html(' 09h07 UTC');
}

let setDirectTo = function() {
    let apt = $('.searchDirectToInputSelected').val();
    apt = JSON.parse(apt);
    rm.setDirectTo(apt);
}

// Navigation display
let toggleLayer = function(layer) {
    if( !nd.layers.hasOwnProperty(layer) ) {
        console.error('ND::toggleLayer - Unknown layer', layer);
        return;
    }

    if( nd.layers[layer].getVisible() ) {
        $(':checkbox[name=ndLayer_'+layer+']').prop('checked', settingsMgr.set('ndLayer_'+layer, false));
        nd.hideLayer(layer);
    } else {
        if(layer == 'oaci_2017') {
            $(':checkbox[name=ndLayer_cartabossy_2015]').prop('checked', settingsMgr.set('ndLayer_cartabossy_2015', false));
            nd.hideLayer('cartabossy_2015');
        }
        if(layer == 'cartabossy_2015') {
            $(':checkbox[name=ndLayer_oaci_2017]').prop('checked', settingsMgr.set('ndLayer_oaci_2017', false));
            nd.hideLayer('oaci_2017');
        }

        $(':checkbox[name=ndLayer_'+layer+']').prop('checked', settingsMgr.set('ndLayer_'+layer, true));
        nd.showLayer(layer);
    }
}

let toggleNdAdsb = function() {
    nd.toggleAdsb();
    $(':checkbox[name=ndAdsb]').prop('checked', settingsMgr.toggle('ndAdsb'));
}

let toggleNdDistanceUnit = function() {
    let k = 'ndDistanceUnit';
    let rValue = 'Km';
    if(settingsMgr.get(k) == 'Km') {
        rValue = 'Nm';
    }
    settingsMgr.set(k, rValue);
    nd.setDistanceUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'Km'));
}

let toggleNdMapToNorth = function() {
    $(':checkbox[name=ndMapToNorth]').prop('checked', settingsMgr.toggle('ndMapToNorth'));
    nd.toggleMapToNorth();
}

let toggleNdAutoZoom = function() {
    $(':checkbox[name=ndAutoZoom]').prop('checked', settingsMgr.toggle('ndAutoZoom'));
    nd.toggleAutoZoom();
}

let toggleRmLoadLastRouteOnStartup = function() {
    $(':checkbox[name=rmLoadLastRouteOnStartup]').prop('checked', settingsMgr.toggle('rmLoadLastRouteOnStartup'));
    rm.toggleLoadLastRouteOnStartup();
}

let changeNdAircraftCenterOffset = function() {
    let k = 'ndAircraftCenterOffset';
    let rValue = $(':input[name='+k+']').val();
    settingsMgr.set(k, rValue);
    nd.setAircraftCenterOffset(rValue);
}

let setNdAverageGroundspeed = function() {
    let k = 'ndAverageGroundspeed';
    let rValue = $(':input[name='+k+']').val();
    rValue = parseInt(rValue);
    settingsMgr.set(k, rValue);
    nd.setAverageGroundspeed(rValue);
}

// Terrain elevation
let toggleTerrainElevation = function() {
    $(':checkbox[name=terrainElevationVisible]').prop('checked', settingsMgr.toggle('terrainElevationVisible'));
    terrain.toggle();
}

let toggleTerrainDistanceUnit = function() {
    let k = 'terrainDistanceUnit';
    let rValue = 'Km';
    if(settingsMgr.get(k) == 'Km') {
        rValue = 'Nm';
    }
    settingsMgr.set(k, rValue);
    terrain.setDistanceUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'Km'));
}

let toggleTerrainElevationUnit = function() {
    let k = 'terrainElevationUnit';
    let rValue = 'M';
    if(settingsMgr.get(k) == 'M') {
        rValue = 'Ft';
    }
    settingsMgr.set(k, rValue);
    terrain.setElevationUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'M'));
}

// Ems
let toggleEmsTemperatureUnit = function() {
    let k = 'emsTemperatureUnit';
    let rValue = 'C';
    if(settingsMgr.get(k) == 'C') {
        rValue = 'F';
    }
    settingsMgr.set(k, rValue);
    ems.setTemperatureUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'C'));
}

let selectLayout = function(layout) {
    switch(layout) {
        case 'nav-ems':
            efis.hide();
            $('#left-area').show();
            $('#right-area').show();
            $('#left-area').removeClass('col-lg-12');
            $('#left-area').addClass('col-lg-7');
            $('#right-area').removeClass('col-lg-12');
            $('#right-area').addClass('col-lg-5');
            nd.updateSize();
            ems.updateSize();
            break;

        case 'efis-ems':
            efis.show();
            $('#left-area').show();
            $('#right-area').show();
            $('#left-area').removeClass('col-lg-12');
            $('#left-area').addClass('col-lg-7');
            $('#right-area').removeClass('col-lg-12');
            $('#right-area').addClass('col-lg-5');
            nd.updateSize();
            ems.updateSize();
            break;

        case 'nav':
            efis.hide();
            $('#left-area').show();
            $('#right-area').hide();
            $('#left-area').removeClass('col-lg-7');
            $('#left-area').addClass('col-lg-12');
            nd.updateSize();
            break;

        case 'efis':
            efis.show();
            $('#left-area').show();
            $('#right-area').hide();
            $('#left-area').removeClass('col-lg-7');
            $('#left-area').addClass('col-lg-12');
            nd.updateSize();
            break;

        case 'ems':
            $('#right-area').show();
            $('#left-area').hide();
            $('#right-area').removeClass('col-lg-5');
            $('#right-area').addClass('col-lg-12');
            ems.updateSize();
            break;

        default:
            break;
    }

    settingsMgr.set('layout', layout);
}

/*$("#toggle-ems").on('click', function(){
    $('#ems').toggleClass('mini');
    $('#pfd').toggleClass('large');
    let terrainVisible = terrain.isVisible();

    if(terrainVisible)
        terrain.hide();

    setTimeout(function(){
        nd.updateSize();
        terrain.updateSize();
        if(terrainVisible)
            terrain.show();
    }, 1100);
    return false;
});*/

$(window).resize(function(){
    let terrainVisible = terrain.isVisible();

    if(terrainVisible)
        terrain.hide();

    efis.redraw();
    setTimeout(function(){
        nd.updateSize();
        ems.updateSize();
        terrain.updateSize();
        if(terrainVisible)
            terrain.show();
    }, 1100);
});

// Efis
let toggleEfis = function() {
    $(':checkbox[name=efisVisible]').prop('checked', settingsMgr.toggle('efisVisible'));
    efis.toggle();
}

let toggleEfisAltitudeUnit = function() {
    let k = 'efisAltitudeUnit';
    let rValue = 'M';
    if(settingsMgr.get(k) == 'M') {
        rValue = 'Ft';
    }
    settingsMgr.set(k, rValue);
    efis.setAltitudeUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'M'));
}

let toggleEfisSpeedUnit = function() {
    let k = 'efisSpeedUnit';
    let rValue = 'Km/h';
    if(settingsMgr.get(k) == 'Km/h') {
        rValue = 'Kt';
    }
    settingsMgr.set(k, rValue);
    efis.setSpeedUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'Km/h'));
}

let toggleEfisQnhUnit = function() {
    let k = 'efisQnhUnit';
    let rValue = 'Mb';
    if(settingsMgr.get(k) == 'Mb') {
        rValue = 'InHg';
    }
    settingsMgr.set(k, rValue);
    efis.setQnhUnit(rValue);
    $(':checkbox[name='+k+']').prop('checked', (rValue == 'Mb'));
}

let openFuelManager = function() {
    $('#fuelValueInput').val(ems.getFuelLevel());
    $('#tankManagerModal').modal({
        backdrop: 'static',
        keyboard: false,
    });
}

let addFuel = function() {
    let quantity = parseFloat( $('#fuelValueInput').val() );
    let currentFuelLevel = ems.getFuelLevel();
    let level = (currentFuelLevel + quantity);
    $.ajax({
        type: 'POST',
        url: 'ajax.php?command=refuel',
        data: {
            level: level,
            quantity: quantity
        }
    }).done(data => {
        sendData({
            type: 'refuel',
            level: level
        });
    });
}

let setFuel = function() {
    let level = parseFloat( $('#fuelValueInput').val() );
    let currentFuelLevel = ems.getFuelLevel();
    let quantity = (level - currentFuelLevel);
    $.ajax({
        type: 'POST',
        url: 'ajax.php?command=refuel',
        data: {
            level: level,
            quantity: quantity
        }
    }).done(data => {
        sendData({
            type: 'refuel',
            level: level
        });
    });
}

let setSunrise = function(date) {
    //console.log(date.getUTCTime());
    $('span.sunrise').html(formatTime(date));
}

let setSunset = function(date) {
    //console.log(date.getUTCTime());
    $('span.sunset').html(formatTime(date));
}

function ConvertDDToDMS(D, lng){
    return {
        dir : D<0?lng?'W':'S':lng?'E':'N',
        deg : 0|(D<0?D=-D:D),
        min : 0|D%1*60,
        sec :(0|D*60%1*60)
    };
}

let updateRouteStat = function(date) {
    let latlng = nd.getAircraftPosition();
    let DMSlng = ConvertDDToDMS(latlng[0], true);
    let DMSlat = ConvertDDToDMS(latlng[1]);
    let DMSposition = DMSlat.deg+"°"+DMSlat.min+"'"+DMSlat.sec+"''"+DMSlat.dir+"&nbsp;&nbsp;"+DMSlng.deg+"°"+DMSlng.min+"'"+DMSlng.sec+"''"+DMSlng.dir;

    let routeDist = nd.getRemainingRouteDistance();
    if(routeDist > 0) {
        routeDist = routeDist+" km";
    } else {
        routeDist = "------";
    }

    let directToDist = nd.getDirectToDistance();
    let directToDuration = nd.getDirectToDuration();
    if(directToDist > 0) {
        directToDist = directToDist+" km / "+directToDuration+" min";
    } else {
        directToDist = "------";
    }

    let routeDuration = nd.getRemainingRouteDuration();
    let eta = "------";
    if(routeDuration > 0) {
        eta = new Date(date.getTime());
        eta.setMinutes(eta.getMinutes() + routeDuration);
        eta = formatTime(eta);

        routeDuration = routeDuration+" min";
    } else {
        routeDuration = "------";
    }

    $('.info-position').html(DMSposition);
    $('.info-ete').html(routeDuration);
    $('.info-eta').html(eta);
    $('.info-wptDistance').html(directToDist);
    $('.info-routeDistance').html(routeDist);
}

$('#searchDirectToModal').on('show.bs.modal', function(e){
    $('.searchDirectToInput').focus();
});

let sendCurrentUser = function() {
    sendData({
        type: 'user_id',
        user_id: settingsMgr.getUser().getId()
    });
}

let sendData = function(obj) {
    let data = JSON.stringify(obj);
    if(ws && ws instanceof WebSocket && ws.readyState == WebSocket.OPEN) {
        ws.send(data);
    }
}

function debounce(callback, delay) {
    let timer = null;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback();
        }, delay);
    }
}

let ws;
function connect() {
    let _hostname = window.location.hostname;
    ws = new WebSocket("ws://"+_hostname+":7700");
    ws.onopen = function() {
        sendCurrentUser();
    };

    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        //console.log(data);
        if(data.IMU){
            data = data.IMU;
            //console.log(data);
            //nd.setAircraftHeading(data.yaw);
            //terrain.setAircraftHeading(data.yaw);
            efis.setSlip(data.slipball);
            efis.setPressure(data.pressure);
            //efis.setAttitude({roll:data.roll, pitch:data.pitch});
            debounce(efis.setAttitude({roll:data.roll, pitch:data.pitch}), 100);
            //efis.setCompass(data.yaw);
        }
        if(data.GPS){
            data = data.GPS;
            nd.setAircraftPosition([data.lng, data.lat]);
            nd.setAircraftTrack(data.compass);
            nd.setAircraftHeading(data.compass);
            efis.setCompass(data.compass);
            terrain.setAircraftHeading(data.compass);

            currentDate = new Date(data.time);
            setSunrise(currentDate.sunrise(data.lat, data.lng));
            setSunset(currentDate.sunset(data.lat, data.lng));

            setUIDate(currentDate);

            terrain.setAircraftPosition([data.lng, data.lat]);
            terrain.setAircraftGroundSpeed(data.spd);
            terrain.setAircraftAltitude(data.alt);

            updateRouteStat(currentDate);

            efis.setAltitude(data.alt);
        }

        if(data.EMS){
            data = data.EMS;
            //console.log(data.current);
            ems.setRpm(data.RPM);
            ems.setCylTemp(data.cylTemp);
            ems.setOilTemp(data.oilTemp);
            ems.setOilPress(data.oilPress);
            ems.setVolt(data.voltage);
            ems.setAmp(data.current);
            ems.setFuelLevel(data.fuelLevel);
            ems.setFuelFlow(data.fuelFlow);
            efis.setSpeed(data.ASI);
            ems.setMap(data.MAP);
        }
    };

    ws.onclose = function(e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };

    ws.onerror = function(err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };
}