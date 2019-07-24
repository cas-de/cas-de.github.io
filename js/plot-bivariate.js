
"use strict";

ftab["u0"] = 0;
ftab["u1"] = 2*Math.PI;
ftab["v0"] = 0;
ftab["v1"] = Math.PI;

ftab["w"] = set_w;
ftab["d"] = set_distance;
ftab["mesh"] = set_mesh;
ftab["tile"] = set_tile;
ftab["alpha"] = 0.94;
ftab["P"] = set_position;
ftab["colorfn"] = choose_color;

var TILE = 0;
var LINE = 1;
var LINE_SHADOW = 2;

var position = [0,0,0];
var new_colorfn = new_light_source;
var color_slope = 1;

sys_xyz.line_color = "#00000060";
sys_xyz.fill_color = "#000000a0";

function choose_color(n,slope){
    if(n==0){
        new_colorfn = new_light_source;
    }else if(n==1){
        new_colorfn = new_heat_map;
        if(slope!=undefined){
            color_slope = slope;
        }
    }
}

function set_position(x,y,z){
    if(y==undefined) y=0;
    if(z==undefined) z=0;
    position[0] = x;
    position[1] = y;
    position[2] = z;
    return [x,y,z];
}

function xyzscale_inc(){
    ax = scale_inc(xscale,ax);
    ay = scale_inc(yscale,ay);
    az = scale_inc(zscale,az);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function xyzscale_dec(){
    ax = scale_dec(xscale,ax);
    ay = scale_dec(yscale,ay);
    az = scale_dec(zscale,az);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function zscale_inc(){
    az = scale_inc(zscale,az);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function zscale_dec(){
    az = scale_dec(zscale,az);
    set_pos(graphics,graphics.pos);
    update(graphics);
}

function set_w(wx,wy){
    if(wy==undefined) wy=wx;
    grx = Array.isArray(wx)?wx:[-wx,wx];
    gry = Array.isArray(wy)?wy:[-wy,wy];
}

function set_mesh(sx,sy){
    if(sy==undefined) sy=sx;
    gstep = [sx,sy];
}

function set_tile(m){
    gtile = m;
}

var pftab = ftab;
var grx = [-10,10];
var gry = [-10,10];
var gstep = [1,1];
var gtile = 1;

var new_proj = new_proj_parallel;
var proj_distance = 100;

function float_re(x){
    return typeof x=="object"?x.re:x;
}

var theta_max = Math.atan(Math.sqrt(2));
var theta_min = theta_max-Math.PI;

function mouse_move_handler(e){
    if(e.buttons==1){
        refresh = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.phi += 0.004*dx;
        gx.theta = clamp(gx.theta+0.004*dy,theta_min,theta_max);
        clientXp = e.clientX;
        clientYp = e.clientY;
        update(gx);
    }else{
        clientXp = e.clientX;
        clientYp = e.clientY;
    }
}

function touch_move(e){
    if(e.touches.length!=0){
        e = e.touches[0];
        refresh = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.phi += 0.004*dx;
        gx.theta = clamp(gx.theta+0.004*dy,theta_min,theta_max);
        clientXp = e.clientX;
        clientYp = e.clientY;
        update(gx);
    }
}

function touch_start(e){
    if(e.touches.length!=0){
        e = e.touches[0];
        clientXp = e.clientX;
        clientYp = e.clientY;
    }
}

function new_system_xyz(last_gx){
    var canvas = document.getElementById("canvas1");
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    var gx = init(canvas,w,h);
    new_point(gx);
    if(last_gx==undefined){
        canvas.addEventListener("mousemove", mouse_move_handler, false);
        canvas.addEventListener("mouseup", mouse_up_handler, false);
        canvas.addEventListener("touchstart", touch_start, false);
        canvas.addEventListener("touchend", touch_end, false);
        canvas.addEventListener("touchmove", touch_move, false);
        gx.phi = 0.5*Math.PI;
        gx.theta = 0;
    }else{
        gx.phi = last_gx.phi;
        gx.theta = last_gx.theta;

    }
    return gx;
}

function component_to_hex(c) {
    var hex = c.toString(16);
    return hex.length==1 ? "0"+hex : hex;
}

function rgba_to_hex(r,g,b,a) {
    return ["#",
        component_to_hex(r),component_to_hex(g),
        component_to_hex(b),component_to_hex(a)
    ].join("");
}

function new_color_gradient(color_array){
    var a = color_array.slice();
    var d = 1/(a.length-1);
    var ar = a.map(function(t){return t[0];});
    var ag = a.map(function(t){return t[1];});
    var ab = a.map(function(t){return t[2];});
    var fr = pli(0,d,ar);
    var fg = pli(0,d,ag);
    var fb = pli(0,d,ab);
    return function(x,a){
        var R = Math.floor(255*fr(x));
        var G = Math.floor(255*fg(x));
        var B = Math.floor(255*fb(x));
        return rgba_to_hex(R,G,B,a);
    };
}

function new_heat_map(gx){
    var m = color_slope;
    var colormap = new_color_gradient([
        [0.1,0.1,0.3],[0,0.4,0.4],[1,0.9,0]
    ]);
    return function(tilet,alpha){
        var x = 0.5+m*0.1*(ax*tilet[6]-position[2]*az);
        var t = clamp(x,0,0.9999);
        return colormap(t,alpha);
    };
}

function draw_line(context,proj,x0,y0,z0,x1,y1,z1){
    var t0 = proj(x0,y0,z0);
    var t1 = proj(x1,y1,z1);
    context.beginPath();
    context.moveTo(t0[0],t0[1]);
    context.lineTo(t1[0],t1[1]);
    context.stroke();
}

function matrix_mul(){
    var Y = arguments[0];
    for(var i=1; i<arguments.length; i++){
        Y = mul_matrix_matrix(Y,arguments[i]);
    }
    return Y;
}

function matrix_Rx(t){
    return [
        [1,0,0],
        [0, Math.cos(t),Math.sin(t)],
        [0,-Math.sin(t),Math.cos(t)]
    ];
}

function matrix_Rz(t){
    return [
        [Math.cos(t),-Math.sin(t),0],
        [Math.sin(t), Math.cos(t),0],
        [0,0,1]
    ];
}

var gxt;
var gyt;

function new_proj_parallel(phi,theta,px0,py0,mx){
    var pi = Math.PI;
    var Rz = matrix_Rz(phi);
    var Rx = matrix_Rx(theta);
    var A = matrix_mul(matrix_Rz(-pi/4),Rx,matrix_Rz(pi/4),Rz);
    return function(x,y,z){
        var xt = A[0][0]*x+A[0][1]*y+A[0][2]*z;
        var yt = A[1][0]*x+A[1][1]*y+A[1][2]*z;
        var zt = A[2][0]*x+A[2][1]*y+A[2][2]*z;
        gxt = xt; gyt = yt;
        return [px0+mx*(yt-xt),py0-mx*(zt-0.5*xt-0.5*yt)];
    };
}

function new_proj_perspective(phi,theta,px0,py0,mx){
    var pi = Math.PI;
    var Rz = matrix_Rz(phi+pi/4);
    var Rx = matrix_Rx(theta+pi/6);
    var A = matrix_mul(Rx,Rz);
    var r = proj_distance/ax;
    return function(x,y,z){
        var xt = A[0][0]*x+A[0][1]*y+A[0][2]*z;
        var yt = A[1][0]*x+A[1][1]*y+A[1][2]*z;
        var zt = A[2][0]*x+A[2][1]*y+A[2][2]*z;
        gxt=yt; gyt=0;
        var a = yt<r?r/(r-yt):NaN;
        return [px0+mx*(-xt*a),py0-mx*(zt*a)];
    };
}

function set_distance(x){
    if(x==0){
        new_proj = new_proj_parallel;
        theta_max = Math.atan(Math.sqrt(2));
    }else{
        new_proj = new_proj_perspective;
        proj_distance = x;
        theta_max = Math.PI/2-Math.PI/6;
    }
    theta_min = theta_max-Math.PI;
    return x;
}

function new_puts(context,proj,m){
    return function(s,x,y,z){
        var p = proj(m*x,m*y,m*z);
        context.fillText(s,p[0],p[1]);
    };
}

function new_draw_line(context,proj,m){
    return function(x0,y0,z0,x1,y1,z1){
        draw_line(context,proj,m*x0,m*y0,m*z0,m*x1,m*y1,m*z1);
    }
}

function get_mx(gx){
    return Math.min(gx.w/46,gx.h/32);
}

function labels(gx,proj,ax,position){
    var context = gx.context;
    var px0 = Math.floor(gx.w/2);
    var py0 = Math.floor(gx.h/2);
    var s;
    context.textAlign = "center";
    var mx = get_mx(gx);
    var puts = new_puts(context,proj,1/ax);
    var line = new_draw_line(context,proj,1/ax);

    var x0 = position[0];
    var y0 = position[1];
    var z0 = position[2];

    for(var x=-8; x<=8; x+=2){
        s = ftos_strip(x0+x/ax,ax);
        puts(s,x,-11,-0.5);
        line(x,-10,0,x,-10.4,0);
    }
    for(var y=-8; y<=8; y+=2){
        s = ftos_strip(y0+y/ay,ay);
        puts(s,-11,y,-0.5);
        line(-10,y,0,-10.4,y,0);
    }
    for(var z=2; z<10; z+=2){
        s = ftos_strip(z0+z/az,az);
        puts(s,-10.5,-10.5,z);
        line(-10,-10,z,-10.2,-10.2,z);
    }
    puts("x",10,-11,-0.5);
    puts("y",-11,10,-0.5);
}

function normalize(v){
    var r = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
    return [v[0]/r,v[1]/r,v[2]/r];
}

function rot(phi,v){
    var c = Math.cos(phi);
    var s = Math.sin(phi);
    return [c*v[0]-s*v[1],s*v[0]+c*v[1],v[2]];
}

var color_gradient_table = [
    [[0.4,0.7,0.64],[0.4,0.7,0.62],[0.5,0.7,0.6],
     [0.8,0.7,0.4],[1,0.76,0],[1,0.96,0.5]],
    [[0.6,0.3,0.5],[0.5,0.8,0.9],[0.94,0.98,1]],
    [[0.2,0.1,0.3],[0.8,0.6,0.5],[0.9,0.9,0.8]],
    [[0.04,0.2,0.3],[0.5,0.7,0.6],[1,1,0.9]]
];

function new_light_source(gx){
    var phi = gx.phi;
    var w = [1,0,0.8];
    var gradient = color_gradient_table.map(new_color_gradient);
    w = normalize(rot(0.5*Math.PI-phi,w));
    return function(t,a){
        var v = t[9];
        var vv = v[0]*v[0]+v[1]*v[1]+v[2]*v[2];
        var s = (v[0]*w[0]+v[1]*w[1]+v[2]*w[2])/Math.sqrt(vv);
        return gradient[t[10]](0.5*s+0.5,a);
    };
}

function buffer_draw_line(context,t){
    var p0 = t[2];
    var p1 = t[3];
    if(t[0]==LINE){
        context.strokeStyle = "#406ab0";
    }else{
        context.strokeStyle = "#a0a0a0";
    }
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(p0[0],p0[1]);
    context.lineTo(p1[0],p1[1]);
    context.stroke();
}

function flush_tile_buffer(gx,alpha,lw){
    var a = gx.tile_buffer;
    var context = gx.context;
    var t,p0,p1,p2,p3;

    a.sort(function(x,y){
        return y[1]-x[1];
    });

    var colorfn = new_colorfn(gx);

    context.lineWidth = 1;
    context.fillStyle = "#d0d0d0b0";
    var line_color = "#0000004a";
    var color;
    for(var i=0; i<a.length; i++){
        t = a[i];
        if(t[0]!=TILE){
            buffer_draw_line(context,t);
            continue;
        }
        p0 = t[2]; p1 = t[3]; p2 = t[4]; p3 = t[5];
        color = colorfn(t,alpha);
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(p0[0],p0[1]);
        context.lineTo(p1[0],p1[1]);
        context.lineTo(p2[0],p2[1]);
        context.lineTo(p3[0],p3[1]);
        context.fill();

        if(t[7]){
            context.lineWidth = lw;
            context.strokeStyle = line_color;
        }else{
            context.lineWidth = 1;
            context.strokeStyle = color;
        }
        context.beginPath();
        context.moveTo(p0[0],p0[1]);
        context.lineTo(p1[0],p1[1]);
        context.stroke();

        if(t[8]){
            context.lineWidth = lw;
            context.strokeStyle = line_color;
        }else{
            context.lineWidth = 1;
            context.strokeStyle = color;
        }
        context.beginPath();
        context.moveTo(p1[0],p1[1]);
        context.lineTo(p2[0],p2[1]);
        context.stroke();
    }
}

function system_xyz(gx){
    if(sys_mode==0) return;
    var context = gx.context;
    var proj = gx.proj;
    var wx = 10/ax;

    context.strokeStyle = sys_xyz.line_color;
    context.fillStyle = sys_xyz.fill_color;
    context.lineWidth = 4;

    // The lines are split into parts so that only the nearest
    // parts are affected when proj returns NaN.
    var h = 2*wx/10;
    for(var k=0; k<10; k++){
        draw_line(context,proj,k*h-wx,-wx,0,(k+1)*h-wx,-wx,0);
        draw_line(context,proj,-wx,k*h-wx,0,-wx,(k+1)*h-wx,0);
    }
    for(var k=0; k<5; k++){
        draw_line(context,proj,-wx,-wx,k*h,-wx,-wx,(k+1)*h);
    }
    context.lineWidth = 2;
    labels(gx,proj,ax,position);
}

function mesh_cond(x){
    return Math.abs(x-Math.floor(x+0.5))<0.001;
}

function plot_sf(gx,f,index,d,xstep,ystep){
    index = index % color_gradient_table.length;
    var x,y,z00,z01,z10,z11,u,v,e;
    var p0,p1,p2,p3;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var dx = d/ax;
    var dy = d/ay;
    var u0 = grx[0]/ax;
    var u1 = grx[1]/ax-0.01*dx;
    var v0 = gry[0]/ay;
    var v1 = gry[1]/ay-0.01*dy;
    var mz = az/ax;
    
    var x0 = position[0];
    var y0 = position[1];
    var z0 = position[2]*mz;

    var a = gx.tile_buffer;
    var kx = 0;
    for(u = u0; u<u1; u+=dx){
        var ky = 1;
        for(v = v0; v<v1; v+=dy){
            x = x0+u;
            y = y0+v;
            z00 = mz*f(x,y);
            z01 = mz*f(x,y+dy);
            z11 = mz*f(x+dx,y+dy);
            z10 = mz*f(x+dx,y);
            p0 = proj(u,v,z00-z0);
            p1 = proj(u,v+dy,z01-z0);
            p2 = proj(u+dx,v+dy,z11-z0);
            p3 = proj(u+dx,v,z10-z0);
            e = [dy*(z00-z10),dx*(z00-z01),dx*dy];
            a.push([TILE,s*v-c*u,p0,p1,p2,p3,z00,
                mesh_cond(kx/xstep),mesh_cond(ky/ystep),e,index]);
            ky++;
        }
        kx++;
    }
}

function vector_product(vx,vy,vz,wx,wy,wz){
    return [vy*wz-vz*wy, vz*wx-vx*wz, vx*wy-vy*wx];
}

function exterior_product(ax,ay,bx,by){
    return ax*by-bx*ay;
}

function plot_psf(gx,f,index,d,ustep,vstep){
    index = index % color_gradient_table.length;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var du = 0.25*d;
    var dv = 0.25*d;
    var wx = 10/ax;
    var wy = 10/ay;
    var mz = az/ax;
    var u0 = ftab["u0"];
    var u1 = ftab["u1"];
    var v0 = ftab["v0"];
    var v1 = ftab["v1"];
    
    var x0 = position[0];
    var y0 = position[1];
    var z0 = position[2]*mz;

    var a = gx.tile_buffer;
    var u,v,p00,p01,p10,p11,e;
    var p0,p1,p2,p3;

    var ku = 0;
    for(u = u0; u<u1; u+=du){
        var kv = 1;
        for(v = v0; v<v1; v+=dv){
            p00 = f(u,v);
            p01 = f(u,v+dv);
            p11 = f(u+du,v+dv);
            p10 = f(u+du,v);
            p00[2]*=mz; p01[2]*=mz; p11[2]*=mz; p10[2]*=mz;
            p0 = proj(p00[0]-x0,p00[1]-y0,p00[2]-z0);
            p1 = proj(p01[0]-x0,p01[1]-y0,p01[2]-z0);
            p2 = proj(p11[0]-x0,p11[1]-y0,p11[2]-z0);
            p3 = proj(p10[0]-x0,p10[1]-y0,p10[2]-z0);

            e = vector_product(
                p10[0]-p00[0],p10[1]-p00[1],p10[2]-p00[2],
                p01[0]-p00[0],p01[1]-p00[1],p01[2]-p00[2]
            );
            var sign = Math.sign(exterior_product(
                p1[0]-p0[0], p1[1]-p0[1],
                p3[0]-p0[0], p3[1]-p0[1]
            ));
            e[0] = sign*e[0];
            e[1] = sign*e[1];
            e[2] = sign*e[2];

            a.push([TILE,-gxt-gyt,p0,p1,p2,p3,p00[2],
                mesh_cond(ku/ustep),mesh_cond(kv/vstep),e,index]);
            kv++;
        }
        ku++;
    }
}

function plot_curve(gx,f){
    var proj = gx.proj;
    var a = gx.tile_buffer;
    var t0 = ftab["t0"];
    var t1 = ftab["t1"];
    var mz = az/ax;
    var p1 = undefined;
    for(var t=t0; t<t1; t+=0.01){
        var v = f(t);
        var p0 = proj(v[0],v[1],mz*v[2]);
        if(p1!=undefined){
            a.push([LINE,-1000,p0,p1]);
        }
        p1 = p0;
    }
    p1 = undefined;
    for(var t=t0; t<t1; t+=0.01){
        var v = f(t);
        var p0 = proj(v[0],v[1],0);
        if(p1!=undefined){
            a.push([LINE_SHADOW,1000,p0,p1]);
        }
        p1 = p0;
    }
}

function zeroes_fast(f,ta,tb,dt,N){
    var state = undefined;
    var buffer = [];
    for(var t=ta; t<tb; t+=dt){
        var z = f(t)<0;
        if(z!=state){
            if(state!=undefined){
                var t0 = bisection_fast(N,state,f,t-dt,t+dt);
                if(Math.abs(f(t0))<0.01){
                    buffer.push(t0);
                }
            }
            state = z;
        }
    }
    return buffer;
}

function buffer_zip(a,b,epsilon){
    var len = a.length;
    var buffer = [];
    for(var i=0; i<len; i++){
        var ai = a[i];
        var j0 = Math.max(0,i-4);
        var j1 = Math.min(i+4,b.length-1);
        var jmin = j0;
        var dmin = Math.abs(ai-b[jmin]);
        for(var j=j0+1; j<=j1; j++){
            var d = Math.abs(ai-b[j]);
            if(d<dmin){
                jmin = j;
                dmin = d;
            }
        }
        if(dmin<epsilon){
            buffer.push([ai,b[jmin]]);
        }
    }
    return buffer;
}

async function plot_level_set(gx,f,z0,n,d,N,epsilon,cond){
    var pid = {};
    var index = pid_stack.length;
    pid_stack.push(pid);
    busy = true;

    var p0,p1,t,x,y,z;
    var dx = d/ax;
    var dy = d/ay;
    var dt = 1/(n*ax);
    var xa = grx[0]/ax;
    var xb = grx[1]/ax;
    var ya = gry[0]/ay;
    var yb = gry[1]/ay;
    var mz = az/ax;
    var mz0 = mz*z0;

    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var k=0;
    var g,a0,a1,a;
    var tile_buffer = gx.tile_buffer;
    var proj = gx.proj;

    g = function(x){return f(x,ya)-z0;};
    a0 = zeroes_fast(g,xa,xb,dt,N);
    for(y=ya; y<yb; y+=dy){
        g = function(x){return f(x,y+dy)-z0;};
        a1 = zeroes_fast(g,xa,xb,dt,N);
        a = buffer_zip(a0,a1,epsilon);
        a0 = a1;
        for(var i=0; i<a.length; i++){
            t = a[i];
            p0 = proj(t[0],y,mz0);
            p1 = proj(t[1],y+dy,mz0);
            tile_buffer.push([LINE,s*y-c*t[0]-0.6,p0,p1]);
        }
        if(cond && k%100==0){
            await sleep(20);
        }
        if(cancel(pid,index,pid_stack)) return;
        k++;
    }

    g = function(y){return f(xa,y)-z0;};
    a0 = zeroes_fast(g,ya,yb,dt,N);
    for(x=xa; x<xb; x+=dx){
        g = function(y){return f(x+dx,y)-z0;};
        a1 = zeroes_fast(g,ya,yb,dt,N);
        a = buffer_zip(a0,a1,epsilon);
        a0 = a1;
        for(var i=0; i<a.length; i++){
            t = a[i];
            p0 = proj(x,t[0],mz0);
            p1 = proj(x+dx,t[1],mz0);
            tile_buffer.push([LINE,s*t[0]-c*x-0.6,p0,p1]);
        }
        if(cond && k%100==0){
            await sleep(20);
        }
        if(cancel(pid,index,pid_stack)) return;
        k++;
    }
    busy = false;
}

function plot_node_bivariate(gx,t,index){
    var m = gtile;
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node_bivariate,gx,t,index);
    }else if(Array.isArray(t) && t[0]==="="){
        var f = compile(t[1],["x","y"]);
        var z0 = compile(t[2],[])();
        if(refresh){
            plot_level_set(gx,f,z0,1,0.4,12,0.4,false);
        }else{
            plot_level_set(gx,f,z0,10,0.1,12,0.2,false);
        }
    }else{
        var T = infer_type(t);
        if(T==TypeVector){
            if(contains_variable(t,"t")){
                var f = compile(t,["t"]);
                plot_curve(gx,f);
            }else{
                var f = compile(t,["u","v"]);
                if(refresh || gx.animation){
                    plot_psf(gx,f,index,1,1,1);
                }else{
                    plot_psf(gx,f,index,m*0.5,gstep[0]*2/m,gstep[1]*2/m);
                }
            }
        }else{
            var f = compile(t,["x","y"]);
            if(refresh){
                plot_sf(gx,f,index,1,1,1);
            }else if(gx.animation){
                plot_sf(gx,f,index,1,1,1);
            }else{
                plot_sf(gx,f,index,m*0.25,gstep[0]*4/m,gstep[1]*4/m);
            }
        }
    }
}

function plot_node(gx,t,index){
    plot_node_bivariate(gx,t,index);
}

function plot_node_relief(gx,t,index){
    var fc = ccompile(t,["z"]);
    var f = function(x,y){
        return fc({re: x, im: y}).re;
    };
    pftab = cftab;
    var m = gtile;
    if(refresh || gx.animation){
        plot_sf(gx,f,index,1,1,1);
    }else{
        plot_sf(gx,f,index,m*0.25,gstep[0]*4/m,gstep[1]*4/m);
    }
}

function plot(gx){
    var input = get_value("inputf").trim();
    var a = input.split(";;");
    process_statements(a);
    var t;
    if(a[0].length>0){
        t = ast(a[0]);
        if(Array.isArray(t) && t[0]===";"){
            for(var i=t.length-1; i>=2; i--){
                eval_statements(t[i]);
            }
            t = t[1];
        }
    }

    pid_stack = [];

    clear(gx,gx.color_bg);
    flush(gx);

    var mx = ax*get_mx(gx);
    gx.px0 = Math.floor(gx.w/2);
    gx.py0 = Math.floor(gx.h/2);
    gx.proj = new_proj(gx.phi,gx.theta,gx.px0,gx.py0,mx);
    gx.tile_buffer = [];
    
    if(a[0].length>0){
        if(Array.isArray(t) && t[0]==="block"){
            for(var i=1; i<t.length; i++){
                if(Array.isArray(t[i]) && t[i][0]===":="){
                    global_definition(t[i]);
                }else{
                    plot_node(gx,t[i],i-1);
                }
            }
        }else{
            if(Array.isArray(t) && t[0]===":="){
                global_definition(t);
            }else{
                plot_node(gx,t,0);
            }
        }
    }

    var lw = gtile<0.4?(gtile<0.15?2.4:1.8):1.4;
    var alpha = Math.round(float_re(pftab["alpha"])*255);
    flush_tile_buffer(gx,alpha,lw);
    system_xyz(gx);
}

function plot_img(w,h){
    if(w==undefined) w = 360;
    if(h==undefined) h = Math.round(w/1.5);
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var gx = init(canvas,w,h);
    new_point(gx);
    gx.sync_mode = true;
    gx.phi = graphics.phi;
    gx.theta = graphics.theta;

    var last_gx = graphics;
    graphics = gx;
    update(gx);
    graphics = last_gx;
    var s = canvas.toDataURL("image/jpeg");
    var img = "<img align=\"top\" src=\""+s+"\"/>";
    return img;
}
ftab["img"] = plot_img;

function main(){
    var gx = new_system_xyz(graphics);
    graphics = gx;
    update(gx);
}

window.onload = function(){
    var gx = new_system_xyz();
    graphics = gx;
    query(window.location.href);
    main();
};

