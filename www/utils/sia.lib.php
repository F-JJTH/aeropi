<?php
$fBoundaries = file_get_contents(dirname(__FILE__)."/france_boundaries.json");
$fBoundaries = utf8_encode($fBoundaries);
$boundaries = json_decode($fBoundaries, true);

function getSqlInsert($airspaces, $type) {
    $insert = "";
    for($i=0; $i<count($airspaces); $i++) {
        $props  = $airspaces[$i]['properties'];
        $coords = $airspaces[$i]['geometry']['coordinates'][0];
        $polygon = "POLYGON((";
        foreach ($coords as $coord) {
            $polygon .= $coord[0]." ".$coord[1].", ";
        }
        $polygon = substr($polygon, 0, -2);
        $polygon .= "))";
        $g = "GeomFromText('".$polygon."')";
        $insert .= "INSERT INTO `airspaces` (`name`, `type`, `class`, `activities`, `remarks`, `upper`, `lower`, `minimum`, `maximum`, `g`) ";
        $insert .= "VALUES ('".$props['name']."', ".$type.", '".$props['class']."', '".addslashes($props['activities'])."', '".addslashes($props['remarks'])."', '".$props['verticalLimit']['upper']."', '".$props['verticalLimit']['lower']."', '".$props['verticalLimit']['minimum']."', '".$props['verticalLimit']['maximum']."', ".$g.");\n";
    }
    return $insert;
}

function getGeojson($features){
  $featureCollection = array(
    'type' => 'FeatureCollection',
    'features' => $features,
  );
  return json_encode($featureCollection, JSON_PRETTY_PRINT);
}

function getVertLimit($elem){
  $vertLimit = [];
  foreach($elem->getElementsByTagName('span') as $span){
    $id = $span->getAttribute('id');
    $id = explode("_", $id);
    $vertLimit[end($id)] = $span->nodeValue;
  }
  return $vertLimit;
}

function getCallsign($elem){
  $span = $elem->getElementsByTagName('span')->item(0);
  $callsign = trim($span->nodeValue);
  $callsign = str_replace("\n\n", " - ", $callsign);
  $callsign = str_replace("\n", "", $callsign);
  $callsign = str_replace("                                    ", " ", $callsign);
  return $callsign;
}

function getClass($elem){
  $span = $elem->getElementsByTagName('span')->item(0);
  return $span->nodeValue;
}

function getTrLine($file){
  $doc = new DOMDocument();
  @$doc->loadHTMLFile($file);
  $features = array();
  return $doc->getElementsByTagName('tr');
}


function getGeoLimit($str){
  $geoLimit = array();
  $str = str_replace("\n-", " -", $str);
  $str = str_replace("-\n", "- ", $str);
  $str = explode(" - ", $str);
  foreach($str as $s){
    $s = trim(str_replace("\n", " ", $s));
    if(is_numeric($s[0])){
      $s = explode(" , ", $s);
      $s[1] = trim($s[1]);
      $s[0] = explode(" ", $s[0])[0];
      $s[1] = explode(" ", $s[1])[0];
      $geoLimit[] = array(
        "type" => "coordinates",
        "lon" => dms_to_deg($s[1]),
        "lat" => dms_to_deg($s[0])
      );
    }elseif($s[0] == "a"){
      // arc description
      $s = str_replace("                 ", " ", $s);
      $s = explode(" , ", $s);
      $s[0] = trim($s[0]);
      $s[1] = trim($s[1]);
      $centerLon = dms_to_deg(explode(" ", $s[1])[0]);
      $radius = explode(" de ", $s[0])[1];
      $radius = substr($radius, 0, -3);
      $sign = explode(" de ", $s[0])[0];
      $sign = explode(" ", $sign)[1];
      $sign = strlen($sign) > 8 ? "-" : "";
      $centerLat = dms_to_deg(explode("sur ", $s[0])[1]);
      $geoLimit[] = array(
        "type" => "arc",
        "lon" => $centerLon,
        "lat" => $centerLat,
        "radius" => floatval($sign.$radius)
      );
    }elseif($s[0] == "c"){
      // cercle description
      $s = explode(" , ", $s);
      $centerLon = dms_to_deg(explode(" ", $s[1])[0]);
      $radius = explode(" de ", $s[0])[1];
      $radius = substr($radius, 0, -3);
      $centerLat = dms_to_deg(explode("sur ", $s[0])[1]);
      $geoLimit[] = array(
        "type" => "circle",
        "lon" => $centerLon,
        "lat" => $centerLat,
        "radius" => floatval($radius)
      );
    }elseif($s[0] == "F"){
      $geoLimit[] = array("type" => "boundaries");
    }
  }
  return $geoLimit;
}


function getCtrName($elem){
  $name = "";
  foreach($elem->getElementsByTagName('span') as $k=>$span){
    if($k < 2)
      continue;
    $name.= $span->nodeValue." ";
  }
  return substr($name, 0, -1);
}

function getCtrRemarks($elem){
  $span = $elem->getElementsByTagName('span')->item(0);
  foreach($span->getElementsByTagName('del') as $del){
    $span->removeChild($del);
  }
  $remarks = trim($span->nodeValue);
  $remarks = explode("\n\n", $remarks);
  return $remarks;
}

function getCtrLimitObject($elem){
  $str = trim($elem->nodeValue);
  return getGeoLimit($str);
}
?>
