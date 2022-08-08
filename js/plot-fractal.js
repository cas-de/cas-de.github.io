
"use strict";

color_dark_axes = [80,80,80];
dark = true;

function move_refresh(gx){
    update(gx);
}

var tau = 2*Math.PI;
cftab["z0"] = function(c){return {re:0,im:0};};
cftab["N"] = {re:400,im:0};
cftab["n"] = {re:1,im:0};
cftab["r"] = {re:10,im:0};
cftab["shift"] = {re:0,im:0};
cftab["cgrad"] = {re:1.0,im:0};
ftab["debug"] = debug_mode;
ftab["ctab"] = ctab;
var debug = false;

cftab["ctab0"] = [[1,1,1],[1,1,1],[0,0,0]];
cftab["ctab1"] = [[1,1,1],[1,0.92,0.5],[1,0.8,0.1],[0.9,0.6,0],
[0.4,0.1,0.25],[0.07,0,0.3],[0.1,0.3,0.64]];
cftab["ctab2"] = [[0.93,1.0,1.0],[0.95,0.93,0.78],
[0.96,0.85,0.55],[0.98,0.78,0.33],[0.99,0.7,0.1],
[0.9,0.58,0.02],[0.71,0.43,0.07],[0.52,0.28,0.11],
[0.33,0.12,0.16],[0.18,0.01,0.21],[0.11,0.02,0.28],
[0.04,0.02,0.35],[0.02,0.08,0.44],[0.05,0.2,0.57],
[0.09,0.32,0.7],[0.16,0.44,0.8],[0.31,0.55,0.84],
[0.47,0.67,0.88],[0.62,0.78,0.92],[0.77,0.89,0.96]];
cftab["ctab3"] = [[1,1,1],[1,0.9,0.6],[1,0.72,0],[0.7,0.5,0.3],
[0.2,0.3,0.34],[0.1,0.1,0.38],[0.2,0.3,0.6],[0.2,0.5,0.83]];
cftab["ctab4"] = [[1,1,1], [1,0.7,0], [0,0.2,0.6]];
cftab["ctab5"] = [[0.09,0.02,0.29],[0.03,0.02,0.36],
[0.02,0.1,0.47],[0.06,0.22,0.59],[0.1,0.35,0.72],
[0.19,0.46,0.81],[0.34,0.58,0.85],[0.5,0.69,0.89],
[0.65,0.8,0.93],[0.81,0.91,0.97],[0.93,0.99,0.96],
[0.95,0.91,0.73],[0.96,0.84,0.51],[0.98,0.76,0.28],
[1.0,0.69,0.06],[0.86,0.55,0.03],[0.67,0.4,0.08],
[0.48,0.25,0.12],[0.3,0.09,0.16],[0.16,0.01,0.22]];
cftab["ctab6"] = [[0.6,0,0],[1,0.8,0.2],[0,0,0]];

var ctab_pointer = cftab["ctab1"];

function debug_mode(){
    debug = true;
}

function submit(gx){
    system(gx,0.02,0.2);
    flush(gx);
    labels(gx);
}

function ctab(a){
    if(Array.isArray(a)){
        ctab_pointer = a;
    }else{
        ctab_pointer = cftab["ctab"+Math.round(a)];
    }
}

function index_color(t,i){
    return hsl_to_rgb_u8(0,0.0,0.75+0.25*Math.cos(i/20));
}

function float_re(x){
    return typeof x=="object"?x.re:x;
}

function new_index_color(color_array,shift){
    var a = color_array.slice();
    var d = 1/a.length;
    a.push(a[0]);
    var ar = a.map(function(t){return float_re(t[0]);});
    var ag = a.map(function(t){return float_re(t[1]);});
    var ab = a.map(function(t){return float_re(t[2]);});
    var fr = pli(0,d,ar);
    var fg = pli(0,d,ag);
    var fb = pli(0,d,ab);
    var gradient = 0.3*cftab["cgrad"].re;
    return function(t,i){
        var x = (gradient*Math.log(i/10+1)+shift)%1;
        t[0] = Math.floor(255*fr(x));
        t[1] = Math.floor(255*fg(x));
        t[2] = Math.floor(255*fb(x));
        return t;
    };
}

function sink(color,x,a){
    var r = Math.min(1,a*(1-x));
    color[0] = Math.floor(r*color[0]);
    color[1] = Math.floor(r*color[1]);
    color[2] = Math.floor(r*color[2]);
}

