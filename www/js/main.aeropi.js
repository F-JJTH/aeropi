'use strict';

class AeroPi {
    constructor(data = {}) {
        this.rm  = null;
        this.ems = null;
        this.nd  = null;
        this.terrain  = null;
        this.settings = null;
    }
    init() {}
    postInit() {}
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
        $(':input[name=ndAutoZoom]').val(settings.ndAutoZoom);
        nd.setAircraftCenterOffset(settings.ndAircraftCenterOffset);
        $(':input[name=ndAverageGroundspeed]').val(settings.ndAverageGroundspeed);

        $(':checkbox[name=efisVisible]').prop('checked', settings.efisVisible);
        $(':checkbox[name=efisSpeedUnit]').prop('checked', (settings.efisSpeedUnit == 'Km/h'));
        $(':checkbox[name=efisAltitudeUnit]').prop('checked', (settings.efisAltitudeUnit == 'M'));
        $(':checkbox[name=efisQnhUnit]').prop('checked', (settings.efisQnhUnit == 'Mb'));
        
        $(':checkbox[name=emsTemperatureUnit]').prop('checked', (settings.emsTemperatureUnit == 'C'));
        ems.setTemperatureUnit(settings.emsTemperatureUnit);

        sendCurrentUser();
    },
    onSettingSaved: setting => {
        console.log(setting);
    }
});

let ems  = new EMS('', settingsMgr, {});
let nd   = new ND('map', settingsMgr, {});
let rm   = new RouteManager(nd, settingsMgr, {});
let efis = new Efis('', settingsMgr, {});
let terrain = new Terrain('#terrainElevation', settingsMgr, {
    url: "ajax.php?command=get_terrain_elevation",
    pathProvider: () => {
        return nd.getPredictivePath();
    }
});

settingsMgr.init();

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
    return ''+('0' + date.getUTCHours()).slice(-2)+'h'+('0' + date.getUTCMinutes()).slice(-2)+" UTC";
}

let setUIDate = function(date) {
    let htmlDate = ('0' + date.getDate()).slice(-2)+'/'+('0' + (date.getMonth()+1)).slice(-2)+'/'+date.getFullYear();
    let htmlTime = ('0' + date.getHours()).slice(-2)+'h'+('0' + date.getMinutes()).slice(-2);
    $('li span.date').html(' '+formatDate(date));
    $('li span.time').html(' '+formatTime(date));
}

let setDirectTo = function() {
    let apt = $('.searchDirectToInputSelected').val();
    apt = JSON.parse(apt);
    rm.setDirectTo(apt);
}

// Navigation display
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
    $(':checkbox[name=terrainToggleCheckbox]').prop('checked', settingsMgr.toggle('terrainElevationVisible'));
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

let setSunrise = function(date) {
    //console.log(date.getUTCTime());
    $('span.sunrise').html(formatTime(date));
}

let setSunset = function(date) {
    //console.log(date.getUTCTime());
    $('span.sunset').html(formatTime(date));
}

$('#searchDirectToModal').on('show.bs.modal', function(e){
    $('.searchDirectToInput').focus();
});

$("#toggle-ems").on('click', function(){
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
});

