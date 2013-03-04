
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
     * @param {Array} Event use arguments
     */
    $jb.EventManage.prototype.fire = function(target, _this, args) {
        if(!this.events[target]) return;
        for(var _i=0, _m=this.events[target].length; _i < _m; _i++) {
            var event = this.events[target][_i];
            event.call(_this, _this, args);
        }
    };
    
    /**
     * Event fire definer for jsBefunge.* classes
     * @param {string} class name
     * @param {Object<string, function>} function names, call function pair
     */
    $jb.EventManage.prototype.defineFire = function(clsname, functions) {
        for(var _key in functions) {
            (function(_item) {
                eval(
                    "$jb." + clsname + ".prototype." + _key + "= function() {" +
                        "_item.apply(this, arguments);" +
                        "$jb.Event.fire('" + clsname + "." + _key + "', this, arguments);" +
                    "};"
                );
            })(functions[_key]);
        }
    };
    
    /**
     * Event management instance
     * @type {jsBefunge.EventManage}
     */
    $jb.Event = new $jb.EventManage();
    
})(jsBefunge);
