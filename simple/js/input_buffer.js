
(function($) {
    
    $.fn.SetBefunge = function() {
        
        // Buf.. does not mean, its <input> texts
        var InputBuffer = {
            pos : 0,
            Prompt : function(txt) {
                $(BefungeElements.Input).prev().text(txt);
            },
            Clear : function() {
                $(BefungeElements.Input).val("");
                this.pos = 0;
            },
            Set : function(d) {
                $(BefungeElements.Input).val(d);
                this.pos = 0;
            },
            Get : function(nonMove) {
                var str = $(BefungeElements.Input).val();
                if(str.length <= this.pos) return 0;
                var c = str.substr(this.pos, 1);
                if(!nonMove) this.pos++;
                return c;
            },
            ToStackAll : function() {
                var c;
                while((c = this.Get()) != 0)
                    Stack.Push(c);
                return c;
            },
            DisableBox : function() {
                $(BefungeElements.Input).attr("disabled","disabled");
            },
            EnableBox : function() {
                $(BefungeElements.Input).removeAttr("disabled");
            },
        };
    };
    
})(jQuery);
