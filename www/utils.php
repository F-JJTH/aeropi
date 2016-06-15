<?php

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
    $mysqli = new mysqli("127.0.0.1", "aeropi"/*usr*/, "aeropi"/*pwd*/, "aeropi"/*db*/);
    $json = array();
    $id = 1;
    if($mysqli->connect_errno) {
      echo "Error: Unable to connect to MySQL." . PHP_EOL;
      echo "Debugging errno: " . $mysqli->connect_errno . PHP_EOL;
      echo "Debugging error: " . $mysqli->connect_error . PHP_EOL;
      exit;
    }
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
      if( !$result = $mysqli->query($sql) ){
        echo "Error: Our query failed to execute and here is why: \n";
        echo "Query: " . $sql . PHP_EOL;
        echo "Errno: " . $mysqli->errno . PHP_EOL;
        echo "Error: " . $mysqli->error . PHP_EOL;
        exit;
      }
    }

    if($action == "loadSettings"){
      echo $user['settings'];
    }
    $result->free();
    mysqli_close($db);
  }
}
?>
