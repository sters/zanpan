
(function($jb) {
    
    /**
     * Befunge Result class
     * @constructor
     * @augments $jb.InputBuffer
     */
    $jb.Result = function(){
        $jb.InputBuffer.apply(this);
    };
    $jb.Result.prototype = new $jb.InputBuffer();
        
})(jsBefunge);
