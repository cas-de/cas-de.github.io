
async function plot_zero_set_fast(gx,f,color){
    if(gx.sync_mode==true){
        plot_zero_set(gx,f,1,14,false,color);
    }else{
        if(gx.animation){
            plot_zero_set(gx,f,40,10,false,color);
            return;
        }
        plot_zero_set(gx,f,4,6,false,color);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_zero_set(gx,f,2,12,true,color);
    }
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node,gx,t,color);
    }else{
        infer_type(t);
        var f = ccompile(t,["z"]);
        var fim = function(x,y){return f({re:x,im:y}).im;};
        var fre = function(x,y){return f({re:x,im:y}).re;};
        var fabs = function(x,y){
            var r = cabs(f({re:x,im:y}));
            return mod(ld(r)-0.5,1)-0.5;
        }
        plot_zero_set_fast(gx,fim,color_table[0]);
        plot_zero_set_fast(gx,fre,color_table[1]);
        var cond = gx.sync_mode!=true;
        plot_zero_set(gx,fabs,2,12,cond,[180,180,180,255]);
    }
}