function new_calc_rect(gx,f,z0,mx,r2,pset,N,n){
    var px0 = gx.px0;
    var py0 = gx.py0;
    var shift = Math.abs(cftab["shift"].re);
    var index_color = new_index_color(ctab_pointer,shift);
    var buffer = [0,0,0];
    var black = [0,0,0];
    var count = Math.round(cftab["n"].re)-1;
    var d = n/(mx*ax);
    var offset = 0.5*d;
    var M = N-20;
    var a_sink = 0.06*N;
    var color;
    var Ax = 1/(mx*ax);
    var Ay = -1/(mx*ay);

    if(count>0){
        var w = d/count;
        return function(px,py){
            var x = Ax*(px-px0);
            var y = Ay*(py-py0);
            var all = 1;
            var sum = 0;
            for(var kx=0; kx<=count; kx++){
                for(var ky=0; ky<=count; ky++){
                    var c = {re: x-offset+w*kx, im: y-offset+w*ky};
                    var z = z0(c);
                    var i = 0;
                    while(true){
                        z = f(z,c);
                        if(z.re*z.re+z.im*z.im>r2){
                            all = 0;
                            break;
                        }else if(i==N){
                            break;
                        }
                        i++;
                    }
                    sum+=i;
                }
            }
            if(all==1){
                rect(pset,black,px,py,n,n);
                return 1;
            }else{
                i = sum/((count+1)*(count+1));
                color = index_color(buffer,i);
                if(i>M){sink(color,i/N,a_sink);}
                rect(pset,color,px,py,n,n);
                return 0;
            }
        };
    }
    
    return function(px,py){
        var x = Ax*(px-px0);
        var y = Ay*(py-py0);
        var c = {re: x, im: y};
        var z = z0(c);
        var i = 0;
        while(true){
            z = f(z,c);
            if(z.re*z.re+z.im*z.im>r2){
                color = index_color(buffer,i);
                if(i>M){sink(color,i/N,a_sink);}
                rect(pset,color,px,py,n,n);
                return 0;
            }else if(i==N){
                rect(pset,black,px,py,n,n);
                return 1;
            }
            i++;
        }
    };
}

function plot_fractal_leaf(px0,py0,px1,py1,calc_rect){
    for(var px=px0; px<px1; px++){
        for(var py=py0; py<py1; py++){
            calc_rect(px,py);
        }
    }
}

function new_plot_fractal_rec(gx,f,n,pset,calc_rect,cond,pid,index,pid_stack){
    var m = 2*n;
    var color_inside = debug?[40,100,180]:[0,0,0];
    return async function plot_fractal_rec(px0,py0,W,H){
        var px1 = px0+W;
        var py1 = py0+H;
        var px,py;
        var all = 1;
        for(px=px0; px<px1; px+=n){
            all &= calc_rect(px,py0);
        }
        for(px=px0; px<px1; px+=n){
            all &= calc_rect(px,py1-n);
        }
        for(py=py0+n; py<py1-n; py+=n){
            all &= calc_rect(px0,py);
        }
        for(py=py0+n; py<py1-n; py+=n){
            all &= calc_rect(px1-n,py);
        }
        if(all==1){
            rect(pset,color_inside,px0+n,py0+n,W-m,H-m);
        }else{
            px0+=n; W-=m;
            py0+=n; H-=m;
            var W0 = n*Math.floor(W/(m));
            var H0 = n*Math.floor(H/(m));
            var mW = W%m;
            var mH = H%m;
            if(W0<4 || H0<4){
                plot_fractal_leaf(px0,py0,px0+W,py0+H,calc_rect);
            }else{
                plot_fractal_rec(px0,py0,W0,H0);
                plot_fractal_rec(px0+W0,py0,W0+mW,H0);
                plot_fractal_rec(px0,py0+H0,W0,H0+mH);
                plot_fractal_rec(px0+W0,py0+H0,W0+mW,H0+mH);
            }
        }
    };
}

async function plot_fractal_tree(gx,f,n,cond){
    var pset = gx.pset;
    var mx = gx.mx;
    var z0 = cftab["z0"];
    var N = Math.round(cftab["N"].re);
    var r2 = Math.pow(cftab["r"].re,2);
    var W = gx.w;
    var H = gx.h;
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);

    var calc_rect = new_calc_rect(gx,f,z0,mx,r2,pset,N,n);
    var plot_rec = new_plot_fractal_rec(gx,f,n,pset,calc_rect,cond,pid,index,pid_stack);

    busy = true;

    for(var py=0; py<H; py+=100){
        for(var px=0; px<W; px+=100){
            plot_rec(px,py,100,100);
            if(cond){await sleep(0);}
            if(cancel(pid,index,pid_stack)) return;
        }
    }
    submit(gx);
    busy = false;
}

async function plot_fractal_async(gx,f){
    if(gx.sync_mode==true){
        plot_fractal_tree(gx,f,1,false);
    }else if(refresh){
        plot_fractal_tree(gx,f,20,false);
    }else if(gx.animation){
        plot_fractal_tree(gx,f,10,false);
    }else{
        plot_fractal_tree(gx,f,4,false);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_fractal_tree(gx,f,1,true);
    }
}

function plot_node(gx,t,color){
    var f = ccompile(t,["z","c"]);
    plot_fractal_async(gx,f);
}
