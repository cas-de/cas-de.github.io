
"use strict";

var graphics;
var ax=1;
var ay=1;
var az=1;
var index0 = 10000;
var xscale = {index: index0};
var yscale = {index: index0};
var zscale = {index: index0};
var hud_display = false;
var GAMMA = 0.57721566490153286;
var PHI = 1.618033988749895;
var dark = false;
var async_continuation = undefined;
var extension_loaded = {};
var extension_table = {};
var recursion_table = {};
var post_app_stack = [];
var freq = 1;
var iso_mode = 0;
var sys_mode = 2;
var sys_xyz = {};
var max_count = 600;

var color_bg = [255,255,255,255];
var color_axes = [160,160,160];
var color_grid = [228,228,228];

var color_dark_bg = [0,0,0,255];
var color_dark_axes = [40,40,40];
var color_dark_grid = [14,14,14];

var color_table = [
    [0,0,140,255],
    [0,100,0,255],
    [140,0,140,255],
    [0,140,140,255],
    [100,80,0,255]
];

var color_table_dark = [
    [220,180,20,255],
    [140,0,100,255],
    [0,120,120,255],
    [60,140,0,255],
    [140,40,40,255]
];

var diff = diffh(0.001);
var diff_operator = diffh_curry(0.001);

var ftab = {
    pi: Math.PI, tau: 2*Math.PI, e: Math.E, nan: NaN, inf: Infinity,
    deg: Math.PI/180, grad: Math.PI/180, gon: Math.PI/200,
    gc: GAMMA, gr: PHI, angle: angle, t0: 0, t1: 2*Math.PI,
    abs: Math.abs, sgn: Math.sign, sign: Math.sign,
    max: Math.max, min: Math.min, clamp: clamp,
    hypot: Math.hypot, floor: Math.floor, ceil: Math.ceil,
    div: div, mod: mod, diveuc: diveuc, modeuc: modeuc,
    divtrunc: divtrunc, modtrunc: modtrunc,
    rect: rectangle, tri: triangle,
    rd: Math.round, trunc: Math.trunc, frac: frac,
    sqrt: Math.sqrt, cbrt: cbrt, rt: root, root: root,
    exp: Math.exp, expm1: Math.expm1,
    log: log, ln: Math.log, lg: lg, ld: ld, lb: ld,
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    cot: cot, sec: sec, csc: csc,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
    sinh: sinh, cosh: cosh, tanh: tanh, coth: coth,
    asinh: asinh, acosh: acosh, atanh: atanh,
    acoth: acoth, asech: asech, acsch: acsch,
    arsinh: asinh, arcosh: acosh, artanh: atanh,
    arcoth: acoth, arsech: asech, arcsch: acsch,
    sinc: sinc, gd: gd, W: lambertw, Wm1: lambertwm1,
    gamma: gamma2, fac: fac, rf: rfac, ff: ffac,
    Gamma: Gamma, erf: erf, erfc: erfc,
    En: En, Ei: Ei, li: li, Li: Li,
    diff: diff, int: integral, D: diff_operator, int16: int16,
    iter: iterate, sum: sum, prod: prod, af: af,
    rand: rand, rng: rand, tg: tg, sc: sc, res: res,
    range: range, inv: invab, agm: agm,
    E: eiE, K: eiK, F: eiF, Pi: eiPi,
    RF: RF, RC: RC, RJ: RJ, RD: RD,
    P: set_position, scale: set_scale,
    zeros: zeros, zeroes: zeros, roots: zeros, Nullstellen: zeros,
    map: map, filter: filter, freq: set_freq, not: not,
    img: plot_img, calc: calc_cmd, len: list_length, cat: list_cat,
    _addtt_: add_tensor_tensor, _subtt_: sub_tensor_tensor,
    _mulst_: mul_scalar_tensor, _mulmv_: mul_matrix_vector,
    _mulmm_: mul_matrix_matrix, _mulvv_: scalar_product,
    _vabs_: abs_vec, _negt_: neg_tensor, sys: sys, iso: iso
};

var cmd_tab = {
    "=":0, slider:0, Regler:0, ani:0, vec:0, line:0, chain:0
};

var plot_cmd_tab = {
    vec:0, line:0, chain:0
};

var keyword_table = {
    "for": "for", "für": "for", "in": "in",
    "und": "&", "oder": "|", "and": "&", "or": "|"
};

var lang_points = "Punkte";

var lang = {
    a_function: "eine Funktion",
    syntax_error: "Syntaxfehler: ",
    expected_right_paren: "')' wurde erwartet.",
    expected_right_sq: "']' wurde erwartet.",
    expected_operand: "ein Operand wurde erwartet.",
    expected_comma_or_bracket: function(i,bracket){
        syntax_error(i,"',' oder '"+bracket+"' wurde erwartet.");
    },
    unexpected_symbol: function(i,x){
        syntax_error(i,"unerwartetes Symbol: '"+x+"'.");    
    },
    number_application_error: function(t){
        return new Err([
            "Fehler: die Zahl ",t,
            " kann nicht als Funktion angewendet werden.<br><br>",
            "Meintest du '",t,"*(...)' anstelle von '",t,
            "(...)'?"
        ].join(""));
    },
    fn_as_number_error: function(t,type){
        return new Err(["Fehler: Operator '",type,
            "' benötigt Zahlen, aber&nbsp;'",t,
            "' ist&nbsp;eine Funktion.<br><br>",
            "Meintest du '",t,"(x)' anstelle von '",t,"'?"
        ].join(""));
    },
    undefined_variable: function(t){
        return new Err("Fehler: undefinierte Variable: '"+t+"'.");
    },
    initial_value_problem_msg: function(){
        return new Err(
            "Bitte gib das Anfangswertproblem wie folgt an:<br><br>"+
            "p:=[x0,y(x0),y'(x0),y''(x0),...]<br><br>"+
            "z.B.:<br><br>"+
            "y''=-y; p:=[0,0,1]");
    },
    p_to_short: "Fehler: p ist zu kurz."
};

function load_async(URL,callback){
   var head = document.getElementsByTagName("head")[0];
   var s = document.createElement("script");
   s.type = "text/javascript";
   s.onload = callback;
   s.src = URL;
   head.appendChild(s);
}

function load_extension(table,id,path){
    load_async(path,async function(){
        var t = extension_table[id];
        var a = Object.keys(t);
        for(var i=0; i<a.length; i++){
            table[a[i]] = t[a[i]];
        }
        extension_loaded[id] = true;
        while(async_continuation == "await"){
            await sleep(100);
        }
        async_continuation();
    });
}

function list_length(a){return a.length;}
function list_cat(a,b){return a.concat(b);}
function not(a){return 1-a;}

function rand(a,b){
    if(a==undefined){
        return Math.random();
    }else if(b==undefined){
        var index = Math.floor(Math.random()*a.length);
        return a[index];
    }else{
        return a+Math.random()*(b-a);
    }
}

function range(a,b,step){
    if(step==undefined){
        var y = [];
        for(var i=a; i<=b; i++){
            y.push(i);
        }
        return y;
    }else{
        var y = [];
        var i=0;
        var x = a;
        while(x<=b){
            y.push(Math.round(1E12*x)/1E12);
            i++;
            x = a+i*step;
        }
        return y;
    }
}

function af(x0,y0,x1,y1){
    var a = (y1-y0)/(x1-x0);
    var b = y0-a*x0;
    return function(x){return a*x+b;}
}

function sc(f,a,b,x){return f(a)+(f(b)-f(a))/(b-a)*(x-a);}
function tg(f,a,x){return f(a)+diff(f,a)*(x-a);}
function res(f,x,a,b){return a<=x && x<=b? f(x): NaN;}
function map(f,a){return a.map(function(x){return f(x);});}
function filter(f,a){return a.filter(f);}

function list_sum(a){
    var y = 0;
    for(var i=0; i<a.length; i++){y+=a[i];}
    return y;
}

function list_prod(a){
    var y = 1;
    for(var i=0; i<a.length; i++){y*=a[i];}
    return y;
}

function sum(a,b,f){
    if(b==undefined){return list_sum(a);}
    a = Math.round(a);
    b = Math.round(b);
    var y = 0;
    for(var i=a; i<=b; i++){
        y += f(i);
    }
    return y;
}

function prod(a,b,f){
    if(b==undefined){return list_prod(a);}
    a = Math.round(a);
    b = Math.round(b);
    var y = 1;
    for(var i=a; i<=b; i++){
        y *= f(i);
    }
    return y;
}

var diff_tab = [
[0],
[1/12,-2/3,0,2/3,-1/12],
[1/90,-3/20,3/2,-49/18,3/2,-3/20,1/90],
[-7/240,3/10,-169/120,61/30,0,-61/30,169/120,-3/10,7/240],
[7/240,-2/5,169/60,-122/15,91/8,-122/15,169/60,-2/5,7/240],
[139/12096,-121/756,3125/3024,-3011/756,33853/4032,-1039/126,0,
 1039/126,-33853/4032,3011/756,-3125/3024,121/756,-139/12096],
[-139/12096,121/630,-3125/2016,3011/378,-33853/1344,1039/21,-44473/720,
 1039/21,-33853/1344,3011/378,-3125/2016,121/630,-139/12096],
[311/17280,-101/360,6995/3456,-2363/270,135073/5760,-40987/1080,184297/5760,0,
 -184297/5760,40987/1080,-135073/5760,2363/270,-6995/3456,101/360,-311/17280]
];

function diff_rec(f,x,n,h){
    if(n<8){
        var a = diff_tab[n];
        var m = Math.floor(a.length/2);
        var y = 0;
        for(var k=-m; k<=m; k++){
            y += a[m+k]*f(x+k*h);
        }
        return y/Math.pow(h,n);
    }else{
        return diff_rec(function(x){return diff_rec(f,x,6,h);},x,n-6,h);
    }
}

function diffh(h){
    return function(f,x,n){
        if(n==undefined || n==1){
            return (f(x-2*h)-8*f(x-h)+8*f(x+h)-f(x+2*h))/(12*h);
        }else if(n==0){
            return f(x);
        }else{
            return diff_rec(f,x,n,Math.pow(h,1/n));
        }
    }
}

function diffh_curry(h){
    var diff = diffh(h);
    return function(f,n){
        return function(x){return diff(f,x,n);};
    };
}

