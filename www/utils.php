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
}
?>
