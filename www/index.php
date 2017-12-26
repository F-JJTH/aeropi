<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="description" content="FoxHotel" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="shortcut icon" type="image/png" href="favicon.png">
    <title>FoxHotel</title>

    <link rel="stylesheet" href="css/ol.css" type="text/css">
    <link rel="stylesheet" href="css/ol3-contextmenu.min.css" type="text/css">
    <link rel="stylesheet" href="css/bootstrap.min.css" type="text/css">
    <!--<link rel="stylesheet" href="css/bootstrap-toggle.min.css" type="text/css">-->
    <link rel="stylesheet" href="css/aeropi.css" type="text/css">
    <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css" type="text/css">
    <link rel="stylesheet" href="css/jquery.typeahead.min.css" type="text/css">

    <script src="js/ol.min.js"></script>
    <script src="js/ol3-contextmenu.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/jquery.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <!--<script src="js/bootstrap-toggle.min.js"></script>-->
    <script src="js/jquery.flot.min.js"></script>
    <script src="js/jquery.flot.threshold.min.js"></script>
    <script src="js/raphael.min.js"></script>
    <script src="js/justgage.js"></script>
    <script src="js/jquery.typeahead.min.js"></script>
</head>

<body>
    <?php include('assets/modals.php'); ?>
    <header>
        <ul id="top-menu"></ul>
    </header>
    <div id="main">
        <div id="primary">
            <div id="pfd">
                <div id="map"></div>
                <div id="terrainElevation"></div>
            </div>
            <div id="ems">
                <a id="toggle-ems" href="#"><span>&raquo;</span></a>
                <ul>
                    <li><div class="justgage" id="cylTempGauge"></div></li>
                    <li><div class="justgage" id="oilTempGauge"></div></li>
                    <li><div class="justgage" id="oilPressGauge"></div></li>
                    <li><div class="justgage" id="rpmGauge"></div></li>
                    <li><div class="justgage" id="mapGauge"></div></li>
                    <li><div class="justgage" id="ampGauge"></div></li>
                    <li><div class="justgage" id="voltGauge"></div></li>
                    <li><div class="justgage" id="asiGauge"></div></li>
                    <li><div class="justgage" id="hdgGauge"></div></li>
                    <li>Fuel data</li>
                </ul>
            </div>
        </div>
        <div id="options">
            <ul>
                <li>
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-road" aria-hidden="true"></i> Route
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" onclick="rm.createRoute()">Create route</a>
                            <a class="dropdown-item" onclick="rm.activateRoute()">Activate route</a>
                            <a class="dropdown-item" onclick="rm.clearRoute()">Clear route</a>
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#routeManagerModal">Route manager</a>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-arrow-circle-o-right" aria-hidden="true"></i> Direct To
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#searchDirectToModal">Search</a>
                            <a class="dropdown-item" onclick="rm.clearDirectTo()">Clear</a>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-map" aria-hidden="true"></i> Map
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item">Layers</a>
                            <a class="dropdown-item" onclick="toggleNdAdsb()">
                                <input type="checkbox" name="ndAdsb" on-value="On" off-value="Off" class="custom-switch">
                                ADS-B
                            </a>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-object-ungroup" aria-hidden="true"></i> MFD
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" onclick="toggleEfis()">
                                <input type="checkbox" name="efisVisible" on-value="On" off-value="Off" class="custom-switch">
                                EFIS
                            </a>
                            <a class="dropdown-item" onclick="toggleTerrainElevation()">
                                <input type="checkbox" name="terrainElevationVisible" on-value="On" off-value="Off" class="custom-switch">
                                Terrain
                            </a>
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#mfdSettingsModal">Settings</a>
                        </div>
                    </div>
                </li>
                <li><input type="range" name="lat" min="43.5" max="44.5" step="0.001" value="44"></li>
                <li><input type="range" name="lon" min="4.5" max="5.5" step="0.001" value="5"></li>
                <li><input type="range" name="ems" min="0" max="240" step="5" value="0"></li>
                <li>
                    <button class="btn btn-secondary text-left" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#powerManagerModal">
                        <span>
                            <i class="fa fa-clock-o" style="margin-left:25%;" aria-hidden="true"></i><span class="time"></span>
                            <br/>
                            <i class="fa fa-calendar" style="margin-left:25%;" aria-hidden="true"></i><span class="date"></span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    </div>
    <script src="js/sun.js"></script>
    <script src="js/settings.aeropi.js"></script>
    <script src="js/rm.aeropi.js"></script>
    <script src="js/nd.aeropi.js"></script>
    <script src="js/ems.aeropi.js"></script>
    <script src="js/terrain.aeropi.js"></script>
    <script src="js/efis.aeropi.js"></script>
    <script src="js/main.aeropi.js"></script>
</body>
</html>
