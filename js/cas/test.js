
conf.root = "../";

function eval_string(s){
    var t = parser.ast(s);
    t = cas.execute(t);
    t = cas.simplify_sf(2,t);
    var out = cas.output_form(t);
    return plain_print.text(out);
}

function checker(output){
    return function(index,input,result){
        var y = eval_string(input);
        if(y == result){
            return "ok";
        }else{
             output.push([
                "<div style='border-left: 6px solid #a00060; padding-left: 10px'>",
                "<p><b>Test #", index, " failed</b> ",
                "<table class='bt'><tr><th>Expression<td><code>", input, "</code>",
                "<tr><th>Expected<td><code>= ", result, "</code>",
                "<tr><th>Got<td><code>= ", y, "</code></table></div>"
            ].join(""));
            return "err";
        }
    }
}

/*
The more tests, the better.
There is no limit.
*/

var tests = [
["01.01", "0+0", "0"],
["01.02", "0*0", "0"],
["01.03", "1+2", "3"],
["02.01", "1/2+1/2", "1"],
["03.01", "x+x", "2x"],
["03.02", "x*x", "x^2"],
["04.01", "diff(0,x)", "0"],
["04.02", "diff(1,x)", "0"],
["04.03", "diff(x,x)", "1"],
["04.04", "diff(2x,x)", "2"],
["04.05", "diff(x^2,x)", "2x"],
["04.06", "diff(x^n,x)", "n*x^(n-1)"],
["04.07", "diff(1/x,x)", "-1/x^2"],
["04.08", "diff(1/x^2,x)", "-2/x^3"],
["04.09", "diff(x^7,x,7)", "5040"],
["04.10", "diff(1/x,x,7)", "-5040/x^8"],
["05.01", "expand(a*(x+y))", "a*x+a*y"],
["05.02", "expand((x+y)^2)", "x^2+2x*y+y^2"],
["05.03", "expand((x-y)^2)", "x^2-2x*y+y^2"],
["05.04", "expand((x+y)*(x-y))", "x^2-y^2"]
];

function all_tests(){
    var output = document.getElementById("output");
    output.innerHTML = "";
    var buffer = [];
    var check = checker(buffer);
    var all_ok = true;
    for(var i=0; i<tests.length; i++){
        var t = tests[i];
        if("err"==check(t[0],t[1],t[2])){
            all_ok = false;
        }
    }
    if(all_ok){
        output.innerHTML = "<p><b style='color: #006000'>Success.</b>";
    }else{
        output.innerHTML = buffer.join("");
    }
}

