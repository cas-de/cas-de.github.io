
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
ftab["color"] = choose_color;
ftab["isoconf"] = iso_config;
ftab["shadow"] = 1;
ftab["border"] = conf_border;
ftab["axis"] = conf_axis;
ftab["zaxis"] = conf_zaxis;

var TILE = 0;
var LINE = 1;
var LINE_SHADOW = 2;
var BORDER = 3;

var position = [0,0,0];
var new_colorfn = new_light_source;
var color_slope = function(x){return x;};
var ctab_heat_index = 0;
var iso_dist = 1;
var iso_ep = 1;
var mesh_width = undefined;
var mesh_border = [0,0];
var axis_position = [-1,-1,0];
var axis_scale = 0.9;
var zaxis_xy = [-1,-1];

var ctab_heat = [
[[0.27,0,0.33],[0.25,0.27,0.53],[0.16,0.47,0.56],
[0.13,0.66,0.52],[0.48,0.82,0.32],[0.99,0.91,0.14]],
[[0,0,0.01],[0.26,0.04,0.41],[0.58,0.15,0.4],
[0.87,0.32,0.23],[0.99,0.65,0.04],[0.99,1.0,0.64]],
[[0.05,0.03,0.53],[0.42,0.0,0.66],[0.69,0.17,0.56],
[0.88,0.39,0.38],[0.99,0.65,0.21],[0.94,0.98,0.13]],
[[0,0,0],[1,1,1]]
];

sys_xyz.line_color = "#00000060";
sys_xyz.fill_color = "#000000a0";

function choose_color(n,slope){
    if(n==0){
        new_colorfn = new_light_source;
    }else if(n>0){
        new_colorfn = new_heat_map;
        ctab_heat_index = n-1;
        if(slope!=undefined){
            if(typeof slope == "number"){
                color_slope = function(x){return slope*x;};
            }else{
                color_slope = slope;
            }
        }
    }
}

function iso_config(dist,ep){
    iso_dist = dist; iso_ep = ep;
}

function conf_border(lu,lv){
    mesh_border = [lu,lv];
}

function conf_axis(y,z){
    axis_position[1] = y;
    axis_position[2] = z==undefined?0:z;
}

