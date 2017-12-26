<?php
$mysqli = new mysqli("localhost", "aeropi", "aeropi", "aeropi");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
}
mysqli_set_charset($mysqli, "utf8");

class User {
    private $id;
    private $name;
    private $create_date;
    private $update_date;

    public function __construct($id = null) {
        if($id != null) {
            global $mysqli;
            $res = $mysqli->query("SELECT * FROM users WHERE id=".$id);
            $row = $res->fetch_assoc();
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->create_date = $row['create_date'];
            $this->update_date = $row['update_date'];
        } else {
            $this->id = null;
            $this->name = null;
            $this->create_date = time();
            $this->update_date = time();
        }
    }

    public function getId() { return $this->id; }

    public function setName($name) { $this->name = $name; }

    static public function find($filter = '') {
        global $mysqli;
        $rValue = array();
        $res = $mysqli->query("SELECT * FROM `users` WHERE id > 0 ".$filter);
        if($res->num_rows > 0) {
            while($row = $res->fetch_assoc()) {
                $rValue[] = new User($row['id']);
            }
        }

        return $rValue;
    }

    public function save() {
        global $mysqli;
        $this->update_date = time();

        if($this->getId() === null) {
            $sql = "INSERT INTO `users` (`name`, `create_date`, `update_date`) VALUES (" .
                " '". $mysqli->real_escape_string($this->name) ."',".
                " '". date('Y-m-d H:i:s',$this->create_date) ."',".
                " '". date('Y-m-d H:i:s',$this->update_date) ."'".
            ")";
        } else {
            $sql = "UPDATE `users` SET" .
                " `name`='". $mysqli->real_escape_string($this->name) ."',".
                " `update_date`='". date('Y-m-d H:i:s',$this->update_date) ."'".
                " WHERE `id`=".$this->id;
        }

        if ($mysqli->query($sql) !== TRUE) {
            echo "Error: " . $sql . "<br>" . $mysqli->error;
        } else {
            $this->id = $mysqli->insert_id;
        }
    }

    public function asArray() {
        $rValue = array();
        foreach ($this as $key => $value) {
            $rValue[$key] = $value;
        }
        return $rValue;
    }
}

class Setting {
    private $id;
    private $key;
    private $value;
    private $user_id;

    public function __construct($id = null) {
        if($id != null) {
            global $mysqli;
            $res = $mysqli->query("SELECT * FROM settings WHERE id=".$id);
            $row = $res->fetch_assoc();
            $this->id = $row['id'];
            $this->key = $row['key'];
            $this->value = $row['value'];
            $this->user_id = $row['user_id'];
        } else {
            $this->id = null;
            $this->key = null;
            $this->value = null;
            $this->user_id = null;
        }
    }

    static public function find($filter = '') {
        global $mysqli;
        $rValue = array();
        $res = $mysqli->query("SELECT * FROM `settings` WHERE id > 0 ".$filter);
        if($res->num_rows > 0) {
            while($row = $res->fetch_assoc()) {
                $rValue[] = new Setting($row['id']);
            }
        }

        return $rValue;
    }

    public function getId() { return $this->id; }

    public function setKey($key) { $this->key = $key; }
    public function getKey() { return $this->key; }

    public function setValue($value) { $this->value = $value; }
    public function getValue() { return $this->value; }

    public function setUserId($id) { $this->user_id = $id; }
    public function getUserId() { return $this->user_id; }

    public function save() {
        global $mysqli;
        if($this->getId() === null) {
            $sql = "INSERT INTO `settings` (`user_id`, `key`, `value`) VALUES (" .
                " '". $mysqli->real_escape_string($this->user_id) ."',".
                " '". $mysqli->real_escape_string($this->key) ."',".
                " '". $mysqli->real_escape_string($this->value) ."'".
            ")";
        } else {
            $sql = "UPDATE `settings` SET" .
                " `user_id`='". $mysqli->real_escape_string($this->user_id) ."',".
                " `key`='". $mysqli->real_escape_string($this->key) ."',".
                " `value`='". $mysqli->real_escape_string($this->value) ."'".
                " WHERE `id`=".$this->id;
        }

        if ($mysqli->query($sql) !== TRUE) {
            echo "Error: " . $sql . "<br>" . $mysqli->error;
        } else {
            $this->id = $mysqli->insert_id;
        }
    }

    public function asArray() {
        $rValue = array();
        foreach ($this as $key => $value) {
            $rValue[$key] = $value;
        }
        return $rValue;
    }
}

class Route {
    private $id;
    private $user_id;
    private $name;
    private $comment;
    private $geojson;
    private $create_date;
    private $update_date;

    public function __construct($id = null) {
        if($id != null) {
            global $mysqli;
            $res = $mysqli->query("SELECT * FROM routes WHERE id=".$id);
            $row = $res->fetch_assoc();
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->user_id = $row['user_id'];
            $this->comment = $row['comment'];
            $this->geojson = $row['geojson'];
            $this->create_date = $row['create_date'];
            $this->update_date = $row['update_date'];
        } else {
            $this->id = null;
            $this->name = null;
            $this->user_id = null;
            $this->comment = null;
            $this->geojson = null;
            $this->create_date = time();
            $this->update_date = time();
        }
    }

