
"use strict";

color_dark_axes = [80,80,80];
dark = true;

function move_refresh(gx){
    update(gx);
}

var tau = 2*Math.PI;
cftab["N"] = {re:40,im:0};
cftab["r"] = {re:10,im:0};
cftab["L"] = {re:1,im:0};
cftab["z0"] = function(c){return c;}

function submit(gx){
    system(gx,0.02,0.2);
    flush(gx);
    labels(gx);
}

function index_color(z,a,N,i){
    var phi = carg_positive(z);
    var x = a*i;
    return hsl_to_rgb_u8(phi,0.4,1/(x*x*x+1));
}

async function newton_fractal(gx,f,n,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var W = gx.w;
    var H = gx.h;
    var px,py,x,y,z,zp,c;
    var pset = gx.pset;
    var px0 = gx.px0;
    var py0 = gx.py0;
    var k = 0;
    var i;
    var N = Math.round(cftab["N"].re);
    var z0 = cftab["z0"];
    var ep = 1E-8;
    var Ax = 1/(gx.mx*ax);
    var Ay = -1/(gx.mx*ay);
    var L = 1/(12*cftab["L"].re);

    for(py=0; py<H; py+=n){
        for(px=0; px<W; px+=n){
            x = Ax*(px-px0);
            y = Ay*(py-py0);
            c = {re: x, im: y};
            z = z0(c);
            i = 0;
            while(i<N){
                zp = z;
                z = f(z,c);
                if(Math.abs(zp.re-z.re)<ep && Math.abs(zp.im-z.im)<ep){
                    break;
                }
                i++;
            }
            rect(pset,index_color(z,L,N,i),px,py,n,n);
        }
        if(cond && k==4){
            k=0;
            await sleep(0);
        }else{
            k++;
        }
        if(cancel(pid,index,pid_stack)) return;
    }

    submit(gx);
    busy = false;
}

async function plot_fractal_async(gx,f){
    if(gx.sync_mode==true){
        newton_fractal(gx,f,1,false);
    }else if(refresh){
        newton_fractal(gx,f,20,false);
    }else if(gx.animation){
        newton_fractal(gx,f,10,false);
    }else{
        newton_fractal(gx,f,4,false);
        while(busy){await sleep(40);}
        await sleep(40);
        newton_fractal(gx,f,2,true);
    }
}

function plot_node(gx,t,color){
    var f = ccompile(t,["z","c"]);
    plot_fractal_async(gx,f);
}


