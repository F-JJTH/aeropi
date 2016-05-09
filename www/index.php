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
  
  <link rel="stylesheet" href="leaflet.0.7.7.min.css" />
  <link href="style.css" rel="stylesheet" type="text/css">
  <link type="text/css" rel="stylesheet" href="instruments.css">
  <title>aeroPi</title>
</head>
<body>
  <ul id="top" class="dashboard">
    <li><a href="#">0</a></li>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
  </ul>
  
  <main>
    <div id="map"></div>
    <div id="instruments">
        <span id="attitude"></span>
        <span id="heading"></span>
        <span id="variometer"></span>
        <!--<span id="airspeed"></span>-->
        <span id="altimeter"></span>
    </div>
  </main>

  <ul id="bottom" class="dashboard">
    <li><a href="#">6</a></li>
    <li><a href="#">7</a></li>
    <li><a href="#">8</a></li>
    <li><a href="#">9</a></li>
    <li><a href="#">10</a></li>
    <li><a href="#">11</a></li>
  </ul>
</body>
</html>


<script src="js/aeropi.js" type="text/javascript"></script>
<script type="text/javascript">
var hostname = window.location.hostname;
var instruments = new Instruments();

// Flight indicators
var indicators = {
  attitude: $.flightIndicator('#attitude', 'attitude'),
  heading : $.flightIndicator('#heading', 'heading'),
  variometer: $.flightIndicator('#variometer', 'variometer'),
  airspeed: $.flightIndicator('#airspeed', 'airspeed'),
  altimeter:  $.flightIndicator('#altimeter', 'altimeter')
}

var gpsSocket = new WebSocket("ws://"+hostname+":7001",'json');
gpsSocket.onmessage = function (e) {
  var data = JSON.parse(e.data);
  instruments.update(data, indicators);
  geo_success(data);
};

var imuSocket = new WebSocket("ws://"+hostname+":7000", 'json');
imuSocket.onmessage = function (e) {
  instruments.update(JSON.parse(e.data), indicators);
};

</script>
