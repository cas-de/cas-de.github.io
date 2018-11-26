
function line(gx,color,x1,y1,x2,y2){
    var x,y;
    var d = 1/Math.hypot(x2-x1,y2-y1);
    for(var t=0; t<1; t+=d){
        x = x1+t*(x2-x1);
        y = y1+t*(y2-y1);
        gx.fpsets(color[3],color,x,y);
    }
}

function vector(gx,color,x,y,vx,vy,L){
    var x1 = gx.px0+gx.mx*x;
    var y1 = gx.py0-gx.my*y;
    var m = L*20/Math.hypot(vx,vy);
    var x2 = x1+m*vx;
    var y2 = y1-m*vy;
    line(gx,color,x1,y1,x2,y2);
    var a = 0.6*m;
    var b = 0.2*m;
    line(gx,color,x2,y2,x1+a*vx-b*vy,y1-a*vy-b*vx);
    line(gx,color,x2,y2,x1+a*vx+b*vy,y1-a*vy+b*vx);
}

function plot_vector_field(gx,f){
    var x,y,v,i,j,alpha;
    var mx = gx.mx;
    var my = gx.my;

    var px0 = gx.px0;
    var py0 = gx.py0;
    var xcount = Math.ceil(0.5*gx.w/gx.mx)+1;
    var ycount = Math.ceil(0.5*gx.h/gx.mx)+1;
    var xshift = Math.round((0.5*gx.w-px0)/gx.mx);
    var yshift = -Math.round((0.5*gx.h-py0)/gx.mx);
    var d = 0.5;

    var color0 = [0,80,160,120];
    var color1 = [160,0,0,160];
    var color = [0,0,0,0];
    for(y=yshift-ycount; y<=yshift+ycount; y+=d){
        for(x=xshift-xcount; x<=xshift+xcount; x+=d){
            v = f(x/ax,y/ay);
            alpha = Math.tanh(0.1*Math.hypot(v[0],v[1]));
            color[0] = (1-alpha)*color0[0]+alpha*color1[0];
            color[1] = (1-alpha)*color0[1]+alpha*color1[1];
            color[2] = (1-alpha)*color0[2]+alpha*color1[2];
            color[3] = (1-alpha)*color0[3]+alpha*color1[3];
            vector(gx,color,x,y,v[0],v[1],0.7+0.3*alpha);
        }
    }
    flush(gx);
    labels(gx);
}

function plot_node(gx,t,color){
    var T = infer_type(t);
    if(T==TypeVector){
        var f = compile(t,["x","y"]);
        plot_vector_field(gx,f);
    }else{
        plot_node_basic(gx,t,color);
    }
}
