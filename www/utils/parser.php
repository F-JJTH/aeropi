<?php
error_reporting(E_ALL & ~ E_WARNING);
require_once "geo.lib.php";
require_once "sia.lib.php";

class AirspaceParser {

    const IS_READY = 1;

    private $filename  = '';
    private $airspaces = array();

    public function __construct($filename) {
        $this->filename = $filename;
    }

    private function cleanUpText($text) {
        $text = trim($text);
        $lines = explode("\n", $text);
        $cleanLines = array();
        if(count($lines)) {
            foreach ($lines as $k => $line) {
                $cleanLines[] = trim($line);
            }
        }
        $text = implode("\n", $cleanLines);
        $text = str_replace("\n\n", "##", $text);
        $text = str_replace("\n", " ", $text);
        return str_replace("##", "\n", $text);
    }

    private function computeAltitude($text) {
        $altitude = null;

        $text = trim($text);
        if($text == "SFC") {
            $altitude = 0;
        } elseif(substr($text, 0, 2) == "FL") {
            list($fl, $value) = explode(' ', $text);
            $altitude = intval($value)*100;
        } elseif(substr($text, -4) == "AMSL") {
            $altitude = intval($text);
        } elseif (substr($text, -4) == "ASFC") {
            $altitude = intval($text);
        } else {
            error_log("## Not applied altitude ".$text);
        }

        return $altitude;
    }

