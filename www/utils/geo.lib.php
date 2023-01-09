<?php

function pointInPolygon($point, $polygon, $pointOnVertex = true) {

    // Transform string coordinates into arrays with x and y values
    $point = pointStringToCoordinates($point);
    $vertices = array(); 
    foreach ($polygon as $vertex) {
        $vertices[] = pointStringToCoordinates($vertex);
    }

    // Check if the point sits exactly on a vertex
    if ($pointOnVertex == true and pointOnVertex($point, $vertices) == true) {
        return true;
    }

    // Check if the point is inside the polygon or on the boundary
    $intersections = 0; 
    $vertices_count = count($vertices);

    for ($i=1; $i < $vertices_count; $i++) {
        $vertex1 = $vertices[$i-1]; 
        $vertex2 = $vertices[$i];
        if ($vertex1['y'] == $vertex2['y'] and $vertex1['y'] == $point['y'] and $point['x'] > min($vertex1['x'], $vertex2['x']) and $point['x'] < max($vertex1['x'], $vertex2['x'])) { // Check if point is on an horizontal polygon boundary
            return true;
        }
        if ($point['y'] > min($vertex1['y'], $vertex2['y']) and $point['y'] <= max($vertex1['y'], $vertex2['y']) and $point['x'] <= max($vertex1['x'], $vertex2['x']) and $vertex1['y'] != $vertex2['y']) { 
            $xinters = ($point['y'] - $vertex1['y']) * ($vertex2['x'] - $vertex1['x']) / ($vertex2['y'] - $vertex1['y']) + $vertex1['x']; 
            if ($xinters == $point['x']) { // Check if point is on the polygon boundary (other than horizontal)
                return true;
            }
            if ($vertex1['x'] == $vertex2['x'] || $point['x'] <= $xinters) {
                $intersections++; 
            }
        } 
    } 
    // If the number of edges we passed through is odd, then it's in the polygon. 
    if ($intersections % 2 != 0) {
        return true;
    } else {
        return false;
    }
}

function pointOnVertex($point, $vertices) {
    foreach($vertices as $vertex) {
        if ($point == $vertex) {
            return true;
        }
    }

}

function pointStringToCoordinates($pointString) {
    //$coordinates = explode(" ", $pointString);
    return array("x" => $pointString[0], "y" => $pointString[1]);
}

/*
 * Distance
 * @params a: an array of lon/lat
 * @params b: an array of lon/lat
 * return distance in miles (float)
 */
function distance($a, $b){
    list($lon1, $lat1) = $a;
    list($lon2, $lat2) = $b;

    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    return $miles;
}

/*
 * dms_to_deg
 * @params dms: a string in DMS format
 */
function dms_to_deg($dms, $debug = false){
  $dms = stripslashes($dms);
  $neg = (preg_match('/[SWO]/i', $dms) == 0) ? 1 : -1;
  $dms = preg_replace('/(^\s?-)|(\s?[NSEWO]\s?)/i', '', $dms);
  $pattern = "/(\\d*\\.?\\d+)(?:[°ºd: ]+)(\\d*\\.?\\d+)*(?:['m′: ])*(\\d*\\.?\\d+)*[\"s″ ]?/i";
  $parts = preg_split($pattern, $dms, 0, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
  if (!$parts) {
    return;
  }
  if($debug) {
    var_dump($parts);
  }
  // parts: 0 = degree, 1 = minutes, 2 = seconds
  $d = isset($parts[0]) ? (float)$parts[0] : 0;
  $m = isset($parts[1]) ? (float)$parts[1] : 0;
  if (strpos($dms, ".") > 1 && isset($parts[2])) {
    $m = (float)($parts[1] . '.' . $parts[2]);
    unset($parts[2]);
  }
  $s = isset($parts[2]) ? (float)$parts[2] : 0;
  $dec = ($d + ($m/60) + ($s/3600))*$neg; 
  return round($dec, 4);
}

/*
 * getBearing
 * @params a: an array of lon/lat
 * @params b: an array of lon/lat
 * return bearing in degrees
 */
function getBearing($a, $b){
  $lat1 = deg2rad($a[1]);
  $long1 = deg2rad($a[0]);
  $lat2 = deg2rad($b[1]);
  $long2 = deg2rad($b[0]);

  $bearingradians = atan2(asin($long2-$long1)*cos($lat2),cos($lat1)*sin($lat2) - sin($lat1)*cos($lat2)*cos($long2-$long1));
  $bearingdegrees = rad2deg($bearingradians);
  $bearingdegrees = $bearingdegrees < 0? 360 + $bearingdegrees : $bearingdegrees;

  return $bearingdegrees;
}

/*
 * getGeoDestination
 * @params start: an array of lon/lat
 * @params dist: a distance in NM
 * @params brng: an orientation in degrees
 * return an array of lon/lat
 */
function getGeoDestination($start,$dist,$brng){
    $lat1 = toRad($start[1]);
    $lon1 = toRad($start[0]);
    $dist = ($dist*1.852)/6372.7976; //Earth's radius in km
    $brng = toRad($brng);
 
    $lat2 = asin( sin($lat1)*cos($dist) +
                  cos($lat1)*sin($dist)*cos($brng) );
    $lon2 = $lon1 + atan2(sin($brng)*sin($dist)*cos($lat1),
                          cos($dist)-sin($lat1)*sin($lat2));
    $lon2 = fmod(($lon2+3*pi()),(2*pi())) - pi();  
 
    return array('lat' => toDeg($lat2), 'lon' => toDeg($lon2));
}

function toRad($deg){
    return $deg * pi() / 180;
}

function toDeg($rad){
    return $rad * 180 / pi();
}
?>
