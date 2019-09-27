
ftab["u0"] = -10;
ftab["u1"] = 10;
ftab["v0"] = -10;
ftab["v1"] = 10;

function move_refresh(gx){
    update(gx);
}

async function plot_net(gx,f,d,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var x,y,w,v;
    var u0 = ftab.u0;
    var v0 = ftab.v0;
    var u1 = ftab.u1;
    var v1 = ftab.v1;
    var xstep = Math.abs(u1-u0)/20;
    var ystep = Math.abs(v1-v0)/20;
    u1 = u1+1E-8;
    v1 = v1+1E-8;
    var m = 1;
    var color1 = [0,0,160];
    var color2 = [140,0,140];
    var point = gx.point();

    for(y=v0; y<=v1; y+=ystep){
        for(x=u0; x<u1; x+=d){
            v = f(m*x,m*y);
            point(color1,ax*v[0],ay*v[1]);
        }
        if(cond){
            await sleep(0);
        }
        if(cancel(pid,index,pid_stack)) return;
    }
    for(x=u0; x<=u1; x+=xstep){
        for(y=v0; y<v1; y+=d){
            v = f(m*x,m*y);
            point(color2,ax*v[0],ay*v[1]);
        }
        if(cond){
            await sleep(0);
        }
        if(cancel(pid,index,pid_stack)) return;
    }

    system(gx,0.02,0.2);
    flush(gx);
    labels(gx);
    busy = false;
}

async function plot_net_async(gx,f){
    if(gx.sync_mode==true){
        plot_net(gx,f,0.002,false);
    }else if(refresh){
        plot_net(gx,f,0.1,false);
    }else{
        plot_net(gx,f,0.02,false);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_net(gx,f,0.004,true);
    }
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="Kurve"){
        infer_type(t[1]);
        var f = compile(t[1],["t"]);
        vplot_async(gx,f,color);
    }else{
        var T = infer_type(t);
        if(T===TypeVector){
            var f = compile(t,["u","v"]);
            plot_net_async(gx,f);
        }else{
            plot_node_basic(gx,t,color);
        }
    }
}


