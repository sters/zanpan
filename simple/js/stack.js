
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
    
    
    /**
     * Clear stack
     */
    $jb.Stack.prototype.clear = function() {
        this.length = 0;
    };
        
})(jsBefunge);
