
var vec_min = 0.7;
var vec_scale = 0.3;
var stream = false;
var field_alpha = 178;
var field_density = 1;

function scale_vec(a){
    if(a==0){
        vec_min = 0.7;
        vec_scale = 0.3;
    }else{
        vec_min=0;
        vec_scale = a;
    }
}

function conf_stream(n,alpha,density){
    stream = n>0.5;
    if(alpha!=undefined){field_alpha = 255*alpha;}
    if(density!=undefined){field_density = density;}
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

function interpolate_color(ctab){
    var ctabr = ctab.map(function(t){return t[0];});
    var ctabg = ctab.map(function(t){return t[1];});
    var ctabb = ctab.map(function(t){return t[2];});
    var n = ctab.length;
    var d = 1/(n-1);
    var fr = pli(0,d,ctabr,ctabr[n-1]);
    var fg = pli(0,d,ctabg,ctabg[n-1]);
    var fb = pli(0,d,ctabb,ctabb[n-1]);
    return function(color,t){
        color[0] = fr(t);
        color[1] = fg(t);
        color[2] = fb(t);
    };
}

var ctab_original = [[120,160,220], [240,160,160]];
var ctab_stream = [[40,140,180],[200,0,140],[240,180,0]];

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

    var color = [0,0,0,field_alpha];
    var set_color = interpolate_color(ctab_stream);
    for(y=yshift-ycount; y<=yshift+ycount; y+=d){
        for(x=xshift-xcount; x<=xshift+xcount; x+=d){
            v = f(x/ax,y/ay);
            alpha = Math.tanh(0.1*Math.hypot(v[0],v[1]));
            set_color(color,alpha);
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

function new_lcg(seed){
    var m = 8388608, a=65793; b=4282663;
    var x = seed%m;
    return function(){
        x = (a*x+b)%m;
        return x/m;
    };
}

function shuffle(a,seed){
    var rng = new_lcg(seed);
    var i, j, h;
    for(i=a.length-1; i>0; i--){
        j = Math.floor(rng()*(i+1));
        h = a[i]; a[i] = a[j]; a[j] = h;
    }
}

function new_stream_line(gx,occupied,M,N,px0,py0,Ax,Ay,ds){
    var point = gx.spoint_alpha;
    var color = [0,0,0,field_alpha];
    var set_color = interpolate_color(ctab_stream);

    var xspace = 0.5/ax;
    var yspace = 0.5/ay;
    var slope = 0.1*freq;
    var buff = [];

    return function(f,x,y,counter,velocity){
        var lastx = x;
        var lasty = y;
        var first = true;
        var ghost = false;
        buff.length = 0;

        for(var k=0; k<2000; k++){
            var indexj = Math.round((px0+Ax*x)/ds);
            var indexi = Math.round((py0-Ay*y)/ds);
            var index = indexi*N+indexj;
            if(indexi<0 || indexi>=M) break;
            if(indexj<0 || indexj>=N) break; 
            
            var value = occupied[index];
            if(counter-value>1 && value>0){
                break;
            }else{
                occupied[index] = counter;
            }

            var v = f(x,y);
            var r = Math.hypot(v[0],v[1]);
            if(!Number.isFinite(r)) break;
            if(ghost && (Math.abs(x-lastx)>0.2*xspace || Math.abs(y-lasty)>0.2*yspace)){
                ghost = false;
            }
            if(!ghost){
                buff.push([r,x,y]);
            }

            if(Math.abs(x-lastx)>xspace || Math.abs(y-lasty)>yspace){
                for(var i=0; i<buff.length; i++){
                    var t = buff[i];
                    set_color(color,Math.tanh(slope*t[0]));
                    point(color,ax*t[1],ay*t[2]);
                }
                buff.length = 0;
                lastx = x;
                lasty = y;
                vector_head(gx,color,ax*x,ay*y,ax*v[0],ay*v[1],0.8);
                ghost = true;
                counter++;
            }

            var h = velocity/r;
            x += h*v[0];
            y += h*v[1];
        }
        return counter+1;
    };
}

function plot_stream(gx,f){
    var Ax = ax*gx.mx;
    var Ay = ay*gx.mx;
    var px0 = gx.px0 + 50;
    var py0 = gx.py0 + 50;

    var W = gx.w + 100;
    var H = gx.h + 100;
    var d = 20;
    var ds = 10/field_density;
    var m = Math.round(H/d);
    var n = Math.round(W/d);
    var M = Math.round(H/ds);
    var N = Math.round(W/ds);
    var occupied = Array(M*N).fill(0);

    var stream_line = new_stream_line(gx,occupied,M,N,px0,py0,Ax,Ay,ds);
    var counter = 1;
    var velocity = 0.02/Math.max(ax,ay);

    var permi = range(0,m-1);
    var permj = range(0,n-1);
    shuffle(permi,1);
    shuffle(permj,2);
    var rng = new_lcg(0);

    for(var i=0; i<m; i++){
        for(var j=0; j<n; j++){
            var x = (permj[j]*d-px0-20*rng())/Ax;
            var y = (py0+20*rng()-permi[i]*d)/Ay;
            counter = stream_line(f,x,y,counter,velocity);
        }
    }
    flush(gx);
    labels(gx);
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && (t[0]==="curve" || t[0]==="Kurve")){
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
        }else if(T==TypeMatrix){
            var f = compile(t,["x","y"]);
            var f0 = function(x,y){return f(x,y)[0];}
            var f1 = function(x,y){return f(x,y)[1];}
            plot_vector_field(gx,f0);
            plot_vector_field(gx,f1);
        }else{
            plot_node_basic(gx,t,color);
        }
    }
}

