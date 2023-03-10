var baseLayers = {
  "France: OACI 2016" : L.tileLayer('maps/oaci_fr_2016/{z}/{x}/{y}.jpg', {
    minZoom : 4,
    maxZoom : 13,
    maxNativeZoom : 11,
    attribution : 'Map data © <a href="http://ign.fr/">IGN</a>',
    bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
  }),
  "France: Cartabossy 2015" : L.tileLayer('maps/cartabossy/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 13,
    maxNativeZoom : 10,
    attribution : 'Map data © <a href="http://cartabossy.com/">Cartabossy</a>',
    bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
  }),
};

var overlays = {
  "France: VAC Approach" : L.tileLayer('maps/approach_fr/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 15,
    maxNativeZoom: 12,
    tms: true,
    attribution: 'Map data © <a href="foxhotel.hd.free.fr">OpenFlightMap</a>',
  }),
  "France: VAC Landing" : L.tileLayer('maps/landing_fr/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 16,
    maxNativeZoom : 14,
    tms: true,
    attribution: 'Map data © <a href="foxhotel.hd.free.fr">OpenFlightMap</a>',
  }),
};

var _plot = null;
var _plotTimer = null;
var _activeTab = null;
var _lastCoord = null;
var _gotoPositions = [];
var _pauseTimer = false;
var _followAircraft = true;
var _locationListener = null;
var _saveLastPositionTimer = null;
var _lastPosition = _defaultPosition;
var _hostname = window.location.hostname;
var _defaultPosition = L.latLng(44, 5);

var nextControl     = L.nextControl();
var clearControl    = L.clearControl();
var followAircraft  = L.followControl();
var fsControl       = L.fullscreenControl();
var predictivePath  = L.polyline(_defaultPosition);
var aircraftMarker  = L.aircraftMarker(_defaultPosition);
var gotoPath        = L.polyline(_defaultPosition, {color: '#00ff00', opacity: 0.8});
var trackPath       = L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4});
var plotHoverMarker = L.circleMarker(_defaultPosition, {color: '#ff0000', radius: 5});
var trackPathHist   = L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4, clickable: false});

var M = 0.0289644;
var g = 9.80665;
var R = 8.31432;
var p_default = 101325;
var t_default = 288.15;

function altcalc(a, k, i) {
  if ((a / i) < (101325 / 22632.1)) {
    var d = - 0.0065;
    var e = 0;
    var j = Math.pow((i / a), (R * d) / (g * M));
    return e + ((k * ((1 / j) - 1)) / d)
  } else {
    if ((a / i) < (101325 / 5474.89)) {
      var e = 11000;
      var b = k - 71.5;
      var f = (R * b * (Math.log(i / a))) / (( - g) * M);
      var l = 101325;
      var c = 22632.1;
      var h = ((R * b * (Math.log(l / c))) / (( - g) * M)) + e;
      return h + f
    }
  }
  return NaN
}

function toDecimal(v, d) {
  return parseFloat(v.toFixed(d));
}

function hsv2rgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ parseInt(r * 255), parseInt(g * 255), parseInt(b * 255) ];
}

function getHueFromTemp(v) {
  var h = 0;
  if(v < 70)
    h = -4.7143e-3 * v + 0.66;
  if(v >= 70 && v < 95)
    h = -6.8e-3 * v + 0.806;
  if(v >= 95)
    h = -6.4e-3 * v + 0.768;
  return h;
}

function getHueFromPress(v) {
  var h = 0;
  if(v >= 3 && v < 5)
    h = 0.165 * v - 0.495;
  if(v >= 5 && v < 7)
    h = -0.165 * v + 1.155;
  return h;
}

