
"use strict";

var tau = 2*Math.PI;
cftab["z0"] = function(c){return {re:0,im:0};};
cftab["N"] = {re:80,im:0};

function index_color(i){
    return hsl_to_rgb_u8(0,0.0,0.75+0.25*Math.cos(i/20));
}

async function plot_fractal(gx,f,n,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var W = gx.w;
    var H = gx.h;
    var px,py,x,y,z,c;
    var pset = gx.pset;
    var px0 = gx.px0;
    var py0 = gx.py0;
    var k = 0;
    var i;
    var r2 = 4;
    var N = Math.round(cftab["N"].re);
    var z0 = cftab["z0"];

    for(py=0; py<H; py+=n){
        for(px=0; px<W; px+=n){
            x = (px-px0)/gx.mx/ax;
            y = -(py-py0)/gx.mx/ay;
            c = {re: x, im: y};
            z = z0(c);
            i = 0;
            while(true){
                z = f(z,c);
                if(z.re*z.re+z.im*z.im>r2){
                    rect(pset,index_color(i),px,py,n,n);
                    break;
                }else if(i==N){
                    rect(pset,[0,0,0],px,py,n,n);
                    break;
                }
                i++;
            }
        }
        if(cond && k==10){
            k=0;
            await sleep(20);
        }else{
            k++;
        }
        if(cancel(pid,index,pid_stack)) return;
    }

    system(gx,true,0.02,0.2);
    flush(gx);
    labels(gx);
    busy = false;
}

async function plot_fractal_async(gx,f){
    if(gx.sync_mode==true){
        plot_fractal(gx,f,1,false);
    }else if(plot_refresh){
        plot_refresh = false;
        plot_fractal(gx,f,20,false);
    }else{
        plot_fractal(gx,f,4,false);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_fractal(gx,f,1,true);
    }
}

function plot_node(gx,t,color){
    var f = ccompile(t,["z","c"]);
    plot_fractal_async(gx,f);
}