var GL64 = [
[-0.9993050417357721, 0.001783280721696567],
[-0.9963401167719552, 0.004147033260562497],
[-0.9910133714767444, 0.006504457968978312],
[-0.9833362538846260, 0.00884675982636394],
[-0.9733268277899110, 0.01116813946013113],
[-0.9610087996520538, 0.01346304789671862],
[-0.9464113748584029, 0.01572603047602469],
[-0.9295691721319397, 0.01795171577569731],
[-0.9105221370785028, 0.02013482315353021],
[-0.8893154459951140, 0.02227017380838327],
[-0.8659993981540928, 0.02435270256871088],
[-0.8406292962525803, 0.02637746971505467],
[-0.8132653151227975, 0.02833967261425949],
[-0.7839723589433414, 0.03023465707240245],
[-0.7528199072605319, 0.03205792835485153],
[-0.7198818501716109, 0.03380516183714161],
[-0.6852363130542332, 0.03547221325688238],
[-0.6489654712546573, 0.03705512854024007],
[-0.6111553551723932, 0.03855015317861561],
[-0.5718956462026341, 0.03995374113272036],
[-0.5312794640198946, 0.04126256324262352],
[-0.4894031457070530, 0.04247351512365356],
[-0.4463660172534641, 0.04358372452932344],
[-0.4022701579639916, 0.04459055816375653],
[-0.3572201583376681, 0.04549162792741817],
[-0.3113228719902109, 0.04628479658131444],
[-0.2646871622087674, 0.04696818281621003],
[-0.2174236437400071, 0.04754016571483032],
[-0.1696444204239928, 0.04799938859645833],
[-0.1214628192961205, 0.04834476223480293],
[-0.07299312178779904,0.04857546744150344],
[-0.02435029266342443,0.04869095700913968],
[ 0.02435029266342443,0.04869095700913968],
[ 0.07299312178779904,0.04857546744150344],
[ 0.1214628192961205, 0.04834476223480293],
[ 0.1696444204239928, 0.04799938859645833],
[ 0.2174236437400071, 0.04754016571483032],
[ 0.2646871622087674, 0.04696818281621003],
[ 0.3113228719902109, 0.04628479658131444],
[ 0.3572201583376681, 0.04549162792741817],
[ 0.4022701579639916, 0.04459055816375653],
[ 0.4463660172534641, 0.04358372452932344],
[ 0.4894031457070530, 0.04247351512365356],
[ 0.5312794640198946, 0.04126256324262352],
[ 0.5718956462026341, 0.03995374113272036],
[ 0.6111553551723932, 0.03855015317861561],
[ 0.6489654712546573, 0.03705512854024007],
[ 0.6852363130542332, 0.03547221325688238],
[ 0.7198818501716109, 0.03380516183714161],
[ 0.7528199072605319, 0.03205792835485153],
[ 0.7839723589433414, 0.03023465707240245],
[ 0.8132653151227975, 0.02833967261425949],
[ 0.8406292962525803, 0.02637746971505467],
[ 0.8659993981540928, 0.02435270256871088],
[ 0.8893154459951140, 0.02227017380838327],
[ 0.9105221370785028, 0.02013482315353021],
[ 0.9295691721319397, 0.01795171577569731],
[ 0.9464113748584029, 0.01572603047602469],
[ 0.9610087996520538, 0.01346304789671862],
[ 0.9733268277899110, 0.01116813946013113],
[ 0.9833362538846260, 0.00884675982636394],
[ 0.9910133714767444, 0.006504457968978312],
[ 0.9963401167719552, 0.004147033260562497],
[ 0.9993050417357721, 0.001783280721696567]
];

var GL16 = [
[-0.9894009349916499, 0.02715245941175403],
[-0.9445750230732326, 0.06225352393864787],
[-0.8656312023878316, 0.09515851168249286],
[-0.7554044083550031, 0.1246289712555339],
[-0.6178762444026438, 0.1495959888165767],
[-0.4580167776572274, 0.1691565193950026],
[-0.2816035507792589, 0.1826034150449236],
[-0.09501250983763745,0.1894506104550685],
[ 0.09501250983763745,0.1894506104550685],
[ 0.2816035507792589, 0.1826034150449236],
[ 0.4580167776572274, 0.1691565193950026],
[ 0.6178762444026438, 0.1495959888165767],
[ 0.7554044083550031, 0.1246289712555339],
[ 0.8656312023878316, 0.09515851168249286],
[ 0.9445750230732326, 0.06225352393864787],
[ 0.9894009349916499, 0.02715245941175403]
];

function new_gauss(g){
    return function gauss(f,a,b,n){
        var m,s,sj,h,i,j,p,q,q0;
        m = g.length;
        h = (b-a)/n;
        p = 0.5*h;
        q0 = p+a;
        s = 0;
        for(j=0; j<n; j++){
            q = q0+j*h;
            sj = 0;
            for(i=0; i<m; i++){
                sj += g[i][1]*f(p*g[i][0]+q);
            }
            s += p*sj;
        }
        return s;
    };
}

var gauss = new_gauss(GL64);
var gauss16 = new_gauss(GL16);

function integral(a,b,f,n){
    if(n==undefined) n=1;
    return gauss(f,a,b,n);
}

function int16(a,b,f,n){
    if(n==undefined) n=1;
    return gauss16(f,a,b,n);
}

function iterate(f,n,x){
    for(var i=0; i<n; i++){
        x = f(x);
    }
    return x;
}

