

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node,gx,t,color);
    }else{
        infer_type(t);
        var f = ccompile(t,["x"]);
        var g = function(x){return f({re:x,im:0}).re;};
        plot_async(gx,g,color);
    }
}
