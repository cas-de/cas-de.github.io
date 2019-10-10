
function cart2(a, b){
    return [].concat(...a.map(x => b.map(y => [].concat(x,y))));
}

function cart(a, b, ...c){
    return b ? cart(cart2(a, b), ...c) : a;
}

function cart_pow(a,n){
    if(n==0){
        return [[]];
    }else if(n==1){
        return a.map(function(x){return [x];});
    }else{
        return cart.apply(null,Array(n).fill(a));
    }
}

function is_well_formed(t){
    if(t===0 || t===1){
        return ["ok"];
    }else if(typeof t=="string"){
        return ["ok"];
    }else if(Array.isArray(t)){
        if(t[0]==="and" || t[0]==="or" || t[0]==="=>" || t[0]==="<=>"
            || t[0]==="not"
        ){
            for(var i=1; i<t.length; i++){
                var y = is_well_formed(t[i]);
                if(y[0]=="err") return y;
            }
            return ["ok"];
        }else{
            return ["err",t];
        }
    }else{
        throw "internal error";
    }
}

function bool_fn_from_formula(t,variables){
    return function(a){
        var d = {};
        for(var i=0; i<a.length; i++){
            d[variables[i]] = a[i];
        }
        return cas.evaluate_strict(t,d);
    };
}

function truth_table_to_htm(tab,variables,expr){
    var a = ["<table class='bt'><tr>"];
    for(var i=0; i<variables.length; i++){
        a.push("<th>"+htm_print.htm(variables[i]));
    }
    a.push("<th>"+htm_print.htm(expr));
    for(var i=0; i<tab.length; i++){
        var pair = tab[i];
        var t = pair[0];
        var y = pair[1];
        a.push("<tr>");
        for(var j=0; j<t.length; j++){
            a.push("<td>"+t[j]);
        }
        a.push("<td style='text-align: center'>"+y);
    }
    a.push("</table>");
    return a.join("");
}

function truth_table(t){
    var variables = Object.keys(cas.variables(t)).sort();
    var f = bool_fn_from_formula(t,variables);
    var n = variables.length;
    var dom = cart_pow([0,1],n);
    var tab = [];    
    for(var i=0; i<dom.length; i++){
        var a = dom[i];
        tab.push([a,f(a)])
    }
    return truth_table_to_htm(tab,variables,t);
}

function info(t){
    var a = ["<table class='bt'>"];
    a.push("<tr><th colspan='2' style='text-align: center'>");
    a.push(htm_print.htm(t));
    var is_taut = cas.taut(t)==1 ? "ja" : "nein";
    var is_sat = cas.sat(t)==1 ? "ja" : "nein";
    a.push("<tr><td>Tautologisch?<td style='padding-left: 0.5em; padding-right: 0.5em'>");
    a.push(is_taut);
    a.push("<tr><td>Erfüllbar?<td style='padding-left: 0.5em; padding-right: 0.5em'>");
    a.push(is_sat);
    a.push("</table>");
    return a.join("");
}

function logic(){
    var input = document.getElementById("input1");
    var output = document.getElementById("output1");
    try{
        var t = parser.ast(input.value);
        if(t!==null){
            var wf = is_well_formed(t);
            if(wf[0]=="err"){
                output.innerHTML = (
                    "<p>Syntaxfehler: Keine logische Formel: "+
                    htm_print.htm(wf[1])
                );
            }else{
                out = ["<br>"];
                out.push(info(t));
                out.push("<br>");
                out.push(truth_table(t));
                output.innerHTML = out.join("");
            }
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