$(document).ready(function() {
  $('#settingsDialog').popup({
    afterclose: function(e, ui){
      window.dispatchEvent(new Event('resize'));
    },
    afteropen: function(e, ui){
      $(_activeTab).addClass('ui-btn-active');
    }
  });

  $('#tabsSettings ul a').on('click', function(e){
    _activeTab = $(this);
  });

  /*
  * Initialize map
  */
  map = L.map('map', {
    center : [44, 5],
    zoom : 10,
    minZoom: 4,
    maxZoom: 16,
    zoomControl: false,
    attributionControl: false,
  });

  $.get("utils.php", {action: 'loadSettings'}, function(data){
    Settings = JSON.parse(data);
    $("#vs").val(Settings.efis.asi.speed.vs);
    $('#qnhInput').val(Settings.efis.alt.qnh);
    $("#vne").val(Settings.efis.asi.speed.vne);
    $("#vno").val(Settings.efis.asi.speed.vno);
    $("#vfe").val(Settings.efis.asi.speed.vfe);
    $("#vso").val(Settings.efis.asi.speed.vso);
    $("#timezone").val(Settings.efis.timezone.offset).slider("refresh");
    $("#speedTickSpacing").val(Settings.efis.asi.tickspacing).slider("refresh");
    $("#altitudeTickSpacing").val(Settings.efis.alt.tickspacing).slider("refresh");
    $("#summer").prop("checked", Settings.efis.timezone.summer).checkboxradio("refresh");
    $("#speedInMapView").prop("checked", Settings.map.display.asi).checkboxradio("refresh");
    $("#compassInMapView").prop("checked", Settings.map.display.compass).checkboxradio("refresh");
    $("#altitudeInMapView").prop("checked", Settings.map.display.alt).checkboxradio("refresh");
    $("#vacLndInMapView").prop("checked", Settings.map.overlays.vac.lnd).checkboxradio("refresh");
    $("#vacAppInMapView").prop("checked", Settings.map.overlays.vac.app).checkboxradio("refresh");
    $("input:radio[name=layerInMapView]").filter("[value="+Settings.map.layer+"]").prop("checked", true).checkboxradio("refresh");
    $("#altitudeUnit").val(Settings.general.unit.altitude).slider("refresh");
    $("#elevationUnit").val(Settings.general.unit.elevation).slider("refresh");
    $("#speedUnit").val(Settings.general.unit.speed).slider("refresh");
    $("#distanceUnit").val(Settings.general.unit.distance).slider("refresh");
    $("#speedSource").val(Settings.efis.asi.source).slider("refresh");
    $("#compassSource").val(Settings.efis.compass.source).slider("refresh");
    $("#altitudeSource").val(Settings.efis.alt.source).slider("refresh");

    efis = $("#efis").efis(Settings.efis);
    efis.setSpeedUnit(Settings.general.unit.speed);
    efis.setDistanceUnit(Settings.general.unit.distance);
    efis.setETA(0);
    efis.setDST(0);
    efis.setPosition(Settings.general.lastposition);
    geo_success({
      "lat": Settings.general.lastposition.lat,
      "lng": Settings.general.lastposition.lng,
      "spd": 0,
      "compass": 0,
      "alt": 0
    });

    if(!Settings.map.display.alt)
      $("#alt").css("z-index", 39);
    if(!Settings.map.display.asi)
      $("#asi").css("z-index", 39);
    if(!Settings.map.display.compass)
      $("#compass").css("z-index", 39);
    if(Settings.map.layer == 'oaci')
      map.addLayer(baseLayers["France: OACI 2016"]);
    if(Settings.map.layer == 'cartabossy')
      map.addLayer(baseLayers["France: Cartabossy 2015"]);
    if(Settings.map.overlays.vac.lnd)
      map.addLayer(overlays["France: VAC Landing"]);
    if(Settings.map.overlays.vac.app)
      map.addLayer(overlays["France: VAC Approach"]);

    var ws = new WebSocket("ws://"+_hostname+":7700");
    ws.onmessage = function (e) {
      var data = JSON.parse(e.data);
      if(data.IMU){
        data = data.IMU;
        data.roll = toDecimal(data.roll, 2);
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
        efis.setAttitude({roll:data.roll, pitch:data.pitch});
      }
      if(data.GPS){
        data = data.GPS;
        //data.spd = 60;
        efis.setClock(data.time);
        efis.setPosition({"lat":data.lat, "lng":data.lng});
        if(Settings.efis.asi.source == "gps") {
          efis.setSpeed(data.spd);
        }

        if(Settings.efis.compass.source == "gps"){
          if(data.spd > 2)
            efis.setCompass(data.compass);
          else
            efis.setCompass(0);
        }

        data.altPress = altcalc(efis.getQnh()*100, 288.15, efis.getPressure()*100)*3.28084;
        geo_success(data);

        var alt = data.altPress;
        if(Settings.efis.alt.source == 'gps')
          alt = data.alt;
        if(Settings.general.unit.altitude == 'm')
          alt /= 3.28084;

        efis.setAltitude(alt);
      }
      if(data.EMS){
        data = data.EMS;
        console.log(data);
        $("input#cht0").val(data.cht0+" °C");
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
        }
      }
    };

    /*$('#ai').on('click', function(){
      $("#ai").css("visibility", "hidden");
      $("#ts").css("visibility", "hidden");
      $("#map").css("visibility", "visible");
    });*/

    $('#nav a').on('click', function(e){
        var elem = $(this).attr('data');
        if(elem == 'map') {
          $(this).addClass('ui-btn-active');
          $('#nav a[data=efis]').removeClass('ui-btn-active');
          $('#ts, #ai').css('visibility', 'hidden');
          $('#map').css('visibility', 'visible');
        }
        if(elem == 'efis') {
          $(this).addClass('ui-btn-active');
          $('#nav a[data=map]').removeClass('ui-btn-active');
          $('#map').css('visibility', 'hidden');
          $('#ts, #ai').css('visibility', 'visible');
        }
        if(elem == 'ems') {
          $('#ems').toggle();
          $(this).toggleClass('ui-btn-active');
        }
    });

    $('#alt').on('click', function(){
      var v = $('#groundElevation').css('visibility') == 'hidden' ? 'visible' : 'hidden';
      $('#groundElevation').css('visibility', v);
    });

    $('#qnh-box').on('click', function(e){
      $('#settingsQnh').popup('open');
    });

    $('#eta-box').on('click', function(e){
      var t = Settings.efis.etaType == 'wp' ? 'total' : 'wp';
      Settings.efis.etaType = t;
      efis.setETAType(t);
    });

    $('#dst-box').on('click', function(e){
      var t = Settings.efis.dstType == 'wp' ? 'total' : 'wp';
      Settings.efis.dstType = t;
      efis.setDSTType(t);
    });
  });

  setTimeout(function(){
    // Because leafletjs seems to require it
    window.dispatchEvent(new Event('resize'));
  }, 2000);

  /*
   * Attach features to the map
   */
  if(_hostname != "localhost" && _hostname != "127.0.0.1")
    fsControl.addTo(map);
  gotoPath.addTo(map);
  trackPath.addTo(map);
  followAircraft.addTo(map);
  predictivePath.addTo(map);
  aircraftMarker.addTo(map);

  $('#leaflet-center-map').on('click', function(){
    _followAircraft = true;
    if(_lastPosition != null)
      map.panTo(_lastPosition, {animate: true, noMoveStart: true});
  });

  aircraftMarker.on('click', function(e) {
    _followAircraft = true;
    if(_lastPosition != null)
      map.panTo(_lastPosition, {animate: true, noMoveStart: true});
  });

  map.on('dragstart', function(e) {
    _followAircraft = false;
  });

  map.on('contextmenu', function(e) {
    if(_lastCoord == null)
      return;
    if(!map.hasClearControl)
      clearControl.addTo(map);
    if(_gotoPositions.length > 0 && !map.hasNextControl)
      nextControl.addTo(map);
    _gotoPositions.push(e.latlng);
    geo_success(_lastCoord);
  });

  /*map.on('click', function(e){
    if( $(e.originalEvent.target).is("img") )
      return false;
    $("#ai").css("visibility", "visible");
    $("#ts").css("visibility", "visible");
    $("#map").css("visibility", "hidden");
  });*/

  $("#qnhDecrease").on('click', function(e){
    var v = $("#qnhInput").val();
    v = parseInt(v)-1;
    if(v < 900)
      return;
    $("#qnhInput").val(v).trigger("change");
  });

  $("#qnhIncrease").on('click', function(e){
    var v = $("#qnhInput").val();
    v = parseInt(v)+1;
    if(v > 1080)
      return;
    $("#qnhInput").val(v).trigger("change");
  });

  $('.exec-cmd').on('click', function(){
    var url = $(this).attr("href");
    $.get(url);
  });

  $("#settingsDialog input, #settingsDialog select, #qnhInput").on('change', function(){
    var param = $(this).attr('name');
    var type  = $(this).attr('type');
    var val   = type == 'checkbox' ? $(this).is(':checked') : $(this).val();
    var data  = undefined;

    switch(param){
      case 'qnhInput':
        efis.setQnh(val);
        data = {efis:{alt:{qnh:parseInt(val)}}};
        break;

      case 'vs':
      case 'vso':
      case 'vfe':
      case 'vno':
      case 'vne':
        efis.setSpeedLimit(param, computeSpeed(val));
        var speed = {};
        speed[param] = parseInt(val);
        data = {'efis':{'asi':{'speed':speed}}};
        break;

      case 'speedTickSpacing':
        efis.setSpeedTickSpacing(val);
        data = {efis: {asi: {tickspacing: parseInt(val)}}};
        break;

      case 'altitudeTickSpacing':
        efis.setAltitudeTickSpacing(val);
        data = {efis: {alt: {tickspacing: parseInt(val)}}};
        break;

      case 'compassInMapView':
        if(val)
          $("#compass").css("z-index", 40);
        else
          $("#compass").css("z-index", 39);
        data = {map:{display:{compass:val}}};
        break;

      case 'altitudeInMapView':
        if(val)
          $("#alt").css("z-index", 40);
        else
          $("#alt").css("z-index", 39);
        data = {map:{display:{alt:val}}};
        break;

      case 'speedInMapView':
        if(val)
          $("#asi").css("z-index", 40);
        else
          $("#asi").css("z-index", 39);
        data = {map:{display:{asi:val}}};
        break;

      case 'trackInMapView':
        if(val)
          trackPath.addTo(map);
        else
          map.removeLayer(trackPath);
        data = {map:{display:{track:val}}};
        break;

      case 'vacLndInMapView':
        if(val)
          map.addLayer(overlays["France: VAC Landing"]);
        else
          map.removeLayer(overlays["France: VAC Landing"]);
        data = {map:{overlays:{vac:{lnd:val}}}};
        break;

      case 'vacAppInMapView':
        if(val)
          map.addLayer(overlays["France: VAC Approach"]);
        else
          map.removeLayer(overlays["France: VAC Approach"]);
        data = {map:{overlays:{vac:{app:val}}}};
        break;

      case 'layerInMapView':
        if(val == 'cartabossy'){
          map.removeLayer(baseLayers["France: OACI 2016"]);
          map.addLayer(baseLayers["France: Cartabossy 2015"]);
        }
        if(val == 'oaci'){
          map.removeLayer(baseLayers["France: Cartabossy 2015"]);
          map.addLayer(baseLayers["France: OACI 2016"]);
        }
        data = {map:{layer:val}};
        break;

      case 'timezone':
        efis.setTimezone(val);
        data = {efis:{timezone:{offset:parseInt(val)}}};
        break;

      case 'summer':
        efis.setSummer(val);
        data = {efis:{timezone:{summer:val}}};
        break;

      case 'speedUnit':
        efis.setSpeedUnit(val);
        data = {general:{unit:{speed:val}}};
        break;

      case 'elevationUnit':
        data = {general:{unit:{elevation:val}}};
        break;

      case 'altitudeUnit':
        data = {general:{unit:{altitude:val}}};
        break;

      case 'distanceUnit':
        efis.setDistanceUnit(val);
        data = {general:{unit:{distance:val}}};
        break;

      case 'speedSource':
        efis.setSpeedSource(val);
        data = {efis:{asi:{source:val}}};
        break;

      case 'compassSource':
        efis.setCompassSource(val);
        data = {efis:{compass:{source:val}}};
        break;
      case 'altitudeSource':
        efis.setAltitudeSource(val);
        data = {efis:{alt:{source:val}}};
        break;
    }
    Settings = $.extend(true, {}, Settings, data);
    saveSettings(data);
  });

  _plotTimer = new Date().getTime() - 1000*10; // soustract 10s for the first update
});

