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
  <script src="js/jquery.2.2.4.min.js"></script>
  <script src="js/jquery-ui.1.11.4.min.js"></script>
  <!--<script src="js/jquery.flightindicators.js"></script>-->
  <script src="js/leaflet.0.7.7.min.js"></script>
  <script src="js/Marker-Control.js"></script>
  <script src="js/jquery.efis.js"></script>

  <link rel="stylesheet" type="text/css" href="style.css"></link>
  <link rel="stylesheet" type="text/css" href="instruments.css"></link>
  <link rel="stylesheet" type="text/css" href="leaflet.0.7.7.min.css"></link>
  <link rel="stylesheet" type="text/css" href="js/jquery-ui.1.11.4.min.css"></link>
  <title>aeroPi</title>
</head>
<body>
  <div id="map"></div>
  <!--<svg id="efis"/>-->
  <div id="efis"></div>
</body>
</html>


<script src="js/aeropi.js" type="text/javascript"></script>
<script type="text/javascript">
var hostname = window.location.hostname;

var options = {
  asi:{
    ladderSpacing: 4,
    speed:{
      vne: 260,
      vno: 170,
      vfe: 110,
      vso: 65,
      vs:  90,
    },
  },
  alt:{
    maxAlt:  25000,
    ladderSpacing: 8,
  },
};

var efis = $("#efis").efis(options);

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
  $("#ai").css("z-index", 0);
  $("#ts").css("z-index", 0);
  $("#asi").css("z-index", 12);
  $("#alt").css("z-index", 12);
  $("#hdg").css("z-index", 12);
  //$("#toolbar").css("z-index", 11);
  $("#map").css("z-index", 11);
  $("div.leaflet-control-layers").css("z-index", 11);
});

map.on('click', function(){
  $("#ai").css("z-index", 10);
  $("#ts").css("z-index", 12);
  $("#asi").css("z-index", 12);
  $("#alt").css("z-index", 12);
  $("#hdg").css("z-index", 12);
  //$("#toolbar").css("z-index", 0);
  $("#map").css("z-index", 0);
  $("div.leaflet-control-layers").css("z-index", 0);
});

var ws = new WebSocket("ws://"+hostname+":7700",'json');
ws.onmessage = function (e) {
  var data = JSON.parse(e.data);
  if(data.IMU){
    data = data.IMU;
    efis.setPressure(data.pressure);
    //instruments.update(data, indicators);
    efis.setAttitude({roll:data.bank, pitch:data.pitch-90});
    //efis.setSlip(data.slip);
  }
  if(data.GPS){
    data = data.GPS;
    efis.setAltitude(data.alt);
    efis.setSpeed(data.spd);
    efis.setHeading(data.hdg);
    geo_success(data);
  }
};
</script>
