
// check file.
(function() {

    var testRun = function(_tests) {
        for(var _k in _tests) {
            var result = _tests[_k]();
            console.log(_k + "\n\tResult: " + result);
        }
    };


    // Stack check
    testRun({
        "Stack Check1" : function() {
            var s = new jsBefunge.Stack();
            s.push("aaa");
            s.push("bbb");
            return(s[1] == "bbb");
        },
        
        "Stack Check2" : function() {
            var s = new jsBefunge.Stack();
            s.push("aaa");
            s.push("bbb");
            s.pop();
            return(s.pop() == "aaa");
        },
        
        "Stack Check3" : function() {
            var s = new jsBefunge.Stack();
            s.push("aaa");
            s.push("bbb");
            s.pop();
            s.clear();
            return(s.length == 0);
        },
    });

    // Result Buffer check
    testRun({
        "Result Check1" : function() {
            var r = new jsBefunge.Result();
            r.add("test");
            r.add(10000);
            return(r.buffer == "test10000");
        },
        
        "Result Check2" : function() {
            var r = new jsBefunge.Result();
            r.add("test");
            r.add(10000);
            r.set("mybuffer");
            return(r.buffer == "mybuffer");
        },
        
        "Result Check3" : function() {
            var r = new jsBefunge.Result();
            r.add("test");
            r.add(10000);
            r.set("mybuffer");
            r.clear();
            return(r.buffer == "");
        },
    });

    // code running check
    testRun({
        "Code Check1" : function() {
            var c = new jsBefunge.Code();
            //c._event.on("Stack.push",   function(t,v){ console.log("Stack.push");   console.log(v); });
            //c._event.on("Stack.pop",    function(t,v){ console.log("Stack.pop");    console.log(v); });
            //c._event.on("Stack.clear",  function(t,v){ console.log("Stack.clear");  console.log(v); });
            //c._event.on("Result.add",   function(t,v){ console.log("Result.add");   console.log(v); });
            //c._event.on("Result.set",   function(t,v){ console.log("Result.set");   console.log(v); });
            //c._event.on("Result.clear", function(t,v){ console.log("Result.clear"); console.log(v); });
            //c._event.on("Code.step", function(t,v){ console.log("Code.step"); console.log(t.pos); });
            //c._event.on("Code.stop", function(t,v){ console.log("Code.stop"); console.log(t.Result.buffer); });
            c._event.on("Code.end",  function(t,v){ console.log("Code Check1\n\tResult: " + (c.Result.buffer == 120)) });

            // calc "5!" => ans: 120
            var src = ["5 100p:v", "v *g00:_00g.@", ">00p1-:^"].join("\n");
            c.run(src);
            
            return("wait for a time");
        },
               
        "Code Check2" : function() {
            var c = new jsBefunge.Code();
            c._event.on("Code.end",  function(t,v){ console.log("Code Check2\n\tResult: " + (c.Result.buffer == "Hello, World!")) });

            // Hello, World!
            var src = [
                'v @_       v',
                '>0"!dlroW"v ',
                'v  :#     < ',
                '>" ,olleH" v',
                '   ^       <',
            ].join("\n");
                
            c.run(src);
            
            return("wait for a time");
        },
    });
    
})();