
(function($jb) {
    
    /**
     * Befunge Result class
     * @constructor
     * @augments $jb.InputBuffer
     */
    $jb.Result = function(){
        $jb.InputBuffer.apply(this);
        this.__super = $jb.InputBuffer.prototype;
    };
    $jb.Result.prototype = new $jb.InputBuffer();
        
})(jsBefunge);
