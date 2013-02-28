<?php

class Stack
{
	private $data = array(),
	
	function get() {
		return $data;
	}
	function push(d) {
		array_unshift($data);
		return true;
	}
	function pop() {
		return array_shift($data);
	}
	function clear() {
		$data = array();
	}
}

class Befunge
{
	private $stack = new Stack();

	private $code = array();
	private $c = '';
	private $pos = array(0, 0);
	private $lenmax = array(0, 0);
	private $direction = 6;
	private $string = false;
	
	private function next() {
		$this->pos[0] += $this->direction == 4 ? -1 : ($this->direction == 6 ? 1 : 0);
		if($this->pos[0] > $this->lenmax[0] - 1) $this->pos[0] = 0;
		if($this->pos[0] < 0) $this->pos[0] = $this->lenmax[0] - 1;
		$this->pos[1] += $this->direction == 8 ? -1 : ($this->direction == 2 ? 1 : 0);
		if($this->pos[1] > $this->lenmax[1] - 1) $this->pos[1] = 0;
		if($this->pos[1] < 0) $this->pos[1] = $this->lenmax[1] - 1;
		$this->c = $this->code[$this->pos[1]][$this->pos[0]];
	}
	private function step() {
		if($this->string) {
			if($this->c != '"') {
				
			} else {
			}
		}
	}
}



?>