
(function($jb) {
    
    /**
     * jsBefunge Buffer class
     * @constructor
     */
    $jb.Buffer = function() {
        this.pos = 0;       // only use input, buf position
        this.buffer = "";   // buffer string
        this._event = new jsBefunge.EventManage(); // local event
    };
    
    /**
     * Clear buffer
     */
    $jb.Buffer.prototype.clear = function() {
        this.buffer = "";
        this.pos = 0;
    };
    
    /**
     * Set buffer
     * @param {string} buffer text
     */
    $jb.Buffer.prototype.set = function(str) {
        this.buffer = str;
        this.pos = 0;
    };
    
    /**
     * Add buffer
     * @param {string} buffer text
     */
    $jb.Buffer.prototype.add = function(str) {
        this.buffer += str;
    };
    
    /**
     * Get value
     * @param {boolean} Don't position change: true,
     *     false : move buffer position
     * @returns {string} front of buffer
     */
    $jb.Buffer.prototype.get = function(nonMove) {
        if(this.buffer.length <= this.pos)
            return "";
        var c = this.buffer.charAt(this.pos);
        if(!nonMove) this.pos++;
        return c;
    };
    
})(jsBefunge);
