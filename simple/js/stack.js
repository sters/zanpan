
(function($) {
    
    $.fn.SetBefunge = function() {
        
        // stack
        var Stack = {
            data : [],
            element : undefined,
            SetElement : function() {
                if(this.element != undefined) return;
                this.element = $(BefungeElements.Stack);
            },
            Push : function(d) {
                if(typeof(d) == "string" || d instanceof String)
                    d = d.charCodeAt(0);
                this.SetElement();
                this.data.unshift(d);
                this.element.html(this.data.join("<br>\n"));
                return true;
            },
            Pop : function() {
                this.SetElement();
                if(this.data.length == 0) return 0;
                var d = this.data.shift();
                this.element.html(this.data.join("<br>\n"));
                return d;
            },
            Clear : function() {
                this.SetElement();
                this.data = [];
                this.element.html("");
            },
        };
    };
    
})(jQuery);
