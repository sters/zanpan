<?php

// revert magic quotes.
if( get_magic_quotes_gpc() )
{
	function strip_magic_quotes_slashes($arr)
	{
		return is_array($arr) ?
			array_map('strip_magic_quotes_slashes', $arr) :
			stripslashes($arr);
	}
	$_GET     = strip_magic_quotes_slashes($_GET);
	$_POST    = strip_magic_quotes_slashes($_POST);
	$_REQUEST = strip_magic_quotes_slashes($_REQUEST);
	$_COOKIE  = strip_magic_quotes_slashes($_COOKIE);
}

// default timezone
date_default_timezone_set('Asia/Tokyo');

// htmlspecialchars
//   input string or array
function h($str, $option=ENT_QUOTES) {
	if(is_array($str)) {
		foreach($str as $i=>$row) {
			$str[$i] = htmlspecialchars($row, $option);
		}
		return $str;
	}
	if(is_string($str)) {
		return htmlspecialchars($str, $option);
	}
	die('"h()" call error. h(string) or h(array)');
}

if(!isset($_REQUEST['user'])){
	echo 'error: user';
	exit;
}

if(isset($_POST['login'])) {
	echo "OK!";

}else{
	$db_url  = "localhost";
	$db_user = "root";
	$db_pass = "";
	$db_db   = "befungechat";
	$connection = mysql_connect($db_url, $db_user, $db_pass);
	mysql_select_db($db_db, $connection);
	mysql_set_charset("utf8");
	
	if(isset($_POST['msg'])) {
		$_REQUEST = $db->escape(h($_REQUEST));
		$t = date("Y/m/d H:i:s");
		mysql_query("INSERT INTO `chat` (`ID`, `Name`, `MSG`, `Date`) 
			VALUES (
				NULL,
				'{$_REQUEST['user']}',
				'{$_REQUEST['msg']}',
				'{$t}'
			);", $connection);

	} else if(isset($_GET['list'])) {
		$res = mysql_query("SELECT Name, MSG, DATE_FORMAT(Date, '%k:%i:%s') AS DateF
			FROM `chat` ORDER BY Date DESC LIMIT 0, 5", $connection);
		while($d = mysql_fetch_assoc($res)) {
			echo $d['DateF'].' '.$d['Name'].'/'.chr(2).$d['MSG'].'/'.chr(3);
		}
		echo chr(0);
	}

	mysql_close($connection);
}

