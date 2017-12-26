<?php

function mysqliConn(){
  $mysqli = new mysqli("127.0.0.1", "aeropi"/*usr*/, "aeropi"/*pwd*/, "aeropi_v1"/*db*/);
  if($mysqli->connect_errno) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . $mysqli->connect_errno . PHP_EOL;
    echo "Debugging error: " . $mysqli->connect_error . PHP_EOL;
    exit;
  }
  return $mysqli;
}

if( isset($_GET["action"])) {
  $action = $_GET["action"];

  if($action == "shutdown"){
    exec("/usr/bin/sudo /sbin/halt -p");
  }

  if($action == "reboot"){
    exec("/usr/bin/sudo /sbin/reboot");
  }

  if($action == "elevation"){
    include_once('lib.hgt.php');
    echo getElevations($_GET['path'], $_GET['samples']);
  }

  if($action == "saveSettings" || $action == "loadSettings"){
    $mysqli = mysqliConn();
    $id = 1;
    $sql = "SELECT settings FROM pilot WHERE id = $id";
    if( !$result = $mysqli->query($sql) ){
      echo "Error: Our query failed to execute and here is why: \n";
      echo "Query: " . $sql . PHP_EOL;
      echo "Errno: " . $mysqli->errno . PHP_EOL;
      echo "Error: " . $mysqli->error . PHP_EOL;
      exit;
    }
    if ($result->num_rows === 0) {
      echo "We could not find a match for ID $id, sorry about that. Please try again.";
      exit;
    }
    $user = $result->fetch_assoc();

    if($action == "saveSettings"){
      $reqSettings = json_decode($_GET['v'], true);
      $currentSettings = json_decode($user['settings'], true);
      $newSettings = array_replace_recursive($currentSettings, $reqSettings);
      $newSettings = json_encode($newSettings);
      $sql = "UPDATE pilot SET settings = '$newSettings' WHERE id = $id";
      if( !$mysqli->query($sql) ){
        echo "Error: Our query failed to execute and here is why: \n";
        echo "Query: " . $sql . PHP_EOL;
        echo "Errno: " . $mysqli->errno . PHP_EOL;
        echo "Error: " . $mysqli->error . PHP_EOL;
        $result->free();
        $mysqli->close();
        exit;
      }
    }

    if($action == "loadSettings"){
      echo $user['settings'];
    }
    $result->free();
    $mysqli->close();
  }
  
  if($action == "getAirspace"){
    $mysqli = mysqliConn();
    $position = json_decode($_GET['position'], true);
    $lng = $position['lng'];
    $lat = $position['lat'];
    $sql = "SELECT *, AsText(geometry) FROM `airspace` WHERE MBRContains( geometry, GeomFromText('POINT($lng $lat)') )";
    echo $sql;

    if( !$result = $mysqli->query($sql) ){
      echo "Error: Our query failed to execute and here is why: \n";
      echo "Query: " . $sql . PHP_EOL;
      echo "Errno: " . $mysqli->errno . PHP_EOL;
      echo "Error: " . $mysqli->error . PHP_EOL;
      exit;
    }
    if ($result->num_rows === 0) {
      echo "No result";
      exit;
    }
    
    $airspaces = array("type"=>"FeatureCollection", "features"=>array());
    while($airspace = $result->fetch_assoc()){
      unset($airspace['geometry']);
      $airspace['info'] = utf8_decode($airspace['info']);
      $arr = array(
        "type" => "feature",
        "properties" => array(
          "name" => $airspace['name'],
          "class" => $airspace['class'],
          "callsign" => $airspace['callsign'],
          "verticalLimit" => array(
            "UPPER" => null,
            "LOWER" => null
          )
        ),
        "geometry" => array(
          "type" => "Polygon",
          "coordinates" => null
        )
      );
      $airspaces['features'][] = $airspace;
    }
    echo "<pre>";
    echo json_encode($airspaces, JSON_PRETTY_PRINT);
    echo "</pre>";
    $result->free();
    $mysqli->close();
  }
}
?>
