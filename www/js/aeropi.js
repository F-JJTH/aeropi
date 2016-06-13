

var baseLayers = {
	"France: OACI 2016" : new L.TileLayer('maps/oaci_fr_2016/{z}/{x}/{y}.jpg', {
		minZoom : 4,
		maxZoom : 13,
		maxNativeZoom : 11,
		attribution : 'Map data © <a href="http://ign.fr/">IGN</a>',
		bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
	}),
	"France: Cartabossy 2015" : new L.TileLayer('maps/cartabossy/{z}/{x}/{y}.png', {
		minZoom : 4,
		maxZoom : 13,
		maxNativeZoom : 10,
		attribution : 'Map data © <a href="http://cartabossy.com/">Cartabossy</a>',
		bounds: L.latLngBounds(L.latLng(41.0,-5.3), L.latLng(51.2,10.1) ),
	}),
};

var overlays = {
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


/*
var DefaultSettings = {
	map: {
		display: {
			asi: true,
			alt: true,
			hdg: true,
		},
		layers: {
			active: 0,
		},
	},
	efis: {
		width: $(window).width(),
		height: $(window).height(),
		asi:{
			tickspacing: 5, // distance between markers
			speed: {
				vne: 0, // never exceed speed (end of orange ruban + red line)
				vno: 0, // max cruise speed (end of green ruban + start of orange ruban)
				vfe: 0, // max speed with flaps extended (end of white ruban)
				vso: 0, // stall speed with flaps extended (start of white ruban)
				vs: 0,  // stall speed with flaps retracted (start of green ruban)
			},
			color: {
				vne: "red",
				caution: "orange",
				normal: "green",
				flaps: "white",
			},
		},
		alt:{
			tickspacing: 8, // distance between markers
			maxalt: 25000,    // maximum altitude marker
		},
		ai:{
			color:{
				ground: "#BF8144", // color of the ground AI
				sky: "#4C78A9",    // color of the sky AI
			},
		},
		compass:{},
		attitude:{
			pitchoffset: 0, // offset of the pitch AI
			rolloffset: 0,  // offset of the roll AI
		},
	},
};


//$.get("settings.php", {set: JSON.stringify(DefaultsSettings)});

$.get("settings.php", {get: null}, function(data){
  console.log( JSON.parse(data) );
});
*/



var _followAircraft = true;
var _lastCoord = null;
var _gotoPositions = [];
var _defaultPosition = new L.latLng(44, 5);
var _lastPosition = _defaultPosition;
var _locationListener = null;
var _plot = null;
var _timer = null;
var _pauseTimer = false;


var fsControl       = new L.fullscreenControl(); // Defined by Control.js
var followAircraft  = new L.followControl(); // Defined by Control.js
var nextControl     = new L.nextControl();
var clearControl    = new L.clearControl();
var predictivePath  = new L.polyline(_defaultPosition);
var gotoPath        = new L.polyline(_defaultPosition, {color: '#00ff00', opacity: 0.8});
var trackPath       = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4});
var trackPathHist   = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4, clickable: false});
var aircraftMarker  = new L.aircraftMarker(_defaultPosition); // Defined by Marker.js
var plotHoverMarker = new L.circleMarker(_defaultPosition, {color: '#ff0000', radius: 5});


var controlLayers = L.control.externLayers(baseLayers, overlays);
//var controlLayers = L.control.layers(baseLayers, overlays);

var hostname = window.location.hostname;


