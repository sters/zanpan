
(function($) {

	$.fn.SetBefunge = function() {
	
		// elements
		var BefungeElements = {
			Code	: "#befungeCode",
			Input	: "#befungeInput",
			RunCode	: "#befungeRunCode",
			Stack	: "#befungeStack",
			Result	: "#befungeResult",
			InputArea	: "#befungeInputArea"
		};

		// code settings
		var Code = {
			runDelay : 1, // millisecconds, use "setTimeout"
		};
		
		///////////////////////////////////
		
		// stack
		var Stack = {
			data : [],
			element : undefined,
			SetElement : function() {
				if(this.element != undefined) return;
				this.element = $(BefungeElements.Stack);
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
				this.element = $(BefungeElements.Result);
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
				$(BefungeElements.Input).prev().text(txt);
			},
			Clear : function() {
				$(BefungeElements.Input).val("");
				this.pos = 0;
			},
			Set : function(d) {
				$(BefungeElements.Input).val(d);
				this.pos = 0;
			},
			Get : function(nonMove) {
				var str = $(BefungeElements.Input).val();
				if(str.length <= this.pos) return 0;
				var c = str.substr(this.pos, 1);
				if(!nonMove) this.pos++;
				return c;
			},
			ToStackAll : function() {
				var c;
				while((c = this.Get()) != 0)
					Stack.Push(c);
				return c;
			},
			DisableBox : function() {
				$(BefungeElements.Input).attr("disabled","disabled");
			},
			EnableBox : function() {
				$(BefungeElements.Input).removeAttr("disabled");
			},
		};
		
		// management befunge code
		Code = $.extend(Code, {
			direction 	: 6,
			pos 		: [0,0],
			c 			: '',
			source 		: [],
			lenmax 		: 0,
			running 	: false,
			nowTimeout	: 0,
			strings     : false,
			
			MakeTable : function() {
				$(BefungeElements.RunCode).text("");
				for(var i=0, ymax=this.source.length; i<ymax; i++) {
					var tr = $("<tr>");
					for(var j=0, xmax=this.source[i].length; j<xmax; j++) {
						tr.append(
							$("<td>").text(this.source[i].substr(j,1))
						);
					}
					$(BefungeElements.RunCode).append(tr);
				}
				$(BefungeElements.RunCode + ' td').dblclick(function(){
					$(this).toggleClass("break");
				});
			},
			UpdateTable : function(x,y, character) {
				$(BefungeElements.RunCode + " tr:eq(" + y  + ") td:eq(" + x + ")")
					.text(character);
			},
			MoveTable : function(remove) {
				$(BefungeElements.RunCode + " tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")")
					.toggleClass("now", !remove);
			},
			
			Init : function() {
				Stack.Clear();
				Result.Clear();
				InputBuffer.pos = 0;
				this.direction = 6;
				this.pos = [0,0];
				this.c = '';
				this.lenmax = 0;
				this.strings = false;
				this.source = $(BefungeElements.Code).val().split("\n")
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
				if(this.strings) {
					if(this.c != '"') {
						Stack.Push(this.c.charCodeAt(0));
						this.Next();
					} else {
						this.Next();
						this.strings = false;
					}
					if($(BefungeElements.RunCode + " tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")").hasClass("break")) {
						this.BreakPoint();
						return false;
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
						this.strings = true;
						break;
					
					
					// user input
					case '&':
						Stack.Push(String.fromCharCode(InputBuffer.Get()));
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

					default:
						break;
				}
				this.Next();
				if($(BefungeElements.RunCode + " tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")").hasClass("break")) {
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
				if(abord)
					this.running = false;
			},
		});
		
		// init, add "Befunge" components
		var element = $(this);
		(function() {
			
			// add stylesheet
			$("head:first").append(
				'<style>' +
					'\n ' + BefungeElements.Code +
						' {float:left; width:100%; height:300px;}' +
					'\n ' + BefungeElements.RunCode +
						' {float:left; border-collapse: collapse;}' +
					'\n ' + BefungeElements.RunCode + ' td' +
						' {width:12px; height:20px; border:1px solid gray; text-align:center;}' +
					'\n ' + BefungeElements.RunCode + ' td.now' +
						' {background-color: #BCF3FF;}' +
					'\n ' + BefungeElements.RunCode + ' td.break' +
						' {background-color: #FF9393;}' +
					'\n ' + BefungeElements.RunCode + ' td.now.break' +
						' {background-color: #DEC3C9;}' +
					'\n ' + BefungeElements.Stack +
						' {overflow:hidden; float:left; padding:5px; border:1px solid black; width:100px; height:300px;}' +
					'\n ' + BefungeElements.Result +
						' {margin-bottom:30px;}' +
					'\n ' + BefungeElements.Input +
						' {width:300px;}' +
					'\n ' + BefungeElements.InputArea +
						' {}' +
				'\n</style>'
			);
			
			// set tags
			element.html("");
			var txtBox = $("<input type='text' id='" + BefungeElements.Input.substr(1) + "'>");
			var btSend = $("<input type='button' value='Run'>");
			var btStep = $("<input type='button' value='Step'>");
			var btPause = $("<input type='button' value='Pause'>");
			var btAbord = $("<input type='button' value='Abord'>");
			
			// add events
			btSend.click(function(){
				btSend.attr("disabled", "true");
				btStep.removeAttr("disabled");
				btPause.removeAttr("disabled");
				btAbord.removeAttr("disabled");
				InputBuffer.DisableBox();
				$("html,body").animate({
					scrollTop: $(BefungeElements.RunCode).offset().top
				}, 0);
				Code.Run();
			});
			btStep.click(function(){
				if(Code.running) {
					Code.Step();
				} else {
					btSend.attr("disabled", "true");
					btPause.removeAttr("disabled");
					btAbord.removeAttr("disabled");
					InputBuffer.DisableBox();
					$("html,body").animate({
						scrollTop: $(BefungeElements.RunCode).offset().top
					}, 0);
					Code.Start();
				}
				btAbord.removeAttr("disabled");
			});
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
				InputBuffer.EnableBox();
				btSend
					.removeAttr("disabled")
					.removeClass("stateInputCommand")
					.removeClass("stateInputName")
					.removeClass("stateInputText");
				//btStep.attr("disabled", "true");
				btPause
					.attr("disabled", "true")
					.val("Pause");
				btAbord.attr("disabled", "true");
				InputBuffer.EnableBox();
			}).attr("disabled", "true");
			
			// add tags
			element
				.append(
					"<textarea id='" + BefungeElements.Code.substr(1) + "'></textarea>"
				)
				.append(
					$("<span><span>Input</span></span>")
						.append(txtBox)
						.attr("id", BefungeElements.InputArea.substr(1))
				)
				.append(btSend)
				.append("&nbsp;&nbsp;")
				.append(btStep)
				.append("&nbsp;&nbsp;")
				.append(btPause)
				.append("&nbsp;&nbsp;&nbsp;&nbsp;")
				.append(btAbord)
				.append(
					"<br>" +
					"<div id='" + BefungeElements.Stack.substr(1) + "'></div>" +
					"<table id='" + BefungeElements.RunCode.substr(1) + "'></table>" +
					"<hr style='clear:both;width:100%;'>" +
					"<div id='" + BefungeElements.Result.substr(1) + "'></div>"
				)
			;
		})();
		
		return this; // jQuery method chain
	};

})(jQuery);
