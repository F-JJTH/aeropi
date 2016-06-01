


var _followAircraft = true;
var _lastCoord = null;
var _gotoPositions = [];
var _defaultPosition = new L.latLng(44, 5);
var _lastPosition = _defaultPosition;
var _locationListener = null;
var _plot = null;
var _timer = null;
var _pauseTimer = false;


//var fsControl       = new L.fullscreenControl(); // Defined by Control.js
//var followAircraft  = new L.followControl(); // Defined by Control.js
//var controlLayers   = new L.control.layers(baseLayers, overLayers);
var nextControl     = new L.nextControl();
var clearControl    = new L.clearControl();
var predictivePath  = new L.polyline(_defaultPosition);
var gotoPath        = new L.polyline(_defaultPosition, {color: '#00ff00', opacity: 0.8});
var trackPath       = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4});
var trackPathHist   = new L.polyline(_defaultPosition, {color: '#ff0000', opacity: 0.4, clickable: false});
var aircraftMarker  = new L.aircraftMarker(_defaultPosition); // Defined by Marker.js
var plotHoverMarker = new L.circleMarker(_defaultPosition, {color: '#ff0000', radius: 5});




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









$(document).ready(function() {
	$.get("config.php", {get: null}, function(data){
		ConfigFile = JSON.parse(data);
		
		$("#speedTickSpacing").val(ConfigFile.asi.tickspacing);
		$("#speedTickSpacing").slider("refresh");
		$("#altitudeTickSpacing").val(ConfigFile.alt.tickspacing);
		$("#altitudeTickSpacing").slider("refresh");
		$("#vne").val(ConfigFile.asi.vne);
		$("#vno").val(ConfigFile.asi.vno);
		$("#vfe").val(ConfigFile.asi.vfe);
		$("#vso").val(ConfigFile.asi.vso);
		$("#vs").val(ConfigFile.asi.vs);

		var options = {
			asi:{
				tickspacing: ConfigFile.asi.tickspacing,
				speed:{
					vne: ConfigFile.asi.vne,
					vno: ConfigFile.asi.vno,
					vfe: ConfigFile.asi.vfe,
					vso: ConfigFile.asi.vso,
					vs:  ConfigFile.asi.vs,
				},
			},
			alt:{
				maxAlt:  ConfigFile.alt.maxaltitude,
				tickspacing: ConfigFile.alt.tickspacing,
			},
			attitude:{
				pitchoffset: ConfigFile.attitude.pitchoffset,
				rolloffset: ConfigFile.attitude.rolloffset,
			},
		};

		efis = $("#efis").efis(options);

		var ws = new WebSocket("ws://"+window.location.hostname+":7700");
		ws.onmessage = function (e) {
			var data = JSON.parse(e.data);
			if(data.IMU){
				data = data.IMU;
				efis.setPressure(data.pressure);
				//instruments.update(data, indicators);
				efis.setAttitude({roll:data.roll, pitch:data.pitch});
				//efis.setSlip(data.accel[0]);
				//efis.setHeading(data.heading);
			}
			if(data.GPS){
				data = data.GPS;
				efis.setAltitude(data.alt);
				efis.setSpeed(data.spd);
				efis.setHeading(data.hdg);
				geo_success(data);
			}
		};
		
		
	});
	
	
	/*
	* Initialize map
	*/
	map = new L.Map('map', {
		center : [44, 5],
		zoom : 10,
		minZoom: 4,
		maxZoom: 16,
		layers: baseLayers['France: OACI 2016'],
		zoomControl: false,
		attributionControl: true,
	});
	
	setTimeout(function(){
		// Because leafletjs seems to require it
		window.dispatchEvent(new Event('resize')); 
	}, 500);


	/*
	* Attach feature to the map
	*/
	//fsControl.addTo(map); // Defined by Control.js
	//followAircraft.addTo(map); // Defined by Control.js
	predictivePath.addTo(map);
	gotoPath.addTo(map);
	trackPath.addTo(map);
	aircraftMarker.addTo(map); // Defined by Marker.js
	//controlLayers.addTo(map);




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

	$('#efis').on('click', function(){
		$("#ai").css("visibility", "hidden");
		$("#ts").css("visibility", "hidden");
		/*$("#asi").css("z-index", 12);
		$("#alt").css("z-index", 12);
		$("#hdg").css("z-index", 12);*/
		//$("#toolbar").css("z-index", 11);
		$("#map").css("visibility", "visible");
		//$("div.leaflet-control-layers").css("z-index", 11);
	});

	map.on('click', function(){
		$("#ai").css("visibility", "visible");
		$("#ts").css("visibility", "visible");
		/*$("#asi").css("z-index", 12);
		$("#alt").css("z-index", 12);
		$("#hdg").css("z-index", 12);*/
		//$("#toolbar").css("z-index", 0);
		$("#map").css("visibility", "hidden");
		//$("div.leaflet-control-layers").css("z-index", 0);
	});


	$('#speedTickSpacing').change(function(){
		var v = $(this).val();
		efis.setSpeedTickSpacing(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});


	$('#altitudeTickSpacing').change(function(){
		var v = $(this).val();
		efis.setAltitudeTickSpacing(v);
		efis.redrawAlt();
		var settings = efis.getSettings();
		var data = {"alt": settings.alt};
		$.get("config.php", {set: JSON.stringify(data)});
	});
	

	$('#vne').change(function(){
		var v = $(this).val();
		efis.setVneSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});
	
	$('#vno').change(function(){
		var v = $(this).val();
		efis.setVnoSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});
	
	$('#vfe').change(function(){
		var v = $(this).val();
		efis.setVfeSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});
	
	$('#vso').change(function(){
		var v = $(this).val();
		efis.setVsoSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});


	$('#vs').change(function(){
		var v = $(this).val();
		efis.setVsSpeed(v);
		efis.redrawAsi();
		var settings = efis.getSettings();
		var data = {"asi": {
				"tickspacing": settings.asi.tickspacing,
				"vne" : settings.asi.speed.vne,
				"vno" : settings.asi.speed.vno,
				"vfe" : settings.asi.speed.vfe,
				"vso" : settings.asi.speed.vso,
				"vs" : settings.asi.speed.vs,
			}
		};
		$.get("config.php", {set: JSON.stringify(data)});
	});
});






function calibrateEfis(){
	var attitude = efis.getAttitude();
	efis.setCalibration(attitude);
	ConfigFile.attitude.pitchoffset = attitude.pitch;
	ConfigFile.attitude.rolloffset = attitude.roll;

	var data = {
		"attitude":{
			"pitchoffset": attitude.pitch,
			"rolloffset": attitude.roll,
		}
	};

	$.get("config.php", {set: JSON.stringify(data)});
}







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
