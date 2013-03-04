
(function($jb) {
    
    /**
     * Befunge Stack class
     * @constructor
     * @augments Array
     */
    $jb.Stack = function(){
        Array.apply(this);
    };
    $jb.Stack.prototype = new Array();
    $jb.Stack.prototype.__super = Array.prototype;
    
    
    /**
     * Clear stack
     */
    $jb.Stack.prototype.clear = function() {
        this.length = 0;
        $jb.Event.fire("Stack.clear", this);
    };
    
    // function override for event call
    var overrides = ["push", "pop"];
    var clsname   = "Stack";
    for(var _i=0, _m=overrides.length; _i<_m; _i++) {
        var _item = overrides[_i];
        eval(
            "$jb." + clsname + ".prototype." + _item + "= function() {" +
                "this.__super." + _item + ".apply(this, arguments);" +
                "$jb.Event.fire('" + clsname + "." + _item + "', this);" +
            "};"
        );
    }
    
})(jsBefunge);
