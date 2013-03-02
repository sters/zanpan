
var jqBefunge = {};

(function($) {
    
    $.fn.SetBefunge = function() {
        
        // elements
        var BefungeElements = {
            Code        : "#befungeCode",
            Input       : "#befungeInput",
            RunCode     : "#befungeRunCode",
            Stack       : "#befungeStack",
            Result      : "#befungeResult",
            InputArea   : "#befungeInputArea"
        };
        
        // init, add "Befunge" components
        var element = $(this);
        (function() {
            
            // add stylesheet
            $("head:first").append(
                '<style>' +
                    '\n ' + BefungeElements.Code +
                        ' {float:left; width:100%; height:300px;}' +
                    '\n ' + BefungeElements.RunCode +
                        ' {float:left; border-collapse: collapse;}' +
                    '\n ' + BefungeElements.RunCode + ' td' +
                        ' {width:12px; height:20px; border:1px solid gray; text-align:center;}' +
                    '\n ' + BefungeElements.RunCode + ' td.now' +
                        ' {background-color: #BCF3FF;}' +
                    '\n ' + BefungeElements.RunCode + ' td.break' +
                        ' {background-color: #FF9393;}' +
                    '\n ' + BefungeElements.RunCode + ' td.now.break' +
                        ' {background-color: #DEC3C9;}' +
                    '\n ' + BefungeElements.Stack +
                        ' {overflow:hidden; float:left; padding:5px; border:1px solid black; width:100px; height:300px;}' +
                    '\n ' + BefungeElements.Result +
                        ' {margin-bottom:30px;}' +
                    '\n ' + BefungeElements.Input +
                        ' {width:300px;}' +
                    '\n ' + BefungeElements.InputArea +
                        ' {}' +
                '\n</style>'
            );
            
            // BefungeScripts Deferred Loading
            var $head = $("head:first");
            var scripts = ["js/input_buffer.js", "js/result.js", "js/stack.js", "js/code.js"];
            $.each(scripts, function(i, src) {
                var x = "<script type='text\/javascript' src='" + src + "><\/script>";
                console.log(x);
            });
            
            // set tags
            element.html("");
            var txtBox = $("<input type='text' id='" + BefungeElements.Input.substr(1) + "'>");
            var btSend = $("<input type='button' value='Run'>");
            var btStep = $("<input type='button' value='Step'>");
            var btPause = $("<input type='button' value='Pause'>");
            var btAbord = $("<input type='button' value='Abord'>");
            
            // add events
            btSend.click(function(){
                btSend.attr("disabled", "true");
                btStep.removeAttr("disabled");
                btPause.removeAttr("disabled");
                btAbord.removeAttr("disabled");
                $(BefungeElements.Input).attr("disabled","disabled");
                $("html,body").animate({
                    scrollTop: $(BefungeElements.RunCode).offset().top
                }, 0);
                (new jqBefunge.Code).run();
            });
            btStep.click(function(){
                if(Code.running) {
                    Code.Step();
                } else {
                    btSend.attr("disabled", "true");
                    btPause.removeAttr("disabled");
                    btAbord.removeAttr("disabled");
                    InputBuffer.DisableBox();
                    $("html,body").animate({
                        scrollTop: $(BefungeElements.RunCode).offset().top
                    }, 0);
                    Code.Start();
                }
                btAbord.removeAttr("disabled");
            });
            /*Code.BreakPoint = function() {
                Code.Stop();
                btStep.removeAttr("disabled");
                btPause.val("Resume");
            };*/
            btPause.click(function(){
                if($(this).val() == "Pause") {
                    Code.BreakPoint();
                } else {
                    Code.Run();
                    btStep.attr("disabled", "true");
                    btPause.val("Pause");
                }
            }).attr("disabled", "true");
            btAbord.click(function(){
                btPause.click();
                Code.Stop(true);
                InputBuffer.EnableBox();
                btSend
                    .removeAttr("disabled")
                    .removeClass("stateInputCommand")
                    .removeClass("stateInputName")
                    .removeClass("stateInputText");
                //btStep.attr("disabled", "true");
                btPause
                    .attr("disabled", "true")
                    .val("Pause");
                btAbord.attr("disabled", "true");
                InputBuffer.EnableBox();
            }).attr("disabled", "true");
            
            // add tags
            element
                .append(
                    "<textarea id='" + BefungeElements.Code.substr(1) + "'></textarea>"
                )
                .append(
                    $("<span><span>Input</span></span>")
                        .append(txtBox)
                        .attr("id", BefungeElements.InputArea.substr(1))
                )
                .append(btSend)
                .append("&nbsp;&nbsp;")
                .append(btStep)
                .append("&nbsp;&nbsp;")
                .append(btPause)
                .append("&nbsp;&nbsp;&nbsp;&nbsp;")
                .append(btAbord)
                .append(
                    "<br>" +
                    "<div id='" + BefungeElements.Stack.substr(1) + "'></div>" +
                    "<table id='" + BefungeElements.RunCode.substr(1) + "'></table>" +
                    "<hr style='clear:both;width:100%;'>" +
                    "<div id='" + BefungeElements.Result.substr(1) + "'></div>"
                )
            ;
        })();
        
        return this; // jqBefunge method chain
    };
    
})(jQuery);
