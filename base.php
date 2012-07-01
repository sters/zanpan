<?php

require('methods.php');
$_REQUEST = array_merge($_GET,$_POST);

$db = MyDB::open();
if(!isset($_REQUEST['user'])){
	echo 'error: user';
	exit;
}
	
if(isset($_POST['login'])) {
	echo "OK!";

}else if(isset($_POST['msg'])) {
	$_REQUEST = $db->escape(h($_REQUEST));
	$t = date("Y/m/d H:i:s");
	$db->query("INSERT INTO `chat` (`ID`, `Name`, `MSG`, `Date`) 
		VALUES (
			NULL,
			'{$_REQUEST['user']}',
			'{$_REQUEST['msg']}',
			'{$t}'
		);");

} else if(isset($_GET['list'])) {
	$db->query("SELECT Name, MSG, DATE_FORMAT(Date, '%k:%i:%s')
		AS DateF FROM `chat` ORDER BY Date DESC LIMIT 0, 5");
	while($d = $db->fetch_assoc()) {
		echo $d['DateF'].' '.$d['Name'].chr(2).$d['MSG'].'/'.chr(3);
	}
	echo chr(0);
}

exit;
?>