    public function process() {
        $html = file_get_contents($this->filename);
        $dom = new DOMDocument;
        $dom->loadHTML($html);
        $table = $dom->getElementsByTagName('table')->item(0);

        $airspaces = array();
        $txt_name = "";

        $trs = $table->getElementsByTagName('tr');
        foreach ($trs as $tr) {
            if(!$tr->hasAttribute('id')) continue;

            $airspace = (object) array();
            $airspace->upper      = '';
            $airspace->lower      = '';
            $airspace->minimum    = '';
            $airspace->maximum    = '';
            $airspace->txt_name   = '';
            $airspace->latlon     = array();
            $airspace->remarks    = '';
            $airspace->class      = '';
            $airspace->activities = '';

            $id = $tr->getAttribute('id');
            list($r, $ref, $types) = explode('--', $id);
            $types = explode('-', $types);
            //echo implode(', ', $types)."<br>";

            if(!in_array('GEO_LAT', $types) && in_array('NOM_PARTIE', $types)) {
                $spans = $tr->getElementsByTagName('span');
                if(count($spans)) {
                    foreach ($spans as $span) {
                        if(!$span->hasAttribute('id')) continue;

                        $id = $span->getAttribute('id');
                        list($r, $refA, $refB, $types) = explode('--', $id);
                        $types = explode('-', $types);

                        if(in_array('AIRSPACE.TXT_NAME', $types) && in_array('AIRSPACE_BORDER.NOM_PARTIE', $types)) {
                            $txt_name = $span->textContent;
                        } elseif(in_array('AIRSPACE_BORDER.NOM_PARTIE', $types) || in_array('AIRSPACE_BORDER.NOM_USUEL', $types)) {
                            $txt_name .= " ".$span->textContent;
                        }
                    }
                }
            }

            if(!in_array('GEO_LAT', $types)) continue;

            if(!in_array('NOM_PARTIE', $types)) {
                $airspace->txt_name = $txt_name;
            }

            $elemToRemove = array();
            $tds = $tr->getElementsByTagName('td');
            foreach ($tds as $td) {
                $dels = $td->getElementsByTagName('del');
                if(count($dels)) {
                    foreach ($dels as $del) {
                        $elemToRemove[] = $del;
                    }
                }
            }

            if(count($elemToRemove)) {
                foreach ($elemToRemove as $node) {
                    $node->parentNode->removeChild($node);
                }
            }

            $hasGeoBorder = false;

            $tds = $tr->getElementsByTagName('td');
            foreach ($tds as $td) {
                $spans = $td->getElementsByTagName('span');
                if(count($spans)) {
                    foreach ($spans as $span) {
                        if(!$span->hasAttribute('id')) continue;

                        $id = $span->getAttribute('id');
                        list($r, $refA, $refB, $types) = explode('--', $id);
                        $types = explode('-', $types);

                        if(in_array('AIRSPACE.TXT_NAME', $types) && in_array('AIRSPACE_BORDER.NOM_PARTIE', $types)) {
                            $airspace->txt_name = $span->textContent;
                        } elseif(in_array('AIRSPACE_BORDER.NOM_PARTIE', $types) || in_array('AIRSPACE_BORDER.NOM_USUEL', $types)) {
                            $airspace->txt_name .= " ".$span->textContent;
                        } elseif( in_array('GEO_BORDER.NOM', $types) ) {
                            $hasGeoBorder = true;
                            $airspace->latlon[] = $span->textContent;
                        } elseif( in_array('AIRSPACE_VERTEX.GEO_LAT', $types) ) {
                            $airspace->latlon[]['lat'] = dms_to_deg(trim($span->textContent));
                        } elseif( in_array('AIRSPACE_VERTEX.GEO_LONG', $types) ) {
                            $airspace->latlon[count($airspace->latlon)-1]['lon'] = dms_to_deg(trim($span->textContent));
                        } elseif( in_array('AIRSPACE_VERTEX.VAL_RADIUS_ARC', $types) ) {
                            $sens = 'CW';
                            if (strpos($span->previousSibling->textContent, 'anti-horaire') !== false) {
                                $sens = 'CCW';
                            }
                            $airspace->latlon[] = "ARC§".$sens."§".$span->textContent;
                        } elseif( in_array('AIRSPACE_VERTEX.UOM_RADIUS_ARC', $types)  ||
                                  in_array('AIRSPACE_VERTEX.GEO_LAT_ARC', $types)     ||
                                  in_array('AIRSPACE_VERTEX.GEO_LONG_ARC', $types) ) {
                            $airspace->latlon[count($airspace->latlon)-1] .= "§".$span->textContent;
                        } elseif( in_array('AIRSPACE.VAL_DIST_VER_UPPER', $types) ) {
                            $airspace->upper = $this->computeAltitude($span->textContent);
                        } elseif( in_array('AIRSPACE.VAL_DIST_VER_LOWER', $types) ) {
                            $airspace->lower = $this->computeAltitude($span->textContent);
                        } elseif( in_array('AIRSPACE.UOM_DIST_VER_MNM', $types) ) {
                            $airspace->minimum = $this->computeAltitude($span->textContent);
                        } elseif( in_array('AIRSPACE.VAL_DIST_VER_MAX', $types) ) {
                            $airspace->maximum = $this->computeAltitude($span->textContent);
                        } elseif( in_array('AIRSPACE.TXT_RMK_NAT', $types) ) {
                            $airspace->remarks = $this->cleanUpText($span->textContent);
                        } elseif( in_array('AIRSPACE.ACTIVITE', $types) ) {
                            $airspace->activities = $this->cleanUpText($span->textContent);
                        } elseif( in_array('AIRSPACE.CODE_CLASS', $types) ) {
                            $airspace->class = $span->textContent;
                        } else {
                            error_log("## Not applied type ".implode(', ', $types));
                            error_log($span->textContent);
                        }
                    }
                }
            }

            $first = $airspace->latlon[0];
            $last  = $airspace->latlon[count($airspace->latlon)-1];
            if($first != $last) {
                $airspace->latlon[] = $airspace->latlon[0];
            }

            if($hasGeoBorder) {
                global $boundaries;
            }

            $coordinates = array();
            foreach ($airspace->latlon as $k => $latlon) {
                if(substr($latlon, 0, 3) === "ARC") {
                    list($ref, $sens, $radius, $unit, $lat, $lon) = explode('§', $latlon);
                    
                    $center = array(dms_to_deg($lon), dms_to_deg($lat));
                    $startBearing = round(getBearing($center, array($airspace->latlon[$k-1]["lon"], $airspace->latlon[$k-1]["lat"])));
                    $endBearing = round(getBearing($center, array($airspace->latlon[$k+1]["lon"], $airspace->latlon[$k+1]["lat"])));
                    $angle = round($startBearing-$endBearing);
                    if($sens == 'CW' && ($startBearing > $endBearing))
                        $angle = round( (360-$startBearing) + $endBearing );
                    if($sens == 'CCW' && ($startBearing < $endBearing))
                        $angle = round( (360-$endBearing) + $startBearing );
                    $angle = abs($angle);

                    $posArray = array();
                    for($i=1; $i<=$angle; $i++){
                        $bearing = $sens == 'CCW' ? $startBearing-$i : $startBearing+$i;

                        if($unit == 'km') {
                            $radius *= 0.539957;
                        }

                        $posArray[] = getGeoDestination($center, abs($radius), $bearing);
                    }

                    $coordinates = array_merge($coordinates, $posArray);

                } elseif(substr($latlon, 0, 5) === "Front" || substr($latlon, 0, 2) === "La") {
                    $boundariesLatLonArray = $boundaries["features"][0]["geometry"]["coordinates"][0][0];
                    $posArray = array();

                    $refStart = $k-1;
                    $ref = $airspace->latlon[$refStart];
                    while(!is_array($ref)){
                      $refStart++;
                      $ref = $airspace->latlon[$refStart];
                    }
                    $posArray[] = array($ref["lat"], $ref["lon"]);

                    $distances = array_map(function($item) use($ref) {
                      return distance($item, array($ref["lon"], $ref["lat"]));
                    }, $boundariesLatLonArray);
                    asort($distances);
                    $boundariesStartKey = key($distances);

                    $refEnd = $k+1;
                    $ref = $airspace->latlon[$refEnd];
                    while(!is_array($ref)){
                      $refEnd++;
                      $ref = $airspace->latlon[$refEnd];
                    }
                    $distances = array_map(function($item) use($ref) {
                      return distance($item, array($ref["lon"], $ref["lat"]));
                    }, $boundariesLatLonArray);
                    asort($distances);
                    $boundariesEndKey = key($distances);

                    if( abs($boundariesEndKey - $boundariesStartKey) > 25000){
                        if($boundariesStartKey > $boundariesEndKey) {
                            for($i=$boundariesStartKey; $i<count($boundariesLatLonArray); $i++){
                                $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                            }
                            for($i=0; $i<$boundariesEndKey; $i++){
                                $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                            }
                        } else {
                            for($i=$boundariesEndKey; $i<count($boundariesLatLonArray); $i++){
                                $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                            }
                            for($i=0; $i<$boundariesStartKey; $i++){
                                $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                            }
                        }
                    }else{
                      if($boundariesEndKey < $boundariesStartKey){
                        for($i=$boundariesStartKey; $i>=$boundariesEndKey; $i--)
                          $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                      }else{
                        for($i=$boundariesStartKey; $i<=$boundariesEndKey; $i++)
                          $posArray[] = array('lat' => $boundariesLatLonArray[$i][1], 'lon' => $boundariesLatLonArray[$i][0]);
                      }
                    }
                    
                    $coordinates = array_merge($coordinates, $posArray);
                } else {
                    $coordinates[] = $latlon;
                }
            }

            $airspace->latlon = $coordinates;

            $feature = array(
                "type" => "Feature",
                "properties" => array(
                    "name" => $airspace->txt_name,
                    "class" => $airspace->class,
                    "activities" => $airspace->activities,
                    "remarks" => $airspace->remarks,
                    "verticalLimit" => array(
                        'upper'   => $airspace->upper,
                        'lower'   => $airspace->lower,
                        'minimum'  => $airspace->minimum,
                        'maximum' => $airspace->maximum
                    )
                ),
                "geometry" => array(
                    "type" => "Polygon",
                    "coordinates" => array(
                        array_map(function($coord) {
                            if(array_key_exists('lon', $coord) && array_key_exists('lat', $coord)) {
                                return array($coord['lon'], $coord['lat']);
                            } else {
                                return array($coord[1], $coord[0]);
                            }
                        }, $airspace->latlon)
                    )
                )
            );

            $this->airspaces[] = $feature;
        }

        return $this->airspaces;
    }
}

/*class Airspace {
    private $txt_name = '';
    private $class    = '';
    private $remarks  = '';
    private $callsign = '';
    private $vertical_limit = array();
    private $coordinates   = array();

    public function __construct() {

    }

    public function setTxtName($v) {
        $this->txt_name = $v;
    }

    public function setClass($v) {
        $this->class = $v;
    }

    public function setRemarks($v) {
        $this->remarks = $v;
    }

    public function setVerticalLimit($v) {
        $this->vertical_limit = $v;
    }

    public function setCoordinates($v) {
        $this->coordinates = $v;
    }
}*/
?>