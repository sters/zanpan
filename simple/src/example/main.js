
(function($) {
    
    $.fn.SetBefunge = function() {
        
        // dom use element ids
        var _elementIDs = {
            Code        : "befungeCode",
            Input       : "befungeInput",
            RunCode     : "befungeRunCode",
            Stack       : "befungeStack",
            Result      : "befungeResult",
            InputArea   : "befungeInputArea"
        };

        // Befunge object
        var _befunge = new jsBefunge.Code();
                
        // befunge element
        var element = $(this);
        element.html("");
        
        // setup UI
        var txtCode = $("<textarea id='" + _elementIDs.Code + "'>"),
            txtBox  = $("<input type='text' id='" + _elementIDs.Input + "'>"),
            btRun   = $("<input type='button' value='Run'>"),
            btStep  = $("<input type='button' value='Step'>"),
            btPause = $("<input type='button' value='Pause'>"),
            btAbord = $("<input type='button' value='Abord'>"),
            
            // init UI
            initUI = function(reverse) {
                $("html,body").css( "scrollTop", $("#" + _elementIDs.RunCode).offset().top );
                if(reverse) {
                    txtBox.removeAttr("disabled");
                    btRun.removeAttr("disabled");
                    btStep.removeAttr("disabled");
                    btPause.attr("disabled", "true").val("Pause");
                    btAbord.attr("disabled", "true");
                    return
                }
                txtBox.attr("disabled", "disabled");
                btRun.attr("disabled", "disabled");
                btStep.removeAttr("disabled");
                btPause.removeAttr("disabled");
                btAbord.removeAttr("disabled");
            },
            
            // add befunge events
            addBefungeEvents = function(){
            
                // code changed call event
                var onCodePositionChanged = function(remove) {
                    var nowObject = $("#" + _elementIDs.RunCode +
                      " tr:eq(" + _befunge.pos[1]  + ") td:eq(" + _befunge.pos[0] + ")");
                    nowObject.toggleClass("now", !remove);
                    
					if(!remove && nowObject.hasClass("break")) {
						_befunge.stop();
					}
                };
                
                // Stack action
                {
                    var onStackChanged = function(t) {
                        $("#" + _elementIDs.Stack).html( t.reverse().join("<br>") );
                    };
                    
                    _befunge._event.on("Stack.push",  onStackChanged);
                    _befunge._event.on("Stack.pop",   onStackChanged);
                    _befunge._event.on("Stack.clear", onStackChanged);
                }
                
                
                // Result action
                {
                    var onResultChanged = function(t) {
                        $("#" + _elementIDs.Result).html( t.buffer );
                    };

                    _befunge._event.on("Result.add",   onResultChanged);
                    _befunge._event.on("Result.set",   onResultChanged);
                    _befunge._event.on("Result.clear", onResultChanged);
                }

                // Code action
                {
                    // step
                    _befunge._event.on("Code.beforeStep", function(t,v){
                        onCodePositionChanged(true);
                    });
                    _befunge._event.on("Code.step", function(t,v){
                        onCodePositionChanged();
                    });

                    // code pause
                    _befunge._event.on("Code.pause", function(t,v){
                        initUI();
                        btStep.removeAttr("disabled");
                        btPause.val("Resume");
                    });
                    
                    // code end
                    _befunge._event.on("Code.end", function(t,v){
                        initUI(true);
                    });
                    
                    // init event => make table
                    _befunge._event.on("Code.init", function(t,v){
                        var $runcode = $("#" + _elementIDs.RunCode)
                        $runcode.text("");
                        for(var i=0, ymax=this.source.length; i<ymax; i++) {
                            var tr = $("<tr>");
                            for(var j=0, xmax=this.source[i].length; j<xmax; j++) {
                                tr.append(
                                    $("<td>").text(this.source[i].substr(j,1))
                                );
                            }
                            $runcode.append(tr);
                        }
                        $runcode.find("td").dblclick(function(){
                            $(this).toggleClass("break");
                        });
                        onCodePositionChanged();
                    });
                }
            },
            
            // add UI events
            addUIEvents = function() {
                
                // run button
                btRun.click(function(){
                    initUI();
                    _befunge.run( $("#" + _elementIDs.Code).val() );
                });
                
                // step button
                btStep.click(function(){
                    if(_befunge.running) {
                        _befunge.step();
                    } else {
                        initUI();
                        btPause.val("Resume");
                        _befunge.run( $("#" + _elementIDs.Code).val(), true );
                    }
                    btAbord.removeAttr("disabled");
                });
                
                // pause button
                btPause.click(function(){
                    if($(this).val() == "Pause") {
                        _befunge.stop();
                        btStep.removeAttr("disabled");
                        btPause.val("Resume");
                        
                    // if text is resume
                    } else {
                        _befunge.run();
                        btStep.attr("disabled", "true");
                        btPause.val("Pause");
                    }
                }).attr("disabled", "true");
                
                // abord button
                btAbord.click(function(){
                    _befunge.stop(true);
                    initUI(true);
                }).attr("disabled", "true");
            };
        
        // event setup
        addBefungeEvents();
        addUIEvents();
        
        // add stylesheet
        $("head:first").append(
            '<style>' +
                '\n #' + _elementIDs.Code +
                    ' {float:left; width:100%; height:200px;}' +
                '\n #' + _elementIDs.RunCode +
                    ' {float:left; border-collapse: collapse;}' +
                '\n #' + _elementIDs.RunCode + ' td' +
                    ' {width:12px; height:20px; border:1px solid gray; text-align:center;}' +
                '\n #' + _elementIDs.RunCode + ' td.now' +
                    ' {background-color: #BCF3FF;}' +
                '\n #' + _elementIDs.RunCode + ' td.break' +
                    ' {background-color: #FF9393;}' +
                '\n #' + _elementIDs.RunCode + ' td.now.break' +
                    ' {background-color: #DEC3C9;}' +
                '\n #' + _elementIDs.Stack +
                    ' {overflow:hidden; float:left; padding:5px; border:1px solid black; width:100px; height:300px;}' +
                '\n #' + _elementIDs.Result +
                    ' {margin-bottom:30px;}' +
                '\n #' + _elementIDs.Input +
                    ' {width:300px;}' +
                '\n #' + _elementIDs.InputArea +
                    ' {}' +
            '\n</style>'
        );
        
        // BefungeScripts Deferred Loading
        /*var $head = $("head:first");
        var script_load = function(scripts) {
            if(scripts.length == 0) return;
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", scripts.shift());
            script.onload = function() {
                script_load(scripts);
            };
            $("head")[0].appendChild(script);
        };
        script_load(["js/input_buffer.js", "js/result.js", "js/stack.js", "js/code.js", "js/event.js"]);
        */
        
        // add tags
        element
            .append(txtCode.text([
                'v ^_       v',
                '>0"!dlroW"v ',
                'v  :#     < ',
                '>" ,olleH" v',
                '   ^       <',
                '  >5100p:v  ',
                '@v *g00: _g.',
                ' > 00p1-:^  '
            ].join("\n")))
            .append(
                $("<span><span>Input</span></span>")
                    .append(txtBox)
                    .attr("id", _elementIDs.InputArea)
            )
            .append(btRun)
            .append("&nbsp;&nbsp;")
            .append(btStep)
            .append("&nbsp;&nbsp;")
            .append(btPause)
            .append("&nbsp;&nbsp;&nbsp;&nbsp;")
            .append(btAbord)
            .append(
                "<br>" +
                "<div id='" + _elementIDs.Stack + "'></div>" +
                "<table id='" + _elementIDs.RunCode + "'></table>" +
                "<hr style='clear:both;width:100%;'>" +
                "<div id='" + _elementIDs.Result + "'></div>"
            )
        ;
        
        return this; // jsBefunge method chain...lol.....
    };
    
})(jQuery);
