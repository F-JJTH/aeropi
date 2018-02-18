<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="description" content="aeroPi" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="shortcut icon" type="image/png" href="img/icon_128x128.png">
    <title>aeroPi</title>

    <link rel="stylesheet" href="css/ol.css" type="text/css">
    <link rel="stylesheet" href="css/ol3-contextmenu.min.css" type="text/css">
    <link rel="stylesheet" href="css/bootstrap.min.css" type="text/css">
    <link rel="stylesheet" href="css/aeropi.css" type="text/css">
    <link rel="stylesheet" href="font-awesome-4.7.0/css/font-awesome.min.css" type="text/css">
    <link rel="stylesheet" href="css/jquery.typeahead.min.css" type="text/css">
    <link rel="manifest" href="/manifest.json">

    <script src="js/ol.min.js"></script>
    <script src="js/ol3-contextmenu.min.js"></script>
    <script src="js/popper.min.js"></script>
    <script src="js/jquery.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/jquery.flot.min.js"></script>
    <script src="js/jquery.flot.threshold.min.js"></script>
    <script src="js/gauge.min.js"></script>
    <script src="js/jquery.typeahead.min.js"></script>
</head>

<body>
    <?php include('assets/modals.php'); ?>
    <header>
        <ul id="top-menu"></ul>
    </header>
    <div class="row no-gutters">
        <div class="col-sm-7" id="left-area">
            <div id="efis"></div>
            <div id="map"></div>
            <div id="terrainElevation"></div>
        </div>
        <div class="col-sm-5" id="right-area">
            <div id="ems">
                <div class="row no-gutters">
                    <div class="col-lg-12 col-md-4">
                        <div class="row ems-row no-gutters">
                            <div class="col-4 col-sm-5"><canvas id="rpmGauge"></canvas></div>
                            <div class="col-8 col-sm-7">
                                <div class="row ems-row no-gutters">
                                    <div class="col-4"><canvas id="cylTempGauge"></canvas></div>
                                    <div class="col-4"><canvas id="oilTempGauge"></canvas></div>
                                    <div class="col-4"><canvas id="oilPressGauge"></canvas></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-12 col-md-4">
                        <div class="row ems-row no-gutters">
                            <div class="col-4 col-sm-5"><canvas id="mapGauge"></canvas></div>
                            <div class="col-8 col-sm-7">
                                <div class="row ems-row no-gutters">
                                    <div class="col-4" ondblclick="openFuelManager()"><canvas id="fuelQtyGauge"></canvas></div>
                                    <div class="col-4"><canvas id="fuelFlowGauge"></canvas></div>
                                    <div class="col-4"><canvas id="fuelPressGauge"></canvas></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-12 col-md-4">
                        <div class="row ems-row no-gutters">
                            <div class="col-4 col-sm-5 ems-info text-nowrap">
                                <div class="row no-gutters">
                                    <div class="col-12 col-lg-6">Position:</div><div class="col-12 col-lg-6"><span class="info-position"></span></div>
                                </div>
                                <div class="row no-gutters">
                                    <div class="col-12 col-lg-6">Next&nbsp;waypoint:</div><div class="col-12 col-lg-6"><span class="info-wptDistance"></span></div>
                                </div>
                                <div class="row no-gutters">
                                    <div class="col-12 col-lg-6">Remaining&nbsp;distance:</div><div class="col-12 col-lg-6"><span class="info-routeDistance"></span></div>
                                </div>
                                <div class="row no-gutters">
                                    <div class="col-6 col-lg-3">ETE:</div><div class="col-6 col-lg-3"><span class="info-ete"></span></div>
                                    <div class="col-6 col-lg-3">ETA:</div><div class="col-6 col-lg-3"><span class="info-eta"></span></div>
                                </div>
                            </div>
                            <div class="col-8 col-sm-7">
                                <div class="row ems-row no-gutters">
                                    <div class="col-4"></div>
                                    <div class="col-4"><canvas id="ampGauge"></canvas></div>
                                    <div class="col-4"><canvas id="voltGauge"></canvas></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row menu-bar no-gutters">
        <div class="col-sm-6">
            <div class="row no-gutters">
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-road" aria-hidden="true"></i> <span class="d-none d-sm-inline">Route</span>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" onclick="rm.createRoute()">Create route</a>
                            <a class="dropdown-item" onclick="rm.activateRoute()">Activate route</a>
                            <a class="dropdown-item" onclick="rm.clearRoute()">Clear route</a>
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#routeManagerModal">Route manager</a>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-arrow-circle-o-right" aria-hidden="true"></i> <span class="d-none d-sm-inline">Direct To</span>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#searchDirectToModal">Search</a>
                            <a class="dropdown-item" onclick="rm.clearDirectTo()">Clear</a>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-object-ungroup" aria-hidden="true"></i> <span class="d-none d-sm-inline">MFD</span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-mfd">
                            <!--<a class="dropdown-item" onclick="toggleEfis()">
                                <input type="checkbox" name="efisVisible" on-value="On" off-value="Off" class="custom-switch">
                                EFIS
                            </a>
                            <a class="dropdown-item" onclick="toggleNdAdsb()">
                                <input type="checkbox" name="ndAdsb" on-value="On" off-value="Off" class="custom-switch">
                                ADS-B
                            </a>-->
                            <a class="dropdown-item" onclick="toggleTerrainElevation()">
                                <input type="checkbox" name="terrainElevationVisible" on-value="On" off-value="Off" class="custom-switch">
                                Terrain
                            </a>
                            <a class="dropdown-item" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#mfdSettingsModal">Settings</a>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fa fa-object-ungroup" aria-hidden="true"></i> <span class="d-none d-sm-inline">Layout</span>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" onclick="selectLayout('nav-ems')">
                                NAV / EMS
                            </a>
                            <a class="dropdown-item" onclick="selectLayout('efis-ems')">
                                EFIS / EMS
                            </a>
                            <a class="dropdown-item" onclick="selectLayout('nav')">
                                NAV
                            </a>
                            <a class="dropdown-item" onclick="selectLayout('ems')">
                                EMS
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="row no-gutters">
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Option1
                        </button>
                    </div>
                </div>
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Option2
                        </button>
                    </div>
                </div>
                <div class="col-3">
                    <div class="dropup">
                        <button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Option3
                        </button>
                    </div>
                </div>
                <div class="col-3" id="datetime-ui">
                    <div class="dropup">
                        <button class="btn btn-secondary text-left" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#powerManagerModal">
                                <i class="fa fa-clock-o" aria-hidden="true"></i><span class="time"></span>
                                <br/>
                                <i class="fa fa-calendar" aria-hidden="true"></i><span class="date"></span>
                        </button>
                    </div>
                </div>
            </div>
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