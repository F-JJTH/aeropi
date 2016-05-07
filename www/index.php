Hello world!


<script type="text/javascript">

var hostname = window.location.hostname;
console.log(hostname);

var gpsSocket = new WebSocket("ws://"+hostname+":7001",'json');
gpsSocket.onopen = function () {
  gpsSocket.send('Hello, Server!!'); //send a message to server once connection is opened.
};
gpsSocket.onerror = function (error) {
  console.log('GPS error: ' + error); //log errors
};
gpsSocket.onmessage = function (e) {
  console.log('GPS: ' + e.data); //log the received message
};

var imuSocket = new WebSocket("ws://"+hostname+":7000", 'json');
imuSocket.onopen = function () {
  imuSocket.send('Hello, Server!!');
};
imuSocket.onerror = function (error) {
  console.log('imu error: ' + error);
};
imuSocket.onmessage = function (e) {
  console.log('IMU: ' + e.data);
};
</script>
