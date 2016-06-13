<?php
class Settings
{
  private $settings = array();

  function __construct($file){
    $this->settings = json_decode( file_get_contents($file), true );
  }

  function write($array, $file){
    $array = array_replace_recursive($this->settings, $array);
    $this->safefilerewrite($file, json_encode($array, JSON_PRETTY_PRINT));
  }

  function safefilerewrite($fileName, $dataToSave){
    if ($fp = fopen($fileName, 'w')){
      $startTime = microtime(TRUE);
      do{
        $canWrite = flock($fp, LOCK_EX);
        // If lock not obtained sleep for 0 - 100 milliseconds, to avoid collision and CPU load
        if(!$canWrite) usleep(round(rand(0, 100)*1000));
      } while ((!$canWrite)and((microtime(TRUE)-$startTime) < 5));

      //file was locked so now we can store information
      if ($canWrite){
        fwrite($fp, $dataToSave);
        flock($fp, LOCK_UN);
      }
      fclose($fp);
    }
  }

  function get(){
    return $this->settings;
  }
}



$conf = new Settings("settings.json");
if( isset($_GET["get"]) ){
  echo json_encode($conf->get());
  exit();
}

if( isset($_GET["set"]) ){
  $data = json_decode($_GET['set'], true);
  echo $data;
  $conf->write($data, "settings.json");
  exit();
}
?>