function lanczos_gamma(x){
    var p=[0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    x--;
    var y=p[0];
    for(var i=1; i<9; i++){
        y+=p[i]/(x+i);
    }
    var t=x+7.5;
    return Math.sqrt(2*Math.PI)*Math.pow(t,(x+0.5))*Math.exp(-t)*y;
}

function gamma(x){
    if(x<0.5){
        return Math.PI/Math.sin(x*Math.PI)/lanczos_gamma(1-x);
    }else{
        return lanczos_gamma(x);
    }
}

function fac(x){
    return gamma(x+1);
}

function ffac(n,k){
    return gamma(n+1)/gamma(n-k+1)
}

function rfac(n,k){
    return gamma(n+k)/gamma(n);
}

function cbrt(x){
    return Math.pow(x,1/3);
}

function root(n,x){
    return Math.pow(x,1/n);
}

function frac(x){
    return x-Math.floor(x);
}

function div(x,m){
    return Math.floor(x/m);
}

function mod(x,m){
    return x-m*Math.floor(x/m);
}

function diveuc(x,m){
    return Math.sign(m)*Math.floor(x/Math.abs(m));
}

function modeuc(x,m){
    return mod(x,Math.abs(m));
}

function divtrunc(x,m){
    return Math.trunc(x/m);
}

function modtrunc(x,m){
    return x-m*Math.trunc(x/m);
}

function angle(x,y){
    return Math.atan2(y,x);
}

function rectangle(x){
    return Math.abs(x)<0.5?1:0;
}

function triangle(x){
    return Math.abs(x)<1?1-Math.abs(x):0;
}

function tanh(x){
    if(x>24) return 1;
    if(x<-24) return -1;
    return 1-2/(Math.exp(2*x)+1);
}

function log(x,b){
    if(b==undefined){
        return Math.log(x);
    }else{
        return Math.log(x)/Math.log(b);
    }
}

function lg(x){return 0.43429448190325176*Math.log(x);}
function ld(x){return 1.4426950408889634*Math.log(x);}
function cot(x){return 1/Math.tan(x);}
function sec(x){return 1/Math.cos(x);}
function csc(x){return 1/Math.sin(x);}
function acot(x){return Math.PI/2-Math.atan(x);}
function asec(x){return Math.acos(1/x);}
function acsc(x){return Math.asin(1/x);}
function sinh(x){return 0.5*(Math.exp(x)-Math.exp(-x));}
function cosh(x){return 0.5*(Math.exp(x)+Math.exp(-x));}
function coth(x){return 1/tanh(x);}
function sech(x){return 1/cosh(x);}
function csch(x){return 1/sinh(x);}
function asinh(x){return Math.log(x+Math.sqrt(x*x+1));}
function acosh(x){return Math.log(x+Math.sqrt(x*x-1));}
function atanh(x){return 0.5*Math.log((1+x)/(1-x));}
function acoth(x){return 0.5*Math.log((x+1)/(x-1));}
function asech(x){return acosh(1/x);}
function acsch(x){return asinh(1/x);}
function gd(x){return Math.atan(sinh(x));}

function sinc(x){
    return x==0?1:Math.sin(Math.PI*x)/(Math.PI*x);
}

function invab(f,x,a,b){
    if(a==undefined) a = -100;
    if(b==undefined) b = 100;
    var m,s,a1,b1,d;
    a1=a; b1=b;
    s = Math.sign(f(b)-f(a));
    if(s==0 || isNaN(s)) s=1;
    for(var k=0; k<60; k++){
        m = 0.5*(a+b);
        d = f(m)-x;
        if(s*d<0) a=m; else b=m;
        if(Math.abs(d)>1E4 && Math.abs(b-a)<1E-4) break;
    }
    if(Math.abs(f(m)-x)>1E-6) return NaN;
    return m;
}

function bisection(f,x,a,b){
    var s = Math.sign(f(b)-f(a));
    if(s==0 || isNaN(s)) s = 1;
    for(var k=0; k<100; k++){
        var m = 0.5*(a+b);
        var d = f(m)-x;
        if(s*d<0) a = m; else b = m;
    }
    return m;
}

function optimize(f,a,b){
    var n = 100;
    for(var k=0; k<14; k++){
        var h = (b-a)/n;
        var xmin = a;
        var ymin = Math.abs(f(a));
        for(var i=1; i<=n; i++){
            var x = a+h*i;
            var y = Math.abs(f(x));
            if(y<ymin){xmin = x; ymin = y;}
        }
        a = xmin-h;
        b = xmin+h;
    }
    return xmin;
}

function zeros_bisection(f,a,b,n){
    var zeros = [];
    var h = (b-a)/n;
    for(var k=0; k<n; k++){
        var x0 = a+h*k;
        var x1 = a+h*(k+1);
        var y0 = f(x0);
        var y1 = f(x1);
        if(Number.isNaN(y1-y0)) continue;
        if(Math.sign(y0)!=Math.sign(y1)){
            var x = bisection(f,0,x0,x1);
            if(Number.isFinite(x)){zeros.push(x);}
        }
    }
    return zeros;
}

function zeros_uniq(f,a,epsilon){
    a.sort(function(x,y){return x-y;});
    var b = [];
    var k = 0;
    var n = a.length;
    while(k<n){
        var xmin = a[k];
        var i = k+1;
        while(i<n && Math.abs(a[i]-a[k])<epsilon){
            if(Math.abs(f(a[i]))<Math.abs(f(xmin))){xmin = a[i];}
            i++;
        }
        if(Math.abs(f(xmin))<1E-12){
            if(Math.abs(xmin)<1E-24){
                b.push(0);
            }else if(Math.abs(xmin)>0.001){
                var xr = Math.round(1E12*xmin)/1E12;
                if(Math.abs(f(xr))<=Math.abs(f(xmin))){
                    b.push(xr);
                }else{
                    b.push(xmin);
                }
            }else{
                b.push(xmin);
            }
        }
        k = i;
    }
    return b;
}

function zeros(f,a,b){
    if(a==undefined) a = -100;
    if(b==undefined) b = 100;
    var h = 0.0001;
    var f1 = function(x){
        return (f(x+3*h)-9*f(x+2*h)+45*f(x+h)
            -45*f(x-h)+9*f(x-2*h)-f(x-3*h))/(60*h);
    };
    var L = zeros_bisection(f,a,b,100000);
    var L1 = zeros_bisection(f1,a,b,100000);
    for(var i=0; i<L1.length; i++){
        if(Math.abs(f(L1[i]))<1E-6){
            var x = optimize(f,L1[i]-1E-4,L1[i]+1E-4);
            if(Math.abs(f(x))<1E-12){L.push(x);}
        }
    }
    return zeros_uniq(f,L,1E-6);
}

// Arithmetic-geometric mean
function agm(a,b){
    var ah,bh;
    for(var i=0; i<20; i++){
        ah = (a+b)/2;
        bh = Math.sqrt(a*b);
        a=ah; b=bh;
        if(Math.abs(a-b)<1E-15) break;
    }
    return a;
}

// Modified arithmetic-geometric mean, see
// Semjon Adlaj: "An eloquent formula for the perimeter
// of an ellipse", Notices of the AMS 59(8) (2012), p. 1094-1099
function magm(x,y){
    var z=0;
    var xh,yh,zh,r;
    for(var i=0; i<20; i++){
        xh=0.5*(x+y);
        r=Math.sqrt((x-z)*(y-z));
        yh=z+r; zh=z-r;
        x=xh; y=yh; z=zh;
        if(Math.abs(x-y)<2E-15) break;
    }
    return x;
}

function eiK(m){
    return 0.5*Math.PI/agm(1,Math.sqrt(1-m));
}

function eiE1(m){
    var M = agm(1,Math.sqrt(1-m));
    var N = magm(1,1-m);
    return 0.5*Math.PI*N/M;
}

function RF(x,y,z){
    var xk=x, yk=y, zk=z;
    var a;
    for(var k=0; k<26; k++){
        a = Math.sqrt(xk*yk)+Math.sqrt(xk*zk)+Math.sqrt(yk*zk);
        xk=(xk+a)/4; yk=(yk+a)/4; zk=(zk+a)/4;
    }
    return 1/Math.sqrt(xk);
}

function RC(x,y){
    return RF(x,y,y);
}

function RJ(x,y,z,p){
    var xk=x, yk=y, zk=z, pk=p;
    var n,s,a,d,e,sx,sy,sz,sp,delta;
    delta=(p-x)*(p-y)*(p-z);
    s=0; n=12;
    for(var k=0; k<n; k++){
        sx=Math.sqrt(xk); sy=Math.sqrt(yk);
        sz=Math.sqrt(zk); sp=Math.sqrt(pk);
        a = sx*sy+sx*sz+sy*sz;
        d=(sp+sx)*(sp+sy)*(sp+sz);
        e=Math.pow(4,-3*k)/(d*d)*delta;
        xk=(xk+a)/4; yk=(yk+a)/4; zk=(zk+a)/4; pk=(pk+a)/4;
        s+=Math.pow(4,-k)/d*RC(1,1+e);
    }
    return Math.pow(xk,-3/2)*Math.pow(4,-n)+6*s;
}

function RD(x,y,z){
    return RJ(x,y,z,z);
}

function eiF(phi,m){
    var s = Math.sin(phi);
    var c = Math.cos(phi);
    return s*RF(c*c,1-m*s*s,1);
}

function eiE2(phi,m){
    var s = Math.sin(phi);
    var c = Math.cos(phi);
    return s*RF(c*c,1-m*s*s,1)-1/3*m*s*s*s*RJ(c*c,1-m*s*s,1,1);
}

function eiPi(phi,n,m){
    var s = Math.sin(phi);
    var c = Math.cos(phi);
    return s*RF(c*c,1-m*s*s,1)+1/3*n*s*s*s*RJ(c*c,1-m*s*s,1,1-n*s*s);
}

function eiE(x,y){
    if(y===undefined){
        return eiE1(x);
    }else{
        return eiE2(x,y);
    }
}

function cfGamma(a,x,n){
    var y=0;
    for(var k=n; k>=1; k--){
        y = k*(k-a)/(x-y-a+2*k+1);
    }
    return Math.exp(-x)*Math.pow(x,a)/(x-y-a+1);
}

function psgamma(a,x,n){
    var y=0;
    var p=1/a;
    for(var k=1; k<n; k++){
        y += p;
        p = p*x/(a+k);
    }
    return y*Math.exp(-x)*Math.pow(x,a);
}

function igamma(a,x){
    if(x>a+1){
        return gamma(a)-cfGamma(a,x,20);
    }else{
        return psgamma(a,x,20);
    }
}

function iGamma(a,x){
    if(x>a+1){
        return cfGamma(a,x,20);
    }else{
        if(a==0) a=1E-6;
        return gamma(a)-psgamma(a,x,20);
    }
}

function gamma2(x,y){
    if(y==undefined){
        return gamma(x);
    }else{
        return igamma(x,y);
    }
}

function Gamma(x,y){
    if(y===undefined){
        return gamma(x);
    }else{
        return iGamma(x,y);
    }
}

function erf(x){
    if(Math.abs(x)>8) return Math.sign(x);
    var y;
    if(Math.abs(x)>1.7){
        y = Math.sqrt(Math.PI)-cfGamma(0.5,x*x,26);
    }else{
        y = psgamma(0.5,x*x,26);
    }
    return Math.sign(x)*y/Math.sqrt(Math.PI);
}

function erfc(x){
    return 1-erf(x);
}

function En(n,x){
    return Math.pow(x,n-1)*iGamma(1-n,x);
}

function Ei(x){
    var s=0;
    var p=1;
    for(var k=1; k<80; k++){
        p = p*x/k;
        s += p/k;
    }
    return GAMMA+Math.log(Math.abs(x))+s;
}

function li(x){
    return Ei(Math.log(x));
}

function Li(x){
    return li(x)-li(2);
}

function lambertw(x){
    var y;
    if(x>=74){
        y = Math.log(x/Math.log(x/Math.log(x/Math.log(x/Math.log(x)))));
    }else if(x>=1.14){
        y = x/Math.pow(x+1,0.73);
    }else if(x>=-0.3455){
        y = x/Math.exp(x/Math.exp(x/Math.exp(x/Math.exp(x/Math.exp(x)))));
    }else if(x>=-1/Math.E){
        y = Math.sqrt(2*(Math.E*x+1))-1;
    }else{
      return NaN;
    }
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    return y;
}

function lambertwm1(x){
    var y;
    if(x<-1/Math.E){
        return NaN;
    }else if(x<-0.33469524){
        y = -Math.sqrt(Math.E*x+1)-1;
    }else if(x<0){
        y = Math.log(x/Math.log(x/Math.log(x/Math.log(x/Math.log(-x)))));
    }else{
        return NaN;
    }
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    y = y-(y-x*Math.exp(-y))/(y+1);
    return y;
}

function calc_cmd(cmd){
    post_app_stack.push(function(){
        var hud = document.getElementById("hud");
        var input = document.getElementById("input-calc");
        hud_display = true;
        hud.style.display = "block";
        input.value = cmd;
        calc();
    });
}

function isalpha(s){
    return /^[a-zäöü]+$/i.test(s);
}

function isdigit(s){
    return /^\d+$/.test(s);
}

function isspace(s){
    return s==' ' || s=='\t' || s=='\n';
}

function str(x,ftos,newline){
    if(Array.isArray(x)){
        var f = function(t){return str(t);};
        if(newline && x.length>0 && Array.isArray(x[0])){
            return "<br>["+x.map(f).join(",<br>&nbsp;")+"]";
        }else{
            return "["+x.map(f).join(", ")+"]";
        }
    }else if(x instanceof Function){
        return lang.a_function;
    }else if(typeof x == "string"){
        return x;
    }else if(typeof x == "number"){
        if(Number.isFinite(x)){
            if(ftos==undefined){
                return x.toString().toUpperCase();
            }else{
                return ftos(x).toUpperCase();
            }
        }else if(Number.isNaN(x)){
            return "nan";
        }else{
            return x.toString().toLowerCase();
        }
    }else if(x.hasOwnProperty("re")){
        if(x.im==0){
            return str(x.re);
        }else{
            var sep = x.im<0? "": "+";
            return [str(x.re),sep,str(x.im),"i"].join("");
        }
    }else{
        return JSON.stringify(x);
    }
}

function print(s){
    var out = document.getElementById("out");
    out.innerHTML = "<p><code>"+s+"</code>";
}

function Err(text){
    this.text = text;
}

function Repeat(){}

function repeat(c,n){
    return Array(n+1).join(c);
}

function syntax_error(i,text){
    var t = i.a[i.index];
    var s = ["&nbsp;&nbsp;",i.s,"<br>&nbsp;&nbsp;",
        repeat("&nbsp;",t[3])+"<b>^</b>", "<br>",
        lang.syntax_error, text
    ].join("");
    throw new Err(s);
}

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

var Symbol = 0;
var SymbolIdentifier = 1;
var SymbolNumber = 2;
var SymbolString = 3;
var SymbolTerminator = 4;

function scan(s){
    var a = [];
    var n = s.length;
    var i = 0;
    var line = 0;
    var col = 0;
    while(i<n){
        if(isalpha(s[i])) {
            var col0 = col;
            var id = "";
            while(i<n && (isalpha(s[i]) || isdigit(s[i]))){
                id += s[i];
                i++; col++;
            }
            if(keyword_table.hasOwnProperty(id)){
                a.push([Symbol,keyword_table[id],line,col0]);
            }else{
                if(a.length>0){
                    var last = a[a.length-1];
                    if(last[0]==SymbolNumber || (last[0]==Symbol && last[1]==')')){
                        a.push([Symbol,"*",line,col0]);
                    }
                }
                a.push([SymbolIdentifier,id,line,col0]);
            }
        }else if(isdigit(s[i])){
            var col0 = col;
            var j = i;
            while(i<n){
                if(isdigit(s[i]) || s[i]=='.'){
                    i++; col++;
                }else if(s[i]=='E'){
                    i++; col++;
                    if(i<n && (s[i]=='+' || s[i]=='-')){i++; col++;}
                }else{
                    break;
                }
            }
            a.push([SymbolNumber,s.slice(j,i),line,col0]);
        }else if(isspace(s[i])){
            if(s[i]=='\n'){line++; col=0;}
            else {col++;}
            i++;
        }else if(i+1<n && s[i]=='<' && s[i+1]=='='){
            a.push([Symbol,"<=",line,col]);
            i+=2; col+=2;
        }else if(i+1<n && s[i]=='>' && s[i+1]=='='){
            a.push([Symbol,">=",line,col]);
            i+=2; col+=2;
        }else if(i+1<n && s[i]==':' && s[i+1]=='='){
            a.push([Symbol,":=",line,col]);
            i+=2; col+=2;
        }else if(superscript.hasOwnProperty(s[i])){
            var number = "";
            while(i<n && superscript.hasOwnProperty(s[i])){
                number += superscript[s[i]];
                i++; col++;
            }
            a.push([Symbol,"^",line,col]);
            a.push([SymbolNumber,number,line,col]);
        }else if(s[i]=='\u00b0'){
            a.push([Symbol,"*",line,col]);
            a.push([SymbolIdentifier,"deg",line,col]);
            i++; col++;
        }else if(s[i]=='"'){
            i++; col++;
            var col0 = col;
            var j = i;
            while(i<n && s[i]!='"'){i++; col++;}
            a.push([SymbolString,s.slice(j,i),line,col0]);
            i++; col++;
        }else{
            if((s[i]=='(' || s[i]=='[') && a.length>0){
                var last = a[a.length-1];
                if(last[0]==SymbolNumber){
                    a.push([Symbol,"*",line,col]);
                }
            }
            a.push([Symbol,s[i],line,col]);
            i++; col++;
        }
    }
    a.push([SymbolTerminator,"",line,col]);
    return a;
}

function atom(i){
    var t = i.a[i.index];
    if(t[0] == SymbolNumber){
        i.index++;
        return parseFloat(t[1]);
    }else if(t[0] == SymbolIdentifier){
        i.index++;
        return t[1];
    }else if(t[0] == Symbol && t[1]=='('){
        i.index++;
        var x = semicolon(i,"let");
        t = i.a[i.index];
        if(t[0] == Symbol && t[1]==')'){
            i.index++;
            return x;
        }else{
            syntax_error(i,lang.expected_right_paren);
        }
    }else if(t[0] == Symbol && t[1]=='['){
        i.index++;
        var a = ["[]"];
        return application_list(i,a,']');
    }else if(t[0] == Symbol && t[1]=='|'){
        i.index++;
        var x = conjunction(i);
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]=='|'){
            i.index++;
        }
        return ["abs",x];
    }else if(t[0] == SymbolString){
        i.index++;
        return ["_string_",t[1]];
    }else{
        syntax_error(i,lang.expected_operand);
    }
}

function application_list(i,a,bracket){
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]==bracket){
        i.index++;
        return a;
    }
    while(1){
        a.push(expression(i));
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]==bracket){
            i.index++;
            return a;
        }else if(t[0]==Symbol && t[1]==','){
            i.index++;
        }else{
            lang.expected_comma_or_bracket(i,bracket);
        }
    }
}

function index_operation(i,x){
    var y = expression(i);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]==']'){
        i.index++;
        return ["index",x,y];
    }else{
        syntax_error(i,lang.expected_right_sq);
    }
}

