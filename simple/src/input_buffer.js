
(function($jb) {
    
    /**
     * Befunge InputBuffer class
     * @constructor
     * @augments $jb.Buffer
     */
    $jb.InputBuffer = function(){
        $jb.Buffer.apply(this);
    };
    $jb.InputBuffer.prototype = new $jb.Buffer();
    $jb.InputBuffer.prototype.__super = $jb.Buffer.prototype;
    
    // function override for event call
    var fnames = ["clear", "set"]
    var funcs = {};
    for(var _i = 0, _m = fnames.length; _i < _m; _i++) {
        var _item = fnames[_i];
        funcs[_item] = new Function("this.__super." + _item + ".apply(this, arguments);");
    }
    $jb.Event.defineFire("InputBuffer", funcs);
    
})(jsBefunge);
