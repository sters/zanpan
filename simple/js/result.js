
(function($jb) {
    
    /**
     * Befunge Result class
     * @constructor
     * @augments $jb.Buffer
     */
    $jb.Result = function(){
        $jb.Buffer.apply(this);
    };
    $jb.Result.prototype = new $jb.Buffer();
    $jb.Result.prototype.__super = $jb.Buffer.prototype;
    
    // function override for event call
    var fnames = ["clear", "add", "set"]
    var funcs = {};
    for(var _i = 0, _m = fnames.length; _i < _m; _i++) {
        var _item = fnames[_i];
        funcs[_item] = new Function("this.__super." + _item + ".apply(this, arguments);");
    }
    $jb.Event.defineFire("Result", funcs);
    
})(jsBefunge);