    static public function find($filter = '') {
        global $mysqli;
        $rValue = array();
        $res = $mysqli->query("SELECT * FROM routes WHERE id > 0 ".$filter);
        if($res->num_rows > 0) {
            while($row = $res->fetch_assoc()) {
                $rValue[] = new Route($row['id']);
            }
        }

        return $rValue;
    }

    public function getId() {
        return $this->id;
    }

    public function getUserId() { return $this->user_id; }
    public function setUserId($id) { $this->user_id = $id; }

    public function getName() { return $this->name; }
    public function setName($name) { $this->name = $name; }

    public function getComment() { return $this->comment; }
    public function setComment($comment) { $this->comment = $comment; }

    public function getGeojson() { return $this->geosjon; }
    public function setGeojson($geojson) { $this->geojson = $geojson; }

    public function getCreateDate() { return $this->create_date; }
    public function getUpdateDate() { return $this->update_date; }

    public function save() {
        global $mysqli;
        $this->update_date = time();

        if($this->getId() === null) {
            $this->create_date = time();
            $sql = "INSERT INTO `routes` (`name`, `user_id`, `comment`, `geojson`, `create_date`, `update_date`) VALUES (" .
                " '". $mysqli->real_escape_string($this->name) ."',".
                " '". $this->user_id ."',".
                " '". $mysqli->real_escape_string($this->comment) ."',".
                " '". $mysqli->real_escape_string($this->geojson) ."',".
                " '". date('Y-m-d H:i:s',$this->create_date) ."',".
                " '". date('Y-m-d H:i:s',$this->update_date) ."'".
            ")";
        } else {
            $sql = "UPDATE `routes` SET" .
                " `name`='". $mysqli->real_escape_string($this->name) ."',".
                " `user_id`='". $this->user_id ."',".
                " `comment`='". $mysqli->real_escape_string($this->comment )."',".
                " `geojson`='". $mysqli->real_escape_string($this->geojson )."',".
                " `update_date`='". date('Y-m-d H:i:s',$this->update_date) ."'".
                " WHERE `id`=".$this->id;
        }

        if ($mysqli->query($sql) !== TRUE) {
            echo "Error: " . $sql . "<br>" . $mysqli->error;
        } else {
            $this->id = $mysqli->insert_id;
        }
    }

    public function delete() {
        global $mysqli;
        if($this->getId() > 0) {
            $sql = "DELETE FROM `routes` WHERE id=".$this->getId();
            $mysqli->query($sql);
        }
    }

    public function asArray() {
        $rValue = array();
        foreach ($this as $key => $value) {
            $rValue[$key] = $value;
        }
        return $rValue;
    }
}

class Airport {
    private $id;
    private $ident;
    private $name;
    private $latitude;
    private $longitude;
    private $elevation;
    private $type;
    private $municipality;
    private $ourairports_id;

    public function getId() { return $this->id; }
    public function getIdent() { return $this->ident; }
    public function getName() { return $this->name; }
    public function getLatitude() { return $this->latitude; }
    public function getLongitude() { return $this->longitude; }
    public function getElevation() { return $this->elevation; }
    public function getType() { return $this->type; }
    public function getMunicipality() { return $this->municipality; }
    public function getOurairportsId() { return $this->ourairports_id; }

    public function getCoordinates() {
        return array('lat' => $this->getLatitude(), 'lon' => $this->getLongitude());
    }

    public function __construct($id = null) {
        if($id != null) {
            global $mysqli;
            $res = $mysqli->query("SELECT * FROM airports WHERE id=".$id);
            $row = $res->fetch_assoc();
            $this->id = $row['id'];
            $this->ident = $row['ident'];
            $this->type = $row['type'];
            $this->name = $row['name'];
            $this->latitude = $row['latitude'];
            $this->longitude = $row['longitude'];
            $this->elevation = $row['elevation'];
            $this->municipality = $row['municipality'];
            $this->ourairports_id = $row['ourairports_id'];
        } else {
            $this->id =  null;
            $this->ident =  null;
            $this->type = null;
            $this->name =  null;
            $this->latitude = null;
            $this->longitude = null;
            $this->elevation = null;
            $this->municipality = null;
            $this->ourairports_id = null;
        }
    }

    static public function find($filter = '') {
        global $mysqli;
        $rValue = array();
        $q = "SELECT * FROM airports WHERE id > 0 ".$filter;
        $res = $mysqli->query($q);
        if($res->num_rows > 0) {
            while($row = $res->fetch_assoc()) {
                $rValue[] = new Airport($row['id']);
            }
        }

        return $rValue;
    }

    public function asArray() {
        $rValue = array();
        foreach ($this as $key => $value) {
            $rValue[$key] = $value;
        }
        $rValue['coordinates'] = $this->getCoordinates();
        return $rValue;
    }

    public function save() {

    }
}
?>