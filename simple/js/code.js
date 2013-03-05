
(function($jb) {
    
    /**
     * Befunge Code running class
     * @constructor
     */
    $jb.Code = function(){
        this.direction = 6;      // 2:down, 4:left, 6:right, 8:up
        this.pos       = [0,0];  // now position
        this.c         = '';     // now command
        this.source    = [];     // Befunge source
        this.lenmax    = 0;      // source max width
        this.running   = false;  // code running?
        this.timer     = null;   // timer object
        this.strings   = false;  // now state = string command?
        this._event = new jsBefunge.EventManage(); // local event
        
        this.Stack              = new $jb.Stack();
        this.Result             = new $jb.Result();
        this.InputBuffer        = new $jb.InputBuffer();
        this.Stack._event       = this._event
        this.Result._event      = this._event
        this.InputBuffer._event = this._event
        
    };
    
    /**
     * Source setup, values initialize
     * @param {string} Befunge Source Codes.
     */
    $jb.Code.prototype.init = function(src){
        // init values
        this.Stack.clear();
        this.Result.clear();
        this.InputBuffer.pos = 0;
        this.direction = 6;
        this.pos       = [0,0];
        this.c         = "";
        this.lenmax    = 0;
        this.running   = false;
        this.timer     = 0;
        this.strings   = false;
        
        // source setup
        this.source = src.split("\n");
        for(var i in this.source) {
            if(this.lenmax < this.source[i].length)
                this.lenmax = this.source[i].length;
        }
        for(var i in this.source) {
            if(this.lenmax > this.source[i].length)
                this.source[i] += new Array(this.lenmax - this.source[i].length + 1).join(' ');
        }

        // first command
        this.c = this.source[0].charAt(0);
        
        // init event
        this.eventFire("Code.init", this);
    };
    
    /**
     * Move next position, command
     */
    $jb.Code.prototype.next = function() {
        if(!this.running) return;

        // moving cursor
        this.pos[0] += this.direction == 4 ? -1 : (this.direction == 6 ? 1 : 0);
        this.pos[1] += this.direction == 8 ? -1 : (this.direction == 2 ? 1 : 0);
        
        // start-end loop
        if(this.pos[0] > this.lenmax - 1) this.pos[0] = 0;
        if(this.pos[0] < 0) this.pos[0] = this.lenmax - 1;
        if(this.pos[1] > this.source.length - 1) this.pos[1] = 0;
        if(this.pos[1] < 0) this.pos[1] = this.source.length - 1;
        
        // command update
        this.c = this.source[this.pos[1]].charAt(this.pos[0]);
    };
    
    /**
     * Code run
     * @param {string} Befunge Source
     * @param {boolean} init only flag ( default: false )
     */
    $jb.Code.prototype.run = function(src, initOnly) {
        var _this = this;
        if(_this.running == false) {
            _this.stop();
            _this.init(src);
            _this.running = true;
        }
        if(!initOnly) {
            _this.timer = setInterval(function() {
                // step exec
                if(!_this.step()) {
                    _this.stop();
                    _this.eventFire("Code.end", _this);
                }
            }, 50);
        }
            
        // code run event
        _this.eventFire("Code.run", this);
    };

    /**
     * Code pause
     * @param {boolean} abord(=Stop) :true,
     *     pause only : false or nothing
     */
    $jb.Code.prototype.stop = function(abord) {
        clearInterval(this.timer);
        if(abord)
            this.running = false;

        // code run event
        this.eventFire("Code.stop", this);
    };

    
    /**
     * Code one step action
     * @return {boolean} code stopped:false, continue:true
     */
    $jb.Code.prototype.step = function() {
        this.eventFire("Code.beforeStep", this);
        var val = this._step();
        this.eventFire("Code.step", this);
        this.eventFire("Code.afterStep", this);
        return val;
    }
    
    /**
     * Code one step action practical use function
     * @return {boolean} code stopped:false, continue:true
     */
    $jb.Code.prototype._step = function() {
        if(!this.running) return false; // code running check
        
        // string command
        if(this.strings) {
            if(this.c != '"') {
                this.Stack.push( this.c.charCodeAt(0) );
                this.next();
            } else {
                this.next();
                this.strings = false;
            }
            
            /*// BreakPoint
            if($(BefungeElements.RunCode + " tr:eq(" + this.pos[1]  + ") td:eq(" + this.pos[0] + ")").hasClass("break")) {
                this.BreakPoint();
                return false;
            }*/
            return true;
        }
        
        // command exec
        switch(this.c){
            // skip next
            case '#':
                this.next();
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
                var d = this.Stack.pop();
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
                this.Stack.push( parseInt(this.c) );
                break;
            
            case '"':
                this.strings = true;
                break;
                
                
            // user input
            case '&':
                this.Stack.push( String.fromCharCode(this.InputBuffer.get()) );
                break;
            case '~':
                this.Stack.push( this.InputBuffer.get() );
                break;
                
            // output    
            case '.':
                this.Result.add( this.Stack.pop() + ' ' );
                break;
            case ',':
                this.Result.add( String.fromCharCode(this.Stack.pop()) );
                break;
                
            // calc
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
                var a = this.Stack.pop();
                var b = this.Stack.pop();
                this.Stack.push( eval("(" + b + ")" + this.c + "(" + a + ")") );
                break;
                
            case '`':
                var n = this.Stack.pop();
                this.Stack.push( this.Stack.pop() > n ? 1 : 0 );
                break;
            case '!':
                this.Stack.push( this.Stack.pop() ? 0 : 1 );
                break;
                
            // stack
            case ':':
                var n = this.Stack.pop();
                this.Stack.push(n);
                this.Stack.push(n);
                break;
                
            case "\\":
                var a = this.Stack.pop();
                var b = this.Stack.pop();
                this.Stack.push(a);
                this.Stack.push(b);
                break;
                
            case '$':
                this.Stack.pop();
                break;
                    
            case 'g':
                var y = this.Stack.pop();
                var x = this.Stack.pop();
                var v = this.source[y].charCodeAt(x);
                this.Stack.push(v);
                break;
                
            case 'p':
                var y = this.Stack.pop();
                var x = this.Stack.pop();
                var v = this.Stack.pop();
                this.source[y] =
                    this.source[y].substring(0, x)
                    + String.fromCharCode(v)
                    + (x+1 == this.source[y].length ? '' : this.source[y].substring(x+1, this.source[y].length));
                break;
                
            // nop
            case ' ':
                break;
            
            // end
            case '@':
                return false;
                break;
                
            default:
                break;
        }
        this.next();
        return true;
    };
    
    /**
     * Event fire function
     * @param {string} Event target
     * @param {object} "this" object
     * @param {Array<object>} args in event funcs
     */
    $jb.Code.prototype.eventFire = function(target, _this, args){
        this._event.fire(target, _this, args);
        $jb.Event.fire(target, _this, args);
    };
    
    
})(jsBefunge);
