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
  <script src="js/leaflet.1.0.1.js"></script>
  <script src="js/Marker-Control.js"></script>
  <script src="js/jquery.efis.js"></script>
  <script src="js/aeropi.js"></script>
  <script src="js/jquery.flot.min.js"></script>
  <script src="js/jquery.flot.time.js"></script>
  <script src="js/jquery.flot.threshold.js"></script>
  <link rel="stylesheet" type="text/css" href="instruments.css"></link>
  <link rel="stylesheet" type="text/css" href="leaflet.1.0.1.css"></link>
  <!--<link rel="stylesheet" type="text/css" href="js/jquery-ui.1.11.4.min.css"></link>-->
  <link rel="stylesheet" type="text/css" href="js/jquery.mobile-1.4.5.min.css"></link>
  <link rel="stylesheet" type="text/css" href="style.css"></link>
  <title>aeroPi</title>
</head>
<body>

  <div data-role="popup" data-dismissible="false" id="settingsQnh">
    <div data-role="header" data-theme="a"><h2>QNH (hPa)</h2></div>
    <div role="main">
      <table>
        <tr>
          <td><button id="qnhDecrease">-</button></td>
          <td><input type="text" id="qnhInput" name="qnhInput" disabled style="width:116px; text-align:center; font-size:24px;"></td>
          <td><button id="qnhIncrease">+</button></td>
        </tr>
      </table>
	    <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b">Ok</a>
    </div>
  </div>


  <a href="#settingsDialog" id="settingsIcon" data-rel="popup" data-position-to="window" class="ui-btn ui-icon-gear ui-corner-all ui-nodisc-icon ui-btn-b ui-btn-icon-left ui-shadow ui-btn-icon-notext" data-transition="pop"></a>
  <div data-role="popup" data-dismissible="false" id="settingsDialog">
    <!--<div data-role="header" data-theme="a"><h2>Settings</h2></div>-->
    <div role="main">
      <div data-role="tabs" id="tabsSettings">
        <div data-role="navbar">
          <ul>
            <li><a href="#GeneralSettings" data-ajax="false" class="ui-btn-active">General</a></li>
            <li><a href="#MapSettings" data-ajax="false">Map</a></li>
            <li><a href="#EfisSettings" data-ajax="false">Efis</a></li>
            <li><a href="#EMSSettings" data-ajax="false">EMS</a></li>
            <li><a href="#InfosSettings" data-ajax="false">Infos</a></li>
          </ul>
        </div>

        <div id="GeneralSettings" class="page-settings">
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Time</h3></div>
            <div class="ui-body ui-body-a">
              <div class="ui-grid-a">
                <div class="ui-block-a">
                  <input type="checkbox" name="summer" id="summer" value="0"><label for="summer">Summer hour</label>
                </div>
                <div class="ui-block-b" style="text-align:center">
                  <label for="timezone">Timezone<input type="range" min="-11" max="14" name="timezone" id="timezone" value="0"></label>
                </div>
              </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Units</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-c">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="altitudeUnit">Altitude</label>
                  <select name="altitudeUnit" id="altitudeUnit" data-role="slider" data-mini="true"><option value="ft">ft</option><option value="m">m</option></select>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="elevationUnit">Elevation</label>
                  <select name="elevationUnit" id="elevationUnit" data-role="slider" data-mini="true"><option value="ft">ft</option><option value="m">m</option></select>
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="distanceUnit">Distance</label>
                  <select name="distanceUnit" id="distanceUnit" data-role="slider" data-mini="true"><option value="nm">nm</option><option value="km">km</option></select>
                </div>
              </div>
              <div class="ui-block-d">
                <div class="ui-field-contain">
                  <label for="speedUnit">Speed</label>
                  <select name="speedUnit" id="speedUnit" data-role="slider" data-mini="true"><option value="kmh">kmh</option><option value="kt">kt</option></select>
                </div>
              </div>
            </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Power</h3></div>
            <div class="ui-body ui-body-a">
              <div class="ui-grid-b">
                <div class="ui-block-a">
                  <button href="utils.php?action=reboot" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow exec-cmd">Reboot</button>
                </div>
                <div class="ui-block-b">
                  <button href="utils.php?action=shutdown" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow exec-cmd">Shutdown</button>
                </div>
                <div class="ui-block-c">
                  <a href="/" data-ajax="false" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow">Reload</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="MapSettings" class="page-settings">
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Layers</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-a">
              <div class="ui-block-a" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="radio" name="layerInMapView" id="oaciLayer" value="oaci"><label for="oaciLayer">OACI 2016</label>
                </div>
              </div>
              <div class="ui-block-b" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="radio" name="layerInMapView" id="cartabossyLayer" value="cartabossy"><label for="cartabossyLayer">Cartabossy 2015</label>
                </div>
              </div>
            </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Overlays</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-a">
              <div class="ui-block-a" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="vacLndInMapView" id="vacLndInMapView"><label for="vacLndInMapView">VAC Atterrissage</label>
                </div>
              </div>
              <div class="ui-block-b" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="vacAppInMapView" id="vacAppInMapView"><label for="vacAppInMapView">VAC Approche</label>
                </div>
              </div>
            </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Map options</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-c">
              <div class="ui-block-a" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="altitudeInMapView" id="altitudeInMapView" checked="checked"><label for="altitudeInMapView">Altitude</label>
                </div>
              </div>
              <div class="ui-block-b" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="compassInMapView" id="compassInMapView" checked="checked"><label for="compassInMapView">Compass</label>
                </div>
              </div>
              <div class="ui-block-c" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="speedInMapView" id="speedInMapView" checked="checked"><label for="speedInMapView">Speed</label></select>
                </div>
              </div>
              <div class="ui-block-d" style="text-align:center;">
                <div class="ui-field-contain">
                  <input type="checkbox" name="trackInMapView" id="trackInMapView" checked="checked"><label for="trackInMapView">Track</label></select>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div id="EfisSettings" class="page-settings">
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Speeds (kmh)</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-d">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="vne">Vne</label><input type="text" name="vne" id="vne">
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="vfe">Vfe</label><input type="text" name="vfe" id="vfe">
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="vno">Vno</label><input type="text" name="vno" id="vno">
                </div>
              </div>
              <div class="ui-block-d">
                <div class="ui-field-contain">
                  <label for="vso">Vso</label><input type="text" name="vso" id="vso">
                </div>
              </div>
              <div class="ui-block-e">
                <div class="ui-field-contain">
                  <label for="vs">Vs</label><input type="text" name="vs" id="vs">
                </div>
              </div>
            </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Ticks ratio</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-a">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="speedTickSpacing">Speed<input type="range" min="2" max="12" value="4" name="speedTickSpacing" id="speedTickSpacing"></label>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="altitudeTickSpacing">Altitude<input type="range" min="2" max="12" value="8" name="altitudeTickSpacing" id="altitudeTickSpacing"></label>
                </div>
              </div>
            </div>
            </div>
          </div>
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Source</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-b">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="speedSource">Speed</label>
                  <select name="speedSource" id="speedSource" data-role="slider" data-mini="true"><option value="gps">GPS</option><option value="air">Air</option></select>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="compassSource">Compass</label>
                  <select name="compassSource" id="compassSource" data-role="slider" data-mini="true"><option value="gps">GPS</option><option value="compass">Mag</option></select>
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="altitudeSource">Altitude</label>
                  <select name="altitudeSource" id="altitudeSource" data-role="slider" data-mini="true"><option value="gps">GPS</option><option value="baro">Baro</option></select>
                </div>
              </div>
            </div>
            </div>
          </div>
          <a href="#" onclick="calibrateEfis()" class="ui-btn ui-corner-all ui-nodisc-icon ui-btn-b ui-shadow">Calibrate Efis</a>
        </div>
        <div id="EMSSettings" class="page-settings">
          <br/>
          <div class="ui-corner-all custom-corners">
            <div class="ui-bar ui-bar-a"><h3>Sensors</h3></div>
            <div class="ui-body ui-body-a">
            <div class="ui-grid-b">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="cht0">CHT0</label><input type="text" name="cht0" id="cht0" disabled>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="cht1">CHT1</label><input type="text" name="cht1" id="cht1" disabled>
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="oilTemp">Oil temperature</label><input type="text" name="oilTemp" id="oilTemp" disabled>
                </div>
              </div>
            </div>
            <div class="ui-grid-b">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="fuelFlow">Fuel flow</label><input type="text" name="fuelFlow" id="fuelFlow" disabled>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="oilPress">Oil pressure</label><input type="text" name="oilPress" id="oilPress" disabled>
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="MaP">MaP</label><input type="text" name="MaP" id="MaP" disabled>
                </div>
              </div>
            </div>
            <div class="ui-grid-b">
              <div class="ui-block-a">
                <div class="ui-field-contain">
                  <label for="voltage">Voltage</label><input type="text" name="voltage" id="voltage" disabled>
                </div>
              </div>
              <div class="ui-block-b">
                <div class="ui-field-contain">
                  <label for="load">Load</label><input type="text" name="load" id="load" disabled>
                </div>
              </div>
              <div class="ui-block-c">
                <div class="ui-field-contain">
                  <label for="rpm">RPM</label><input type="text" name="rpm" id="rpm" disabled>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
        <div id="InfosSettings" class="page-settings"></div>
      </div>
      <a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-b">Ok</a>
    </div>
  </div>

  <div id="nav">
    <a href="#" data='efis' class="ui-btn ui-corner-all ui-btn-b ui-shadow ui-btn-active">EFIS</a><a href="#" data='map' class="ui-btn ui-corner-all ui-btn-b ui-shadow">MAP</a><a href="#" data='ems' class="ui-btn ui-btn-b ui-btn-active ui-corner-all ui-shadow">EMS</a>
  </div>

  <div id="map"></div>
  <div id="efis"></div>
  <div id="groundElevation"></div>
  <div id="ems">
    <div class="ui-field-contain">
      <label for="cht0">CHT0</label><input type="text" name="cht0" id="cht0" disabled>
    </div>
    <div class="ui-field-contain">
      <label for="cht1">CHT1</label><input type="text" name="cht1" id="cht1" disabled>
    </div>
    <div class="ui-field-contain">
      <label for="oilTemp">Oil temp</label><input type="text" name="oilTemp" id="oilTemp" disabled>
    </div>
    <div class="ui-field-contain">
      <label for="oilPress">Oil press</label><input type="text" name="oilPress" id="oilPress" disabled>
    </div>
  </div>

</body>
</html>





<script type="text/javascript">

</script>
