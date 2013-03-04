
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

})(jsBefunge);
