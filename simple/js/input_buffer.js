
(function($jb) {
    
    /**
     * Befunge InputBuffer class
     * @constructor
     */
    $jb.InputBuffer = function() {
        this.pos = 0;
        this.stack = null;
        this.buffer = "";
    };
    
    /**
     * Clear buffer
     */
    $jb.InputBuffer.prototype.Clear = function() {
        this.buffer = "";
        this.pos = 0;
    };
    
    /**
     * Set buffer
     * @param {string} buffer text
     */
    $jb.InputBuffer.prototype.Set = function(str) {
        this.buffer = str;
        this.pos = 0;
    };
    
    /**
     * Add buffer
     * @param {string} buffer text
     */
    $jb.InputBuffer.prototype.Set = function(str) {
        this.buffer += str;
        this.pos = 0;
    };
    
    /**
     * Get value
     * @param {boolean} Don't position change: true,
     *     false : move buffer position
     */
    $jb.InputBuffer.prototype.Get = function(nonMove) {
        if(this.buffer.length <= this.pos) return 0;
        var c = this.buffer.substr(this.pos, 1);
        if(!nonMove) this.pos++;
        return c;
    };
    
    /**
     * Get All values. want to fix latter...
     * @param {string} buffer text
     */
    $jb.InputBuffer.prototype.GetAll = function() {
        var c;
        while((c = this.Get()) != 0)
            Stack.Push(c);
        return c;
    }

})(jqBefunge);
