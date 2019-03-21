<?php
$sql = new mysqli('localhost', 'root', '', 'game');

if (mysqli_connect_errno()) die ('Error connect data base');

$data = json_decode(file_get_contents('php://input'), true);

if ($data['name'] != 'TeRTeR') {
	if ($sql->query("SELECT * FROM `game_results` WHERE `name` = '".$data['name']."'")->num_rows == 1) {
	    $sql->query("UPDATE `game_results` SET `score` = '".$data['score']."' WHERE `name` = '".$data['name']."'");
	} else {
	    $sql->query("INSERT INTO `game_results` (`name`, `score`) VALUES ('".$data['name']."', '".$data['score']."')");
	}
}

$list = $sql->query("SELECT * FROM `game_results` ORDER BY `score` DESC LIMIT 10");

$res = array();

while ($user = $list->fetch_array(MYSQLI_ASSOC)) {
    array_push($res, $user);
}

echo json_encode($res);