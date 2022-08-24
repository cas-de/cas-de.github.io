
var resolution = 1;

function set_resolution(x){
    resolution = x;
}
ftab["Auflösung"] = set_resolution;

async function plot_zero_set_fast(gx,f,color){
    var res = 2*resolution;
    if(gx.sync_mode==true){
        plot_zero_set(gx,f,res,14,false,color);
    }else{
        if(gx.animation){
            plot_zero_set(gx,f,40,10,false,color);
            return;
        }
        plot_zero_set(gx,f,4,6,false,color);
        while(busy){await sleep(40);}
        await sleep(40);
        plot_zero_set(gx,f,res,12,true,color);
    }
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node,t,gx,color);
    }else{
        infer_type(t);
        var f = ccompile(t,["z"]);
        var fim = function(x,y){
            var value = f({re:x,im:y}).im;
            return mod(value-0.5,1)-0.5;
        };
        var fre = function(x,y){
            var value = f({re:x,im:y}).re;
            return mod(value-0.5,1)-0.5;
        };
        plot_zero_set_fast(gx,fim,color_table[0]);
        plot_zero_set_fast(gx,fre,color_table[1]);
    }
}
