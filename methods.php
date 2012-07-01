<?php

// local debug
define("ISLOCALDEBUG", true);

// revert magic quotes.
//   fuck magic quote! :(
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
function h_decode($str, $option=ENT_QUOTES) {
	if(is_array($str)) {
		foreach($str as $i=>$row) {
			$str[$i] = htmlspecialchars_decode($row, $option);
		}
		return $str;
	}
	if(is_string($str)) {
		return htmlspecialchars_decode($str, $option);
	}
	die('"h()" call error. h(string) or h(array)');
}

// database management
final class MyDB {

	const DBurl  = "";
	const DBuser = "";
	const DBpass = "";
	const DBdb   = "";
	
	const d_url  = "localhost";
	const d_user = "root";
	const d_pass = "";
	const d_db   = "befungechat";
	
	// sql connection
	public $mysql_link = null;
	// cache latest query resource
	public $_result = null;
	// cache latest affected rows
	public $query_rows = 0;
	
	
	// db values
	static function url()	{ return defined("ISLOCALDEBUG") ? self::d_url	: self::DBurl	; }
	static function user()	{ return defined("ISLOCALDEBUG") ? self::d_user	: self::DBuser	; }
	static function pass()	{ return defined("ISLOCALDEBUG") ? self::d_pass	: self::DBpass	; }
	static function db()	{ return defined("ISLOCALDEBUG") ? self::d_db	: self::DBdb	; }
	
	// destructor
	function __destruct() {
		self::close();
	}
	
	// open
	//   create new instance, and return.
	static function open() {
		$x = new MyDB;
		$x->mysql_link = mysql_connect(self::url(), self::user(), self::pass())
			or die("mysql_connect error !\n".mysql_error());
		mysql_select_db(self::db(), $x->mysql_link)
			or die("mysql_select_db error !\n".mysql_error());
		mysql_set_charset("utf8");
		return $x;
	}
	
	// close
	//   mysql close
	function close() {
		mysql_close($this->mysql_link)
			;//or die("エラーが発生しました。管理者へ連絡してください。");	
	}
	
	// free
	//   call free method on query result resource
	function free($result = null) {
		if(!is_resource($result)){
			$this->query_rows = 0;
			mysql_free_result($this->_result);
			$this->_result = null;
			return;
		}
		mysql_free_result($result);
	}
	
	// escape
	//   if argument is string, call mysql escape.
	//   is array, all element call escape method
	function escape($txt) {
		if(is_array($txt)) {
			foreach($txt as $i=>$row) {
				$txt[$i] = mysql_real_escape_string($row);
			}
			return $txt;
		}
		return mysql_real_escape_string($txt);
	}
	
	// insert_id
	//   get A_I number after execute INSERT query
	function insert_id($result = null) {
		if(!is_resource($result)){
			return mysql_insert_id();
		}
		return mysql_insert_id($result);
	}
	
	// query
	//   exec sql query. return resource
	function query($sql_command) {
		if(is_resource($this->_result))
			mysql_free_result($this->_result);
		$this->_result = mysql_query($sql_command, $this->mysql_link)
			;//or die("エラーが発生しました。管理者へ連絡してください。");
		if(preg_match("/^\s*insert/i", $sql_command)) {
			$this->query_rows = mysql_affected_rows();
		} else {
			if($this->_result === false) {
				return false;
			}
			if(preg_match("/^\s*select/i", $sql_command)) {
				$this->query_rows = mysql_num_rows($this->_result);
			} else {
				if(is_resource($this->_result))
					$this->query_rows = mysql_affected_rows($this->_result);
				else
					$this->query_rows = mysql_affected_rows();
			}
		}
		return $this->_result;
	}
	
	// fetch_row
	//   call fetch_row. its array(list).
	//   if no argument, use latest resource
	function fetch_row($result = null) {
		if(!is_resource($result)){
			if(!is_resource($this->_result)) return false;
			return mysql_fetch_row($this->_result);
		}
		return mysql_fetch_row($result);
	}
	
	// fetch_assoc
	//   call fetch_assoc. its array(hash, dictionary)
	//   if no argument, use latest resource
	function fetch_assoc($result = null) {
		if(!is_resource($result)){
			if(!is_resource($this->_result)) return false;
			return mysql_fetch_assoc($this->_result);
		}
		return mysql_fetch_assoc($result);
	}
	
	// result
	//   return all result rows in fetch_assoc.
	//   but its slowly, only use simply process
	function result($result = null) {
		$a = $this->_result;
		if(is_resource($result)) $a = $result;
		$ret = array();
		while($r = mysql_fetch_assoc($a))
			$ret[] = $r;
		return $ret;
	}
}

?>