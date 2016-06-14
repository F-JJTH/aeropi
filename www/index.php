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
  <script src="js/jquery.1.11.3.min.js"></script>
  <!--<script src="js/jquery-ui.1.11.4.min.js"></script>-->
  <script src="js/jquery.mobile-1.4.5.min.js"></script>
  <!--<script src="js/jquery.flightindicators.js"></script>-->
  <script src="js/leaflet.0.7.7.min.js"></script>
  <script src="js/Marker-Control.js"></script>
  <script src="js/jquery.efis.js"></script>
  <script src="js/aeropi.js"></script>

  <link rel="stylesheet" type="text/css" href="instruments.css"></link>
  <link rel="stylesheet" type="text/css" href="leaflet.0.7.7.min.css"></link>
  <!--<link rel="stylesheet" type="text/css" href="js/jquery-ui.1.11.4.min.css"></link>-->
  <link rel="stylesheet" type="text/css" href="js/jquery.mobile-1.4.5.min.css"></link>
  <link rel="stylesheet" type="text/css" href="style.css"></link>
  <title>aeroPi</title>
</head>
<body>

  <div data-role="popup" data-dismissible="false" id="settingsQnh">
    <div data-role="header" data-theme="a"><h2>QNH settings</h2></div>
    <div role="main">
      <table>
        <tr>
          <td><button id="qnhDecrease">-</button></td>
          <td><input type="text" id="qnhInput" name="qnhInput" min="950" max="1030" disabled style="width:116px; text-align:center; font-size:24px;"></td>
          <td><button id="qnhIncrease">+</button></td>
        </tr>
      </table>
	    <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b">Ok</a>
    </div>
  </div>


  <a href="#settingsDialog" id="settingsIcon" data-rel="popup" data-position-to="window" class="ui-btn ui-icon-gear ui-corner-all ui-nodisc-icon ui-btn-b ui-btn-icon-left ui-shadow ui-btn-icon-notext" data-transition="pop"></a>
  <div data-role="popup" data-dismissible="false" id="settingsDialog">
    <div data-role="header" data-theme="a"><h2>Settings</h2></div>

    <div role="main">
      <div data-role="tabs" id="tabsSettings">
        <div data-role="navbar">
          <ul>
            <li><a href="#GeneralSettings" data-ajax="false">General</a></li>
            <li><a href="#MapSettings" data-ajax="false">Map</a></li>
            <li><a href="#EfisSettings" data-ajax="false">Efis</a></li>
            <li><a href="#InfosSettings" data-ajax="false">Infos</a></li>
          </ul>
        </div>

        <div id="GeneralSettings" class="page-settings">
          <table>
            <tr>
              <td><input type="checkbox" name="summer" id="summer" value="0"><label for="summer">Summer hour</label></td>
              <td><!--<input type="checkbox" name="null0" id="null0" value="0"><label for="null0">null</label>--></td>
              <td><!--<input type="checkbox" name="null1" id="null1" value="0"><label for="null1">null</label>--></td>
              <td><!--<input type="checkbox" name="null2" id="null2" value="0"><label for="null2">null</label>--></td>
            </tr>
            <tr>
              <td colspan="2"><!--<label for="magneticdeclination">Magnetic declinaison</label><input type="number" name="magneticdeclination" id="magneticdeclination" value="0">--></td>
              <td colspan="2"><label for="timezone">Timezone</label><input type="range" min="-11" max="14" name="timezone" id="timezone" value="0"></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td><button href="utils.php?action=reboot" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow exec-cmd">Reboot</button></td>
              <td><button href="utils.php?action=shutdown" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow exec-cmd">Shutdown</button></td>
            </tr>
          </table>
        </div>

        <div id="MapSettings" class="page-settings">
          <form class="ui-field-contain">
            <table>
              <tr>
                <td><input type="checkbox" name="altitudeInMapView" id="altitudeInMapView" checked="checked"><label for="altitudeInMapView">Altitude</label></td>
                <td><input type="checkbox" name="compassInMapView" id="compassInMapView" checked="checked"><label for="compassInMapView">Compass</label></td>
                <td><input type="checkbox" name="speedInMapView" id="speedInMapView" checked="checked"><label for="speedInMapView">Speed</label></td>
                <td><input type="checkbox" name="trackInMapView" id="trackInMapView" checked="checked"><label for="trackInMapView">Track</label></td>
              </tr>
              <tr>
                <td>Layers</td>
                <td><input type="radio" name="layerInMapView" id="oaciLayer" value="oaci"><label for="oaciLayer">OACI 2016</label></td>
                <td><input type="radio" name="layerInMapView" id="cartabossyLayer" value="cartabossy"><label for="cartabossyLayer">Cartabossy 2015</label></td>
                <td></td>
              </tr>
              <tr>
                <td>Overlays</td>
                <td><input type="checkbox" name="vacLndInMapView" id="vacLndInMapView"><label for="vacLndInMapView">VAC Atterrissage</label></td>
                <td><input type="checkbox" name="vacAppInMapView" id="vacAppInMapView"><label for="vacAppInMapView">VAC Approche</label></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </form>
        </div>

        <div id="EfisSettings" class="page-settings">
          <form class="ui-field-contain">
            <table>
              <tr>
                <td><label for="speedTickSpacing">Speed tick ratio:</label></td>
                <td><input type="range" min="2" max="12" value="4" name="speedTickSpacing" id="speedTickSpacing"></td>
                <td><label for="altitudeTickSpacing">Altitude tick ratio:</label></td>
                <td><input type="range" min="2" max="12" value="8" name="altitudeTickSpacing" id="altitudeTickSpacing"></td>
              </tr>
              <tr>
                <td><label for="vne">Vne speed:</label></td>
                <td><input type="text" name="vne" id="vne">&nbsp;&nbsp;Kmh</td>
                <td><label for="vfe">Vfe speed:</label></td>
                <td><input type="text" name="vfe" id="vfe">&nbsp;&nbsp;Kmh</td>
              </tr>
              <tr>
                <td><label for="vno">Vno speed:</label></td>
                <td><input type="text" name="vno" id="vno">&nbsp;&nbsp;Kmh</td>
                <td><label for="vso">Vso speed:</label></td>
                <td><input type="text" name="vso" id="vso">&nbsp;&nbsp;Kmh</td>
              </tr>
              <tr>
                <td><label for="vs">Vs speed:</label></td>
                <td><input type="text" name="vs" id="vs">&nbsp;&nbsp;Kmh</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td colspan="2"><a href="#" onclick="calibrateEfis()" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow">Calibrate Efis</a></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </form>
        </div>
        <div id="InfosSettings" class="page-settings">
          <table>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </table>
        </div>
      </div>
      <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b">Ok</a>
    </div>
  </div>
  <!--<div id="mapMenu">
    <ul>
      <li><a href="#" data-user="layer"><img src="img/layer.svg"></a></li>
      <li><a href="#" data-user="follow"><img src="img/follow.svg"></a></li>
      <li><a href="#" data-user="route"><img src="img/route.svg"></a></li>
      <li><a href="#" data-user="fullscreen"><img src="img/fullscreen.svg"></a></li>
      <li><a href="#" data-user="next"><img src="img/next.svg"></a></li>
      <li><a href="#" data-user="clear"><img src="img/clear.svg"></a></li>
    </ul>
  </div>-->
  <div id="map"></div>
  <div id="efis"></div>
</body>
</html>





<script type="text/javascript">

</script>
