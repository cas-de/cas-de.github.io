
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
            || t[0]==="not" || t[0]==="comma"
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
    if(Array.isArray(expr) && expr[0]==="comma"){
        for(var k=1; k<expr.length; k++){
            a.push("<th>"+htm_print.htm(expr[k]));
        }
    }else{
        a.push("<th>"+htm_print.htm(expr));
    }
    for(var i=0; i<tab.length; i++){
        var pair = tab[i];
        var t = pair[0];
        var y = pair[1];
        a.push("<tr>");
        for(var j=0; j<t.length; j++){
            a.push("<td>"+t[j]);
        }
        for(var k=0; k<y.length; k++){
            a.push("<td style='text-align: center'>"+y[k]);
        }
    }
    a.push("</table>");
    return a.join("");
}

function truth_tables(t){
    var variables = Object.keys(cas.variables(t)).sort();
    var n = variables.length;
    var af = [];
    for(var k=1; k<t.length; k++){
        af.push(bool_fn_from_formula(t[k],variables));
    }
    var dom = cart_pow([0,1],n);
    var tab = [];
    for(var i=0; i<dom.length; i++){
        var a = dom[i];
        var values = [];
        for(var k=0; k<af.length; k++){
            values.push(af[k](a));
        }
        tab.push([a,values]);
    }
    return truth_table_to_htm(tab,variables,t);
}

function truth_table(t){
    if(Array.isArray(t) && t[0]==="comma"){
        return truth_tables(t);
    }
    var variables = Object.keys(cas.variables(t)).sort();
    var f = bool_fn_from_formula(t,variables);
    var n = variables.length;
    var dom = cart_pow([0,1],n);
    var tab = [];    
    for(var i=0; i<dom.length; i++){
        var a = dom[i];
        tab.push([a,[f(a)]])
    }
    return truth_table_to_htm(tab,variables,t);
}

function info(t){
    if(Array.isArray(t) && t[0]==="comma"){
        a = t.slice(1);
    }else{
        a = [t];
    }
    var tab = ["<table class='bt'>"];
    if(a.length==1){
        tab.push("<tr><th colspan='2' style='text-align: center'>");
        tab.push(htm_print.htm(a[0]));
    }else{
        tab.push("<tr><th>");
        for(var k=0; k<a.length; k++){
            tab.push("<th style='text-align: center'>");
            tab.push(htm_print.htm(a[k]));
        }
    }
    tab.push("<tr><td>Tautologisch?");
    for(var k=0; k<a.length; k++){
        var is_taut = cas.taut(a[k])==1 ? "ja" : "nein";
        tab.push("<td style='padding-left: 0.5em; padding-right: 0.5em'>");
        tab.push(is_taut);
    }
    tab.push("<tr><td>Erfüllbar?");
    for(var k=0; k<a.length; k++){
        var is_sat = cas.sat(a[k])==1 ? "ja" : "nein";
        tab.push("<td style='padding-left: 0.5em; padding-right: 0.5em'>");
        tab.push(is_sat);    
    }
    tab.push("</table>");
    return tab.join("");
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
