
(function($) {

	$.fn.SetBefunge = function() {
	
		var befungeElements = {
			code: 		"#befungeCode",
			runcode: 	"#befungeRunCode",
			stack: 		"#befungeStack"
		};
		
		// stack
		var Stack = {
			data : [],
			element : undefined,
			SetElement : function() {
				if(this.element != undefined) return;
				this.element = $("#befungeStack");
			},
			Push : function(d) {
				if(typeof(d) == "string" || d instanceof String)
					d = d.charCodeAt(0);
				this.SetElement();
				this.data.unshift(d);
				this.element.html(this.data.join("<br>\n"));
				return true;
			},
			Pop : function() {
				this.SetElement();
				if(this.data.length == 0) return 0;
				var d = this.data.shift();
				this.element.html(this.data.join("<br>\n"));
				return d;
			},
			Clear : function() {
				this.SetElement();
				this.data = [];
				this.element.html("");
			},
		};
		
		// result (default output)
		var Result = {
			element : undefined,
			SetElement : function() {
				if(this.element != undefined) return;
				this.element = $("#befungeResult");
			},			
			Clear : function() {
				this.SetElement();
				this.element.html("");
			},
			Add : function(str) {
				this.SetElement();
				this.element.html(this.element.html() + str);
			},
		};
		
		// Buf.. does not mean, its <input> texts
		var InputBuffer = {
			pos : 0,
			Prompt : function(txt) {
				$("#befungeInput").prev().text(txt);
			},
			Clear : function() {
				$("#befungeInput").val("");
				this.pos = 0;
			},
			Set : function(d) {
				$("#befungeInput").val(d);
				this.pos = 0;
			},
			Get : function(nonMove) {
				var str = $("#befungeInput").val();
				if(str.length <= this.pos) return 0;
				var c = str.substr(this.pos, 1);
				if(!nonMove) this.pos++;
				return c;
			},
			ToStackAll : function() {
				var c;
				while((c = this.Get()) != 0) {
					Stack.Push(c);
				}
				return c;
			},
			DisableBox : function() {
				$("#befungeInput").attr("disabled","disabled");
			},
			EnableBox : function() {
				$("#befungeInput").removeAttr("disabled");
			},
			
			
		};
		
		// store texts.
		var OutputBuffer = {
			str : "",
			Clear : function() {
				str = "";
			},
			Add : function(val) {
				str += val;
			},
			Get : function() {
				return str;
			},
			PipeResult : function() {
				Result.Add(str);
			}
		};
		
		// ajax data
		var AjaxConnection = {
			username : "",
			Send : function(method, data, func) {
				var d = data;
				d.user = this.username;
				$.ajax({
					url : "base.php",
					type : method,
					data : d,
					dataType : "text",
					success: func,
				});					
			},
		};
		
		// management befunge code
		var Code = {
			direction 	: 6,
			pos 		: [0,0],
			c 			: '',
			source 		: [],
			lenmax 		: 0,
			runDelay 	: 10,
			running 	: false,
			nowTimeout	: 0,
			strings     : false,
			
			MakeTable : function() {
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
			UpdateTable : function(x,y, character) {
				$("#befungeRunCode tr:eq(" + y  + ") td:eq(" + x + ")")
					.text(character);
			},
			MoveTable : function(remove) {
				$("#befungeRunCode tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")")
					.toggleClass("now", !remove);
			},
			
			Init : function() {
				Stack.Clear();
				Result.Clear();
				InputBuffer.Clear();
				OutputBuffer.Clear();
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
				this.MakeTable();
				this.MoveTable();
				this.c = this.source[this.pos[1]].substr(this.pos[0], 1);
			},
			
			Next : function() {
				this.MoveTable(true);
				this.pos[0] += this.direction == 4 ? -1 : (this.direction == 6 ? 1 : 0);
				this.pos[1] += this.direction == 8 ? -1 : (this.direction == 2 ? 1 : 0);
				if(this.pos[0] > this.lenmax - 1) this.pos[0] = 0;
				if(this.pos[0] < 0) this.pos[0] = this.lenmax - 1;
				if(this.pos[1] > this.source.length - 1) this.pos[1] = 0;
				if(this.pos[1] < 0) this.pos[1] = this.source.length - 1;
				this.MoveTable();
				this.c = this.source[this.pos[1]].substr(this.pos[0], 1);
			},
			
			Start : function(reset) {
				if(this.running && !reset) return;
				this.Init();
				this.running = true;
			},
			
			// one step action
			Step : function() {
				if(!this.running) return false;
				if(this.string) {
					if(this.c != '"') {
						Stack.Push(this.c.charCodeAt(0));
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
						var d = Stack.Pop();
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
						Stack.Push(parseInt(this.c));
						break;
					
					case '"':
						this.string = true;
						break;
					
					
					// user input
					case '&':
						break;
					case '~':
						Stack.Push(InputBuffer.Get());
						break;
						
					// output	
					case '.':
						Result.Add(Stack.Pop() +' ');
						break;
					case ',':
						Result.Add(String.fromCharCode(Stack.Pop()));
						break;
						
					// calc
					case '+':
					case '-':
					case '*':
					case '/':
					case '%':
						var n = Stack.Pop();
						Stack.Push(eval("("+Stack.Pop()+")" + this.c + "("+n+")"));
						break;
					
					case '`':
						var n = Stack.Pop();
						Stack.Push(Stack.Pop() > n ? 1 : 0);
						break;
					case '!':
						Stack.Push(Stack.Pop() ? 0 : 1);
						break;
						
					// stack
					case ':':
						var n = Stack.Pop();
						Stack.Push(n);
						Stack.Push(n);
						break;
						
					case "\\":
						var i = Stack.Pop();
						var j = Stack.Pop();
						Stack.Push(i);
						Stack.Push(j);
						break;
						
					case '$':
						Stack.Pop();
						break;
							
					case 'g':
						var y = Stack.Pop();
						var x = Stack.Pop();
						var v = this.source[y].charCodeAt(x);
						Stack.Push(v);
						break;
							
					case 'p':
						var y = Stack.Pop();
						var x = Stack.Pop();
						var v = Stack.Pop();
						this.source[y] =
							this.source[y].substring(0, x)
							+ String.fromCharCode(v)
							+ (x+1 == this.source[y].length ? '' : this.source[y].substring(x+1, this.source[y].length));
						this.UpdateTable(x,y, String.fromCharCode(v));
						break;
					
					case ' ':
						//while(this.c == ' ')
						//	this.Next();
						//return true;
						break;
					
					// end
					case '@':
						return false;
						break;
					
					////////////////////////////////////////////
					// extend
					////////////////////////////////////////////
					// "O"utputBuffer
					//   stack pop one -> to ASCII -> add outbut buffer
					case 'O':
						OutputBuffer.Add(String.fromCharCode(Stack.Pop()));
						break;
					
					// "L"ogin
					//   clear InputBuf ->
					//   -> stack pop ALL -> to ASCII -> HTTP POST ->
					//   -> get response -> stack push 255
					case 'L':
						InputBuffer.Clear();
						var c, str="";
						while((c = Stack.Pop()) != 0) {
							str += String.fromCharCode(c);
						}
						AjaxConnection.username = str;
						AjaxConnection.Send("post", {"login" : str}, function(data){
							InputBuffer.EnableBox();
							InputBuffer.Prompt("InputCommand");
							Stack.Push(1);
						});
						break;
						
					// "G"et chat log
					case 'G':
						InputBuffer.DisableBox();
						InputBuffer.Clear();
						AjaxConnection.Send("get", {'list':true}, function(data){
							InputBuffer.Set(data);
							Stack.Push(128);
							Stack.Push(256);
						});
						break;
						
					// "M"essage
					case 'M':
						InputBuffer.Clear();
						InputBuffer.EnableBox();
						InputBuffer.Prompt("InputText");
						Stack.Push(64);
						Stack.Push(256);						
						break;

					// "S"end msg
					case 'S':
						InputBuffer.Clear();
						var c, str="";
						while((c = Stack.Pop()) != 0) {
							str += String.fromCharCode(c);
						}
						console.log(str);
						
						AjaxConnection.Send("post", {"msg" : str}, function(data){
							Stack.Push(256);
						});
						break;
						
					// "Prompt"
					case 'P':
						var c, str="";
						while((c = Stack.Pop()) != 0) {
							str += String.fromCharCode(c);
						}
						InputBuffer.Clear();
						InputBuffer.Prompt(str);
						InputBuffer.EnableBox();
						console.log(str);
						break;

					////////////////////////////////////////////
					default:
						break;
				}
				this.Next();
				if($("#befungeRunCode tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")").hasClass("break")) {
					this.BreakPoint();
					return false;
				}
				return true;
			},
			
			Run : function(callback) {
				this.Stop();
				if(!this.running) this.Start(true);
				(function() {
					if(Code.Step())
						Code.nowTimeout = setTimeout(arguments.callee, Code.runDelay);
					else 
						if(callback != undefined)
							callback();
				})();
			},
			
			Stop : function(abord) {
				clearTimeout(this.nowTimeout);
				if(abord) {
					this.Start(true);
				}
			},
		};
		
		// init, add "Befunge" components
		var element = $(this);
		(function() {
			
			// css
			$("head:first").append(
				'<style>' +
					'\n #befungeCode		{float:left; width:50%; height:300px; display:none;}' +
					'\n #befungeRunCode		{float:left; border-collapse: collapse;}' +
					'\n #befungeRunCode td' +
					'	{width:10px; height:20px; border:1px solid gray; text-align:center;}' +
					'\n #befungeRunCode td.now {background-color: #BCF3FF;}' +
					'\n #befungeRunCode td.break {background-color: #FF9393;}' +
					'\n #befungeRunCode td.now.break {background-color: #DEC3C9;}' +
					'\n #befungeStack		{overflow:hidden; float:left; padding:5px; border:1px solid black; width:100px; height:300px;}' +
					'\n #befungeDirection	{float:left; font-size: 4em;}' +
					'\n #befungeInput {width:300px;}' +
					'\n #befungeMsg {display:none;}' +
				'\n</style>'
			);
			
			// tag
			element.html("");
			var txtBox = $("<input type='text' id='befungeInput' value='abc'>");
			var btRun = $("<input type='button' value='Run'>");
			var btStep = $("<input type='button' value='Step'>");
			var btPause = $("<input type='button' value='Pause'>");
			var btAbord = $("<input type='button' value='Abord'>");
			
			btRun.click(function(){
				if(InputBuffer.Get(true) == 0 || InputBuffer.Get(true).length == 0)
					return;
				if($(this).hasClass("stateInputCommand")) {
					$(this)
						.removeClass("stateInputCommand")
						.addClass("stateInputText");
					InputBuffer.DisableBox();
					Stack.Push(1);
					
				} else if($(this).hasClass("stateInputName")) {
					$(this)
						.removeClass("stateInputName")
						.addClass("stateInputCommand");
					InputBuffer.DisableBox();
					Stack.Push(1);
				} else if($(this).hasClass("stateInputText")) {
					Stack.Push(1);
				} else {
					InputBuffer.Clear();
					Code.Run();
					btRun.val("Send");
					btStep.attr("disabled", "true");
					btPause.removeAttr("disabled");
					btAbord.removeAttr("disabled");
					$("#befungeMsg").show();
					$(this).addClass("stateInputName");
				}
			});
			btStep.click(function(){
				Code.running ? Code.Step() : Code.Start();
				btAbord.removeAttr("disabled");
			}).attr("disabled", "true");;
			Code.BreakPoint = function() {
				Code.Stop();
				btStep.removeAttr("disabled");
				btPause.val("Resume");
			};
			btPause.click(function(){
				if($(this).val() == "Pause") {
					Code.BreakPoint();
				} else {
					Code.Run();
					btStep.attr("disabled", "true");
					btPause.val("Pause");
				}
			}).attr("disabled", "true");
			btAbord.click(function(){
				btPause.click();
				Code.Stop(true);
				$("#befungeMsg").hide();
				InputBuffer.Set("abc");
				InputBuffer.EnableBox();
				InputBuffer.Prompt("YourName");
				btRun
					.removeAttr("disabled")
					.removeClass("stateInputCommand")
					.removeClass("stateInputName")
					.removeClass("stateInputText")
					.val("Run")
				btStep.attr("disabled", "true");
				btPause.attr("disabled", "true");
				btAbord.attr("disabled", "true");
			}).attr("disabled", "true");
			element
				.append(
					$("<span id='befungeMsg'><span>YourName</span></span>")
						.append(txtBox)
				)
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

	// dom ready
	$(document).ready(function() {
	
		// setup
		$("#testDiv").SetBefunge();
		
		// load chat code
		$("#befungeCode").load("./chat.txt");
	});


})(jQuery);