function conf_zaxis(x,y){
    zaxis_xy[0]=x; zaxis_xy[1]=y;
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

function set_mesh(sx,sy,lw){
    if(sy==undefined) sy=sx;
    gstep = [sx,sy];
    if(lw!=undefined) mesh_width = lw;
}

function set_tile(mx,my){
    gtile = my==undefined?[mx,mx]:[mx,my];
}

var pftab = ftab;
var grx = [-10,10];
var gry = [-10,10];
var gstep = [1,1];
var gtile = [1,1];

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
    var slope = color_slope;
    var colormap = new_color_gradient(ctab_heat[ctab_heat_index]);
    return function(tilet,alpha){
        var x = 0.5+slope(0.1*(ax*tilet[6]-position[2]*az));
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

function set_distance(x,scale){
    if(x==0){
        new_proj = new_proj_parallel;
        theta_max = Math.atan(Math.sqrt(2));
    }else{
        new_proj = new_proj_perspective;
        proj_distance = x;
        theta_max = Math.PI/2-Math.PI/6;
    }
    theta_min = theta_max-Math.PI;
    if(scale!=undefined) axis_scale = scale;
    return x;
}

function new_puts(context,proj,m){
    return function(s,x,y,z,sx,sy){
        var p = proj(m*x,m*y,m*z);
        context.fillText(s,sx+p[0],sy+p[1]);
    };
}

function new_draw_line(context,proj,m){
    return function(x0,y0,z0,x1,y1,z1){
        draw_line(context,proj,m*x0,m*y0,m*z0,m*x1,m*y1,m*z1);
    }
}

function get_mx(gx){
    return axis_scale*Math.min(gx.w/46,gx.h/32);
}

function size_fn(x){
    var y = x*x+1;
    return Math.round(16-14/(y*y));
}

function down_shift_fn(x){
    var y = 0.5*(1-Math.cos(2*x));
    y = y*y;
    return y*y;
}

function labels(gx,proj,ax,position){
    var context = gx.context;
    var px0 = Math.floor(gx.w/2);
    var py0 = Math.floor(gx.h/2);
    var s;
    var mx = get_mx(gx);
    set_font_size(gx,size_fn(0.12*mx));

    var puts = new_puts(context,proj,1/ax);
    var line = new_draw_line(context,proj,1/ax);
    var py = axis_position[1];
    var pz = 2*axis_position[2];

    var x0 = position[0];
    var y0 = position[1];
    var z0 = position[2];

    var sf = 20.5/mx;
    var d = 1.0*sf;
    var spy = py<0?-1:1;
    var phi = 360*mod(gx.phi/(2*Math.PI),1);
    var down_shift = 0.4*down_shift_fn(gx.theta-theta_max);

    var align_sgn;
    if(135<phi && phi<315){
        context.textAlign = "left";
        align_sgn = -1;
    }else{
        context.textAlign = "right";
        align_sgn = 1;
    }
    var down = Math.cos(gx.phi+Math.PI/4+Math.PI)*down_shift;
    for(var x=-8; x<=8; x+=2){
        s = ftos_strip(x0+x/ax,ax);
        puts(s,x,-10.4-0.6*d,pz-down,align_sgn*5,5);
        line(x,-10,pz,x,-10-0.12-sf*0.3,pz);
    }
    if(py < 0.7){
        puts("x",10,-10.4-0.6*d,pz-down,align_sgn*5,5);
    }

    if((py<0) == (45<phi && phi<225)){
        context.textAlign = "right";
        align_sgn = 1;
    }else{
        context.textAlign = "left";
        align_sgn = -1;
    }
    down = spy*Math.cos(gx.phi+Math.PI/4+0.5*Math.PI)*down_shift;
    for(var y=-8; y<=8; y+=2){
        s = ftos_strip(y0+y/ay,ay);
        puts(s,py*10.4+0.6*spy*d,y,pz+down,align_sgn*5,5);
        line(py*10,y,pz,py*10+spy*(0.12+sf*0.3),y,pz);
    }
    if(py < 0.7){
        puts("y",py*10.4+0.6*spy*d,10,pz+down,align_sgn*5,5);
    }

    var c0 = Math.cos(-gx.phi+Math.PI/2);
    var s0 = Math.sin(-gx.phi+Math.PI/2);
    var vx = c0-s0;
    var vy = c0+s0;
    context.textAlign = "right";
    var dz0 = 2*Math.min(0,Math.round(axis_position[2]));
    d = 0.08+0.17*sf;
    x0 = zaxis_xy[0]*10;
    y0 = zaxis_xy[1]*10;
    var dtext = (0.12+0.28*sf);
    for(var z=dz0+2; z<10; z+=2){
        s = ftos_strip(z0+z/az,az);
        puts(s,x0-dtext*vx,y0-dtext*vy,z-0.2*sf,0,0);
        line(x0,y0,z,x0-d*vx,y0-d*vy,z);
    }
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

function buffer_draw_line(context,t,lw){
    var p0 = t[2];
    var p1 = t[3];
    if(t[0]==LINE){
        context.strokeStyle = "#202020";
        context.lineWidth = 2;
    }else if(t[0]==BORDER){
        context.strokeStyle = "#0000004a";
        context.lineWidth = lw+t[4];
    }else{
        context.strokeStyle = "#a0a0a0";
        context.lineWidth = 2;
    }
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
            buffer_draw_line(context,t,lw);
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
    var py = axis_position[1];
    var pz = 2*axis_position[2]*wx/10;

    context.strokeStyle = sys_xyz.line_color;
    context.fillStyle = sys_xyz.fill_color;
    context.lineWidth = 4;

    // The lines are split into parts so that only the nearest
    // parts are affected when proj returns NaN.
    var h = 2*wx/10;
    for(var k=0; k<10; k++){
        draw_line(context,proj,k*h-wx,-wx,pz,(k+1)*h-wx,-wx,pz);
        draw_line(context,proj,py*wx,k*h-wx,pz,py*wx,(k+1)*h-wx,pz);
    }
    var k0 = Math.min(0,axis_position[2]);
    var x0 = zaxis_xy[0]*wx;
    var y0 = zaxis_xy[1]*wx;
    for(var k=k0; k<5; k++){
        draw_line(context,proj,x0,y0,k*h,x0,y0,(k+1)*h);
    }
    context.lineWidth = 3;
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
    var c = Math.cos(gx.phi - Math.PI/4);
    var s = Math.sin(gx.phi - Math.PI/4);

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
    y = y0+v0;
    for(u = u0; u<u1; u+=dx){
        x = x0+u;
        z00 = mz*f(x,y);
        z01 = mz*f(x+dx,y);
        p0 = proj(u,v0,z00-z0);
        p1 = proj(u+dx,v0,z01-z0);
        a.push([BORDER,s*v0-c*u,p0,p1,0.6]);
    }
    x = x0+u1;
    for(v = v0; v<v1; v+=dy){
        y = y0+v;
        z00 = mz*f(x,y);
        z01 = mz*f(x,y+dy);
        p0 = proj(u1,v,z00-z0);
        p1 = proj(u1,v+dy,z01-z0);
        a.push([BORDER,s*v-c*u1,p0,p1,0.6]);
    }
}

function vector_product(vx,vy,vz,wx,wy,wz){
    return [vy*wz-vz*wy, vz*wx-vx*wz, vx*wy-vy*wx];
}

function exterior_product(ax,ay,bx,by){
    return ax*by-bx*ay;
}

function plot_psf(gx,f,index,du,dv,ustep,vstep){
    index = index % color_gradient_table.length;
    gx.parametric_surface = true;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    du = 0.25*du;
    dv = 0.25*dv;
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
    if(mesh_border[0]!=0){
        v = v0;
        for(u = u0; u<u1; u+=du){
            p00 = f(u,v);
            p01 = f(u+du,v);
            p00[2]*=mz; p01[2]*=mz;
            p0 = proj(p00[0]-x0,p00[1]-y0,p00[2]-z0);
            p1 = proj(p01[0]-x0,p01[1]-y0,p01[2]-z0);
            a.push([BORDER,-gxt-gyt,p0,p1,mesh_border[0]-1]);
        }
    }
    if(mesh_border[1]!=0){
        u = u1;
        for(v = v0; v<v1; v+=dv){
            p00 = f(u,v);
            p01 = f(u,v+dv);
            p00[2]*=mz; p01[2]*=mz;
            p0 = proj(p00[0]-x0,p00[1]-y0,p00[2]-z0);
            p1 = proj(p01[0]-x0,p01[1]-y0,p01[2]-z0);
            a.push([BORDER,-gxt-gyt,p0,p1,mesh_border[1]-1]);
        }
    }
}

function curve_order_fn(gx){
    var c = Math.cos(gx.phi - Math.PI/4);
    var s = Math.sin(gx.phi - Math.PI/4);
    var x0 = position[0];
    var y0 = position[1];
    if(gx.parametric_surface){
        var w = 1.0/ax;
        return function(x,y){return -gxt-gyt-w;};
    }else{
        var w = 0.6/ax;
        return function(x,y){return s*(y-y0)-c*(x-x0)-w;};
    }
}

function plot_curve(gx,f){
    var proj = gx.proj;
    var a = gx.tile_buffer;
    var t0 = ftab["t0"];
    var t1 = ftab["t1"];
    var mz = az/ax;
    var p1 = undefined;
    var x0 = position[0];
    var y0 = position[1];
    var z0 = position[2];
    var order = curve_order_fn(gx);

    var d = 0.01*ftab.tstep;
    for(var t=t0; t<t1; t+=d){
        var v = f(t);
        var p0 = proj(v[0]-x0,v[1]-y0,mz*(v[2]-z0));
        if(p1!=undefined){
            a.push([LINE,order(v[0],v[1]),p0,p1]);
        }
        p1 = p0;
    }
    if(ftab.shadow==0) return;
    p1 = undefined;
    for(var t=t0; t<t1; t+=d){
        var v = f(t);
        var p0 = proj(v[0]-x0,v[1]-y0,0);
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
    var x0 = position[0];
    var y0 = position[1];
    var xa = x0 + grx[0]/ax;
    var xb = x0 + grx[1]/ax;
    var ya = y0 + gry[0]/ay;
    var yb = y0 + gry[1]/ay;
    var mz = az/ax;
    var mz0 = mz*(z0-position[2]);
    var order = curve_order_fn(gx);

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
            p0 = proj(t[0]-x0,y-y0,mz0);
            p1 = proj(t[1]-x0,y-y0+dy,mz0);
            tile_buffer.push([LINE,order(t[0],y),p0,p1]);
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
            p0 = proj(x-x0,t[0]-y0,mz0);
            p1 = proj(x-x0+dx,t[1]-y0,mz0);
            tile_buffer.push([LINE,order(x,t[0]),p0,p1]);
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
    var m0 = gtile[0];
    var m1 = gtile[1];
    if(Array.isArray(t) && t[0]==="for"){
        node_loop(plot_node_bivariate,t,gx,index);
    }else if(Array.isArray(t) && t[0]==="="){
        var f = compile(t[1],["x","y"]);
        var z0 = compile(t[2],[])();
        if(refresh){
            plot_level_set(gx,f,z0,1,0.4,12,0.4,false);
        }else{
            plot_level_set(gx,f,z0,10,0.1*iso_dist,12,0.2*iso_ep,false);
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
                    plot_psf(gx,f,index,1,1,1,1);
                }else{
                    plot_psf(gx,f,index,m0*0.5,m1*0.5,gstep[0]*2/m0,gstep[1]*2/m1);
                }
            }
        }else{
            var f = compile(t,["x","y"]);
            if(refresh){
                plot_sf(gx,f,index,1,1,1);
            }else if(gx.animation){
                plot_sf(gx,f,index,1,1,1);
            }else{
                plot_sf(gx,f,index,m0*0.25,gstep[0]*4/m0,gstep[1]*4/m1);
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
    var m = gtile[0];
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

    var lw = gtile[0]<0.4?(gtile[0]<0.15?2.4:1.8):1.4;
    if(mesh_width!=undefined) lw = mesh_width;
    var alpha = Math.round(float_re(pftab["alpha"])*255);
    flush_tile_buffer(gx,alpha,lw);
    system_xyz(gx);
}

function plot_img(w,h,fmt){
    if(w==undefined) w = 360;
    if(h==undefined) h = Math.round(w/1.5);
    if(fmt==undefined) fmt = "jpeg";
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
    var s = canvas.toDataURL("image/"+fmt);
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

