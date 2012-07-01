
(function($) {

	$.fn.befunge = function() {
	
		var befungeElements = {
			code: 		"#befungeCode",
			runcode: 	"#befungeRunCode",
			stack: 		"#befungeStack"
		};
		
		// classes
		var Stack = {
			data : [],
			element : undefined,
			setElement : function() {
				if(this.element != undefined) return;
				this.element = $("#befungeStack");
			},
			push : function(d) {
				this.setElement();
				this.data.unshift(d);
				this.element.html(this.data.join("<br>\n"));
				return true;
			},
			pop : function() {
				this.setElement();
				var d = this.data.shift();
				this.element.html(this.data.join("<br>\n"));
				return d;
			},
			clear : function() {
				this.setElement();
				this.data = [];
				this.element.html("");
			}
		};
		
		var Result = {
			element : undefined,
			setElement : function() {
				if(this.element != undefined) return;
				this.element = $("#befungeResult");
			},			
			clear : function() {
				this.setElement();
				this.element.html("");
			},
			add : function(str) {
				this.setElement();
				this.element.html(this.element.html() + str);
			}
		};
		
		var Code = {
			direction 	: 6,
			pos 		: [0,0],
			c 			: '',
			source 		: [],
			lenmax 		: 0,
			runDelay 	: 20,
			running 	: false,
			nowTimeout	: 0,
			strings     : false,
			
			makeTable : function() {
				$("#befungeRunCode").text("");
				for(var i=0, ymax=this.source.length; i<ymax; i++) {
					var tr = $("<tr>");
					for(var j=0, xmax=this.source[i].length; j<xmax; j++) {
						tr.append(
							$("<td>").text(this.source[i].substr(j,1))
						);
					}
					$("#befungeRunCode").append(tr);
				}
				$("#befungeRunCode td").dblclick(function(){
					$(this).toggleClass("break");
				});
			},
			updateTable : function(x,y, character) {
				$("#befungeRunCode tr:eq(" + y  + ") td:eq(" + x + ")")
					.text(character);
			},
			moveTable : function(remove) {
				$("#befungeRunCode tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")")
					.toggleClass("now", !remove);
			},
			
			init : function() {
				Stack.clear();
				Result.clear();
				this.direction = 6;
				this.pos = [0,0];
				this.c = '';
				this.lenmax = 0;
				this.strings = false;
				this.source = $("#befungeCode").val().split("\n")
				for(var i in this.source) {
					if(this.lenmax < this.source[i].length)
						this.lenmax = this.source[i].length;
				}
				for(var i in this.source) {
					if(this.lenmax > this.source[i].length)
						this.source[i] += new Array(this.lenmax - this.source[i].length + 1).join(' ');
				}
				this.makeTable();
				this.moveTable();
				this.c = this.source[this.pos[1]].substr(this.pos[0], 1);
			},
			
			Next : function() {
				this.moveTable(true);
				$("#befungeDirection").text(["↓","←","→","↑"][this.direction / 2 - 1]);
				this.pos[0] += this.direction == 4 ? -1 : (this.direction == 6 ? 1 : 0);
				this.pos[1] += this.direction == 8 ? -1 : (this.direction == 2 ? 1 : 0);
				if(this.pos[0] > this.lenmax - 1) this.pos[0] = 0;
				if(this.pos[0] < 0) this.pos[0] = this.lenmax - 1;
				if(this.pos[1] > this.source.length - 1) this.pos[1] = 0;
				if(this.pos[1] < 0) this.pos[1] = this.source.length - 1;
				this.moveTable();
				this.c = this.source[this.pos[1]].substr(this.pos[0], 1);
			},
			
			start: function(reset) {
				if(this.running && !reset) return;
				this.init();
				this.running = true;
			},
			
			//
			step : function() {
				if(!this.running) return false;
				if(this.string) {
					if(this.c != '"') {
						Stack.push(this.c.charCodeAt(0));
						this.Next();
					} else {
						this.Next();
						this.string = false;
					}
					return true;
				}
				switch(this.c){					
					// pass
					case '#':
						this.Next();
						break;
				
					// direction
					case 'v':
						this.direction = 2;
						break;
					case '<':
						this.direction = 4;
						break;
					case '>':
						this.direction = 6;
						break;
					case '^':
						this.direction = 8;
						break;
					case '_': case '|':
						var d = Stack.pop();
						this.direction = this.c == '_' ? (d == 0 ? 6 : 4) : (d == 0 ? 2 : 8)
						break;
					case '?':
						this.direction = parseInt(Math.random() * 4) * 2;
						break;
						
					// literal
					case '0': case '1': case '2':
					case '3': case '4': case '5':
					case '6': case '7': case '8':
					case '9':
						Stack.push(parseInt(this.c));
						break;
					
					case '"':
						this.string = true;
						break;
					
					
					// user input
					case '&':
					case '~':
						break;
						
					// output	
					case '.':
						Result.add(Stack.pop() +' ');
						break;
					case ',':
						Result.add(String.fromCharCode(Stack.pop()));
						break;
						
					// calc
					case '+':
					case '-':
					case '*':
					case '/':
					case '%':
						var n = Stack.pop();
						Stack.push(eval("("+Stack.pop()+")" + this.c + "("+n+")"));
						break;
					
					case '`':
						var n = Stack.pop();
						Stack.push(Stack.pop() > n ? 1 : 0);
						break;
					case '!':
						Stack.push(Stack.pop() ? 0 : 1);
						break;
						
					// stack
					case ':':
						var n = Stack.pop();
						Stack.push(n);
						Stack.push(n);
						break;
						
					case "\\":
						var i = Stack.pop();
						var j = Stack.pop();
						Stack.push(i);
						Stack.push(j);
						break;
						
					case '$':
						Stack.pop();
						break;
							
					case 'g':
						var y = Stack.pop();
						var x = Stack.pop();
						Stack.push(this.source[y].charCodeAt(x));
						break;
							
					case 'p':
						var y = Stack.pop();
						var x = Stack.pop();
						var v = Stack.pop();
						this.source[y] =
							this.source[y].substring(0, x-1)
							+ String.fromCharCode(v)
							+ this.source[y].substring(x+1, this.source[y].length);
						
						this.updateTable(x,y, String.fromCharCode(v));
						break;
					
					case ' ':
						//while(this.c == ' ')
						//	this.Next();
						//return true;
						break;
					
					case '@':
						return false;
					
					default:
						break;
				}
				this.Next();
				if($("#befungeRunCode tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")").hasClass("break")) {
					this.breakPoint();
					return false;
				}
				return true;
			},
			
			Run : function() {
				this.stop();
				if(!this.running) this.start(true);
				(function() {
					if(Code.step())
						Code.nowTimeout = setTimeout(arguments.callee, Code.runDelay);
				})();
			},
			
			stop : function(abord) {
				clearTimeout(this.nowTimeout);
				if(abord) {
					this.start(true);
				}
			},
			
			breakPoint : function(){}
		};
		
		// init, add "Befunge" components
		var element = $(this);
		(function() {
			// css
			$("head:first").append(
				'<style>' +
					'\n #befungeCode		{float:left; width:50%; height:300px;}' +
					'\n #befungeRunCode		{float:left; border-collapse: collapse;}' +
					'\n #befungeRunCode td' +
					'	{width:15px; height:20px; border:1px solid gray; text-align:center;}' +
					'\n #befungeRunCode td.now {background-color: #BCF3FF;}' +
					'\n #befungeRunCode td.break {background-color: #FF9393;}' +
					'\n #befungeRunCode td.now.break {background-color: #DEC3C9;}' +
					'\n #befungeStack		{overflow:hidden; float:left; padding:5px; border:1px solid black; width:100px; height:300px;}' +
					'\n #befungeDirection	{float:left; font-size: 4em;}' +
				'\n</style>'
			);
			
			// tag
			element.html("");
			var btRun = $("<input type='button' value='Run'>");
			var btStep = $("<input type='button' value='Step'>");
			var btPause = $("<input type='button' value='Pause'>");
			var btAbord = $("<input type='button' value='Abord'>");
			btRun.click(function(){
				Code.Run();
				btRun.attr("disabled", "true");
				btStep.attr("disabled", "true");
				btPause.removeAttr("disabled");
				btAbord.removeAttr("disabled");
			});
			btStep.click(function(){
				Code.running ? Code.step() : Code.start();
				btAbord.removeAttr("disabled");
			});
			Code.breakPoint = function() {
				Code.stop();
				btRun.removeAttr("disabled");
				btStep.removeAttr("disabled");
				btPause.attr("disabled", "true");
			};
			btPause.click(Code.breakPoint).attr("disabled", "true");
			btAbord.click(function(){
				btPause.click();
				Code.stop(true);
				btAbord.attr("disabled", "true");
			}).attr("disabled", "true");
			element
				.append(btRun)
				.append("&nbsp;&nbsp;")
				.append(btStep)
				.append("&nbsp;&nbsp;")
				.append(btPause)
				.append("&nbsp;&nbsp;&nbsp;&nbsp;")
				.append(btAbord)
				.append(
					"<br>" +
					"<textarea id='befungeCode'></textarea>" +
					"<div id='befungeStack'></div>" +
					"<table id='befungeRunCode'></table>" +
					"<span id='befungeDirection'></span>" +
					"<br style='clear:both;width:100%;'>" +
					"<div id='befungeResult'></div>"
				)
			;
		})();
		
		return this;
	};

	$(document).ready(function() {
		$("#testDiv").befunge();
		
		$("#befungeCode").load("test.txt");
	});


})(jQuery);
