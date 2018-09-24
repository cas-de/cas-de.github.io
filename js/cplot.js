

function plot_node(gx,t,color){
    var f = ccompile(t,["x"]);
    var g = function(x){return f({re:x,im:0}).re;};
    plot_async(gx,g,color);
}