function application(i){
    var x = atom(i);
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]=='('){
            if(Array.isArray(x) && (x[0]==="+" || x[0]==="-" ||
              x[0]==="*" || x[0]==="/" || x[0]==="^"
            )){
                break;
            }
            i.index++;
            x = application_list(i,[x],')');
        }else if(t[0]==Symbol && t[1]=='['){
            i.index++;
            x = index_operation(i,x);
        }else if(t[0]==Symbol && t[1]=="'"){
            var count = 0;
            while(1){
                t = i.a[i.index];
                if(t[0]==Symbol && t[1]=="'"){
                    count++;
                    i.index++;
                }else break;
            }
            var t = i.a[i.index];
            if(t[0]==Symbol && t[1]=='('){
                i.index++;
                var y = application_list(i,["[]"],')');
                if(y.length==2){y = y[1];}
                if(count==1){
                    x = ["diff",x,y];
                }else{
                    x = ["diff",x,y,count];
                }
            }else{
                x = ["D",x,count];
            }
        }else if(t[0]==Symbol && t[1]=="!"){
            i.index++;
            x = ["fac",x];
        }else if(t[0]==Symbol && t[1]=="."){
            i.index++;
            var y = expression(i);
            if(Array.isArray(x)) x = x.slice(1);
            x = ["fn",x,y];
        }else{
            break;
        }
    }
    return x;
}

function power(i){
    var x = application(i);
    var t = i.a[i.index];
    if(t[0] == Symbol && t[1]=='^'){
        i.index++;
        var y = negation(i);
        return ["^",x,y];
    }else{
        return x;
    }
}

function negation(i){
    var t = i.a[i.index];
    if(t[0] == Symbol && t[1]=='-'){
        i.index++;
        var x = power(i);
        return ["~",x];
    }else if(t[0] == Symbol && t[1]=='+'){
        i.index++;
        return power(i);
    }else{
        return power(i);
    }
}

function multiplication(i){
    var x = negation(i);
    while(1){
        var t = i.a[i.index];
        if(t[0] == Symbol && (t[1]=='*' || t[1]=='/')){
            i.index++;
            var y = negation(i);
            x = [t[1],x,y];
        }else if(t[0] == Symbol && t[1]=='('){
            var y = negation(i);
            x = ["*",x,y];
        }else{
            break;
        }
    }
    return x;
}

function addition(i){
    var x = multiplication(i);
    while(1){
        var t = i.a[i.index];
        if(t[0] == Symbol && (t[1]=='+' || t[1]=='-')){
            i.index++;
            var y = multiplication(i);
            x = [t[1],x,y];
        }else{
            break;
        }
    }
    return x;
}

function range_expression(i){
    var x = addition(i);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]==':'){
        i.index++;
        var y = addition(i);
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]==':'){
            i.index++;
            var z = addition(i);
            return ["range",x,y,z];
        }else{
            return ["range",x,y];
        }
    }else{
        return x;
    }
}

function comparison(i){
    var x = range_expression(i);
    var h = undefined;
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && (
           t[1]=="<"  || t[1]==">" || t[1]=="<=" ||
           t[1]==">=" || t[1]=="=" || t[1]=="!=" ||
           t[1]=="in"
        )){
            i.index++;
            var y = range_expression(i);
            if(h==undefined){
                x = [t[1],x,y];
            }else{
                x = ["&",x,[t[1],h,y]];
            }
            h = y;
        }else{
            return x;
        }
    }
}

function conjunction(i){
    var x = comparison(i);
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]=='&'){
            i.index++;
            var y = comparison(i);
            x = ["&",x,y];
        }else{
            return x;
        }
    }
}

function disjunction(i){
    var x = conjunction(i);
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]=='|'){
            i.index++;
            var y = conjunction(i);
            x = ["|",x,y];
        }else{
            return x;
        }
    }
}

function for_expression(i){
    var x = disjunction(i);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="for"){
        i.index++;
        var y = disjunction(i);
        return ["for",x,y];
    }else{
        return x;
    }
}

function expression(i){
    return for_expression(i);
}

function assignment(i){
    var x = expression(i);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]==":="){
        i.index++;
        var y = expression(i);
        return [":=",x,y];
    }else{
        return x;
    }
}

function expression_list(i,type){
    var a = [type];
    while(1){
        a.push(assignment(i));
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]==","){
            i.index++;
        }else{
            break;
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function semicolon(i,type){
    var a = [";"];
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]==";"){
            a.push(null);
            i.index++;
            continue;
        }
        a.push(expression_list(i,type));
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]==";"){
            i.index++;
        }else{
            break;
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function parse(a,s){
    var i = {index: 0, a: a, s: s};
    var x = semicolon(i,"block");
    var t = i.a[i.index];
    if(t[0] != SymbolTerminator){
        lang.unexpected_symbol(i,t[1]);
    }
    return x;
}

function ast(s){
    var a = scan(s);
    return parse(a,s);
}

function abs_vec(v){
    var y = 0;
    for(var i=0; i<v.length; i++){
        y+=v[i]*v[i];
    }
    return Math.sqrt(y);
}

function scalar_product(v,w){
    var n = Math.min(v.length,w.length);
    var y = 0;
    for(var i=0; i<n; i++){
        y+=v[i]*w[i];
    }
    return y;
}

function mul_scalar_tensor(r,a){
    var b = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            b.push(mul_scalar_tensor(r,a[i]));
        }else{
            b.push(r*a[i]);
        }
    }
    return b;
}

function neg_tensor(a){
    return mul_scalar_tensor(-1,a);
}

function mul_matrix_vector(A,v){
    var m = A.length;
    var nv = v.length;
    var w = [];
    for(var i=0; i<m; i++){
        var y = 0;
        var n = Math.min(nv,A[i].length);
        for(var j=0; j<n; j++){y+=A[i][j]*v[j];}
        w.push(y);
    }
    return w;
}

function mul_matrix_matrix(A,B){
    var m = A.length;
    var n = B[0].length;
    var p = A[0].length;
    var C = [];
    for(var i=0; i<m; i++){
        var v = [];
        for(var j=0; j<n; j++){
            var y = 0;
            for(var k=0; k<p; k++){y+=A[i][k]*B[k][j];}
            v.push(y);
        }
        C.push(v);
    }
    return C;
}

function add_tensor_tensor(a,b){
    var c = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            c.push(add_tensor_tensor(a[i],b[i]));
        }else{
            c.push(a[i]+b[i]);
        }
    }
    return c;
}

function sub_tensor_tensor(a,b){
    var c = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            c.push(sub_tensor_tensor(a[i],b[i]));
        }else{
            c.push(a[i]-b[i]);
        }
    }
    return c;
}

var TypeNumber = 0;
var TypeVector = 1;
var TypeMatrix = 2;
var type_op_table = {
    "[]":0, "+":0, "-":0, "*":0, "/":0, "^":0, "~":0,
    "abs":0, "index":0, "fn":0, "diff":0
};

var id_type_table = {
    "unit": [TypeVector],
    "nabla": [TypeVector],
    "rot": [TypeMatrix],
    "I": [TypeMatrix],
    "diag": [TypeMatrix],
    "tp": [TypeMatrix],
    "expm": [TypeMatrix],
    "jacobi": [TypeMatrix]
};

function assign(x,y){
    var a = Object.keys(y);
    for(var i=0; i<a.length; i++){
        x[a[i]] = y[a[i]];
    }
}

function infer_from_let(t,local_context){
    var local_variables = {};
    if(local_context!==undefined){
        assign(local_variables,local_context);
    }
    var n = t.length-1;
    for(var i=1; i<n; i++){
        local_variables[t[i][1]] = infer_type(t[i][2],local_variables);
    }
    return infer_type(t[n],local_variables);
}

function infer_type(t,local_variables){
    if(Array.isArray(t)){
        if(t[0]==="let"){
            return infer_from_let(t,local_variables);
        }
        var T = t.map(function(x){
            return infer_type(x,local_variables);
        });
        if(type_op_table.hasOwnProperty(t[0])){
            if(t[0]==="[]"){
                if(T.length>1 && T[1]===TypeVector){
                    return TypeMatrix;
                }else{
                    return TypeVector;
                }
            }else if(t[0]==="+"){
                if(T[1]===TypeVector || T[1]===TypeMatrix){
                    t[0] = "_addtt_";
                    return T[1];
                }
            }else if(t[0]==="-"){
                if(T[1]===TypeVector || T[1]===TypeMatrix){
                    t[0] = "_subtt_";
                    return T[1];
                }
            }else if(t[0]==="*"){
                if(T[2]===TypeVector){
                    if(T[1]===TypeMatrix){
                        t[0] = "_mulmv_";
                        return TypeVector;
                    }else if(T[1]===TypeVector){
                        t[0] = "_mulvv_";
                    }else{
                        t[0] = "_mulst_";
                        return TypeVector;
                    }
                }else if(T[2]===TypeMatrix){
                    if(T[1]===TypeMatrix){
                        t[0] = "_mulmm_";
                        return TypeMatrix;
                    }else{
                        t[0] = "_mulst_";
                        return TypeMatrix;
                    }
                }
            }else if(t[0]==="/"){
                if(T[1]===TypeVector || T[1]===TypeMatrix){
                    t[0] = "_mulst_";
                    var v = t[1];
                    t[1] = ["/",1,t[2]];
                    t[2] = v;
                    return T[1];
                }
            }else if(t[0]==="^"){
                if(T[1]===TypeMatrix){
                    t[0] = "_matrix_pow_";
                    return TypeMatrix;
                }
            }else if(t[0]==="~"){
                if(T[1]===TypeVector || T[1]===TypeMatrix){
                    t[0] = "_negt_";
                    return T[1];
                }
            }else if(t[0]==="abs"){
                if(T[1]===TypeVector){
                    t[0] = "_vabs_";
                }
            }else if(t[0]==="index"){
                if(T[1]===TypeMatrix){
                    return TypeVector;
                }
            }else if(t[0]==="fn"){
                return [T[2]];
            }else if(t[0]==="diff"){
                if(Array.isArray(T[1]) && T[1][0]===TypeVector){
                    if(T[2]===TypeVector){
                        t[0] = "jacobi";
                        return TypeMatrix;
                    }else{
                        t[0] = "_vdiff_";
                        return TypeVector;
                    }
                }else if(T[2]===TypeVector){
                    t[0] = "nabla";
                    return TypeVector;
                }
            }
        }else if(Array.isArray(T[0])){
            return T[0][0];
        }
    }else if(typeof t=="string"){
        if(local_variables!==undefined && local_variables.hasOwnProperty(t)){
            return local_variables[t];
        }else if(id_type_table.hasOwnProperty(t)){
            return id_type_table[t];
        }
    }
    return TypeNumber;
}

function compile_application(a,id,t,context){
    if(id.length>0) a.push(id);
    a.push("(");
    var first = true;
    for(var i=1; i<t.length; i++){
        if(first){first = false;}
        else{a.push(",");}
        compile_expression(a,t[i],context);
    }
    a.push(")");
}

function compile_list(a,t,context){
    a.push("[");
    var first = true;
    for(var i=1; i<t.length; i++){
        if(first){first = false;}
        else{a.push(",");}
        compile_expression(a,t[i],context);
    }
    a.push("]");
}

function compile_lambda_expression(a,argv,body,context){
    if(!Array.isArray(argv)) argv = [argv];
    var local = Object.create(context.local);
    for(var i=0; i<argv.length; i++){
        local[argv[i]] = true;
    }
    var sub_context = {local: local, pre: context.pre};
    a.push("function("+argv.join(",")+"){return ");
    compile_expression(a,body,sub_context);
    a.push(";}");
}

function compile_block(a,t,context){
    var n = t.length-1;
    var b = [];
    for(var i=1; i<n; i++){
        compile_expression(b,t[i],context);
        b.push(";");
    }
    context.statements.push(b.join(""));
    compile_expression(a,t[n],context);
}

