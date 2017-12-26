<?php
require_once('./mysql.php');
session_start();

$command = $_GET['command'];
switch ($command) {
    case 'login_user':
        $userId = $_POST['user_id'];
        if($userId === null || $userId == 0) {
            $result = array('status' => 'KO');
            break;
        }
        $_SESSION['user_id'] = $userId;
        $result = array('status' => 'OK');
        break;

    case 'save_user':
        $userId = $_POST['id'];
        $userName = $_POST['name'];
        $user = new User($userId);
        $user->setName($userName);
        $user->save();
        $result = array('status' => 'OK', 'user' => $user->asArray());
        break;

    case 'get_users':
        $users = User::find();
        $usersAsArray = array();
        if(count($users)) {
            foreach ($users as $user) {
                $usersAsArray[] = $user->asArray();
            }
        }
        $result = array('status' => 'OK', 'users' => $usersAsArray);
        break;

    case 'get_user':
        if(!isset($_SESSION['user_id'])) {
            $result = array('status' => 'OK', 'user' => null);
            break;
        }
        $user = new User($_SESSION['user_id']);

        $settings = Setting::find(' AND `user_id`='.$_SESSION['user_id']);
        $settingsAsArray = array();
        if(count($settings)) {
            foreach ($settings as $setting) {
                $settingsAsArray[] = $setting->asArray();
            }
        }
        $result = array('status' => 'OK', 'user' => $user->asArray(), 'settings' => $settingsAsArray);
        break;

    case 'set_setting':
        $key = $_POST['key'];
        $value = $_POST['value'];

        $settings = Setting::find(' AND `key`="'.$key.'" AND `user_id`='.$_SESSION['user_id']);
        if(count($settings) > 0) {
            $setting = $settings[0];
        } else {
            $setting = new Setting();
            $setting->setKey($key);
            $setting->setUserId($_SESSION['user_id']);
        }
        $setting->setValue($value);
        $setting->save();
        $result = array('status' => 'OK', 'setting' => $setting->asArray());
        break;

    case 'get_settings':
        if(!isset($_SESSION['user_id'])) {
            $result = array('status' => 'OK', 'settings' => null);
            break;
        }
        $settings = Setting::find(' AND `user_id`='.$_SESSION['user_id']);
        $settingsAsArray = array();
        if(count($settings)) {
            foreach ($settings as $setting) {
                $settingsAsArray[] = $setting->asArray();
            }
        }
        $result = array('status' => 'OK', 'settings' => $settingsAsArray);
        break;

    case 'create_route':
        $route = new Route();
        $route->save();
        $result = array('status' => 'OK', 'route' => $route->asArray());
        break;

    case 'delete_route':
        $route = new Route($_POST['id']);
        $route->delete();
        $result = array('status' => 'OK');
        break;

    case 'get_routes':
        //$routes = Route::find(' AND `user_id`='.$_SESSION['user_id'].' ORDER BY id DESC');
        $routes = Route::find(' ORDER BY id DESC');
        $routesAsArray = array();
        if(count($routes) > 0) {
            foreach ($routes as $route) {
                $routesAsArray[] = $route->asArray();
            }
        }
        $result = array('status' => 'OK', 'routes' => $routesAsArray);
        break;

    case 'get_route':
        $route = new Route($_GET['id']);
        $result = array('status' => 'OK', 'route' => $route->asArray());
        break;

    case 'post_route':
        $route = new Route($_POST['id']);
        $route->setUserId($_SESSION['user_id']);
        $route->setName($_POST['name']);
        $route->setComment($_POST['comment']);
        $route->setGeojson(json_encode($_POST['geojson']));
        $route->save();
        $result = array('status' => 'OK', 'route' => $route->asArray());
        break;

    case 'search_airport':
        $q = mysqli_real_escape_string($mysqli, $_POST['q']);
        $filter = " AND (`municipality` LIKE '%".$q."%' OR `name` LIKE '%".$q."%' OR `ident` LIKE '".$q."%')";
        $airports = Airport::find($filter);

        $airportsAsArray = array();
        if(count($airports) > 0) {
            foreach ($airports as $airport) {
                $airportsAsArray[] = $airport->asArray();
            }
        }

        $result = array('status' => 'OK', 'airports' => $airportsAsArray);
        break;

    case 'get_terrain_elevation':
          include_once('lib.hgt.php');
          $terrain = getElevations($_POST['path'], $_POST['samples']);
          $result = array('status' => 'OK', 'terrain' => $terrain);
        break;

    case 'reboot':
        exec("/usr/bin/sudo /sbin/reboot");
        break;

    case 'shutdown':
        exec("/usr/bin/sudo /sbin/halt -p");
        break;

    case 'restart_server':
        //TO BO DONE
        break;

    default:
        $result = array();
        break;
}

header('Content-Type: application/json');
$json = json_encode($result);
die($json);