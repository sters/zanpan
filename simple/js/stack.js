
(function($jb) {
    
    /**
     * Befunge Stack class
     * @constructor
     * @augments Array
     */
    $jb.Stack = function(){
        Array.apply(this);
        
        // local event
        this._event = new jsBefunge.EventManage();
    };
    $jb.Stack.prototype = new Array();
    $jb.Stack.prototype.__super = Array.prototype;
    
    
    /**
     * Overrides reverse :dont broke this obj
     */
    $jb.Stack.prototype.reverse = function() {
        return  Array.prototype.slice.call(this).reverse();
    };
    /**
     * Broken reverse() function
     */
    $jb.Stack.prototype.reverse_self = function() {
        this.__super.reverse(arguments);
    };

    /**
     * Clear stack
     */
    $jb.Stack.prototype.clear = function() {
        this.length = 0;
        $jb.Event.fire("Stack.clear", this);
    };
    
    // function override for event call
    var funcs = {
        "push" : function() { this.__super.push.apply(this, arguments); },
        "pop"  : function() { return this.__super.pop.apply(this, arguments);  },
    };
    $jb.Event.defineFire("Stack", funcs);
    
})(jsBefunge);
