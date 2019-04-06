
var conf = {
    debug_mode: false
};

function load_async(path,callback){
    var head = document.getElementsByTagName("head")[0];
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.onload = callback;
    s.src = path;
    head.appendChild(s);
}

function load(path){
    load_async(path,function(){});
}

function main_eval(){
    var input = document.getElementById("input1");
    var output = document.getElementById("output1");
    try{
        var t = parser.ast(input.value);
        if(t!==null){
            t = cas.execute(t);
            t = cas.simplify_sf(2,t);
            var out = cas.output_form(t);
            output.innerHTML = "";
            if(conf.debug_mode){
                output.innerHTML += "<p><span class='mono'>"+JSON.stringify(out)+"</span>";
            }
            output.innerHTML += "<p>= "+htm_print.htm(out);
            // output.innerHTML += "<ul class='ast'><li>"+compiler.ast_tos(out)+"</ul>";
        }else{
            output.innerHTML="";
        }
    }catch(e){
        if(typeof e=="string"){
            output.innerHTML = "<p>"+e;
        }
        throw e;
    }
}

function diff(){
    var input = document.getElementById("input1");
    var output = document.getElementById("output1");
    try{
        var t = parser.ast(input.value);
        if(t!==null){
            t = cas.execute(["diff",t,"x"]);
            t = cas.simplify_sf(2,t);
            var out = cas.output_form(t);
            output.innerHTML = "<p>= "+htm_print.htm(out);
        }else{
            output.innerHTML = "";
        }
    }catch(e){
        if(typeof e=="string"){
            output.innerHTML = "<p>"+e;
        }
        throw e;
    }
}

function expand(){
    var input = document.getElementById("input1");
    var output = document.getElementById("output1");
    try{
        var t = parser.ast(input.value);
        if(t!==null){
            t = cas.execute(["expand",t]);
            t = cas.simplify_sf(2,t);
            var out = cas.output_form(t);
            output.innerHTML = "<p>= "+htm_print.htm(out);
        }else{
            output.innerHTML = "";
        }
    }catch(e){
        if(typeof e=="string"){
            output.innerHTML = "<p>"+e;
        }
        throw e;
    }
}

var main = main_eval;

function handle_keys(event){
    if(event.keyCode==13){
        main();
    }
}

window.onload = function(){
    load("js/cas/syntax.js");
    load("js/cas/kernel.js");
    load("js/cas/print.js");
};

