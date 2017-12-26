<?php
$SRTM3_dir = "SRTM3/";

function getDistancePointToPoint($from, $to){
  $lat1 = $from['lat'];
  $lng1 = $from['lng'];
  $lat2 = $to['lat'];
  $lng2 = $to['lng'];
  $r = (3959 * 3.1415926 * sqrt(($lat2 - $lat1) * ($lat2 - $lat1) + cos($lat2 / 57.29578) * cos($lat1 / 57.29578) * ($lng2 - $lng1) * ($lng2 - $lng1)) / 180) * 1.609344;
  $r = round($r*1000, 2);
  return $r;
}

function getDistanceBetweenPoints($from, $to)
{
    $rad = M_PI / 180;
    //Calculate distance from latitude and longitude
    $theta = $from['lng'] - $to['lng'];
    $dist = sin($from['lat'] * $rad) * sin($to['lat'] * $rad) +  cos($from['lat'] * $rad) * cos($to['lat'] * $rad) * cos($theta * $rad);

    return acos($dist) / $rad * 60 *  1.852;
}

function parsePath($str){
  $points = explode("|", $str);
  foreach($points as $point){
    $lnglat = explode(",", $point);
    $p['lng'] = round($lnglat[0], 5);
    $p['lat'] = round($lnglat[1], 5);
    $path[] = $p;
  }
  return $path;
}

function getMinLat($points){
  $v = $points[0]['lat'];
  foreach($points as $point){
    if($point['lat'] < $v)
      $v = $point['lat'];
  }
  return intval($v);
}

function getMinlng($points){
  $v = $points[0]['lng'];
  foreach($points as $point){
    if($point['lng'] < $v)
      $v = $point['lng'];
  }
  return intval($v);
}

function getMaxLat($points){
  $v = $points[0]['lat'];
  foreach($points as $point){
    if($point['lat'] > $v)
      $v = $point['lat'];
  }
  return intval($v);
}

function getMaxlng($points){
  $v = $points[0]['lng'];
  foreach($points as $point){
    if($point['lng'] > $v)
      $v = $point['lng'];
  }
  return intval($v);
}

function getFileToLookup($path){
  $minLat = getMinLat($path);
  $maxLat = getMaxLat($path);
  $minlng = getMinlng($path);
  $maxlng = getMaxlng($path);
  $fileList = array();
  for($lat=$minLat; $lat<=$maxLat; $lat++){
    for($lng=$minlng; $lng<=$maxlng; $lng++){
      $latSign = ($lat < 0) ? "S" : "N";
      $lngSign = ($lng < 0) ? "W" : "E";
      $fileList[] = $latSign.str_pad(abs($lat), 2, "0", STR_PAD_LEFT).$lngSign.str_pad(abs($lng), 3, "0", STR_PAD_LEFT);
    }
  }
  return $fileList;
}

function DECtoABSINT($d){return abs(intval($d));}

function getFileToLookupFromPoint($point){
  $latSign = ($point['lat'] < 0) ? "S" : "N";
  $lngSign = ($point['lng'] < 0) ? "W" : "E";
  $lat = DECtoABSINT($point['lat']);
  $lng = DECtoABSINT($point['lng']);
  return $latSign.str_pad($lat, 2, "0", STR_PAD_LEFT).$lngSign.str_pad($lng, 3, "0", STR_PAD_LEFT).'.hgt';
}

function getDistancesInPath($path){
  $d = array();
  for($i=1; $i<sizeof($path); $i++){
    $d[] = getDistancePointToPoint($path[$i-1], $path[$i]);
    //$d[] = getDistanceBetweenPoints($path[$i-1], $path[$i]);
  }
  return $d;
}

function getBearing($from, $to){
  $lat1 = $from['lat'];
  $lng1 = $from['lng'];
  $lat2 = $to['lat'];
  $lng2 = $to['lng'];
  return (rad2deg(atan2(sin(deg2rad($lng2) - deg2rad($lng1)) * cos(deg2rad($lat2)), cos(deg2rad($lat1)) * sin(deg2rad($lat2)) - sin(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($lng2) - deg2rad($lng1)))) + 360) % 360;
}

