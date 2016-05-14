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
  <div id="info">
    <div id="instruments">
      <span id="attitude"></span>
      <!--<span id="heading"></span>
      <span id="variometer"></span>
      <span id="airspeed"></span>
      <span id="altimeter"></span>-->
    </div>
    <ul id="textual">
      <li class="text-instrument" id="alt">ALT: <span class="val">0000</span> ft</li>
      <li class="text-instrument" id="qnh">QNH: <span class="val">0000</span> Mb</li>
      <li class="text-instrument" id="gs">GS:  <span class="val">0000</span> kmh</li>
      <li class="text-instrument" id="hdg">HDG: <span class="val">0000</span> °</li>
      <li class="text-instrument" id="vs" >VS:  <span class="val">0000</span> ft/min</li>
    </ul>
  </div>
  <div id="toolbar">
    <button id="settings"><span>Param</span></button>
    <button id="leaflet-center-map"><img src="img/followAircraft.svg"></button>
    <button id="leaflet-zoom-in"><img src="img/zoom-in.png"></button>
    <button id="leaflet-zoom-out"><img src="img/zoom-out.png"></button>
  </div>
</body>
</html>


<script src="js/aeropi.js" type="text/javascript"></script>
<script type="text/javascript">
var hostname = window.location.hostname;
var instruments = new Instruments();

// Flight indicators
var indicators = {
  attitude: $.flightIndicator('#attitude', 'attitude'),
  /*heading : $.flightIndicator('#heading', 'heading'),
  variometer: $.flightIndicator('#variometer', 'variometer'),
  airspeed: $.flightIndicator('#airspeed', 'airspeed'),
  altimeter: $.flightIndicator('#altimeter', 'altimeter')*/
}

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

$('#attitude').on('click', function(){
  indicators.attitude.calibrate();
});


var ws = new WebSocket("ws://"+hostname+":7700",'json');
ws.onmessage = function (e) {
  var data = JSON.parse(e.data);
  //instruments.update(data, indicators);
  if(data.IMU){
    data = data.IMU;
    $('#gs span.val').html(data.spd);
    $('#hdg span.val').html(data.hdg);
    $('#vs span.val').html(data.vs);
    $('#qnh span.val').html(data.pressure);
    instruments.update(data, indicators);
  }
  if(data.GPS){
    data = data.GPS;
    $('#alt span.val').html(data.alt);
    geo_success(data);
  }
};
</script>
