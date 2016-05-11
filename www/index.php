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
    <button><span>Param</span></button>
    <button id="leaflet-center-map"><span>Center map</span></button>
    <button id="leaflet-zoom-in"><img src="img/zoom-in.png"></button>
    <button id="leaflet-zoom-out"><img src="img/zoom-out.png"></button>
  </div>






  <!--<ul id="top" class="dashboard">
    <li><a href="#">0</a></li>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
  </ul>-->
  
  <main>

  </main>

  <!--<ul id="bottom" class="dashboard">
    <li><a href="#">6</a></li>
    <li><a href="#">7</a></li>
    <li><a href="#">8</a></li>
    <li><a href="#">9</a></li>
    <li><a href="#">10</a></li>
    <li><a href="#">11</a></li>
  </ul>-->
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


var gpsSocket = new WebSocket("ws://"+hostname+":7700",'json');
gpsSocket.onmessage = function (e) {
  var data = JSON.parse(e.data);
  //instruments.update(data, indicators);
  $('#alt span.val').html(data.alt);
  $('#gs span.val').html(data.spd);
  $('#hdg span.val').html(data.hdg);
  $('#vs span.val').html(data.vs);
  geo_success(data);
};

var imuSocket = new WebSocket("ws://"+hostname+":7000", 'json');
imuSocket.onmessage = function (e) {
  var data = JSON.parse(e.data);
  $('#qnh span.val').html(data.altMb);
  instruments.update(data, indicators);
};

</script>
