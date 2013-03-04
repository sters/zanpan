
(function($jb) {
    
    /**
     * Befunge EventManage class
     * @constructor
     */
    $jb.EventManage = function(){
        this.events = {};
    };
    
    /**
     * Event define. jQuery like named
     * @param {string} Target string. It use for events manage
     * @param {function} Event's call this method
     * @return {integer} 
     */
    $jb.EventManage.prototype.on = function(target, func) {
        if(!this.events[target])
            this.events[target] = [];
        this.events[target].push(func);
        return this.events[target].length - 1;
    };
    
    /**
     * Event undefine. jQuery like named
     * @param {string} Target string
     * @param {integer} Event's ID
     */
    $jb.EventManage.prototype.off = function(target, eventID) {
        if(!this.events[target]) return;
        this.events[target][eventID] = null;
    };
    
    /**
     * Event fire.
     * @param {string} Target string
     * @param {object} Event call in this
     */
    $jb.EventManage.prototype.fire = function(target, _this) {
        if(!this.events[target]) return;
        for(var _i=0, _m=this.events[target].length; _i < _m; _i++) {
            var event = this.events[target][_i];
            event.call(_this, target, _this);
        }
    };
    
    /**
     * Event management instance
     * @type {jsBefunge.EventManage}
     */
    $jb.Event = new $jb.EventManage();
    
})(jsBefunge);