function calibrateEfis(){
  var attitude = efis.getAttitude();

  efis.setCalibration(attitude);
  Settings.efis.attitude.pitchoffset = attitude.pitch;
  Settings.efis.attitude.rolloffset = attitude.roll;
  var data = {efis:{attitude:{
    pitchoffset: attitude.pitch,
    rolloffset: attitude.roll,
  }}};
  saveSettings(data);
  efis.setAttitude({pitch:0, roll:0});
}

function saveSettings(data){
  $.get("utils.php", {action: 'saveSettings', v: JSON.stringify(data) });
}

function computeSpeed(s){
  s = Settings.general.unit.speed == "kt" ? s*0.539957 : s;
  return parseInt(s);
}

/*
* Executed on geolocation success
*/
function geo_success(position){
  //position.spd = Math.round(27.78); //100kmh
  _lastCoord = position;
  _lastPosition = L.latLng(position.lat, position.lng);
  aircraftMarker.setLatLng(_lastPosition);
  if(position.spd > 5)
    aircraftMarker.setCompass(position.compass);

  if(_saveLastPositionTimer == null)
    _saveLastPositionTimer = new Date().getTime();

  if( (new Date().getTime() - _saveLastPositionTimer > 1000*60) ){ //each 1 minute
    var data = {general:{lastposition:_lastPosition}};
    saveSettings(data);
    _saveLastPositionTimer = new Date().getTime();
  }

  updateFlightPlan(position.spd);
  trackPath.addLatLng(_lastPosition);

  if(_followAircraft)
    map.panTo(_lastPosition, {animate: true, noMoveStart: true});

  var speed = position.spd > 5 ? position.spd : 17;
  var nextPoint = destSphere(position.lat, position.lng, position.compass, speed);
  predictivePath.setLatLngs([_lastPosition, nextPoint]);
  updatePlot(predictivePath, speed, position.alt, false);
}

