

var baseLayers = {
  "France: Cartabossy" : new L.TileLayer('maps/cartabossy/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 13,
    maxNativeZoom : 10,
    attribution : 'Map data © <a href="http://cartabossy.com/">Cartabossy</a>',
    bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
  }),
  "France: OACI 2016" : new L.TileLayer('maps/oaci_fr_2016/{z}/{x}/{y}.jpg', {
    minZoom : 4,
    maxZoom : 13,
    maxNativeZoom : 11,
    attribution : 'Map data © <a href="http://ign.fr/">IGN</a>',
    bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
  }),
};

var overLayers = {
  "France: VAC Approach" : new L.TileLayer('maps/approach_fr/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 15,
    maxNativeZoom: 12,
    tms: true,
    attribution: 'Map data © <a href="foxhotel.hd.free.fr">OpenFlightMap</a>',
  }),
  "France: VAC Landing" : new L.TileLayer('maps/landing_fr/{z}/{x}/{y}.png', {
    minZoom : 4,
    maxZoom : 16,
    maxNativeZoom : 14,
    tms: true,
    attribution: 'Map data © <a href="foxhotel.hd.free.fr">OpenFlightMap</a>',
  }),
};

//var controlLayers = L.control.externLayers(baseLayers, overLayers);


/*
 * Executed on geolocation success
 */

function geo_success(position, force) {
  var _lat = position.lat;
  var _lon = position.lon;
  var _alt = position.alt;
  var _hdg = position.hdg;
  var _spd = position.spd;
  //_spd = Math.round(27.78); //100kmh
  _lastPosition = new L.LatLng(_lat, _lon);
  _lastCoord = position;
  force = (typeof force === "undefined") ? false : force; // force to update Plot

  aircraftMarker.setLatLng(_lastPosition);
  aircraftMarker.setHeading(_hdg);
  //accuracyCircle.setLatLng(_lastPosition);
  //accuracyCircle.setRadius(position.coords.accuracy/2);

  if(_gotoPositions.length != 0){
    var p = new Array(_lastPosition);
    p = p.concat(_gotoPositions);
    gotoPath.setLatLngs(p);
    gotoPath.addTo(map);
/*
    if(Options.get("goto-enabled")){
      var gotoLength = 0;
      var tmp = null;
      $.each(p, function(i, ll){
        if(tmp == null){
          tmp = ll;
          return;
        }
        gotoLength += Math.round(ll.distanceTo(tmp))/1000;
        tmp = ll; 
      });
      var gotoDuration = Math.round( (gotoLength/(_spd*3.6))*60 );

      var gotoDurationStr = "";
      var hr = Math.floor(gotoDuration/60);
      var mn = gotoDuration%60;

      if(hr != Infinity){
        if(hr > 0)
          gotoDurationStr += hr+"\u00A0h\u00A0";
        gotoDurationStr += mn+"\u00A0min";
      }else{
        gotoDurationStr += "Infinity";
      }

      if(!Options.get("distance-unit"))
        gotoLength = gotoLength * 0.539957;

      var unit = Options.get("distance-unit") ? "Km" : "Nm";
      var li = document.createElement("li");
      li.appendChild(document.createTextNode("GoTo"));
      li.appendChild(document.createElement("br"));
      li.appendChild(document.createTextNode("Distance:\u00A0"+gotoLength.toFixed(1)+"\u00A0"+unit) );
      li.appendChild(document.createTextNode(" | Time:\u00A0"+gotoDurationStr));
      ul.appendChild(li);
    }*/
  }

  trackPath.addLatLng(_lastPosition);

  if(_followAircraft)
    map.panTo(_lastPosition, {animate: true, noMoveStart: true});

  var nextPoint = destSphere(_lat, _lon, _hdg, _spd > 5 ? _spd : 17);
  predictivePath.setLatLngs([_lastPosition, nextPoint]);
  //updatePlot(predictivePath,  _spd > 25 ? _spd : 17, _alt, force);
}

/*
 * Executed on geolocation failure
 */

function geo_error(){
  alert("Sorry, no position available.");
}

/*
 * Compute predictive point given position, bearing and distance
 */

function destSphere(lat1, lon1, brg, spd) {
  var R    = 6372.7976; // Earth radius
  var dist = (spd*0.3)/R; // 5 minutes
  var lat1 = lat1*Math.PI/180;
  var lon1 = lon1*Math.PI/180;
  var brg  = brg*Math.PI/180;
  var lat  = Math.asin(Math.sin(lat1)*Math.cos(dist) + Math.cos(lat1)*Math.sin(dist)*Math.cos(brg));
  var lon  = lon1 + Math.atan2(Math.sin(brg)*Math.sin(dist)*Math.cos(lat1), Math.cos(dist)-Math.sin(lat1)*Math.sin(lat));
  return new L.latLng(lat*180/Math.PI, lon*180/Math.PI);
}


/*******************************************************************************************
 ****************************************** Main *******************************************
 *******************************************************************************************/

var _followAircraft = true;
var _lastCoord = null;
var _gotoPositions = [];
var _defaultPosition = new L.latLng(44, 5);
var _lastPosition = _defaultPosition;
var _locationListener = null;
var _plot = null;
var _timer = null;
var _pauseTimer = false;

/*
 * Initialize map
 */
var map = new L.Map('map', {
    center : [44, 5],
    zoom : 10,
    minZoom: 4,
    maxZoom: 16,
    layers: baseLayers['France: OACI 2016'],
    zoomControl: false,
    attributionControl: true,
});

/*
 * Attach feature to the map
 */

//var menuControl    = new L.menuControl().addTo(map); // Defined by Control.js
//var fsControl      = new L.fullscreenControl().addTo(map); // Defined by Control.js
//var followAircraft = new L.followControl().addTo(map); // Defined by Control.js
//var recControl     = new L.recControl().addTo(map); // Defined by Control.js
var nextControl    = new L.nextControl();
var clearControl   = new L.clearControl();
var predictivePath = new L.polyline(_defaultPosition).addTo(map);
var gotoPath       = new L.polyline(_defaultPosition, {color: '#00ff00', opacity: 0.8}).addTo(map);
var trackPath      = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4}).addTo(map);
var trackPathHist  = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4, clickable: false});
//var accuracyCircle = new L.circle(_defaultPosition, 50).addTo(map);
var aircraftMarker = new L.aircraftMarker(_defaultPosition).addTo(map); // Defined by Marker.js
var plotHoverMarker = new L.circleMarker(_defaultPosition, {color: '#ff0000', radius: 5});
//var controlLayers = new L.control.layers(baseLayers, overLayers).addTo(map);


aircraftMarker.on('click', function(e) {
  _followAircraft = true;
  if(_lastPosition != null)
    map.panTo(_lastPosition, {animate: true, noMoveStart: true});
});

map.on('dragstart', function(e) {
  _followAircraft = false;
});

map.on('contextmenu', function(e) {
  if(!map.hasClearControl)
    clearControl.addTo(map);

  _gotoPositions.push(e.latlng);
  if(_gotoPositions.length > 1 && !map.hasNextControl)
    nextControl.addTo(map);

  geo_success(_lastCoord);
});
