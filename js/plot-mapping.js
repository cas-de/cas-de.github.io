
function move_refresh(gx){
    update(gx);
}

async function plot_net(gx,f,d,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var x,y,z;
    var wx = 10;
    var wy = 10;
    var m = 1;
    var x,y,w;
    var color1 = [0,0,160];
    var color2 = [140,0,140];
    var point = gx.spoint;

    for(y=-wy; y<=wy; y+=1){
        for(x=-wx; x<wx; x+=d){
            z = {re: m*x, im: m*y};
            w = f(z);
            point(color1,ax*w.re,ay*w.im);
        }
        if(cond){
            await sleep(0);
        }
        if(cancel(pid,index,pid_stack)) return;
    }
    for(x=-wx; x<=wx; x+=1){
        for(y=-wy; y<wy; y+=d){
            z = {re: m*x, im: m*y};
            w = f(z);
            point(color2,ax*w.re,ay*w.im);
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
    }else if(refresh || gx.animation){
        plot_refresh = false;
        plot_net(gx,f,0.1,false);
    }else{
        plot_net(gx,f,0.02,false);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_net(gx,f,0.004,true);
    }
}

function plot_node(gx,t,color){
    var f = ccompile(t,["z"]);
    plot_net_async(gx,f);
}