function compile_assignment(a,t,context){
    a.push("var "+t[1]+"=");
    compile_expression(a,t[2],context);
    context.local[t[1]] = true;
}

var operator_table = {
    "+": "+", "-": "-", "*": "*", "/": "/",
    "<": "<", ">": ">", "<=": "<=", ">=": ">=",
    "&": "&&", "|": "||", "=": "=="
};

var number_op_table = {
    "+":0, "-":0, "*":0, "/":0, "^":0,
    "<":0, ">":0, "<=":0, ">=":0
}

function type_test(t,type){
    if(type!=undefined){
        if(type=="app"){
            if(typeof ftab[t]=="number"){
                throw lang.number_application_error(t);
            }
        }else if(number_op_table.hasOwnProperty(type)){
            if(typeof ftab[t]=="function"){
                throw lang.fn_as_number_error(t,type);
            }
        }
    }
}

function compile_expression(a,t,context,type){
    if(typeof t == "number"){
        a.push(t<0?("("+t+")"):t);
    }else if(typeof t == "string"){
        if(t in context.local){
            if(type=="app" && context.local[t]=="number"){
                throw lang.number_application_error(t);
            }else{
                a.push(t);
            }
        }else if(ftab.hasOwnProperty(t)){
            type_test(t,type);
            context.pre.push("var "+t+"=ftab[\""+t+"\"];");
            context.local[t] = true;
            a.push(t);
        }else if(!extension_loaded.ftab){
            async_continuation = "await";
            load_extension(ftab,"ftab","js/ext-ftab.js");
            throw new Repeat();
        }else{
            throw lang.undefined_variable(t);
        }
    }else if(Array.isArray(t)){
        var op = t[0];
        if(Array.isArray(op)){
            compile_expression(a,op,context);
            compile_application(a,"",t,context);
        }else if(operator_table.hasOwnProperty(op)){
            a.push("(");
            compile_expression(a,t[1],context,op);
            a.push(operator_table[op]);
            compile_expression(a,t[2],context,op);
            a.push(")");
        }else if(op=="^"){
            a.push("power(");
            compile_expression(a,t[1],context,op);
            a.push(",");
            compile_expression(a,t[2],context,op);
            a.push(")");
        }else if(op=="~"){
            a.push("(-");
            compile_expression(a,t[1],context,op);
            a.push(")");
        }else if(op=="fn"){
            compile_lambda_expression(a,t[1],t[2],context);
        }else if(op=="[]"){
            compile_list(a,t,context);
        }else if(op==":="){
            compile_assignment(a,t,context);
        }else if(op=="block" || op=="let"){
            compile_block(a,t,context);
        }else if(op=="index"){
            compile_expression(a,t[1],context);
            a.push("[");
            compile_expression(a,t[2],context,op);
            a.push("]");
        }else if(op=="if"){
            a.push("(");
            compile_expression(a,t[1],context);
            a.push("?");
            compile_expression(a,t[2],context);
            a.push(":");
            if(t.length<4){
                a.push("NaN");
            }else{
                compile_expression(a,t[3],context);
            }
            a.push(")");
        }else if(op=="_string_"){
            a.push('"'+t[1]+'"');
        }else{
            compile_expression(a,op,context,"app");
            compile_application(a,"",t,context);
        }
    }else{
        throw "panic";
    }
}

function fix(m,F){
    return function f(n){
        if(!m.hasOwnProperty(n)){m[n] = F(f,n);}
        return m[n];
    };
}

function compile_fn_body(a,t,context,sig){
    a.push("(function(){");
    a.push("return function"+sig);
    a.push("){");
    var statements_index = a.length;
    a.push("");
    a.push("return ");
    compile_expression(a,t,context);
    a.push(";};");
    a.push("})()");
    a[0] += context.pre.join("");
    if(context.statements.length>0){
        a[statements_index] = context.statements.join("");
    }
}

function compile(t,argv,type,name){
    if(type==undefined) type="number";
    var a = [];
    var local = Object.create(null);
    for(var i=0; i<argv.length; i++){
        local[argv[i]] = type;
    }
    if(name!=undefined){
        local[name] = "";
    }
    var context = {
        pre: ["var power=Math.pow;"],
        local: local,
        statements: []
    };
    if(name!=undefined && recursion_table.hasOwnProperty(name)){
        compile_fn_body(a,t,context,"("+name+","+argv.join(","));
        var m = recursion_table[name];
        delete recursion_table[name];
        // console.log(a.join(""));
        return fix(m,window.eval(a.join("")));
    }else{
        name = name==undefined?"":" "+name;
        compile_fn_body(a,t,context,name+"("+argv.join(","));
        // console.log(a.join(""));
        return window.eval(a.join(""));
    }
}

function compile_string(s,argv){
    var t = ast(s);
    return compile(t,argv);
}

function new_point(gx){
    var w = gx.w;
    var h = gx.h;
    var mx = gx.mx;
    var my = gx.my;
    var data = gx.data;
    var floor = Math.floor;
    var pset = function(color,x,y){
        if(x>=0 && x<w && y>=0 && y<h){
            var i = (x+y*w)*4;
            data[i+0] = color[0];
            data[i+1] = color[1];
            data[i+2] = color[2];
        }
    };
    var pseta = function(color,x,y,a){
        if(x>=0 && x<w && y>=0 && y<h){
            var i = (x+y*w)*4;
            data[i+0] = Math.min(data[i+0],255-floor(a*(1-color[0]/255)));
            data[i+1] = Math.min(data[i+1],255-floor(a*(1-color[1]/255)));
            data[i+2] = Math.min(data[i+2],255-floor(a*(1-color[2]/255)));
        }
    };
    var pseta_max = function(color,x,y,a){
        if(x>=0 && x<w && y>=0 && y<h){
            var i = (x+y*w)*4;
            data[i+0] = Math.max(data[i+0],floor(a*color[0]/255));
            data[i+1] = Math.max(data[i+1],floor(a*color[1]/255));
            data[i+2] = Math.max(data[i+2],floor(a*color[2]/255));
        }
    };
    var pseta_median = function(color,x,y,a){
        if(x>=0 && x<w && y>=0 && y<h){
            var i = (x+y*w)*4;
            data[i+0] = floor((1-a)*data[i+0]+a*color[0]);
            data[i+1] = floor((1-a)*data[i+1]+a*color[1]);
            data[i+2] = floor((1-a)*data[i+2]+a*color[2]);
        }
    };
    if(dark) pseta = pseta_max;
    var pset4 = function(color,x,y){
        pset(color,x,y);
        pset(color,x+1,y);
        pset(color,x,y+1);
        pset(color,x+1,y+1);
    };
    var pset4a = function(color,x,y,a){
        pseta_median(color,x,y,a);
        pseta_median(color,x+1,y,a);
        pseta_median(color,x,y+1,a);
        pseta_median(color,x+1,y+1,a);
    }
    // var fade = function(x){
    //     return Math.exp(-0.4*x*x*x);
    // };
    // Approximation:
    var fade = function(x){
        var t = x+0.128*x*x;
        var y = 13.8/(t*t*t+13.8);
        var y2 = y*y;
        return y2*y2;
    };
    var psetdiff = function(a,color,rx,ry,px,py){
        var dx = Math.abs(px-rx);
        var dy = Math.abs(py-ry);
        var d = Math.sqrt(dx*dx+dy*dy);
        pseta(color,px,py,a*fade(d));
    };
    var fpsets = function(a,color,rx,ry){
        var px = Math.floor(rx);
        var py = Math.floor(ry);
        for(var i=-2; i<=2; i++){
            for(var j=-2; j<=2; j++){
                psetdiff(a,color,rx,ry,px+i,py+j);
            }
        }
    };
    var spoint = function(color,x,y){
        var rx = gx.px0+mx*x;
        var ry = gx.py0-my*y;
        fpsets(255,color,rx,ry);
    };
    var point = function(color,x,y){
        var px = floor(gx.w2+mx*x);
        var py = floor(gx.h2-my*y);
        pset4(color,px,py);
    };
    var hline = function(gx,py0,y,a){
        var py = py0-Math.floor(my*y);
        var color = gx.color;
        if(a==undefined){
            for(var px=0; px<w; px++){
                pset4(color,px,py);
            }
        }else{
            for(var px=0; px<w; px++){
                pset4a(color,px,py,a);
            }
        }
    };
    var vline = function(gx,px0,x,a){
        var px = px0+Math.floor(mx*x);
        var color = gx.color;
        if(a==undefined){
            for(var py=0; py<h; py++){
                pset4(color,px,py);
            }
        }else{
            for(var py=0; py<h; py++){
                pset4a(color,px,py,a);
            }
        }
    };
    var vspine = function(gx,px0,py0,x,a){
        if(a==undefined) a=1;
        var px = px0+Math.floor(mx*x);
        var color = gx.color;
        for(var py=py0-4; py<py0+5; py++){
            pset4a(color,px,py,a);
        }
    }
    var hspine = function(gx,px0,py0,y,a){
        if(a==undefined) a=1;
        var py = py0-Math.floor(my*y);
        var color = gx.color;
        for(var px=px0-4; px<px0+5; px++){
            pset4a(color,px,py,a);
        }
    };
    var circle = function(color,x,y,r,fill){
        var rx = gx.px0+ax*mx*x;
        var ry = gx.py0-ay*my*y;
        if(fill){
            var px = Math.round(rx);
            var py = Math.round(ry);
            var n = Math.round(r);
            var r2 = r*r;
            for(var i=-n; i<=n; i++){
                for(var j=-n; j<=n; j++){
                    if(i*i+j*j<r2){pset(color,px+i,py+j);}
                }
            }
        }
        var t1 = 2*Math.PI;
        var d = 1/r;
        for(var t=0; t<t1; t+=d){
            fpsets(255,color,rx+r*Math.cos(t),ry+r*Math.sin(t));
        }
    };

    gx.pset = pset;
    gx.pset4 = pset4;
    gx.point = point;
    gx.spoint = spoint;
    gx.fpsets = fpsets;
    gx.hline = hline;
    gx.vline = vline;
    gx.hspine = hspine;
    gx.vspine = vspine;
    gx.pseta_median = pseta_median;
    gx.circle = circle;
}

function init(canvas,w,h){
    var gx = {};
    gx.canvas = canvas;
    gx.context = canvas.getContext("2d");
    gx.context.clearRect(0,0,w,h);
    gx.img = gx.context.createImageData(w,h);
    gx.data = gx.img.data;
    gx.w=w; gx.h=h;
    gx.w2=w/2; gx.h2=h/2;
    gx.px0 = Math.floor(0.5*gx.w);
    gx.py0 = Math.floor(0.5*gx.h);
    gx.pos = [0,0];
    gx.animation = false;

    if(dark){
        gx.color_bg = color_dark_bg;
        gx.color_axes = color_dark_axes;
        gx.color_grid = color_dark_grid;
        color_table = color_table_dark;
        gx.font_color = "#5a5a5a";
    }else{
        gx.color_bg = color_bg;
        gx.color_axes = color_axes;
        gx.color_grid = color_grid;
        gx.font_color = "#404040";
    }

    gx.color = [0,0,0,255];

    /* gx.mx = 36; */
    var grid = ftab["grid"];
    if(grid!=undefined){
        gx.mx = 50*grid;
    }else if(w<600){
        gx.mx = w/1300*110;
    }else if(w<800){
        gx.mx = w/1300*72.5;
    }else if(w<1000){
        gx.mx = w/1300*65;
    }else{
        gx.mx = w/1300*50;
    }
    gx.my = gx.mx;
    gx.char_max = gx.mx<38?2:3;
    var font_size = gx.mx<32?14:16;
    var font = "\"DejaVu Sans\", \"Verdana\", \"sans-serif\"";
    gx.context.font = font_size+"px "+font;
    return gx;
}


