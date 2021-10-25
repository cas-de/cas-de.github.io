
var conf = {
    debug_mode: false,
    root: ""
};

function load_async(path,callback){
    var head = document.getElementsByTagName("head")[0];
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.onload = callback;
    s.src = path;
    head.appendChild(s);
}

var load_count = 0;
var load_complete;

function load(path){
    load_async(path, function(){
        // Some hack. Needs to be made clean async.
        load_count += 1;
        if(load_count == load_complete){query();}
    });
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
var query_id = "input1";
var query_action = main;

function handle_keys(event){
    if(event.keyCode==13){
        main();
    }
}

function query() {
    var a = window.location.href.split("?");
    if(a.length > 1){
        var input = document.getElementById(query_id);
        input.value = decodeURIComponent(a[1]);
        query_action();
    }
}

var encode_tab = {
  " ": "20", "#": "23", "'": "27", "[": "5b", "]": "5d", "^": "5e",
  "\"": "22", "<": "3c", ">": "3e", "|": "7c"
};

function encode_query(s){
    var a = [];
    for(var i = 0; i < s.length; i++){
        if(s.charCodeAt(i) > 127){
            a.push(encodeURIComponent(s[i]));
        }else if(encode_tab.hasOwnProperty(s[i])){
            a.push("%" + encode_tab[s[i]]);
        }else{
            a.push(s[i]);
        }
    }
    return a.join("");
}

function link(s){
    var url = window.location.href.split("?")[0];
    return ("<p><a style='color: #808080; text-decoration: underline' href='" + url + "?"
      + encode_query(s) + "'>Link</a>");
}

window.onload = function(){
    load_complete = 3;
    load(conf.root+"js/cas/syntax.js");
    load(conf.root+"js/cas/kernel.js");
    load(conf.root+"js/cas/print.js");
};

