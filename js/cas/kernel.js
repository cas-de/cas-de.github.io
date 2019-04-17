
"use strict";

function str(x){
    return JSON.stringify(x);
}

function log(x){
    console.log(str(x));
}

function dbg(x){
    log(x);
    return x;
}

var cas = (function(){
var cas = {
shallow_copy: function(a){
    var b=[];
    for(var i=0; i<a.length; i++){
        b.push(a[i]);
    }
    return b;
},

is_app: function(t){
    return Array.isArray(t);
},

is_number: function(t){
    return typeof t=="number";
},

is_int: function(t){
    return typeof t=="number" && t==Math.floor(t);
},

is_atom: function(t){
    return cas.is_number(t) || typeof t=="string";
},

is_const: function(t,v){
    if(cas.is_app(t)){
        return undefined;
    }else{
        if(t===v){
            return false;
        }else{
            return true;
        }
    }
},

is_simple_product_term: function(t){
    if(cas.is_atom(t)){
        return true;
    }else if(cas.is_app(t) && t[0]==="*"){
        for(var i=1; i<t.length; i++){
            if(!cas.is_simple_product_term(t[i])) return false;
        }
        return true;
    }else{
        return false;
    }
},

hash: function hash(t){
    return JSON.stringify(t);
},

fac: function(n){
    var y = 1;
    for(var k=1; k<=n; k++){
        y*=k;
    }
    return y;
},

gcd: function(x,y){
    x = Math.abs(x);
    y = Math.abs(y);
    var h;
    while(y>0){
        h = x%y;
        x = y;
        y = h;
    }
    return x;
},

prod_rest: function(a){
    if(a.length==1){
        return 1;
    }else if(a.length==2){
        return a[1];
    }else{
        return ["*"].concat(a.slice(1));
    }
},

ipow: function(n){
    n = n%4;
    return n==0? 1: n==1? "i": n==2? -1: ["*",[-1,"i"]];
},

simplify_sum: function(a){
    var tab = {};
    var s = 0;
    var b = [];
    for(var i=0; i<a.length; i++){
        if(typeof a[i]=="number"){
           s = s+a[i];
        }else{
            var h;
            if(cas.is_prod(a[i]) && typeof a[i][1]=="number"){
                var n = a[i][1];
                var rest = cas.prod_rest(a[i].slice(1));
                h = cas.hash(rest);
                if(tab.hasOwnProperty(h)){
                    tab[h][0]+=n;
                }else{
                    tab[h] = [n,rest];
                }
            }else{
                h = cas.hash(a[i]);
                if(tab.hasOwnProperty(h)){
                    tab[h][0]++;
                }else{
                    tab[h] = [1,a[i]];
                }
            }
        }
    }
    var c = [];
    var u;
    for(var x in tab){
        u = tab[x];
        if(u[0]!==0){
          c.push(u[0]==1? u[1]: ["*"].concat(u));
        }
    }
    if(s!=0){
        c.push(s);
    }
    return c.length==0? 0: c.length==1? c[0]: ["+"].concat(c);
},

simplify_prod: function(a){
    var tab = {};
    var p = 1;
    var q = 1;
    for(var i=0; i<a.length; i++){
        if(typeof a[i]=="number"){
            p = p*a[i];
            if(p==0) return 0;
        }else{
            var h;
            if(cas.is_app(a[i]) && a[i][0]==="^" && typeof a[i][2]=="number"){
                if(typeof a[i][1]=="number" && a[i][2]==-1){
                    q = q*a[i][1];
                }else{
                    var x = a[i][1];
                    var n = a[i][2];
                    h = cas.hash(x);
                    if(tab.hasOwnProperty(h)){
                        tab[h][1]+=n;
                    }else{
                        tab[h] = [x,n];
                    }
                }
            }else{
                h = cas.hash(a[i]);
                if(tab.hasOwnProperty(h)){
                    tab[h][1]++;
                }else{
                    tab[h] = [a[i],1];
                }
            }
        }
    }
    if(p==Math.floor(p) && q==Math.floor(q)){
        var z = cas.gcd(p,q);
        p = p/z;
        q = q/z;
    }
    var c = [];
    if(p!=1){
        c.push(p);
    }
    if(q!=1){
        c.push(["^",q,-1]);
    }
    var n;
    for(var x in tab){
        var u = tab[x];
        if(u[0]==="i"){
            c.push(cas.ipow(u[1]));
        }else if(u[1]!==0){
            c.push(u[1]===1? u[0]: ["^"].concat(u));
        }
    }
    return c.length==0? 1: c.length==1? c[0]: ["*"].concat(c);
},

distribute: function(x,a){
    var y = ["+"];
    for(var i=1; i<a.length; i++){
        y.push(["*",x,a[i]]);
    }
    return y;
},

simplify_tab: {
    "-": function(t){
        var x = cas.simplify(t[1]);
        var y = cas.simplify(t[2]);
        if(cas.is_number(x)){
            if(cas.is_number(y)){
                return x-y;
            }else if(x===0){
                return ["neg",y];
            }else{
                return ["-",x,y];
            }
        }else if(y===0){
            return x;
        }else{
            return ["-",x,y];
        }
    },
    "^": function(t){
        var x = cas.simplify(t[1]);
        var y = cas.simplify(t[2]);
        if(y===1){
            return x;
        }else if(y===0){
            return 1;
        }else if(x==="i"){
            if(y===2) return -1;
        }else if(x===1){
            return 1;
        }else if(typeof x=="number"){
            if(typeof y=="number"){
                if(y<0){
                    return ["^",Math.pow(x,Math.abs(y)),-1];
                }else{
                    return Math.pow(x,y);
                }
            }
        }else if(cas.is_app(x) && x[0]==="^"){
            if(cas.is_int(x[2]) && cas.is_int(y)){
                return ["^",x[1],x[2]*y];
            }
        }else if(cas.is_app(x) && x[0]==="*"){
            if(cas.is_int(y)){
                return ["*"].concat(x.slice(1).map(function(xk){
                    return ["^",xk,y];
                }));
            }
        }
        return ["^",x,y];    
    },
    "*": function(t){
        var a = t.slice(1).map(cas.simplify);
        var y = cas.simplify_prod(a);
        if(cas.is_app(y) && y[0]==="*"){
            var n = y.length-1;
            if(cas.is_app(y[n]) && y[n][0]==="+"){
                if(y.length==3){
                    if(cas.is_simple_product_term(y[1])){
                        return cas.distribute(y[1],y[2]);
                    }
                }else{
                    var p = y.slice(0,n);
                    if(cas.is_simple_product_term(p)){
                        return cas.distribute(p,y[n]);
                    }
                }
            }
        }
        return y;    
    },
    "+": function(t){
        var a = t.slice(1).map(cas.simplify);
        return cas.simplify_sum(a);
    },
    "neg": function(t){
        var x = cas.simplify(t[1]);
        if(typeof x=="number"){
            return -x;
        }else{
            return ["neg",x];
        }    
    },
    "/": function(t){
        var x = cas.simplify(t[1]);
        var y = cas.simplify(t[2]);
        if(x===0 && y!==0){
            return 0;
        }else if(y===1){
            return x;
        }else if(x===y){
            return 1;
        }else{
            return ["/",x,y];
        }    
    },
    "ln": function(t){
        var x = cas.simplify(t[1]);
        if(x==="e"){
            return 1;
        }else if(x===1){
            return 0;
        }else{
            return ["ln",x];
        }    
    },
    "fac": function(t){
        var x = cas.simplify(t[1]);
        if(typeof x=="number" && x>=0 && x<10){
            return cas.fac(x);
        }else{
            return ["fac",x];
        }    
    },
    "cos": function(t){
        var x = cas.simplify(t[1]);
        if(cas.is_number(x)){
            if(x==0){
                return 1;
            }else if(x<0){
                return ["cos",-x];
            }
        }else if(x==="pi"){
            return -1;
        }else if(cas.is_app(x) && x[0]==="*" &&
            cas.is_number(x[1]) && x[1]<0
        ){
            if(x[1]==-1){
                return ["cos",cas.simplify_single(["*"].concat(x.slice(2)))];
            }else{
                return ["cos",["*",-x[1]].concat(x.slice(2))];
            }
        }
        return ["cos",x];    
    },
    "sin": function(t){
        var x = cas.simplify(t[1]);
        if(cas.is_number(x)){
            if(x==0){
                return 0;
            }else if(x<0){
                return ["*",-1,["sin",-x]];
            }
        }else if(x==="pi"){
            return 0;
        }else if(cas.is_app(x) && x[0]==="*" &&
            cas.is_number(x[1]) && x[1]<0
        ){
            if(x[1]==-1){
                return ["*",-1,["sin",cas.simplify_single(["*"].concat(x.slice(2)))]];
            }else{
                return ["*",-1,["sin",["*",-x[1]].concat(x.slice(2))]];
            }
        }
        return ["sin",x];    
    },
    "atan": function(t){
        var x = cas.simplify(t[1]);
        if(x===0){
            return 0;
        }else{
            return ["atan",x];
        }
    },
    "asin": function(t){
        var x = cas.simplify(t[1]);
        if(x===0){
            return 0;
        }else{
            return ["asin",x];
        }
    },
    "acos": function(t){
        var x = cas.simplify(t[1]);
        if(x===0){
            return ["*","pi",["^",2,-1]];
        }else{
            return ["asin",x];
        }
    }
},

simplify: function(t){
    if(!cas.is_app(t)) return t;
    if(typeof t[0]==="string" && cas.simplify_tab.hasOwnProperty(t[0])){
        return cas.simplify_tab[t[0]](t);
    }else{
        return [t[0]].concat(t.slice(1).map(cas.simplify));
    }
},

is_sum: function(t){
    return cas.is_app(t) && t[0]==="+";
},

is_prod: function(t){
    return cas.is_app(t) && t[0]==="*";
},

cmp_sum: function(x,y){
    if(typeof x=="number"){
        return typeof y=="number"? 0: 1;
    }else if(typeof y=="number"){
        return typeof x=="number"? 0: -1;
    }else{
        return 0;
    }
},

cmp_prod: function(x,y){
    var Tx = typeof x;
    var Ty = typeof y;
    if(Tx=="number"){
        return Ty=="number"? 0: -1;
    }else if(Ty=="number"){
        return Tx=="number"? 0: 1;
    }else if(Tx=="string"){
        if(Ty=="string"){
            return x<y? -1: x>y? 1: 0;
        }else{
            return 0;
        }
    }else if(Ty=="string"){
        return 1;
    }else{
        return 0;
    }
},

standard_form: function(t){
    if(cas.is_app(t)){
        if(t[0]==="+"){
            var a = [];
            var x;
            for(var i=1; i<t.length; i++){
                x = cas.standard_form(t[i]);
                if(cas.is_sum(x)){
                    a.push.apply(a,x.slice(1));
                }else{
                    a.push(x);
                }
            }
            a.sort(cas.cmp_sum)
            return ["+"].concat(a);
        }else if(t[0]==="*"){
            var a = [];
            var x;
            for(var i=1; i<t.length; i++){
                x = cas.standard_form(t[i]);
                if(cas.is_prod(x)){
                    a.push.apply(a,x.slice(1));
                }else{
                    a.push(x);
                }
            }
            a.sort(cas.cmp_prod);
            return ["*"].concat(a);
        }else if(t[0]==="-"){
            var x = cas.standard_form(t[1]);
            var y = cas.standard_form(["*",-1,t[2]]);
            if(cas.is_sum(x)){
                return ["+"].concat(x.slice(1).concat([y]));
            }else{
                return ["+",x,y];
            }
        }else if(t[0]==="neg"){
            return cas.standard_form(["*",-1,t[1]]);
        }else if(t[0]==="/"){
            return cas.standard_form(["*",t[1],["^",t[2],-1]]);
        }else{
            var a = [];
            for(var i=0; i<t.length; i++){
                a.push(cas.standard_form(t[i]));
            }
            return a;
        }
    }
    return t;
},

expand_binary_prod: function(x,y){
    if(cas.is_sum(x)){
        var a = ["+"];
        for(var i=1; i<x.length; i++){
            a.push(cas.expand(["*",x[i],y]));
        }
        return a;
    }else if(cas.is_sum(y)){
        var a = ["+"];
        for(var i=1; i<y.length; i++){
            a.push(cas.expand(["*",x,y[i]]));
        }
        return a;
    }else{
        return ["*",x,y];
    }
},

expand: function(t){
    if(cas.is_app(t)){
        if(t[0]==="*"){
            var u = cas.expand(t[1]);
            for(var i=2; i<t.length; i++){
                u = cas.expand_binary_prod(u,cas.expand(t[i]));
            }
            return u;
        }else if(t[0]==="^"){
            if(typeof t[2]=="number" &&
                t[2]>1 && t[2]==Math.floor(t[2])
            ){
                var p = cas.expand(t[1]);
                var u = p;
                for(var i=1; i<t[2]; i++){
                    u = cas.expand_binary_prod(p,u);
                }
                return u;
            }
        }else if(t[0]==="sum"){
            var a = t[1][2];
            var b = t[2];
            var y = ["+"];
            if(typeof a=="number" && typeof b=="number"){
                var v = t[1][1];
                for(var k=a; k<=b; k++){
                    var vtab = {}; vtab[v]=k;
                    y.push(cas.substitute(t[3],vtab));
                }
                return y;
            }
        }else if(t[0]==="sin" && cas.is_app(t[1]) &&
            t[1][0]==="+" && t[1].length>2
        ){
            var a = t[1][1];
            var b = t[1].length==3? t[1][2]: ["+"].concat(t[1].slice(2));
            return cas.expand(["+",
                ["*",cas.expand(["sin",a]),cas.expand(["cos",b])],
                ["*",cas.expand(["sin",b]),cas.expand(["cos",a])]
            ]);
        }else if(t[0]==="cos" && cas.is_app(t[1]) &&
            t[1][0]==="+" && t[1].length>2
        ){
            var a = t[1][1];
            var b = t[1].length==3? t[1][2]: ["+"].concat(t[1].slice(2));
            return cas.expand(["+",
                ["*",cas.expand(["cos",a]),cas.expand(["cos",b])],
                ["*",-1,cas.expand(["sin",a]),cas.expand(["sin",b])]
            ]);
        }
        return [t[0]].concat(t.slice(1).map(cas.expand));
    }else{
       return t;
    }
},

simplify_sf: function(n,t){
    for(var i=0; i<n; i++){
        t = cas.simplify(cas.standard_form(t));
    }
    return t;
},

expand_sf: function(t){
    return cas.expand(cas.standard_form(t));
},

expand_simplify: function(n,t){
    return cas.simplify_sf(n,cas.expand(cas.simplify(t)));
},

diff_tab: {
    "+": function(t,v){
        var a = ["+"];
        for(var i=1; i<t.length; i++){
            a.push(cas.diff(t[i],v));
        }
        return a;
    },
    "-": function(t,v){
        return ["-",cas.diff(t[1],v),cas.diff(t[2],v)];
    },
    "*": function(t,v){
        var a = ["+"];
        for(var i=0; i+1<t.length; i++){
            var b = t.slice(1);
            b[i] = cas.diff(b[i],v);
            a.push(["*"].concat(b));
        }
        return a;
    },
    "/": function(t,v){
        var f = t[1];
        var g = t[2];
        return ["-",
            ["/",cas.diff(f,v),g],
            ["/",["*",f,cas.diff(g,v)],["^",g,2]]
        ];
    },
    "^": function(t,v){
        var x = t[1];
        var n = t[2];
        if(x===v){
            if(cas.is_const(n,v)){
                return ["*",n,["^",x,["-",n,1]]];
            }
        }else if(cas.is_const(n,v)){
            return ["*",["*",n,["^",x,["-",n,1]]],cas.diff(x,v)];
        }else if(cas.is_const(x,v)){
            return ["*",["*",t,["ln",x]],cas.diff(n,v)];
        }
        return ["*",["^",x,n],["+",
            ["/",["*",cas.diff(x,v),n],x],
            ["*",cas.diff(n,v),["ln",x]]
        ]];
    },
    "neg": function(t,v){
        return ["neg",cas.diff(t[1],v)];
    },
    "exp": function(t,v){
        return ["*",cas.diff(t[1],v),t];
    },
    "ln": function(t,v){
        return ["*",cas.diff(t[1],v),["^",t[1],-1]];
    },
    "lg": function(t,v){
        return ["*",["/",1,["ln",10]],cas.diff(t[1],v),["^",t[1],-1]];
    },
    "log": function(t,v){
        return cas.diff(["/",["ln",t[1]],["ln",t[2]]],v);
    },
    "sin": function(t,v){
        return ["*",cas.diff(t[1],v),["cos",t[1]]];
    },
    "cos": function(t,v){
        return ["neg",["*",cas.diff(t[1],v),["sin",t[1]]]];
    },
    "tan": function(t,v){
        return ["/",cas.diff(t[1],v),["^",["cos",t[1]],2]];
    },
    "cot": function(t,v){
        return ["neg",["/",cas.diff(t[1],v),["^",["sin",t[1]],2]]];
    },
    "asin": function(t,v){
        return ["*",
            cas.diff(t[1],v),
            ["^",["+",1,["*",-1,["^",t[1],2]]],["*",-1,["^",2,-1]]]
        ];
    },
    "acos": function(t,v){
        return ["*",-1,
            cas.diff(t[1],v),
            ["^",["+",1,["*",-1,["^",t[1],2]]],["*",-1,["^",2,-1]]]
        ];
    },
    "atan": function(t,v){
        return ["*",cas.diff(t[1],v),["^",["+",["^",t[1],2],1],-1]];
    },
    "acot": function(t,v){
        return ["*",-1,cas.diff(t[1],v),["^",["+",["^",t[1],2],1],-1]];
    },
    "sqrt": function(t,v){
        return ["*",["/",1,["*",2,t]],cas.diff(t[1],v)];
    },
    "root": function(t,v){
        return cas.diff(["^",t[1],["/",1,t[2]]],v);
    },
    "sum": function(t,v){
        return ["sum",t[1],t[2],cas.diff(t[3],v)];
    },
    "Gamma": function(t,v){
        return ["*",cas.diff(t[1],v),["Gamma",t[1]],["psi",t[1]]];
    },
    "psi": function(t,v){
        if(t.length==2){
            return ["*",cas.diff(t[1],v),["psi",1,t[1]]];
        }else if(cas.is_int(t[1])){
            return ["*",cas.diff(t[2],v),["psi",t[1]+1,t[2]]];
        }else{
            return ["diff",t,v];
        }
    }
},

diff: function(t,v){
    if(cas.is_app(t)){
        if(cas.diff_tab.hasOwnProperty(t[0])){
            return cas.diff_tab[t[0]](t,v);
        }else if(t.length==2 && cas.is_app(t[1])){
            return ["*",
                [["lambda",["[]","t"],cas.diff([t[0],"t"],"t")],t[1]],
                cas.diff(t[1],"x")
            ];
        }else{
            return ["diff",t,v];
        }
    }else{
        return t===v? 1: 0;
    }
},

diffn: function(t,v,n){
    for(var i=0; i<n; i++){
        t = cas.simplify_sf(1,cas.diff(t,v));
    }
    return t;
},

taylor: function(t,v,a,n){
    if(cas.is_int(n) && n>=0){
        var k = 0;
        var y = ["+"];
        for(var k=0; k<=n; k++){
            var vtab={}; vtab[v]=a;
            var p = cas.substitute(cas.diffn(t,v,k),vtab);
            y.push(["*",["^",cas.fac(k),-1],p,["^",["+",v,["*",-1,a]],k]]);
        }
        return cas.simplify_single(y);
    }else{
        return ["taylor",t,v,a,n];
    }
},

grad: function(t,v){
    var y = ["[]"];
    for(var i=1; i<v.length; i++){
        y.push(cas.diff(t,v[i]));
    }
    return y;
},

variables_table: {
},

evaluate: function(t){
    if(cas.is_app(t)){
        if(t[0]==="diff" && typeof t[2]=="string"){
            if(t.length==4){
                if(typeof t[3]=="number"){
                    return cas.diffn(
                        cas.evaluate(t[1]),
                        cas.evaluate(t[2]), t[3]
                    );
                }else{
                    return t;
                }
            }else{
                return cas.simplify(cas.diff(
                    cas.evaluate(t[1]),
                    cas.evaluate(t[2])
                ));
            }
        }else if(t[0]==="grad"){
            return cas.grad(cas.evaluate(t[1]),t[2]);
        }else if(t[0]==="taylor"){
            return cas.taylor(t[1],t[2],t[3],t[4]);
        }else if(t[0]==="simp"){
            return cas.simplify_sf(1,cas.evaluate(t[1]));
        }else if(t[0]==="expand"){
            return cas.expand_sf(cas.evaluate(t[1]));
        }else if(t[0]==="sf"){
            return cas.standard_form(cas.evaluate(t[1]));
        }else if(t[0]==="var"){
            return cas.variables_as_list(t[1]);
        }else if(t[0]==="taut"){
            return cas.taut(t[1]);
        }else if(t[0]==="sat"){
            return cas.sat(t[1]);
        }else if(t[0]==="subs"){
            var expr,v,value;
            if(cas.is_app(t[1]) && t[1][0]==="="){
                expr = t[2];
                v = t[1][1];
                value = t[1][2];
            }else{
                expr = t[1];
                v = t[2][1];
                value = t[2][2];
            }
            var vtab={}; vtab[v]=value;
            return cas.substitute(cas.evaluate(expr),vtab);
        }else if(t[0]==="eval"){
            return cas.evaluate(cas.evaluate(t[1]));
        }else if(t[0]==="hold"){
            return t[1];
        }else if(t[0]==="plain"){
            var u = cas.output_form(cas.simplify_sf(2,cas.evaluate(t[1])));
            return ["str",plain_print.text(u)];
        }else{
            var a = [];
            for(var i=0; i<t.length; i++){
                a.push(cas.evaluate(t[i]));
            }
            return a;
        }
    }else{
        return t;
    }
},

substitute: function(t,d){
    if(cas.is_app(t)){
        var a = [t[0]];
        if(t[0]==="="){
            a.push(t[2]);
            a.push(cas.substitute(t[3],d));
        }else{
            for(var i=1; i<t.length; i++){
                a.push(cas.substitute(t[i],d));
            }
        }
        return a;
    }else if(typeof t==="string"){
        if(d.hasOwnProperty(t)){
          return d[t];
        }else{
          return t;
        }
    }else{
        return t;
    }
},

execute: function(t){
    // t = cas.substitute(t,cas.variables_table);
    if(cas.is_app(t)){
        if(t[0]==="="){
            cas.variables_table[t[1]] = cas.evaluate(t[2]);
            return t;
        }
    }
    return cas.evaluate(t);
},

is_negative: function(t){
    return(
        typeof t=="number" && t<0 ||
        cas.is_prod(t) && typeof t[1]=="number" && t[1]<0
    );
},

remove_minus: function(t){
    if(typeof t=="number") return -t;
    var a = cas.shallow_copy(t);
    a[1] = -a[1];
    if(a[1]==1){
        var b = a.slice(2);
        return b.length==1? b[0]: [t[0]]+b;
    }else{
        return a;
    }
},

simplify_single: function(t){
    return t.length==2? t[1]: t;
},

frac_form: function(a){
    var nominator = ["*"];
    var denominator = ["*"];
    for(var i=0; i<a.length; i++){
        var x = a[i];
        if(cas.is_app(x) && x[0]==="^" &&
           typeof x[2]=="number" && x[2]<0
        ){
            if(x[2]==-1){
                denominator.push(x[1]);
            }else{
                denominator.push(["^",x[1],-x[2]]);
            }
        }else{
            nominator.push(x);
        }
    }
    if(denominator.length==1){
        return cas.simplify_single(nominator);
    }else if(nominator.length==1){
        return ["/",1,cas.simplify_single(denominator)];
    }else{
        return ["/",
            cas.simplify_single(nominator),
            cas.simplify_single(denominator)
        ];
    }
},

output_form_rec: function(t){
    if(cas.is_app(t)){
        var a = t.slice(1).map(cas.output_form_rec);
        if(t[0]==="+"){
            var u;
            if(cas.is_negative(a[0])){
                u = ["neg",cas.remove_minus(a[0])];
            }else{
                u = a[0];
            }
            for(var i=1; i<a.length; i++){
                if(cas.is_negative(a[i])){
                    u = ["-",u,cas.remove_minus(a[i])];
                }else{
                    u = ["+",u,a[i]];
                }
            }
            return u;
        }else if(t[0]==="*"){
            return cas.frac_form(a);
        }else if(t[0]==="^"){
            if(typeof a[0]=="number" && a[0]<0){
                return ["^",["neg",Math.abs(a[0])],a[1]];
            }
        }
        return [t[0]].concat(a);
    }else{
        return t;
    }
},

output_form_residual: function(t){
    if(cas.is_app(t)){
        var a = t.slice(1).map(cas.output_form_residual);
        if(t[0]==="^"){
            if(typeof a[1]=="number" && a[1]<0){
                if(a[1]==-1){
                    return ["/",1,a[0]];
                }else{
                    return ["/",1,["^",a[0],-a[1]]];
                }
            }
        }else if(t[0]==="*"){
            if(typeof a[0]=="number" && a[0]==-1){
                if(a.length==2){
                    return ["neg",a[1]];
                }else{
                    return ["*",["neg",a[1]]].concat(a.slice(2));
                }
            }
        }
        return [t[0]].concat(a);
    }else{
        return t;
    }
},

output_form: function(t){
    return cas.output_form_residual(cas.output_form_rec(t));
},

update: function(a,b){
    var v = Object.keys(b);
    var key;
    for(var i=0; i<v.length; i++){
        key = v[i];
        a[key] = b[key];
    }
},

variables: function(t){
    if(cas.is_app(t)){
        var d = {};
        for(var i=1; i<t.length; i++){
            cas.update(d,cas.variables(t[i]));
        }
        return d;
    }else if(typeof t==="string"){
        var d = {};
        d[t] = 1;
        return d;
    }else{
        return [];
    }
},

variables_as_list: function(t){
    var d = cas.variables(t);
    return ["[]"].concat(Object.keys(d));
},

eval_dict: {
    "and": function(a){return a[0]&&a[1];},
    "or" : function(a){return a[0]||a[1];},
    "not": function(a){return !a[0]? 1: 0;},
    "=>" : function(a){return !a[0]||a[1]? 1: 0;},
    "<=>": function(a){return a[0]==a[1]? 1: 0;},
    "+"  : function(a){return a[0]+a[1];},
},

evaluate_strict: function(t,d){
    if(cas.is_app(t)){
        var a = [];
        for(var i=1; i<t.length; i++){
            a.push(cas.evaluate_strict(t[i],d));
        }
        return cas.eval_dict[t[0]](a);
    }else if(typeof t==="string"){
        return d[t];
    }else{
        return t;
    }
},

test_all_valuations: function(a,i,t,d){
    if(i==a.length){
        var y = cas.evaluate_strict(t,d);
        return [y,y];
    }else{
        d[a[i]] = 0;
        var A = cas.test_all_valuations(a,i+1,t,d);
        d[a[i]] = 1;
        var B = cas.test_all_valuations(a,i+1,t,d);
        return [A[0]&&B[0],A[1]+B[1]];
    }
},

test_tautology: function(t){
    var d = cas.variables(t);
    var a = [];
    for(var key in d){
        a.push(key);
    }
    return cas.test_all_valuations(a,0,t,d);
},

taut: function(t){
    return cas.test_tautology(t)[0];
},

sat: function(t){
    return cas.test_tautology(t)[1]!=0?1:0;
}

}; return cas;
})();

