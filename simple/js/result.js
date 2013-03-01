
(function($) {
    
    $.fn.SetBefunge = function() {
        
        // result (default output)
        var Result = {
            element : undefined,
            SetElement : function() {
                if(this.element != undefined) return;
                this.element = $(BefungeElements.Result);
            },            
            Clear : function() {
                this.SetElement();
                this.element.html("");
            },
            Add : function(str) {
                this.SetElement();
                this.element.html(this.element.html() + str);
            },
        };
    };
    
})(jQuery);