$(document).ready(function() {

$('#settingsDialog').popup({
  afterclose: function(e, ui){
  console.log('resize');
    window.dispatchEvent(new Event('resize'));
  }
});

	/*
	 * Initialize map
	 */
	map = new L.Map('map', {
		center : [44, 5],
		zoom : 10,
		minZoom: 4,
		maxZoom: 16,
		zoomControl: false,
		attributionControl: false,
	});

	$.get("settings.php", {get: null}, function(data){
		Settings = JSON.parse(data);
		
		$("#speedTickSpacing").val(Settings.efis.asi.tickspacing).slider("refresh");
//		$("#speedTickSpacing").slider("refresh");
		$("#altitudeTickSpacing").val(Settings.efis.alt.tickspacing).slider("refresh");
//		$("#altitudeTickSpacing").slider("refresh");
		$("#vne").val(Settings.efis.asi.speed.vne);
		$("#vno").val(Settings.efis.asi.speed.vno);
		$("#vfe").val(Settings.efis.asi.speed.vfe);
		$("#vso").val(Settings.efis.asi.speed.vso);
		$("#vs").val(Settings.efis.asi.speed.vs);
		$("#altitudeInMapView").prop("checked", Settings.map.display.alt).checkboxradio("refresh");
		$("#speedInMapView").prop("checked", Settings.map.display.asi).checkboxradio("refresh");
		$("#compassInMapView").prop("checked", Settings.map.display.hdg).checkboxradio("refresh");
		$("#vacLndInMapView").prop("checked", Settings.map.overlays.vac.lnd).checkboxradio("refresh");
		$("#vacAppInMapView").prop("checked", Settings.map.overlays.vac.app).checkboxradio("refresh");
		$("input:radio[name=layerInMapView]").filter("[value="+Settings.map.layer+"]").prop("checked", true).checkboxradio("refresh");

		efis = $("#efis").efis(Settings.efis);
		
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

		var ws = new WebSocket("ws://"+hostname+":7700");
		ws.onmessage = function (e) {
			var data = JSON.parse(e.data);
			if(data.IMU){
				data = data.IMU;
				//efis.setPressure(data.pressure);
				//instruments.update(data, indicators);
				efis.setAttitude({roll:data.roll, pitch:data.pitch});
				efis.setSlip(data.accel[0]);
				//efis.setHeading(data.heading);
			}
			if(data.GPS){
				data = data.GPS;
				efis.setClock(data.time);
				efis.setPosition({"lat":data.lat, "lon":data.lon});
				efis.setPressure(data.pressure);
				efis.setAltitude(data.alt);
				efis.setSpeed(data.spd);
				efis.setHeading(data.hdg);
				geo_success(data);
			}
		};
		
		$('#ai').on('click', function(){
			$("#ai").css("visibility", "hidden");
			$("#ts").css("visibility", "hidden");
			$("#map").css("visibility", "visible");
		});
	});
	
	setTimeout(function(){
		// Because leafletjs seems to require it
		window.dispatchEvent(new Event('resize'));
	}, 2000);


	/*
	 * Attach feature to the map
	 */
	if(hostname != "localhost" && hostname != "127.0.0.1")
		fsControl.addTo(map); // Defined by Control.js
	followAircraft.addTo(map); // Defined by Control.js
	predictivePath.addTo(map);
	gotoPath.addTo(map);
	trackPath.addTo(map);
	aircraftMarker.addTo(map); // Defined by Marker.js


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
		if(!map.hasClearControl)
			clearControl.addTo(map);

		_gotoPositions.push(e.latlng);
		if(_gotoPositions.length > 1 && !map.hasNextControl)
			nextControl.addTo(map);

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
		//var settings = efis.getSettings();
		var data = {efis: {asi: {tickspacing: v/*settings.asi.tickspacing*/}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});


	$('#altitudeTickSpacing').change(function(){
		var v = parseInt( $(this).val() );
		efis.setAltitudeTickSpacing(v);
		efis.redrawAlt();
		var settings = efis.getSettings();
		var data = {efis:{alt:{tickspacing: v/*settings.alt*/}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});
	

	$('#vne').change(function(){
		var v = parseInt( $(this).val() );
		efis.setVneSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {efis:{asi:{speed:{vne:v}}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});
	
	$('#vno').change(function(){
		var v = parseInt( $(this).val() );
		efis.setVnoSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {efis:{asi:{speed:{vno:v}}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});
	
	$('#vfe').change(function(){
		var v = parseInt( $(this).val() );
		efis.setVfeSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {efis:{asi:{speed:{vfe:v}}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});
	
	$('#vso').change(function(){
		var v = parseInt( $(this).val() );
		efis.setVsoSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {efis:{asi:{speed:{vso:v}}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});


	$('#vs').change(function(){
		var v = parseInt( $(this).val() );
		efis.setVsSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {efis:{asi:{speed:{vs:v}}}};
		$.get("settings.php", {set: JSON.stringify(data)});
	});
	
	$('.exec-cmd').on('click', function(){
	  var url = $(this).attr("href");
	  $.get(url);
	});


	$("#MapSettings input").on('change', function(){
		var param = $(this).attr('name');
		var type = $(this).attr('type');
		var val = 0;

		if(type == 'checkbox')
			val = $(this).is(':checked');
		if(type == 'radio')
		    val = $(this).val();
	
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
});






function calibrateEfis(){
	var attitude = efis.getAttitude();
	efis.setCalibration(attitude);
	Settings.efis.attitude.pitchoffset = attitude.pitch;
	Settings.efis.attitude.rolloffset = attitude.roll;

	var data = {
		efis:{
			attitude:{
				pitchoffset: attitude.pitch,
				rolloffset: attitude.roll,
			}
		}
	};
	$.get("settings.php", {set: JSON.stringify(data)});
}
















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

	if(_gotoPositions.length != 0){
		var p = new Array(_lastPosition);
		p = p.concat(_gotoPositions);
		gotoPath.setLatLngs(p);
		gotoPath.addTo(map);
	}

	trackPath.addLatLng(_lastPosition);

	if(_followAircraft)
	map.panTo(_lastPosition, {animate: true, noMoveStart: true});

	var nextPoint = destSphere(_lat, _lon, _hdg, _spd > 5 ? _spd : 17);
	predictivePath.setLatLngs([_lastPosition, nextPoint]);
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










//var instruments = new Instruments();
// Flight indicators
//var indicators = {
//  attitude: $.flightIndicator('#attitude', 'attitude'),
/*heading : $.flightIndicator('#heading', 'heading'),
variometer: $.flightIndicator('#variometer', 'variometer'),
airspeed: $.flightIndicator('#airspeed', 'airspeed'),
altimeter: $.flightIndicator('#altimeter', 'altimeter')*/
//}