function getDistanceFromNextWpt(path){
  var points = path.getLatLngs();
  return Math.round( points[0].distanceTo(points[1]) ) / 1000;
}

function getDistanceInPath(path){
  var points = path.getLatLngs();
  var dist = 0;
  for(var i=0; i<(points.length-1); i++){
    dist += Math.round( points[i].distanceTo(points[i+1]) ) / 1000;
  }
  return dist;
}

function getETAFromDistanceAndSpeed(distance, speed){
  var eta = (distance/speed)*60;
  return Math.round(eta*10)/10;
}

function updateFlightPlan(currentSpeed){
  if(_gotoPositions.length == 0)
    return;

  var p = [_lastPosition];
  p = p.concat(_gotoPositions);
  gotoPath.setLatLngs(p);
  gotoPath.addTo(map);

  /* ETA computation */
  var nextWptDST = getDistanceFromNextWpt(gotoPath);
  var nextWptETA = getETAFromDistanceAndSpeed(nextWptDST, currentSpeed);

  var totalDST = getDistanceInPath(gotoPath);
  var totalETA = getETAFromDistanceAndSpeed(totalDST, currentSpeed);

  efis.setDST({"wp": nextWptDST, "total": totalDST});

  if(currentSpeed < 5){
    efis.setETA("Infinity");
    return;
  }
  efis.setETA({"wp": nextWptETA, "total": totalETA});
}

