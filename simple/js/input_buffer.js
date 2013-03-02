
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
    $jb.InputBuffer.prototype.clear = function() {
        this.buffer = "";
        this.pos = 0;
    };
    
    /**
     * Set buffer
     * @param {string} buffer text
     */
    $jb.InputBuffer.prototype.set = function(str) {
        this.buffer = str;
        this.pos = 0;
    };
    
    /**
     * Add buffer
     * @param {string} buffer text
     */
    $jb.InputBuffer.prototype.add = function(str) {
        this.buffer += str;
        this.pos = 0;
    };
    
    /**
     * Get value
     * @param {boolean} Don't position change: true,
     *     false : move buffer position
     * @returns {string} front of buffer
     */
    $jb.InputBuffer.prototype.get = function(nonMove) {
        if(this.buffer.length <= this.pos)
            return "";
        var c = this.buffer.charAt(this.pos);
        if(!nonMove) this.pos++;
        return c;
    };
    
    /**
     * Get All values. want to fix latter...
     * @param {string} buffer text
     * @returns {string} front of buffer
     */
    $jb.InputBuffer.prototype.getAll = function() {
        if(this.stack == null)
            return "";
        var c;
        while((c = this.get()) != 0)
            this.stack.Push(c);
        return c;
    }

})(jqBefunge);
