<?php
function readAirportFromCSV($file) {
    $airports = array_map('str_getcsv', file($file));
    array_walk($airports, function(&$airport) use ($airports) {
        $airport = array_combine($airports[0], $airport);
    });
    array_shift($airports);
    return $airports;
}
$sql = '';
$icaoIds = array();

$airports = readAirportFromCSV('./ourairports.csv');
foreach ($airports as $a) {
    if( $a['iso_country'] == 'FR' && !array_key_exists($a['ident'], $icaoIds) ) {
        $icaoIds[] = $a['ident'];
        $sql .= "INSERT INTO `airports` (`ident`, `type`, `name`, `latitude`, `longitude`, `elevation`, `municipality`, `ourairports_id`) ";
        $sql .= "VALUES ('".$a['ident']."', '".$a['type']."', '".addslashes($a['name'])."', ".$a['latitude_deg'].", ".$a['longitude_deg'].", ".intval($a['elevation_ft']).", '".addslashes($a['municipality'])."', ".$a['id'].");\n";
    }
}

$sql .= "\n\n";

$airports = readAirportFromCSV('./basulm_1130.csv');
foreach ($airports as $a) {
    if($a['Obsolète'] != 'oui' && !in_array($a['Code terrain'], $icaoIds)) {
        $pos = explode(', ', $a['Position']);
        $latitude = $pos[0];
        $longitude = $pos[1];
        $altitude = intval(substr($a['Altitude'],0, -3));
        $sql .= "INSERT INTO `airports` (`ident`, `type`, `name`, `latitude`, `longitude`, `elevation`, `municipality`, `ourairports_id`) ";
        $sql .= "VALUES ('".$a['Code terrain']."', '".addslashes($a['Type'])."', '".addslashes($a['Toponyme'])."', ".$latitude.", ".$longitude.", ".$altitude.", '".addslashes($a['Toponyme'])."', -1);\n";
    }
}

echo $sql;
?>