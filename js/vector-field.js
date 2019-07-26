
var vec_min = 0.7;
var vec_scale = 0.3;
var stream = false;

function scale_vec(a){
    if(a==0){
        vec_min = 0.7;
        vec_scale = 0.3;
    }else{
        vec_min=0;
        vec_scale = a;
    }
}

function conf_stream(n){
    stream = n>0.5;
}

ftab["dyn"] = scale_vec;
ftab["stream"] = conf_stream;

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
    var a = 0.4*m;
    var b = 0.2*m;
    line(gx,color,x2,y2,x2-a*vx-b*vy,y2+a*vy-b*vx);
    line(gx,color,x2,y2,x2-a*vx+b*vy,y2+a*vy+b*vx);
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
            vector(gx,color,x,y,v[0],v[1],vec_min+vec_scale*alpha);
        }
    }
    flush(gx);
    labels(gx);
}

function vector_head(gx,color,x,y,vx,vy,L){
    var x1 = gx.px0+gx.mx*x;
    var y1 = gx.py0-gx.my*y;
    var m = L*20/Math.hypot(vx,vy);
    var a = 0.4*m;
    var b = 0.14*m;
    line(gx,color,x1,y1,x1-a*vx-b*vy,y1+a*vy-b*vx);
    line(gx,color,x1,y1,x1-a*vx+b*vy,y1+a*vy+b*vx);
}

function new_stream_line(gx,occupied,M,N,px0,py0,Ax,Ay,ds){
    var spoint = gx.spoint;
    var color0 = [120,160,220,255];
    var color1 = [240,160,160,255];
    var color = [180,200,220,255];

    var xspace = 2/ax;
    var yspace = 2/ay;
    return function(f,x,y,counter,velocity){
        var lastx = 0;
        var lasty = 0;
        for(var k=0; k<2000; k++){
            var indexj = Math.round((px0+Ax*x)/ds);
            var indexi = Math.round((py0-Ay*y)/ds);
            var index = indexi*N+indexj;
            if(indexi<0 || indexi>=M) break;
            if(indexj<0 || indexj>=N) break; 
            
            var value = occupied[index];
            if(value!=counter && value>0){
                break;
            }else{
                occupied[index] = counter;
            }

            var v = f(x,y);
            var r = Math.hypot(v[0],v[1]);
            if(!Number.isFinite(r)) break;

            var alpha = Math.tanh(0.1*r);
            color[0] = (1-alpha)*color0[0]+alpha*color1[0];
            color[1] = (1-alpha)*color0[1]+alpha*color1[1];
            color[2] = (1-alpha)*color0[2]+alpha*color1[2];

            spoint(color,ax*x,ay*y);
            if(Math.abs(x-lastx)>xspace || Math.abs(y-lasty)>yspace){
                lastx = x;
                lasty = y;
                vector_head(gx,color,ax*x,ay*y,v[0],v[1],0.8);
            }

            var h = velocity/r;
            x += h*v[0];
            y += h*v[1];
        }    
    };
}

function plot_stream(gx,f){
    var Ax = ax*gx.mx;
    var Ay = ay*gx.mx;
    var px0 = gx.px0;
    var py0 = gx.py0;

    var W = gx.w;
    var H = gx.h;
    var d = 20;
    var ds = 10;
    var m = Math.round(H/d);
    var n = Math.round(W/d);
    var M = Math.round(H/ds);
    var N = Math.round(W/ds);
    var occupied = Array(M*N).fill(0);

    var stream_line = new_stream_line(gx,occupied,M,N,px0,py0,Ax,Ay,ds);
    var counter = 1;
    var velocity = 0.02/ax;

    for(var i=0; i<m; i++){
        for(var j=0; j<n; j++){
            var x = (j*d-px0)/Ax;
            var y = (py0-i*d)/Ay;
            stream_line(f,x,y,counter,velocity);
            stream_line(f,x,y,counter,-velocity);
            counter++;
        }
    }
    flush(gx);
    labels(gx);
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && t[0]==="Kurve"){
        infer_type(t[1]);
        var f = compile(t[1],["t"]);
        vplot_async(gx,f,color);
    }else{
        var T = infer_type(t);
        if(T==TypeVector){
            var f = compile(t,["x","y"]);
            if(stream){
                plot_stream(gx,f);
            }else{
                plot_vector_field(gx,f);
            }
        }else{
            plot_node_basic(gx,t,color);
        }
    }
}

