Hello world!


<script type="text/javascript">



var ws = new WebSocket("ws://192.168.0.27:7001",'json');
ws.onopen = function () {
  ws.send('Hello, Server!!'); //send a message to server once connection is opened.
};
ws.onerror = function (error) {
  console.log('Error Logged: ' + error); //log errors
};
ws.onmessage = function (e) {
  console.log('Received From Server: ' + e.data); //log the received message
};
</script>