function get_value(id){
    return document.getElementById(id).value;
}

function system(gx,alpha,alpha_axes){
    if(sys_mode==0) return;
    var grid = sys_mode>1;
    var px0 = Math.round(gx.px0); // On Chrome, touch clientX
    var py0 = Math.round(gx.py0); // returns also fractional part.
    var xcount = Math.ceil(0.5*gx.w/gx.mx)+1;
    var ycount = Math.ceil(0.5*gx.h/gx.mx)+1;
    var xshift = Math.round((0.5*gx.w-px0)/gx.mx);
    var yshift = -Math.round((0.5*gx.h-py0)/gx.mx);

    if(grid){
        gx.color = gx.color_grid;
        for(var y=yshift-ycount; y<=yshift+ycount; y++){
            if(y!=0) gx.hline(gx,py0,y,alpha);
        }
        for(var x=xshift-xcount; x<=xshift+xcount; x++){
            if(x!=0) gx.vline(gx,px0,x,alpha);
        }
    }

    gx.color = gx.color_axes;
    gx.hline(gx,py0,0,alpha_axes);
    gx.vline(gx,px0,0,alpha_axes);
    for(var y=yshift-ycount; y<=yshift+ycount; y++){
        if(y!=0){
            gx.hspine(gx,px0,py0,y,alpha_axes);
        }
    }
    for(var x=xshift-xcount; x<=xshift+xcount; x++){
        gx.vspine(gx,px0,py0,x,alpha_axes);
    }
}

function clear_system(gx){
    clear(gx,gx.color_bg);
    system(gx);
}

function clamp(x,a,b){
    return Math.min(Math.max(x,a),b);
}

function ftos(x,m,a){
    var minus = x<0;
    x = Math.abs(x);
    var n = Math.round(a+Math.max(0,lg(m)));
    var s;
    if(x<1E-5 && x!=0){
        s = x.toExponential(Math.max(0,n+Math.round(lg(0.5*x)))).toUpperCase();
    }else{
        s = x.toFixed(n);
    }
    return minus?"\u2212"+s:s;
}

function strip_zeros(s){
    var n = s.length;
    var point = false;
    for(var i=0; i<n; i++){
        if(s[i]=='.') point = true;
        if(s[i]=='e' || s[i]=='E') return s;
    }
    if(!point) return s;
    var k = n-1;
    while(k>0){
        if(s[k]=='.'){k--; break;}
        else if(s[k]!='0') break;
        k--;
    }
    return s.slice(0,k+1);
}

function ftos_strip(x,m){
    return strip_zeros(ftos(x,m,1));
}

function labels(gx){
    if(sys_mode==0) return;
    var context = gx.context;
    var w = gx.w;
    var h = gx.h;
    var mx = gx.mx;
    var px0 = Math.round(gx.px0);
    var py0 = Math.round(gx.py0);
    var xcount = Math.ceil(0.5*w/mx);
    var ycount = Math.ceil(0.5*h/mx);
    var xshift = Math.round((0.5*w-px0)/mx);
    var yshift = Math.round((0.5*h-py0)/mx);
    var px,py,s,px_adjust,py_adjust;
    context.fillStyle = gx.font_color;
    context.textAlign = "center";

    var bulky_pred = false;
    var char_max = gx.char_max;
    var bulky2 = false;

    var xmargin = 26;
    var ymargin = 12;

    for(var x=xshift-xcount; x<=xshift+xcount; x++){
        if(x!=0){
            px = px0+Math.floor(mx*x);
            if(px<xmargin || px>w-xmargin) continue;
            s = strip_zeros(ftos(x/ax,ax,1));
            if(s.length>9) bulky2 = true;
            if(bulky2){
                if(mod(x,3)==1) py_adjust=22;
                else if(mod(x,3)==2) py_adjust=40;
                else py_adjust=58;
            }else{
                if(x%2==0 && (s.length>char_max || s.length>1 && bulky_pred)){
                    py_adjust=40;
                }else{
                    py_adjust=22;
                }
            }
            if(x/ax<0){px_adjust=4;} else{px_adjust=-1;}
            context.fillText(s,px-px_adjust,clamp(py0,10,h-44)+py_adjust);
            bulky_pred = s.length>char_max;
        }
    }
    context.textAlign = "right";
    for(var y=yshift-ycount; y<=yshift+ycount; y++){
        if(y!=0){
            py = py0+Math.floor(mx*y);
            if(py<ymargin || py>h-ymargin) continue;
            s = ftos(-y/ay,ay/4,1);
            if(ay<2){s=strip_zeros(s);}
            context.fillText(s,clamp(px0-10,28+10*(s.length-2),w-16),py+6);
        }
    }
}

function sleep(ms){
    return new Promise(function(resolve,reject){
        setTimeout(resolve,ms);
    });
}

function clear(gx,color){
    var data = gx.data;
    var w = gx.w;
    var h = gx.h;
    var n = 4*w*h;
    var r = color[0];
    var g = color[1];
    var b = color[2];
    var a = color[3];
    for(var i=0; i<n; i+=4){
        data[i] = r;
        data[i+1] = g;
        data[i+2] = b;
        data[i+3] = a;
    }
}

function flush(gx){
    gx.context.putImageData(gx.img,0,0);
}

var clientXp=0;
var clientYp=0;
var moved = false;

function refresh(gx){
    clear_system(gx);
    flush(gx);
    labels(gx);
}

function move_refresh(gx){
    refresh(gx);
}

function mouse_move_handler(e){
    if(e.buttons==1){
        moved = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.px0 = gx.px0+dx;
        gx.py0 = gx.py0+dy;
        gx.pos = get_pos(gx);
        clientXp = e.clientX;
        clientYp = e.clientY;
        move_refresh(gx);
    }else{
        clientXp = e.clientX;
        clientYp = e.clientY;
    }
}

function mouse_up_handler(e){
    if(moved){
        update(graphics);
        moved = false;
    }
}

function touch_move(e){
    if(e.touches.length!=0){
        e = e.touches[0];
        moved = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.px0 = gx.px0+dx;
        gx.py0 = gx.py0+dy;
        gx.pos = get_pos(gx);
        clientXp = e.clientX;
        clientYp = e.clientY;
        move_refresh(gx);
    }
}

function touch_start(e){
    if(e.touches.length!=0){
        e = e.touches[0];
        clientXp = e.clientX;
        clientYp = e.clientY;
    }
}

function touch_end(){
    if(moved){
        update(graphics);
        moved = false;
    }
}

function new_system(last_gx){
    var canvas = document.getElementById("canvas1");
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    var gx = init(canvas,w,h);
    new_point(gx);
    if(last_gx!==undefined){
        gx.px0 = last_gx.px0;
        gx.py0 = last_gx.py0;
        gx.pos = last_gx.pos;
    }else{
        canvas.addEventListener("mousemove", mouse_move_handler, false);
        canvas.addEventListener("mouseup", mouse_up_handler, false);
        canvas.addEventListener("touchstart", touch_start, false);
        canvas.addEventListener("touchend", touch_end, false);
        canvas.addEventListener("touchmove", touch_move, false);
    }
    refresh(gx);

    return gx;
}

var busy;
var pid_stack;

function cancel(pid,index,pid_stack){
    return (index>=pid_stack.length ||
      !Object.is(pid,pid_stack[index]));
}

function new_fplot_rec(buffer,gx,color,spoint,y0,wy,count){
    var ya = y0-wy;
    var yb = y0+wy;
    var YA = y0-2*wy;
    var YB = y0+2*wy;
    return function fplot_rec(depth,f,a,b,d){
        var delta_max = 0;
        var y0 = f(a);
        for(var x=a; x<b; x+=d){
            var y = f(x);
            if(ya<y && y<yb){
                spoint(color,ax*x,ay*y);
            }
            if((ya<y || ya<y0) && (y<yb || y0<yb)){
                var delta = Math.abs(y-y0);
                if(delta>delta_max) delta_max = delta;
            }
            y0 = y;
        }
        if(delta_max>0.02/ay && depth<6){
            buffer[depth].push(function(){
                count.value++;
                var n = 10;
                var h = (b-a)/n;
                for(var i=0; i<n; i++){
                    fplot_rec(depth+1,f,a+h*i,a+h*(i+1),d/n);
                }
            });
        }
    };
}

async function fplot(gx,f,d,cond,color){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;
    var spoint = gx.spoint;
    var wx = 0.5*gx.w/(gx.mx*ax);
    var wy = 0.5*(gx.h+4)/(gx.mx*ay);
    var x0 = (0.5*gx.w-gx.px0)/(gx.mx*ax);
    var y0 = (gx.py0-0.5*gx.h)/(gx.mx*ay);
    var k=0;
    d = d/ax;
    var a = x0-wx;
    var b = x0+wx;
    var n = 100;
    var h = (b-a)/n;
    var count = {value: 0};
    var buffer = [[],[],[],[],[],[]];
    var fplot_rec = new_fplot_rec(buffer,gx,color,spoint,y0,wy,count);
    for(var i=0; i<n; i++){
        fplot_rec(0,f,a+h*i-0.12*h,a+h*(i+1)+0.12*h,d);
    }
    if(gx.animation==true){
        flush(gx);
        labels(gx);
        busy = false;
        return;
    }
    var k = 0;
    for(var depth=0; depth<buffer.length; depth++){
        if(count.value>max_count) break;
        var bfn = buffer[depth];
        for(var i=0; i<bfn.length; i++){
            bfn[i]();
            if(depth!=0) k++;
            if(cond && k==100){k = 0; await sleep(10);}
            if(cancel(pid,index,pid_stack)){return;}
        }
        if(depth==0 && cond){
            flush(gx);
            labels(gx);
            await sleep(20);
        }
    }
    flush(gx);
    labels(gx);
    busy = false;
}

function bisection_fast(N,state,f,a,b){
    var m;
    for(var k=0; k<N; k++){
        m = 0.5*(a+b);
        if(f(m)<0==state) a=m; else b=m;
    }
    return m;
}

async function plot_zero_set(gx,f,n,N,cond,color){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var W = gx.w;
    var H = gx.h;
    var px,py,x,y,z;
    var px0 = gx.px0;
    var py0 = gx.py0;
    var Ax = 1/(gx.mx*ax);
    var Ay = -1/(gx.mx*ay);

    var state;
    var dx = n/(gx.mx*ax);
    var dy = n/(gx.mx*ay);
    var k=0;

    for(py=0; py<H; py+=1){
        state = undefined;
        for(px=0; px<W; px+=n){
            x = Ax*(px-px0);
            y = Ay*(py-py0);
            z = f(x,y)<0;
            if(z!=state){
                if(state!=undefined){
                    var g = function(x){return f(x,y);};
                    var x0 = bisection_fast(N,state,g,x-dx,x+dx);
                    if(Math.abs(f(x0,y))<0.1){
                        gx.spoint(color,ax*x0,ay*y);
                    }
                }
                state = z;
            }
        }
        if(cond && k%100==0){
            await sleep(20);
        }
        if(cancel(pid,index,pid_stack)) return;
        k++;
    }
    for(px=0; px<W; px+=1){
        state = undefined;
        for(py=0; py<H; py+=n){
            x = Ax*(px-px0);
            y = Ay*(py-py0);
            z = f(x,y)<0;
            if(z!=state){
                if(state!=undefined){
                    var g = function(y){return f(x,y);};
                    var y0 = bisection_fast(N,!state,g,y-dy,y+dy);
                    if(Math.abs(f(x,y0))<0.1){
                        gx.spoint(color,ax*x,ay*y0);
                    }
                }
                state = z;
            }
        }
        if(cond && k%100==0){
            await sleep(20);
        }
        if(cancel(pid,index,pid_stack)) return;
        k++;
    }
    flush(gx);
    labels(gx);
    busy = false;
}

