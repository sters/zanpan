
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
    
})(jsBefunge);
