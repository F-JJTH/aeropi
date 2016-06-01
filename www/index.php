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
        <div id="GeneralSettings" style="height:300px; overflow:auto;">
          General: settings clock, settings magnetic declinaison
        </div>
        <div id="MapSettings" style="height:300px; overflow:auto;">
          <form class="ui-field-contain">
            <fieldset data-role="controlgroup" data-type="horizontal">
              <legend>Show:</legend>
              <input type="checkbox" name="speedInMapView" id="speedInMapView"><label for="speedInMapView">Speed</label>
              <input type="checkbox" name="altitudeInMapView" id="altitudeInMapView"><label for="altitudeInMapView">Altitude</label>
              <input type="checkbox" name="compassInMapView" id="compassInMapView"><label for="compassInMapView">Compass</label>
              <input type="checkbox" name="trackInMapView" id="trackInMapView"><label for="trackInMapView">Track</label>
            </fieldset>
          </form>
        </div>
        <div id="EfisSettings" style="height:300px; overflow:auto;">
          <form class="ui-field-contain">
            <table>
              <tr>
                <td><label for="speedTickSpacing">Speed tick spacing:</label></td>
                <td colspan="3"><input type="range" min="2" max="12" value="4" name="speedTickSpacing" id="speedTickSpacing"></td>
              </tr>
              <tr>
                <td><label for="altitudeTickSpacing">Altitude tick spacing:</label></td>
                <td colspan="3"><input type="range" min="2" max="12" value="8" name="altitudeTickSpacing" id="altitudeTickSpacing"></td>
              </tr>
              <tr>
                <td><label for="vne">Vne speed:</label></td>
                <td><input type="text" name="vne" id="vne"></td>
                <td><label for="vfe">Vfe speed</label></td>
                <td><input type="text" name="vfe" id="vfe"></td>
              </tr>
              <tr>
                <td><label for="vno">Vno speed</label></td>
                <td><input type="text" name="vno" id="vno"></td>
                <td><label for="vso">Vso speed</label></td>
                <td><input type="text" name="vso" id="vso"></td>
              </tr>
              <tr>
                <td><label for="vs">Vs speed</label></td>
                <td><input type="text" name="vs" id="vs"></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td><a href="#" onclick="calibrateEfis()" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow">Calibrate Efis</a></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </form>
        </div>
        <div id="InfosSettings" style="height:300px; overflow:auto;">
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
  <div id="mapMenu">
    <ul>
      <li><a href="#"><img src="img/layer.svg"></a></li>
      <li><a href="#"><img src="img/follow.svg"></a></li>
      <li><a href="#"><img src="img/route.svg"></a></li>
      <li><a href="#"><img src="img/next.svg"></a></li>
      <li><a href="#"><img src="img/clear.svg"></a></li>
    </ul>
  </div>
  <div id="map"></div>
  <div id="efis"></div>
</body>
</html>





<script type="text/javascript">

</script>