$(window).resize(function(){
    let terrainVisible = terrain.isVisible();

    if(terrainVisible)
        terrain.hide();

    setTimeout(function(){
        nd.updateSize();
        terrain.updateSize();
        if(terrainVisible)
            terrain.show();
    }, 1100);
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

let ws;
function connect() {
    let _hostname = window.location.hostname;
    ws = new WebSocket("ws://"+_hostname+":7700");
    ws.onopen = function() {
        sendCurrentUser();
    };

    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        if(data.IMU){
            data = data.IMU;
            //console.log(data);

            ems.setHdg(data.yaw);
            nd.setAircraftHeading(data.yaw);
            terrain.setAircraftHeading(data.yaw);
            /*data.roll = toDecimal(data.roll, 2);
            data.pitch = toDecimal(data.pitch, 2);
            data.slipball = toDecimal(data.slipball, 2);
            data.pressure = toDecimal(data.pressure, 2);
            data.temperature = toDecimal(data.temperature, 1);
            if(Settings.efis.compass.source != "gps"){
                data.compass = parseInt(data.yaw);
                efis.setCompass(data.compass);
            }
            efis.setSlip(data.slipball);
            efis.setPressure(data.pressure);
            efis.setAttitude({roll:data.roll, pitch:data.pitch});*/
        }
        if(data.GPS){
            data = data.GPS;
            nd.setAircraftPosition([data.lng, data.lat]);

            let today = new Date(data.time);
            setSunrise(today.sunrise(data.lat, data.lng));
            setSunset(today.sunset(data.lat, data.lng));

            setUIDate(today);

            terrain.setAircraftPosition([data.lng, data.lat]);
            terrain.setAircraftGroundSpeed(data.spd);
            terrain.setAircraftAltitude(data.alt);
            /*data.spd = 60;
            efis.setClock(data.time);
            efis.setPosition({"lat":data.lat, "lng":data.lng});
            if(Settings.efis.asi.source == "gps") {
                efis.setSpeed(data.spd);
            }

            if(Settings.efis.compass.source == "gps"){
                if(data.spd > 2) {
                    efis.setCompass(data.compass);
                } else {
                    efis.setCompass(0);
                }
            }

            data.altPress = altcalc(efis.getQnh()*100, 288.15, efis.getPressure()*100)*3.28084;
            geo_success(data);

            var alt = data.altPress;
            if(Settings.efis.alt.source == 'gps')
                alt = data.alt;
            if(Settings.general.unit.altitude == 'm')
                alt /= 3.28084;

            efis.setAltitude(alt);*/
        }

        if(data.EMS){
            data = data.EMS;
            //console.log(data);

            ems.setRpm(data.RPM);
            ems.setCylTemp(data.cylTemp);
            ems.setOilTemp(data.oilTemp);
            ems.setOilPress(data.oilPress);
            ems.setVolt(data.voltage);
            /*$("input#cht0").val(data.cht0+" °C");
            var col = "rgb("+hsv2rgb(getHueFromTemp(data.cht0), 1, 1)+")";
            $("input#cht0").css({backgroundColor: col});

            $("input#cht1").val(data.cht1+" °C");
            var col = "rgb("+hsv2rgb(getHueFromTemp(data.cht1), 1, 1)+")";
            $("input#cht1").css({backgroundColor: col});

            $("input#oilTemp").val(data.oilTemp+" °C");
            var col = "rgb("+hsv2rgb(getHueFromTemp(data.oilTemp), 1, 1)+")";
            $("input#oilTemp").css({backgroundColor: col});

            $("input#oilPress").val(data.oilPress+" Bar");
            var col = "rgb("+hsv2rgb(getHueFromPress(data.oilPress), 1, 1)+")";
            $("input#oilPress").css({backgroundColor: col});

            $("input#fuelFlow").val(toDecimal(data.fuelFlow, 2)+" L/h");
            $("input#MaP").val(data.MaP+" \"");
            $("input#voltage").val(toDecimal(data.voltage, 1)+" V");
            $("input#load").val(data.load+" A");
            $("input#rpm").val(data.RPM+" tr/m");

            if(Settings.efis.asi.source != "gps") {
                efis.setSpeed(data.ASI);
            }*/
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

connect();













$('input[name=ems]').on('input', function(){
    let v = $(this).val();
/*    ems.setCylTemp(v*1.5);
    ems.setOilTemp(v*1.5);
    ems.setOilPress(v / 10);
    ems.setRpm(v*80);
    ems.setAmp(-30 -(v*-0.6));
    ems.setMap(v*0.32);
    ems.setVolt(v*0.15);
    ems.setHdg(v*7.2);
    ems.setAsi(v*2.7);
    nd.setAircraftHeading(v*7.2);*/
    let spd = v;
    console.log('spd: '+spd);
    nd.setAircraftGroundSpeed(spd);
    terrain.setAircraftGroundSpeed(spd);
    /*terrain.setAircraftAltitude(v*25);
    let predictivePath = nd.getPredictivePath();*/
});
/*
$('input[name=lat], input[name=lon]').on('input', function(){
    let lon = parseFloat( $('input[name=lon]').val() );
    let lat = parseFloat( $('input[name=lat]').val() );
    nd.setAircraftPosition([lon, lat]);
    terrain.setAircraftPosition([lon, lat]);
    let today = new Date();
    setSunrise(today.sunrise(lat, lon));
    setSunset(today.sunset(lat, lon));
});

$('input[name=hdg]').on('input', function(){
    let hdg = parseFloat( $(this).val() );
    nd.setAircraftHeading(hdg);
    terrain.setAircraftHeading(hdg);
    ems.setHdg(hdg);
});
*/