function toRad($deg){return $deg * pi() / 180;}
function toDeg($rad){return $rad * 180 / pi();}

function getPointFromDistanceAndBearing($from, $bearing, $distance){
  $lat1 = toRad($from['lat']);
  $lng1 = toRad($from['lng']);
  $dist = ($distance/1000)/6372.7976; //Earth's radius in km
  $brng = toRad($bearing);
  $lat2 = asin( sin($lat1)*cos($dist) +
          cos($lat1)*sin($dist)*cos($brng) );
  $lng2 = $lng1 + atan2(sin($brng)*sin($dist)*cos($lat1),
          cos($dist)-sin($lat1)*sin($lat2));
  $lng2 = fmod(($lng2+3*pi()),(2*pi())) - pi();  
 
  return array('lat'=>round(toDeg($lat2), 5), 'lng'=>round(toDeg($lng2), 5));
}

function getSampledSegmentsPoints($path, $samples){
  $distancesInPath = getDistancesInPath($path);
  $sampleLength = array_sum($distancesInPath)/$samples;
  $samplePerSegment = $samples/(sizeof($path)-1);
  $segments = array();
  for($i=1; $i<sizeof($path); $i++){
    $startPoint = array('lat'=>$path[$i-1]['lat'], 'lng'=>$path[$i-1]['lng']);
    $endPoint = array('lat'=>$path[$i]['lat'], 'lng'=>$path[$i]['lng']);
    $segmentBearing = getBearing($startPoint, $endPoint);
    $sampledPoints = array($startPoint);
    $from = $startPoint;
    for($z=1; $z<$samplePerSegment; $z++){
      $s = getPointFromDistanceAndBearing($from, $segmentBearing, $sampleLength);
      $sampledPoints[] = $s;
      $from = $s;
    }
    $sampledPoints[] = $endPoint;
    $segments[] = array('start'=>$startPoint, 'end'=>$endPoint, 'bearing'=>$segmentBearing, 'distance'=>$distancesInPath[$i-1], 'points'=>$sampledPoints);
  }
  return $segments;
}

function DECtoDMS($dec){
  $vars = explode(".",$dec);
  $deg = $vars[0];
  $min = 0;
  $sec = 0;
  if(count($vars) >1) {
    $tempma = "0.".$vars[1];
    $tempma = $tempma * 3600;
    $min = floor($tempma / 60);
    $sec = $tempma - ($min*60);
  }
  return array("deg"=>$deg,"min"=>$min,"sec"=>$sec);
}

function DMStoSeconds($dms){return $dms['min']*60+$dms['sec'];}
function getPixelFromSeconds($seconds){return round($seconds/3);}

function getCellFromPoint($point){
  $latDMS = DECtoDMS($point['lat']);
  $lngDMS = DECtoDMS($point['lng']);
  $latSec = DMStoSeconds($latDMS);
  $lngSec = DMStoSeconds($lngDMS);
  $pixRow = 1201-getPixelFromSeconds($latSec);
  $pixCol = getPixelFromSeconds($lngSec);
  return (1201*$pixRow-1)+$pixCol;
}

function getElevations($path_req, $samples_req){
  global $SRTM3_dir;
  $path = parsePath($path_req);
  $segments = getSampledSegmentsPoints($path, $samples_req);
  $res = array();
  $prevElevation = null;
  foreach($segments as &$segment){
    foreach($segment['points'] as &$point){
      $cell = getCellFromPoint($point);
      $f = getFileToLookupFromPoint($point);
      $fp = fopen($SRTM3_dir.$f, 'r');
      fseek($fp, ($cell*2)-2);
      $bytes = fread($fp, 2);
      $elevation = unpack('n', $bytes)[1];
      if($elevation - $prevElevation > 1000 && $prevElevation !== null) // Prevent gap in SRTM data to be visible
        $elevation = $prevElevation;
      $res[] = array(
        'elevation' => $elevation,
        'location' => $point,
        'distance' => getDistanceBetweenPoints($path[0], $point),
        'resolution' => 1
      );
      $prevElevation = $elevation;
    }
  }
  return $res;
}
?>
