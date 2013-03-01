
(function($) {
    
    $.fn.SetBefunge = function() {
        // code settings
        var Code = {
            runDelay : 1, // millisecconds, use "setTimeout"
        };
        
        // management befunge code
        Code = $.extend(Code, {
            direction  : 6,
            pos        : [0,0],
            c          : '',
            source     : [],
            lenmax     : 0,
            running    : false,
            nowTimeout : 0,
            strings    : false,
            
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
                        //    this.Next();
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
    };
    
})(jQuery);