async function vplot(gx,f,d,cond,color){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;
    var spoint = gx.spoint;
    var k=0;
    var t0 = ftab.t0;
    var t1 = ftab.t1;
    for(var t=t0; t<t1; t+=d){
        var v = f(t);
        spoint(color,ax*v[0],ay*v[1]);
        if(cond && k==4000){
            k=0;
            await sleep(10);
        }else{
            k++;
        }
        if(cancel(pid,index,pid_stack)) return;
    }
    flush(gx);
    labels(gx);
    busy = false;
}

async function plot_async(gx,f,color){
    if(gx.sync_mode==true){
        fplot(gx,f,0.01,false,color);
    }else{
        if(gx.animation==true){
            fplot(gx,f,0.01,false,color);
        }else{
            fplot(gx,f,0.01,true,color);
        }
    }
}

async function plot_zero_set_async(gx,f,color){
    if(gx.sync_mode==true){
        plot_zero_set(gx,f,1,14,false,color);
    }else{
        if(gx.animation==true){
            plot_zero_set(gx,f,40,10,false,color);
            return;
        }
        plot_zero_set(gx,f,4,10,false,color);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_zero_set(gx,f,1,14,true,color);
    }
}

async function vplot_async(gx,f,color){
    if(gx.sync_mode==true){
        vplot(gx,f,0.001,false,color);
    }else{
        vplot(gx,f,0.01,false,color);
        if(gx.animation==true) return;
        while(busy){await sleep(40);}
        await sleep(40);
        vplot(gx,f,0.001,true,color);
    }
}

function hsl_to_rgb(H,S,L){
    var C = (1-Math.abs(2*L-1))*S;
    var R1,G1,B1,Hp,X,m;
    Hp = 3*H/Math.PI;
    X = C*(1-Math.abs(Hp%2-1));
    if(0<=Hp && Hp<1){
        R1=C; G1=X; B1=0;
    }else if(1<=Hp && Hp<2){
        R1=X; G1=C; B1=0;
    }else if(2<=Hp && Hp<3){
        R1=0; G1=C; B1=X;
    }else if(3<=Hp && Hp<4){
        R1=0; G1=X; B1=C;
    }else if(4<=Hp && Hp<5){
        R1=X; G1=0; B1=C;
    }else if(5<=Hp && Hp<6.01){
        R1=C; G1=0; B1=X;
    }else{
        return [1,1,1,];
    }
    m = L-C/2;
    return [R1+m,G1+m,B1+m];
}

function hsl_to_rgb_u8(H,S,L){
    var t = hsl_to_rgb(H,S,L);
    return [255*t[0],255*t[1],255*t[2]];
}

function rect(pset,color,px0,py0,w,h){
    var px1 = px0+w;
    var py1 = py0+h;
    for(var py=py0; py<py1; py++){
        for(var px=px0; px<px1; px++){
            pset(color,px,py);
        }
    }
}

function level_color(x){
    return hsl_to_rgb_u8(mod(Math.PI*(4/3-2/10*freq*x),2*Math.PI),1,0.6);
}

async function plot_level(gx,f,n,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var W = gx.w;
    var H = gx.h;
    var px,py,x,y,z;
    var pseta = gx.pseta_median;
    var pset = function(color,x,y){pseta(color,x,y,0.4);}
    var px0 = gx.px0;
    var py0 = gx.py0;
    var k = 0;
    
    for(py=0; py<H; py+=n){
        for(px=0; px<W; px+=n){
            x = (px-px0)/gx.mx/ax;
            y = -(py-py0)/gx.mx/ay;
            rect(pset,level_color(f(x,y)),px,py,n,n);
        }
        if(cond && k==10){
            k=0;
            await sleep(20);
        }else{
            k++;
        }
        if(cancel(pid,index,pid_stack)) return;
    }
    flush(gx);
    busy = false;
}

function set_freq(x){
    freq = x;
    return x;
}

function plot_level_async(gx,f,color){
    var g = function(x,y){
        var r = freq*f(x,y);
        return r-1-Math.floor(r-0.5);
    };
    if(iso_mode==0 || iso_mode==2){
        plot_level(gx,f,1,false);
    }
    labels(gx);
    if(iso_mode>0){
        plot_zero_set_async(gx,g,color);
    }
}

function bisection_bool(state,f,a,b){
    var m;
    for(var k=0; k<6; k++){
        m = 0.5*(a+b);
        if(f(m)==state) a=m; else b=m;
    }
    return m;
}

function plot_bool(gx,f,color,n){
    var W = gx.w;
    var H = gx.h;
    var px,py,x,y,z;
    var pseta = gx.pseta_median;
    var alpha = dark?0.3:0.4;
    var pset = function(color,x,y){pseta(color,x,y,alpha);}
    var px0 = gx.px0;
    var py0 = gx.py0;

    var state;
    var d = n/gx.mx/ax;
    for(py=0; py<H; py+=n){
        state = undefined;
        for(px=0; px<W; px+=n){
            x = (px-px0)/gx.mx/ax;
            y = -(py-py0)/gx.mx/ay;
            z = f(x,y);
            if(z){
                rect(pset,color,px,py,n,n);
            }
            if(z!=state){
                if(state!=undefined){
                    var g = function(x){return f(x,y);};
                    var x0 = bisection_bool(state,g,x-d,x+d);
                    gx.spoint(color,ax*x0,ay*y);
                }
                state = z;
            }
        }
    }
    for(px=0; px<W; px+=n){
        state = undefined;
        for(py=0; py<H; py+=n){
            x = (px-px0)/gx.mx/ax;
            y = -(py-py0)/gx.mx/ay;
            z = f(x,y);
            if(z!=state){
                if(state!=undefined){
                    var g = function(y){return f(x,y);};
                    var y0 = bisection_bool(!state,g,y-d,y+d);
                    gx.spoint(color,ax*x,ay*y0);
                }
                state = z;
            }
        }
    }
    flush(gx);
    labels(gx);
}

function pli(x0,d,y){
    var n = y.length;
    return function(x){
        var k = Math.floor((x-x0)/d);
        if(k<0 || k+1>=n){
            return NaN;
        }else{
            return y[k]+(y[k+1]-y[k])/d*(x-x0-k*d);
        }
    };
}

function add_scaled(n,v,x,a,y){
    for(var i=0; i<n; i++){
        v[i] = x[i]+a*y[i];
    }
    return v;
}

function runge_kutta_unilateral(f,h,N,x0,y0){
    var n = y0.length;
    var m = n-1;
    var F = function(v,x,y){
        for(var i=0; i<m; i++) v[i] = y[i+1];
        v[m] = f(x,y);
    };
    var x = x0;
    var y = y0.slice();
    var yt = y.slice();
    var k1 = y.slice();
    var k2 = y.slice();
    var k3 = y.slice();
    var k4 = y.slice();
    var a = [y[0]];
    for(var k=1; k<=N; k++){
        F(k1,x,y);
        F(k2,x+0.5*h,add_scaled(n,yt,y,0.5*h,k1));
        F(k3,x+0.5*h,add_scaled(n,yt,y,0.5*h,k2));
        F(k4,x+h,add_scaled(n,yt,y,h,k3));
        for(var i=0; i<n; i++){
            y[i] = y[i]+h/6*(k1[i]+2*(k2[i]+k3[i])+k4[i]);
        }
        x = x0+k*h;
        a.push(y[0]);
    }
    return pli(x0,h,a);
}

function runge_kutta(f,h,wm,wp,x0,y0){
    var gm = runge_kutta_unilateral(f,-h,wm/h,x0,y0);
    var gp = runge_kutta_unilateral(f,h,wp/h,x0,y0);
    return function(x){return x<x0?gm(x):gp(x);};
}

function ode_as_fn_rec(v,t){
    if(Array.isArray(t)){
        if(t[0]==="D" && t[1]===v){
            return ["index","y",t[2]];
        }else{
            var a = [];
            for(var i=0; i<t.length; i++){
                a.push(ode_as_fn_rec(v,t[i]));
            }
            return a;        
        }
    }else if(t===v){
        return ["index","y",0];
    }else{
        return t;
    }
}

function ode_as_fn(t,v,order){
    var u = ode_as_fn_rec(v,t[2]);
    if(!ftab.hasOwnProperty("t") && contains_variable(t[2],"t")){
        return compile(u,["t","y"]);
    }else{
        return compile(u,["x","y"]);
    }
}

function from_ode(gx,t){
    var v = t[1][1];
    var order = t[1][2];
    var f = ode_as_fn(t,v,order);
    var p = ftab["p"];
    if(!ftab.hasOwnProperty("p") || !Array.isArray(p)){
        throw lang.initial_value_problem_msg();
    }
    if(p.length<order+1){
        throw new Err(lang.p_to_short);
    }else{
        p = p.slice(0,order+1);
    }
    var wm = Math.abs(p[0]+gx.px0/gx.mx/ax);
    var wp = Math.abs(p[0]-(gx.w-gx.px0)/gx.mx/ax);
    var fv = runge_kutta(f,0.001,wm,wp,p[0],p.slice(1));
    return fv;
}

function points(gx,color,f,a){
    var r = 4;
    if(a.length>1){
        r = r*clamp(4*ax*Math.abs(a[1]-a[0]),0.25,1);
    }
    for(var i=0; i<a.length; i++){
        var y = f(a[i]);
        if(Array.isArray(y)){
            gx.circle(color,y[0],y[1],4,true);
        }else{
            gx.circle(color,a[i],y,r,true);
        }
    }
    flush(gx);
    labels(gx);
}

function points_list(gx,color,a,r){
    if(r==undefined) r=4;
    for(var i=0; i<a.length; i++){
        var t = a[i];
        gx.circle(color,t[0],t[1],r,true);
    }
    flush(gx);
    labels(gx);
}

function contains_variable(t,v){
    if(Array.isArray(t)){
        if(t[0]==="fn"){
            if(Array.isArray(t[1])){
                for(var i=0; i<t[1].length; i++){
                    if(t[1][i]===v) return false;
                }
            }else if(t[1]===v){
                return false;
            }
            return contains_variable(t[2],v);
        }else{
            for(var i=0; i<t.length; i++){
                if(contains_variable(t[i],v)) return true;
            }
            return false;
        }
    }else{
        return t===v;
    }
}

function substitute(t,v,value){
    if(Array.isArray(t)){
        var a = [];
        for(var i=0; i<t.length; i++){
            a.push(substitute(t[i],v,value));
        }
        return a;
    }else if(t===v){
        return value;
    }else{
        return t;
    }
}

function node_loop(callback,gx,t,color){
    var v = t[2][1];
    var a = compile(t[2][2],[])();
    var node = t[1];
    for(var i=0; i<a.length; i++){
        t = substitute(node,v,a[i]);
        if(Array.isArray(t) && t[0]===";"){
            for(var j=2; j<t.length; j++){
                eval_statements(t[j]);
            }
            t = t[1];
            if(t===null) continue;
        }
        callback(gx,t,color);
    }
}

var bool_result_ops = {
    "<":0, ">":0, "<=":0, ">=":0, "&":0, "|":0, "not":0
};

