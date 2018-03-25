<?php
require_once "parser.php";

// SELECT *, AsText(g) FROM `airspaces` WHERE Contains(g, GeomFromText('POINT(8.7423706 41.838874)')) 

$airspaceParser = new AirspaceParser("ctr.html");
$ctrAirspaces = $airspaceParser->process();
file_put_contents("ctr.geojson", getGeojson($ctrAirspaces));
file_put_contents("insert.sql", getSqlInsert($ctrAirspaces, 0));
echo "CTR: ".count($ctrAirspaces)."\n";

$airspaceParser = new AirspaceParser("siv.html");
$sivAirspaces = $airspaceParser->process();
file_put_contents("siv.geojson", getGeojson($sivAirspaces));
file_put_contents("insert.sql", getSqlInsert($sivAirspaces, 1), FILE_APPEND);
echo "SIV: ".count($sivAirspaces)."\n";

$airspaceParser = new AirspaceParser("tma.html");
$tmaAirspaces = $airspaceParser->process();
file_put_contents("tma.geojson", getGeojson($tmaAirspaces));
file_put_contents("insert.sql", getSqlInsert($tmaAirspaces, 2), FILE_APPEND);
echo "TMA: ".count($tmaAirspaces)."\n";
?>