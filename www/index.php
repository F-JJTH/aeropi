<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="description" content="aeroPi" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="format-detection" content="telephone=no">
  <!-- jQuery Core -->
  <script src="js/jquery.1.11.2.min.js"></script>
  <script src="js/jqueryui.1.11.2.min.js"></script>
  <script src="js/jquery.flightindicators.js"></script>  
  <script src="js/leaflet.0.7.7.min.js"></script>
  <script src="js/Marker-Control.js"></script>

  <link rel="stylesheet" type="text/css" href="style.css">
  <link rel="stylesheet" type="text/css" href="instruments.css">
  <link rel="stylesheet" type="text/css" href="leaflet.0.7.7.min.css" />
  <title>aeroPi</title>
</head>
<body>
  <div id="map"></div>
  <svg id="efis"/>
  <div id="toolbar">
    <button id="settings"><span>Param</span></button>
    <button id="leaflet-center-map"><img src="img/followAircraft.svg"></button>
    <button id="leaflet-zoom-in"><img src="img/zoom-in.png"></button>
    <button id="leaflet-zoom-out"><img src="img/zoom-out.png"></button>
  </div>
</body>
</html>


<script src="js/aeropi.js" type="text/javascript"></script>
<script src="js/aeropi.efis.js" type="text/javascript"></script>
<script type="text/javascript">
var hostname = window.location.hostname;


var efis = new Efis("efis", {
  /*general:{
    width:  400,
    height: 480,
  },*/
  asi:{
    aspectRatio: 4,
    speeds:{
      vne: 260,
      vno: 170,
      vfe: 110,
      vso: 65,
      vs:  90,
    },
  },
  alt:{
    maxAlt:  25000,
    aspectRatio: 5,
  },
});

//var instruments = new Instruments();

// Flight indicators
//var indicators = {
//  attitude: $.flightIndicator('#attitude', 'attitude'),
  /*heading : $.flightIndicator('#heading', 'heading'),
  variometer: $.flightIndicator('#variometer', 'variometer'),
  airspeed: $.flightIndicator('#airspeed', 'airspeed'),
  altimeter: $.flightIndicator('#altimeter', 'altimeter')*/
//}

$('#leaflet-zoom-in').on('click', function(){
  map.zoomIn();
});

$('#leaflet-zoom-out').on('click', function(){
  map.zoomOut();
});

$('#leaflet-center-map').on('click', function(){
  _followAircraft = true;
  if(_lastPosition != null)
    map.panTo(_lastPosition, {animate: true, noMoveStart: true});
});

$('#efis').on('click', function(){
  $("#horizon").css("z-index", 0);
  $("#toolbar").css("z-index", 11);
  $("#map").css("z-index", 11);
  $("div.leaflet-control-layers").css("z-index", 11);
});

map.on('click', function(){
  $("#efis").css("z-index", 10);
  $("#toolbar").css("z-index", 0);
  $("#map").css("z-index", 0);
  $("div.leaflet-control-layers").css("z-index", 0);
});


var ws = new WebSocket("ws://"+hostname+":7700",'json');
ws.onmessage = function (e) {
  var data = JSON.parse(e.data);
  if(data.IMU){
    data = data.IMU;
    //$('#qnh span.val').html(data.pressure);
    //instruments.update(data, indicators);
    efis.setAttitude({roll:data.bank, pitch:data.pitch-90});
  }
  if(data.GPS){
    data = data.GPS;
    //$('#gs span.val').html(data.spd);
    //$('#hdg span.val').html(data.hdg);
    //$('#vs span.val').html(data.vs);
    //$('#alt span.val').html(data.alt);
    efis.setAltitude(data.alt);
    efis.setSpeed(data.spd);
    geo_success(data);
  }
};
</script>
