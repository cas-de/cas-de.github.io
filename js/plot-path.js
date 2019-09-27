
cftab["t0"] = complex(0,0);
cftab["t1"] = complex(2*Math.PI,0);

async function vcplot(gx,f,d,cond,color){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;
    var point = gx.point();
    var k=0;
    var t0 = cftab.t0.re;
    var t1 = cftab.t1.re;
    for(var t=t0; t<t1; t+=d){
        var z = f({re: t, im: 0});
        point(color,ax*z.re,ay*z.im);
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

async function vcplot_async(gx,f,color){
    while(busy) await sleep(40);
    vcplot(gx,f,0.001,false,color);
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node,gx,t,color);
    }else{
        var f = ccompile(t,["t"]);
        vcplot_async(gx,f,color);
    }
}

