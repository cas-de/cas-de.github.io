
// Functionality, superseded or currently not used.

// =====================================
// Graphing a real function, replaced by
// a recursive algorithm.

async function fplot(gx,f,d,cond,color){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;
    var point = gx.point();
    var wx = 0.5*gx.w/(gx.mx*ax);
    var wy = 0.5*(gx.h+4)/(gx.mx*ay);
    var x0 = (0.5*gx.w-gx.px0)/(gx.mx*ax);
    var y0 = (gx.py0-0.5*gx.h)/(gx.mx*ay);
    var ya = y0-wy;
    var yb = y0+wy;
    var k=0;
    d = d/ax;
    for(var x=x0-wx; x<x0+wx; x+=d){
        var y = f(x);
        if(ya<y && y<yb){
            point(color,ax*x,ay*y);
        }
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
        fplot(gx,f,0.0002,false,color);
    }else{
        fplot(gx,f,0.01,false,color);
        if(gx.animation) return;
        while(busy){await sleep(40);}
        await sleep(40);
        fplot(gx,f,0.001,true,color);
        fplot(gx,f,0.0001,true,color);
    }
}


// ===============================
// Graphing a fractal, replaced by
// a recursive algorithm.

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
    var r2 = Math.pow(cftab["r"].re,2);
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

    submit(gx);
    busy = false;
}

async function plot_fractal_async(gx,f){
    if(gx.sync_mode==true){
        plot_fractal(gx,f,1,false);
    }else if(refresh){
        plot_refresh = false;
        plot_fractal(gx,f,20,false);
    }else{
        plot_fractal(gx,f,4,false);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_fractal(gx,f,1,true);
    }
}