function pad(n){return (n < 10) ? ("0" + n) : n;}

/*
* Compute predictive point given position, bearing and distance
*/
function destSphere(lat1, lng1, brg, spd){
  var R    = 6372.7976; // Earth radius
  var dist = (spd*0.3)/R; // 5 minutes
  var lat1 = lat1*Math.PI/180;
  var lng1 = lng1*Math.PI/180;
  var brg  = brg*Math.PI/180;
  var lat  = Math.asin(Math.sin(lat1)*Math.cos(dist) + Math.cos(lat1)*Math.sin(dist)*Math.cos(brg));
  var lng  = lng1 + Math.atan2(Math.sin(brg)*Math.sin(dist)*Math.cos(lat1), Math.cos(dist)-Math.sin(lat1)*Math.sin(lat));
  return L.latLng(lat*180/Math.PI, lng*180/Math.PI);
}


/*
 * Update plot draw
 */

function updatePlot(path, spd, alt, force) {
  // Check that we update plot every 10s when not forced
  if(!force)
    if( (_plotTimer == null) || (new Date().getTime() - _plotTimer < 1000*10))
      return;

  _plotTimer = new Date().getTime();

  var positions = path.getLatLngs();
  var lat1 = positions[0].lat;
  var lon1 = positions[0].lng;
  var lat2 = positions[1].lat;
  var lon2 = positions[1].lng;
  var altitude = alt;
  var pathLength = Math.round(positions[0].distanceTo(positions[1])/100);

  $.ajax({
    type: 'GET',
    url: 'utils.php?action=elevation',
    cache: false,
    data: {
      path: lat1+","+lon1+"|"+lat2+","+lon2,
      samples: pathLength,
    },
    dataType: 'json',
    success: function (data) {
      if(Settings.general.unit.elevation == 'm')
        altitude = Math.round(altitude / 3.2808);
      var elevArr = [altitude];
      var elevationData = [];
      $.each(data.results, function (index, element) {
        var point = new L.latLng(element.location.lat, element.location.lng);
        var distance = Math.round(positions[0].distanceTo(point))/1000;
        var elevation = Math.round(element.elevation);
        if(Settings.general.unit.distance == 'nm')
          distance = distance * 0.539957;
        if(Settings.general.unit.elevation == 'ft')
          elevation = Math.round(elevation * 3.2808);

        elevationData.push([distance, elevation]);
        elevArr.push(elevation);
      });

      if(Settings.general.unit.distance == 'nm')
        spd = Math.round(spd*0.539957);

      var yOffset = 200;
      if(Settings.general.unit.elevation == 'ft')
        yOffset = 500;
      var xMax = ((Math.round(spd)*300))/1000;
      var yMax = Math.max.apply(null, elevArr)+yOffset;

      var options = {
        canvas: true,
        series: {
          lines: { show: true },
          points: { show: false },
        },
        xaxis: {
          min: 0,
          max: xMax,
          tickFormatter: function(v){
            var unit = Settings.general.unit.distance;
            return v + " "+unit;
          },
        },
        yaxis: {
          min: 0,
          max: yMax,
          tickFormatter: function(v){
            var unit = Settings.general.unit.elevation;
            return v + " "+unit;
          },
        },
      };

      var currentAlt = [[0, altitude], [xMax, altitude]];
      _plot = $.plot($('#groundElevation'),
        [
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
          {color: "#00f", data: currentAlt},
        ],
        options);
    }
  });
}
