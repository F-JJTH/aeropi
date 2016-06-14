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

  $.get("settings.php", {get: null}, function(data){
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
    $("#compassInMapView").prop("checked", Settings.map.display.hdg).checkboxradio("refresh");
    $("#altitudeInMapView").prop("checked", Settings.map.display.alt).checkboxradio("refresh");
    $("#vacLndInMapView").prop("checked", Settings.map.overlays.vac.lnd).checkboxradio("refresh");
    $("#vacAppInMapView").prop("checked", Settings.map.overlays.vac.app).checkboxradio("refresh");
    $("input:radio[name=layerInMapView]").filter("[value="+Settings.map.layer+"]").prop("checked", true).checkboxradio("refresh");

    if(Settings.general.unit.speed == "kt"){
      $.each(Settings.efis.asi.speed, function(i, speed){
        Settings.efis.asi.speed[i] = parseInt(speed*0.539957);
      });
    }

    efis = $("#efis").efis(Settings.efis);
    efis.setPosition(Settings.general.lastposition);
    geo_success({
      "lat": Settings.general.lastposition.lat,
      "lng": Settings.general.lastposition.lng,
      "spd": 0,
      "hdg": 0,
      "alt": 0
    });

    if(!Settings.map.display.alt)
      $("#alt").css("z-index", 39);
    if(!Settings.map.display.asi)
      $("#asi").css("z-index", 39);
    if(!Settings.map.display.hdg)
      $("#hdg").css("z-index", 39);
    if(Settings.map.overlays.vac.lnd)
      map.addLayer(overlays["France: VAC Landing"]);
    if(Settings.map.overlays.vac.app)
      map.addLayer(overlays["France: VAC Approach"]);
    if(Settings.map.layer == 'oaci')
      map.addLayer(baseLayers["France: OACI 2016"]);
    if(Settings.map.layer == 'cartabossy')
      map.addLayer(baseLayers["France: Cartabossy 2015"]);

    var ws = new WebSocket("ws://"+_hostname+":7700");
    ws.onmessage = function (e) {
      var data = JSON.parse(e.data);
      if(data.IMU){
        data = data.IMU;
        efis.setSlip(data.accel[0]);
        //efis.setHeading(data.heading);
        //efis.setPressure(data.pressure);
        //instruments.update(data, indicators);
        efis.setAttitude({roll:data.roll, pitch:data.pitch});
      }
      if(data.GPS){
        data = data.GPS;
        efis.setClock(data.time);
        efis.setPosition({"lat":data.lat, "lng":data.lng});
        if(Settings.general.unit.speed == "kt")
          data.spd = parseInt(data.spd*0.539957);
        efis.setSpeed(data.spd);
        efis.setHeading(data.hdg);
        geo_success(data);

        var altM = data.alt/3.28084;
        var P  = data.pressureAlt*100;
        var Pb = efis.getQnh()*100;
        var h = altM - 44330 * ( Math.pow(P/Pb, 0.190263237) - 1 );
        var alt = h*3.28084;
        if(Settings.general.unit.altitude == 'm')
          alt = h;
        efis.setAltitude(alt);
      }
    };

    $('#ai').on('click', function(){
      $("#ai").css("visibility", "hidden");
      $("#ts").css("visibility", "hidden");
      $("#map").css("visibility", "visible");
    });

    $('#qnh-box').on('click', function(e){
      $('#settingsQnh').popup('open');
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
    if(_gotoPositions.length > 1 && !map.hasNextControl)
      nextControl.addTo(map);
    _gotoPositions.push(e.latlng);
    geo_success(_lastCoord);
  });

  map.on('click', function(e){
    if( $(e.originalEvent.target).is("img") )
      return false;
    $("#ai").css("visibility", "visible");
    $("#ts").css("visibility", "visible");
    $("#map").css("visibility", "hidden");
  });

  $('#speedTickSpacing').change(function(){
    var v = parseInt( $(this).val() );
    efis.setSpeedTickSpacing(v);
    efis.redrawAsi();
    var data = {efis: {asi: {tickspacing: v/*settings.asi.tickspacing*/}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#altitudeTickSpacing').change(function(){
    var v = parseInt( $(this).val() );
    efis.setAltitudeTickSpacing(v);
    efis.redrawAlt();
    var data = {efis:{alt:{tickspacing: v/*settings.alt*/}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#vne').change(function(){
    var v = parseInt( $(this).val() );
    if(Settings.general.unit.speed == "kt")
      efis.setVneSpeed(parseInt(v*0.539957));
    else
      efis.setVneSpeed(v);
    efis.redrawAsi();
    var data = {efis:{asi:{speed:{vne:v}}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#vno').change(function(){
    var v = parseInt( $(this).val() );
    if(Settings.general.unit.speed == "kt")
      efis.setVnoSpeed(parseInt(v*0.539957));
    else
      efis.setVnoSpeed(v);
    efis.redrawAsi();
    var data = {efis:{asi:{speed:{vno:v}}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#vfe').change(function(){
    var v = parseInt( $(this).val() );
    if(Settings.general.unit.speed == "kt")
      efis.setVfeSpeed(parseInt(v*0.539957));
    else
      efis.setVfeSpeed(v);
    efis.redrawAsi();
    var data = {efis:{asi:{speed:{vfe:v}}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#vso').change(function(){
    var v = parseInt( $(this).val() );
    if(Settings.general.unit.speed == "kt")
      efis.setVsoSpeed(parseInt(v*0.539957));
    else
      efis.setVsoSpeed(v);
    efis.redrawAsi();
    var data = {efis:{asi:{speed:{vso:v}}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#vs').change(function(){
    var v = parseInt( $(this).val() );
    if(Settings.general.unit.speed == "kt")
      efis.setVsSpeed(parseInt(v*0.539957));
    else
      efis.setVsSpeed(v);
    efis.redrawAsi();
    var data = {efis:{asi:{speed:{vs:v}}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('#qnhInput').change(function(){
    var v = parseInt( $(this).val() );
    efis.setQnh(v);
    var data = {efis:{alt:{qnh:v}}};
    $.get("settings.php", {set: JSON.stringify(data)});
  });

  $('.exec-cmd').on('click', function(){
    var url = $(this).attr("href");
    $.get(url);
  });

  $("#MapSettings input").on('change', function(){
    var param = $(this).attr('name');
    var type = $(this).attr('type');
    var val = $(this).val();

    if(type == 'checkbox')
      val = $(this).is(':checked');

    if(param == 'compassInMapView'){
      if(val)
        $("#hdg").css("z-index", 40);
      else
        $("#hdg").css("z-index", 39);
      var data = {map:{display:{hdg:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'altitudeInMapView'){
      if(val)
        $("#alt").css("z-index", 40);
      else
        $("#alt").css("z-index", 39);
      var data = {map:{display:{alt:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'speedInMapView'){
      if(val)
        $("#asi").css("z-index", 40);
      else
        $("#asi").css("z-index", 39);
      var data = {map:{display:{asi:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'trackInMapView'){
      if(val)
        trackPath.addTo(map);
      else
        map.removeLayer(trackPath);
      var data = {map:{display:{track:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'vacLndInMapView'){
      if(val)
        map.addLayer(overlays["France: VAC Landing"]);
      else
        map.removeLayer(overlays["France: VAC Landing"]);
      var data = {map:{overlays:{vac:{lnd:val}}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'vacAppInMapView'){
      if(val)
        map.addLayer(overlays["France: VAC Approach"]);
      else
        map.removeLayer(overlays["France: VAC Approach"]);
      var data = {map:{overlays:{vac:{app:val}}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'layerInMapView'){
      if(val == 'cartabossy'){
        map.removeLayer(baseLayers["France: OACI 2016"]);
        map.addLayer(baseLayers["France: Cartabossy 2015"]);
      }
      if(val == 'oaci'){
        map.removeLayer(baseLayers["France: Cartabossy 2015"]);
        map.addLayer(baseLayers["France: OACI 2016"]);
      }
      var data = {map:{layer:val}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }
  });

  $("#GeneralSettings input, #GeneralSettings select").on('change', function(){
    var param = $(this).attr('name');
    var type = $(this).attr('type');
    var val = $(this).val();
    if(type == 'checkbox')
      val = $(this).is(':checked');
    if(type == 'number')
      val = parseInt(val);

    if(param == 'timezone'){
      efis.setTimezone(val);
      var data = {efis:{timezone:{offset:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'summer'){
      efis.setSummer(val);
      var data = {efis:{timezone:{summer:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'speedUnit'){
      $.get("settings.php", {get: null}, function(data){
        var S = JSON.parse(data);
        var mul = 1;
        if(val == 'kt')
          mul = 0.539957;
        efis.setVneSpeed(parseInt(S.efis.asi.speed.vne*mul));
        efis.setVnoSpeed(parseInt(S.efis.asi.speed.vno*mul));
        efis.setVfeSpeed(parseInt(S.efis.asi.speed.vfe*mul));
        efis.setVsoSpeed(parseInt(S.efis.asi.speed.vso*mul));
        efis.setVsSpeed(parseInt(S.efis.asi.speed.vs*mul));
        efis.redrawAsi();
      });
      Settings.general.unit.speed = val;
      var data = {general:{unit:{speed:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'elevationUnit'){
      var data = {general:{unit:{elevation:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'altitudeUnit'){
      Settings.general.unit.altitude = val;
      var data = {general:{unit:{altitude:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }

    if(param == 'distanceUnit'){
      var data = {general:{unit:{distance:val}}};
      $.get("settings.php", {set: JSON.stringify(data)});
    }
  });

  $("#qnhDecrease").on('click', function(e){
    var v = $("#qnhInput").val();
    v = parseInt(v)-1;
    $("#qnhInput").val(v).trigger("change");
  });

  $("#qnhIncrease").on('click', function(e){
    var v = $("#qnhInput").val();
    v = parseInt(v)+1;
    $("#qnhInput").val(v).trigger("change");
  });
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
  $.get("settings.php", {set: JSON.stringify(data)});
}

/*
* Executed on geolocation success
*/
function geo_success(position, force) {
  var _lat = position.lat;
  var _lng = position.lng;
  var _alt = position.alt;
  var _hdg = position.hdg;
  var _spd = position.spd;
  //_spd = Math.round(27.78); //100kmh
  _lastPosition = L.latLng(_lat, _lng);
  _lastCoord = position;
  force = (typeof force === "undefined") ? false : force; // force to update Plot
  aircraftMarker.setLatLng(_lastPosition);
  aircraftMarker.setHeading(_hdg);

  if(_saveLastPositionTimer == null) _saveLastPositionTimer = new Date().getTime();
  if( (new Date().getTime() - _saveLastPositionTimer > 1000*60) ){ //each 1 minute
    var data = {general:{lastposition:_lastPosition}};
    $.get("settings.php", {set: JSON.stringify(data)});
    _saveLastPositionTimer = new Date().getTime();
  }

  if(_gotoPositions.length != 0){
    var p = [_lastPosition];
    p = p.concat(_gotoPositions);
    gotoPath.setLatLngs(p);
    gotoPath.addTo(map);
    /* ETA computation */
    var nextWptDist = Math.round(p[0].distanceTo(p[1]))/1000;
    var nextWptETA = (nextWptDist/efis.getSpeed())*60;
    nextWptETA = Math.round(nextWptETA*10)/10;
    var totalDist = 0;
    var tmp = null;
    $.each(p, function(i, ll){
      if(tmp == null){
        tmp = ll;
        return;
      }
      totalDist += Math.round(ll.distanceTo(tmp))/1000;
      tmp = ll;
    });
    var spd = efis.getSpeed();

    if(spd < 5){
      efis.setETA("Infinity");
    }else{
      var totalETA = (totalDist/efis.getSpeed())*60;
      totalETA = Math.round(totalETA*10)/10;
      var gotoDurationStr = "";
      var totalSec = totalETA*60;
      var hh = parseInt(totalSec/3600)%24;
      var mm = parseInt(totalSec/60)%60;
      var ss = totalSec%60;
      gotoDurationStr += pad(hh)+":"+pad(mm)+":"+pad(ss);
      efis.setETA(gotoDurationStr);
    }
  }
  trackPath.addLatLng(_lastPosition);

  if(_followAircraft)
    map.panTo(_lastPosition, {animate: true, noMoveStart: true});

  var nextPoint = destSphere(_lat, _lng, _hdg, _spd > 5 ? _spd : 17);
  predictivePath.setLatLngs([_lastPosition, nextPoint]);
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