function plot_node_basic(gx,t,color){
    var f;
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node,gx,t,color);
    }else if(Array.isArray(t) && t[0]===lang_points){
        if(t.length==2){
            var a = compile(t[1],[])();
            points_list(gx,color,a);
        }else{
            var a = compile(t[2],[])();
            f = compile(t[1],[])();
            points(gx,color,f,a);
        }
    }else if(Array.isArray(t) &&
        typeof t[0]==="string" && plot_cmd_tab.hasOwnProperty(t[0])
    ){
        eval_cmd(t);
    }else if(Array.isArray(t) && t[0]==="="){
        if(Array.isArray(t[1]) && t[1][0]==="D"){
            var v = t[1][1];
            f = from_ode(gx,t);
            if(v!=="y") ftab[v] = f;
            plot_async(gx,f,color);
        }else if(t[1]==="y" && !contains_variable(t[2],"y")){
            infer_type(t);
            f = compile(t[2],["x"]);
            plot_async(gx,f,color);
        }else{
            t = ["-",t[1],t[2]];
            infer_type(t);
            f = compile(t,["x","y"]);
            plot_zero_set_async(gx,f,color);
        }
    }else if(Array.isArray(t) && bool_result_ops.hasOwnProperty(t[0])){
        infer_type(t);
        f = compile(t,["x","y"]);
        plot_bool(gx,f,color,1);
    }else{
        var T = infer_type(t);
        if(T===TypeVector){
            f = compile(t,["t"]);
            vplot_async(gx,f,color);
        }else if(contains_variable(t,"y")){
            f = compile(t,["x","y"]);
            plot_level_async(gx,f,color);
        }else{
            if(!ftab.hasOwnProperty("t") && contains_variable(t,"t")){
                f = compile(t,["t"]);
            }else{
                f = compile(t,["x"]);
            }
            plot_async(gx,f,color);
        }
    }
}

function plot_node(gx,t,color){
    plot_node_basic(gx,t,color);
}

function global_definition(t){
    if(Array.isArray(t[1])){
        var app = t[1];
        var name = app[0];
        var T = infer_type(t[2]);
        if(app.length==2 && typeof app[1]!="string"){
            if(!recursion_table.hasOwnProperty(name)){
                recursion_table[name] = {};
            }
            recursion_table[name][app[1]] = compile(t[2],[])();
        }else{
            if(T!==TypeNumber){id_type_table[name] = [T];}
            var value = compile(t[2],app.slice(1),"",name);
            ftab[name] = value;
        }
    }else{
        var T = infer_type(t[2]);
        if(T!==TypeNumber) id_type_table[t[1]] = T;
        var value = compile(t[2],[]);
        ftab[t[1]] = value();
    }
}

function eval_node(t){
    var value = compile(t,[]);
    value();
}

function eval_cmd(t){
    if(extension_loaded.cmd){
        cmd_tab[t[0]](t);
    }else{
        async_continuation = "await";
        load_extension(cmd_tab,"cmd","js/ext-cmd.js");
        throw new Repeat();
    }
}

function eval_statements(t){
    if(Array.isArray(t) && (t[0]==="block" || t[0]===";")){
        for(var i=1; i<t.length; i++){
            eval_statements(t[i]);
        }
    }else{
        if(Array.isArray(t) && t[0]===":="){
            global_definition(t);
        }else if(Array.isArray(t) && typeof t[0]=="string" &&
            cmd_tab.hasOwnProperty(t[0])
        ){
            eval_cmd(t);
        }else{
            eval_node(t);
        }
    }
}

function process_statements(a){
    if(a.length>1){
        var inputf = document.getElementById("inputf");
        inputf.value = a[0];
    }
    for(var i=1; i<a.length; i++){
        if(a[i].length>0){
            var t = ast(a[i]);
            eval_statements(t);
        }
    }
}

function plot(gx){
    var color_index = 0;
    var input = get_value("inputf").trim();
    var a = input.split(";;");
    process_statements(a);
    pid_stack = [];

    if(a[0].length>0){
        var t = ast(a[0]);
        if(Array.isArray(t) && t[0]===";"){
            for(var i=t.length-1; i>=2; i--){
                eval_statements(t[i]);
            }
            t = t[1];
            if(t===null){refresh(gx); return;}
        }
        refresh(gx);
        if(Array.isArray(t) && t[0]==="block"){
            for(var i=1; i<t.length; i++){
                if(Array.isArray(t[i]) && t[i][0]===":="){
                    global_definition(t[i]);
                }else{
                    plot_node(gx,t[i],color_table[color_index]);
                    color_index = (color_index+1)%color_table.length;
                }
            }
        }else{
            if(Array.isArray(t) && t[0]===":="){
                global_definition(t);
            }else{
                plot_node(gx,t,color_table[0]);
            }
        }
    }else{
        refresh(gx);
    }
}

function calculate_eval(t,conf){
    if(Array.isArray(t) && t[0]===";"){
        var a = [];
        for(var i=2; i<t.length; i++){
            var y = calculate_eval(t[i],conf);
            if(y!=undefined) a.push(y);
        }
        return calculate_eval(t[1],conf);
    }else if(Array.isArray(t) && t[0]==="block"){
        var a = [];
        for(var i=1; i<t.length; i++){
            var y = calculate_eval(t[i],conf);
            if(y!=undefined) a.push(y);
        }
        if(a.length>0) return a;
    }else if(Array.isArray(t) && t[0]===":="){
        global_definition(t);
    }else{
        if(conf==="complex"){
            infer_type(t);
            return ccompile(t,[])();
        }else{
            infer_type(t);
            return compile(t,[])();
        }
    }
}

function calculate(conf){
    var input = get_value("input-calc");
    var out = document.getElementById("calc-out");
    if(input.length==0){
        out.innerHTML = "";
        return;
    }
    try{
        var t = ast(input);
        var value = calculate_eval(t,conf);
        // out.innerHTML = "<p><code>"+str(t)+"</code>";
        // var t0 = performance.now();
        if(value==undefined){
            out.innerHTML = "";
        }else{
            out.innerHTML = "<p><code>= "+str(value,undefined,true)+"</code>";
        }
        // var t1 = performance.now();
        // out.innerHTML += "<p><code>time: "+(t1-t0)+"ms</code>";
    }catch(e){
        if(e instanceof Err){
            out.innerHTML = "<p><code>"+e.text+"</code>";
        }else if(e instanceof Repeat){
            async_continuation = calc;
        }else{
            throw e;
        }
    }
}

function calc(){
    calculate();
}

function get_pos(gx){
    return [
        (0.5*gx.w-gx.px0)/gx.mx/ax,
        -(0.5*gx.h-gx.py0)/gx.mx/ay
    ];
}

function set_pos(gx,t){
    var x = t[0];
    var y = t[1];
    gx.px0 = Math.round(0.5*gx.w-x*ax*gx.mx);
    gx.py0 = Math.round(0.5*gx.h+y*ay*gx.mx);
    gx.pos = t;
}

function set_position(x,y){
    set_pos(graphics,[x,y]);
    return [x,y];
}

function set_scale(dx,dy,dz){
    if(dy==undefined) dy=dx;
    if(dz==undefined) dz=dx;
    ax = 1/dx;
    ay = 1/dy;
    az = 1/dz;
    set_pos(graphics,graphics.pos);
    xscale.index = index0+Math.round(3*lg(ax));
    yscale.index = index0+Math.round(3*lg(ay));
    zscale.index = index0+Math.round(3*lg(az));
    return [dx,dy];
}

function scale_inc(scale,a){
    var m = scale.index%3==2?5/2:2;
    scale.index++;
    return Math.round(1E10*a*m)/1E10;
}

function scale_dec(scale,a){
    var m = scale.index%3==0?5/2:2;
    scale.index--;
    return Math.round(1E10*a/m)/1E10;
}

function xyscale_inc(){
    ax = scale_inc(xscale,ax);
    ay = scale_inc(yscale,ay);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function xyscale_dec(){
    ax = scale_dec(xscale,ax);
    ay = scale_dec(yscale,ay);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function xscale_inc(){
    ax = scale_inc(xscale,ax);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function yscale_inc(){
    ay = scale_inc(yscale,ay);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function xscale_dec(){
    ax = scale_dec(xscale,ax);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function yscale_dec(){
    ay = scale_dec(yscale,ay);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function sys(n){
    sys_mode = n;
}

function iso(n){
    iso_mode = n;
}

function switch_hud(){
    var hud = document.getElementById("hud");
    if(hud_display){
        hud_display = false;
        hud.style.display = "none";
    }else{
        hud_display = true;
        hud.style.display = "block";
    }
}

function update(gx){
    var out = document.getElementById("out");
    out.innerHTML = "";
    try{
        plot(gx);
    }catch(e){
        if(e instanceof Err){
            out.innerHTML = "<br>"+e.text;
        }else if(e instanceof Repeat){
            async_continuation = main;
        }else{
            throw e;
        }
    }
    process_post_applications();
}

function main(){
    var gx = new_system(graphics);
    graphics = gx;
    update(gx);
}

function keys(event){
    if(event.keyCode==13) main();
}

function keys_calc(event){
    if(event.keyCode==13) calc();
}

function query(href){
    var a = href.split("?");
    if(a.length>1){
        var input = document.getElementById("inputf");
        input.value = decodeURIComponent(a[1]);
    }
}

var encode_tab = {
  " ": "20", "#": "23", "'": "27", "[": "5b", "]": "5d", "^": "5e",
  "\"": "22", "<": "3c", ">": "3e", "|": "7c"
};

function encode_query(s){
    var a = [];
    for(var i=0; i<s.length; i++){
        if(s.charCodeAt(i)>127){
            a.push(encodeURIComponent(s[i]));
        }else if(encode_tab.hasOwnProperty(s[i])){
            a.push("%"+encode_tab[s[i]]);
        }else{
            a.push(s[i]);
        }
    }
    return a.join("");
}

function upper_str(x){
    return x.toString().toUpperCase();
}

function link(position,regard_zscale){
    if(regard_zscale==undefined) regard_zscale = false;
    var s = document.getElementById("inputf").value;
    var out = document.getElementById("calc-out");
    var url = window.location.href.split("?")[0];
    var scale;
    if(regard_zscale){
        scale = (xscale.index==yscale.index && xscale.index==zscale.index?
            (xscale.index==index0?"":";;scale("+upper_str(1/ax)+")"):
            ";;scale("+upper_str(1/ax)+","+upper_str(1/ay)+","+upper_str(1/az)+")"            
        );
    }else{
        scale = (xscale.index==yscale.index?
            (xscale.index==index0?"":";;scale("+upper_str(1/ax)+")"):
            ";;scale("+upper_str(1/ax)+","+upper_str(1/ay)+")"
        );
    }
    var pos = "";
    var t = graphics.pos;
    if(position && (t[0]!=0 || t[1]!=0)){
        var n = Math.max(0,1+Math.round(Math.log(ax)));
        var t0 = t[0].toFixed(n);
        var t1 = t[1].toFixed(n);
        pos = (scale==""?";;":",")+"P("+t0+","+t1+")";
    }
    out.innerHTML = "<p style='font-size: 80%'>"+url+"?"+encode_query(s+scale+pos);
}

async function update_on_resize(){
    await sleep(2000);
    if(graphics.w!=window.innerWidth || graphics.h!=window.innerHeight){
        main();
    }
}

function plot_img(w,h){
    if(w==undefined) w = 360;
    if(h==undefined) h = Math.round(w/1.5);
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var gx = init(canvas,w,h);
    new_point(gx);
    gx.sync_mode = true;

    var t = get_pos(graphics);
    set_pos(gx,t);

    clear_system(gx);
    flush(gx);
    var last_gx = graphics;
    graphics = gx;
    update(gx);
    graphics = last_gx;
    var s = canvas.toDataURL("image/png");
    var img = "<img align=\"top\" src=\""+s+"\"/>";
    return img;
}

function calc_img(){
    var input = document.getElementById("input-calc");
    input.value = "img(540,360)";
    calc();
}

function process_post_applications(){
    for(var i=0; i<post_app_stack.length; i++){
        var f = post_app_stack[i];
        f();
    }
    post_app_stack = [];
}

window.onload = function(){
    var gx = new_system();
    graphics = gx;
    query(window.location.href);
    main();
    update_on_resize();
};

