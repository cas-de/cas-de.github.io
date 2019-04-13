

"use strict";

var parser = (function(){

function isalpha(s){
    return /^[a-z]+$/i.test(s);
}

function isdigit(s){
    return /^\d+$/.test(s);
}

function isspace(s){
    return s==' ' || s=='\t' || s=='\n';
}

var Symbol = 0;
var SymbolIdentifier = 1;
var SymbolNumber = 2;
var SymbolTerminator = 3;

function vtoken_tos(a){
    var b = [];
    for(var i=0; i<a.length; i++){
        var t = a[i];
        b.push("["+t[0]+","+t[1]+"]");
    }
    return b.join(" ");
}

var keywords = {
    "in": "in", "and": "&", "or": "|", "not": "not",
    "und": "&", "oder": "|"
};

var superscript = {
    '\u2070': "0",
    '\u00b9': "1",
    '\u00b2': "2",
    '\u00b3': "3",
    '\u2074': "4",
    '\u2075': "5",
    '\u2076': "6",
    '\u2077': "7",
    '\u2078': "8",
    '\u2079': "9"
};

function scan(s){
    var c,i,j,line,col,hcol;
    var n = s.length;
    var a = [];
    i = 0;
    line = 0;
    col = 0;
    while(i<n){
        c = s[i];
        if(isspace(c)){
            i++; col++;
        }else if(isdigit(c)){
            j = i; hcol = col;
            while(i<n && (isdigit(s[i]) || s[i]=='.')){
                if(s[i]=='.' && i+1<n && s[i+1]=='.') break;
                i++; col++;
            }
            a.push([SymbolNumber,s.slice(j,i),line,hcol]);
        }else if(isalpha(c)){
            j = i; hcol = col;
            while(i<n && (isalpha(s[i]) || isdigit(s[i]))){
                i++; col++;
            }
            var id = s.slice(j,i);
            if(keywords.hasOwnProperty(id)){
                a.push([Symbol,keywords[id],line,col]);
            }else{
                if(a.length>0 && a[a.length-1][0]==SymbolNumber){
                    a.push([Symbol,"*",line,col]);
                }
                a.push([SymbolIdentifier,id,line,hcol]);
            }
        }else if(c=="(" || c=="[" || c=="{"){
            if(a.length>0 && a[a.length-1][0]==SymbolNumber){
                a.push([Symbol,"*",line,col]);
            }
            a.push([Symbol,c,line,col]);
            i++; col++;
        }else if(c==")" || c=="]" || c=="}"){
            a.push([Symbol,c,line,col]);
            i++; col++;
        }else if(c=="," || c==";"){
            a.push([Symbol,c,line,col]);
            i++; col++;
        }else if(c=="!" && i+1<n && s[i+1]=="="){
            a.push([Symbol,"!=",line,col]);
            i+=2; col+=2;
        }else if(c=="=" && i+1<n && s[i+1]==">"){
            a.push([Symbol,"=>",line,col]);
            i+=2; col+=2;
        }else if(c=="." && i+1<n && s[i+1]=="."){
            a.push([Symbol,"..",line,col]);
            i+=2; col+=2;
        }else if(c=="<" && i+2<n && s[i+1]=="=" && s[i+2]==">"){
            a.push([Symbol,"<=>",line,col]);
            i+=3; col+=3;
        }else if(superscript.hasOwnProperty(s[i])){
            var number = "";
            while(i<n && superscript.hasOwnProperty(s[i])){
                number += superscript[s[i]];
                i++; col++;
            }
            a.push([Symbol,"^",line,col]);
            a.push([SymbolNumber,number,line,col]);
        }else{
            a.push([Symbol,c,line,col]);
            i++; col++;
        }
    }
    a.push([SymbolTerminator,"",line,col]);
    return a;
}

function point_to(s,col){
    var a = [
        s, "\n<br>",
        Array(col).join("&nbsp;")+"^"
    ];
    return a.join("");
}

function syntax_error(i,text){
    var line = i.a[i.index][2];
    var col = i.a[i.index][3];
    var a = ["<code>",
        point_to(i.s,col+1), "\n<br>",
        "Line ", String(line+1), ", col ", String(col+1), "\n<br>",
        "Syntax error: ", text, "</code>"
    ];
    throw a.join("");
}

function get_token(i){
    return i.a[i.index];
}

function atom(i){
    var t = get_token(i);
    if(t[0]==SymbolNumber){
        i.index++;
        return parseFloat(t[1]);
    }else if(t[0]==SymbolIdentifier){
        i.index++;
        return t[1];
    }else{
        syntax_error(i,"expected an identifier or a number.");
    }
}

function list(i){
    i.index++;
    var a=["[]"];
    var t = get_token(i);
    if(t[0]==Symbol && t[1]=="]"){
        i.index++;
        return a;
    }
    while(1){
        a.push(expression(i));
        t = get_token(i);
        if(t[0]==Symbol && t[1]=="]"){
            i.index++;
            return a;
        }else if(t[0]==Symbol && t[1]==","){
            i.index++;
            continue;
        }else{
          syntax_error(i,"expected ',' or ']'.");
        }
    }
}

function formal_arguments(i,a){
    while(1){
        a.push(atomic_expression(i));
        var t = get_token(i);
        if(t[0]==Symbol && t[1]=="|"){
            i.index++;
            break;
        }else if(t[0]==Symbol && t[1]==","){
            i.index++;
            continue;
        }
    }
    return a;
}

function function_literal(i){
    i.index++;
    var a = formal_arguments(i,["[]"]);
    var x = expression(i);
    return ["lambda",a,x];
}

function atomic_expression(i){
    var t = get_token(i);
    if(t[0]==Symbol && t[1]=="("){
        i.index++;
        var x = expression(i);
        t = get_token(i);
        if(t[0]!=Symbol || t[1]!=")"){
            syntax_error(i,"expected ')'.");
        }
        i.index++;
        return x;
    }else if(t[0]==Symbol && t[1]=="["){
        return list(i);
    }else if(t[0]==Symbol && t[1]=="|"){
        return function_literal(i);
    }else{
        return atom(i);
    }
}

function application(i){
    var x = atomic_expression(i);
    while(1){
        var t = get_token(i);
        if(t[0]==Symbol && t[1]=="("){
            var a = [x];
            i.index++;
            while(1){
                a.push(expression(i));
                t = get_token(i);
                if(t[0]==Symbol && t[1]==")"){
                    i.index++;
                    x = a;
                    break;
                }else if(t[0]==Symbol && t[1]==","){
                    i.index++;
                    continue;
                }else{
                    syntax_error(i,"expected ',' or ')'.");
                }
            }
        }else if(t[0]==Symbol && t[1]=="!"){
            i.index++;
            x = ["fac",x];        
        }else{
            break;
        }
    }
    return x;
}

function power(i){
    var x = application(i);
    var t = get_token(i);
    if(t[0]==Symbol && t[1]=="^"){
        i.index++;
        var y = factor(i);
        return ["^",x,y];
    }else{
        return x;
    }
}

function factor(i){
    var t = get_token(i);
    if(t[0]==Symbol){
        if(t[1]=="+"){
            i.index++;
            return factor(i);
        }else if(t[1]=="-"){
            i.index++;
            return ["neg",factor(i)];
        }else{
            return power(i);
        }
    }else{
         return power(i);
    }
}

function term(i){
    var x = factor(i);
    var t = get_token(i);
    while(t[0]==SymbolIdentifier || t[0]==SymbolNumber){
        x = ["*",x,factor(i)];
        t = get_token(i);
    }
    while(t[0]==Symbol && (t[1]=="*" || t[1]=="/" || t[1]=="%")){
        i.index++;
        var y = factor(i);
        x = [t[1],x,y];
        t = get_token(i);
    }
    return x;
}

function pm_term(i){
    var x = term(i);
    var t = get_token(i);
    while(t[0]==Symbol && (t[1]=="+" || t[1]=="-")){
        i.index++;
        var y = term(i);
        x = [t[1],x,y];
        t = get_token(i);
    }
    return x;
}

function range_term(i){
    var x = pm_term(i);
    var t = get_token(i);
    if(t[0]==Symbol && t[1]==".."){
        i.index++;
        var y = pm_term(i);
        t = get_token(i);
        if(t[0]==Symbol && t[1]==":"){
            i.index++;
            var d = pm_term(i);
            return ["range",x,y,d];
        }
        return ["range",x,y];
    }else{
        return x;
    }
}

function eq_relation(i){
    var x = range_term(i);
    var t = get_token(i);
    if(t[0]==Symbol && (t[1]=="in" || t[1]=="=" || t[1]=="!=")){
        i.index++;
        var y = range_term(i);
        return [t[1],x,y];
    }else{
        return x;
    }
}

function relation(i){
    var x = eq_relation(i);
    var t = get_token(i);
    if(t[0]==Symbol && (
       t[1]=="<" || t[1]==">" ||
       t[1]=="<=" || t[1]==">=" || t[1]=="~"
    )){
        i.index++;
        var y = eq_relation(i);
        return [t[1],x,y];
    }else{
        return x;
    }
}

function negation(i){
    var t = get_token(i);
    if(t[0]==Symbol && t[1]=="not"){
        i.index++;
        var x = negation(i);
        return ["not",x];
    }else{
        return relation(i);
    }
}

function and_expression(i){
    var x = negation(i);
    var t = get_token(i);
    while(t[0]==Symbol && t[1]=="&"){
        i.index++;
        var y = negation(i);
        x = ["and",x,y];
        t = get_token(i);
    }
    return x;
}

function or_expression(i){
    var x = and_expression(i);
    var t = get_token(i);
    while(t[0]==Symbol && t[1]=="|"){
        i.index++;
        var y = and_expression(i);
        x=["or",x,y];
        t = get_token(i);
    }
    return x;
}

function implication(i){
    var x = or_expression(i);
    var t = get_token(i);
    while(t[0]==Symbol && t[1]=="=>"){
        i.index++;
        var y = or_expression(i);
        x = [t[1],x,y];
        t = get_token(i);
    }
    return x;
}

function equivalence(i){
    var x = implication(i);
    var t = get_token(i);
    while(t[0]==Symbol && t[1]=="<=>"){
        i.index++;
        var y = implication(i);
        x = [t[1],x,y];
        t = get_token(i);
    }
    return x;
}

function expression(i){
    return equivalence(i);
}

function ast(a,s){
    if(s===undefined){
        s = a;
        a = scan(s);
    }
    if(a[0][0]==SymbolTerminator){
        return null;
    }else{
        // log(compiler.vtoken_tos(a));
        var i = {index: 0, a: a, s: s};
        return expression(i);
    }
}

function ast_tos(t){
    if(Array.isArray(t)){
        var a = [];
        a.push("<table class='op'><tr><td>"+ast_tos(t[0])+"</table>");
        a.push("<ul class='ast'>");
        for(var i=1; i<t.length; i++){
          a.push("<li>"+ast_tos(t[i]));
        }
        a.push("</ul>");
        return a.join("");
    }
    var T = typeof t;
    if(T=="string" || T=="number"){
        return String(t);
    }else{
        throw "ast_tos error";
    }
}

function htm_expression(t){
    if(navigator.userAgent.indexOf("Firefox")>0){
        return mathml_print.htm(t);
    }else{
        return htm_print.htm(t);
    }
}

return{
    isalpha: isalpha, isdigit: isdigit,
    htm_expression: htm_expression,
    scan: scan, ast_tos: ast_tos,
    ast: ast,
}

})();

