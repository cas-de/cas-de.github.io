
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

var plot_refresh = false;

function refresh(gx){
    plot_refresh = true;
    update(gx);
}

function float_re(x){
    return typeof x=="object"?x.re:x;
}

var theta_max = Math.atan(Math.sqrt(2));
var theta_min = theta_max-Math.PI;

function mouse_move_handler(e){
    if(e.buttons==1){
        moved = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.phi += 0.004*dx;
        gx.theta = clamp(gx.theta+0.004*dy,theta_min,theta_max);
        clientXp = e.clientX;
        clientYp = e.clientY;
        refresh(gx);
    }else{
        clientXp = e.clientX;
        clientYp = e.clientY;
    }
}

function mouse_up_handler(e){
    if(moved){
        update(graphics);
        moved = false;
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

function colorfn2(t,a){
    var c = hsl_to_rgb(4/3*Math.PI*(1-clamp(t,0,1)),1,0.6);
    var y = rgba_to_hex(Math.round(255*c[0]),Math.round(255*c[1]),Math.round(255*c[2]),a);
    return y;
}

function draw_line(context,proj,x0,y0,z0,x1,y1,z1){
    var t0 = proj(x0,y0,z0);
    var t1 = proj(x1,y1,z1);
    context.beginPath();
    context.moveTo(t0[0],t0[1]);
    context.lineTo(t1[0],t1[1]);
    context.stroke();
}

function mul_matrix_matrix(A,B){
    var m = A.length;
    var n = B[0].length;
    var p = A[0].length;
    var C = [];
    for(var i=0; i<m; i++){
        var v = [];
        for(var j=0; j<n; j++){
            var y = 0;
            for(var k=0; k<p; k++){y += A[i][k]*B[k][j];}
            v.push(y);
        }
        C.push(v);
    }
    return C;
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

function labels(gx,proj){
    var context = gx.context;
    var px0 = Math.floor(gx.w/2);
    var py0 = Math.floor(gx.h/2);
    var s;
    context.textAlign = "center";
    var mx = get_mx(gx);
    var puts = new_puts(context,proj,1/ax);
    var line = new_draw_line(context,proj,1/ax);
    for(var x=-8; x<=8; x+=2){
        s = ftos_strip(x/ax,ax);
        puts(s,x,-11,-0.5);
        line(x,-10,0,x,-10.4,0);
    }
    for(var y=-8; y<=8; y+=2){
        s = ftos_strip(y/ax,ax);
        puts(s,-11,y,-0.5);
        line(-10,y,0,-10.4,y,0);
    }
    for(var z=2; z<10; z+=2){
        s = ftos_strip(z/ax,ax);
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

function new_light_source(phi,w){
    var f = new_color_gradient([
        [0.4,0.7,0.64],[0.4,0.7,0.62],[0.5,0.7,0.6],
        [0.8,0.7,0.4],[1,0.76,0],[1,0.96,0.5]
    ]);
    w = normalize(rot(0.5*Math.PI-phi,w));
    return function(v,a){
        var vv = v[0]*v[0]+v[1]*v[1]+v[2]*v[2];
        var s = (v[0]*w[0]+v[1]*w[1]+v[2]*w[2])/Math.sqrt(vv);
        return f(0.5*s+0.5,a);
    };
}

function flush_tile_buffer(gx,alpha,lw){
    var a = gx.tile_buffer;
    var context = gx.context;
    var t,p0,p1,p2,p3;

    a.sort(function(x,y){
        return x[0]<y[0];
    });

    var colorfn = new_light_source(gx.phi,[1,0,0.8]);

    context.lineWidth = 1;
    context.fillStyle = "#d0d0d0b0";
    var line_color = "#0000004a";
    var color;
    for(var i=0; i<a.length; i++){
        t = a[i];
        p0 = t[1]; p1 = t[2]; p2 = t[3]; p3 = t[4];
        // color = colorfn2(0.5+0.2*t[5],alpha);
        color = colorfn(t[8],alpha);
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(p0[0],p0[1]);
        context.lineTo(p1[0],p1[1]);
        context.lineTo(p2[0],p2[1]);
        context.lineTo(p3[0],p3[1]);
        context.fill();

        if(t[6]){
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

        if(t[7]){
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

function system_xyz(gx,proj,wx){
    var context = gx.context;
    var proj = gx.proj;
    context.strokeStyle = "#00000060";
    context.fillStyle = "#000000a0";
    context.lineWidth = 4;
    wx = 10/ax;
    draw_line(context,proj,-wx,-wx,0,wx,-wx,0);
    draw_line(context,proj,-wx,-wx,0,-wx,wx,0);
    draw_line(context,proj,-wx,-wx,0,-wx,-wx,wx);
    context.lineWidth = 2;
    labels(gx,proj,ax);
}

function mesh_cond(x){
    return Math.abs(x-Math.floor(x+0.5))<0.001;
}

function plot_sf(gx,f,d,xstep,ystep){
    var x,y,z00,z01,z10,z11,v;
    var p0,p1,p2,p3;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var dx = d/ax;
    var dy = d/ax;
    var x0 = grx[0]/ax;
    var x1 = grx[1]/ax;
    var y0 = gry[0]/ax;
    var y1 = gry[1]/ax;

    var a = gx.tile_buffer;
    var kx = 0;
    for(x = x0; x<x1; x+=dx){
        var ky = 1;
        for(y = y0; y<y1; y+=dy){
            z00 = f(x,y);
            z01 = f(x,y+dy);
            z11 = f(x+dx,y+dy);
            z10 = f(x+dx,y);
            p0 = proj(x,y,z00);
            p1 = proj(x,y+dy,z01);
            p2 = proj(x+dx,y+dy,z11);
            p3 = proj(x+dx,y,z10);
            v = [dy*(z00-z10),dx*(z00-z01),dx*dy];
            a.push([s*y-c*x,p0,p1,p2,p3,z00,
                mesh_cond(kx/xstep),mesh_cond(ky/ystep),v]);
            ky++;
        }
        kx++;
    }
}

function vector_product(vx,vy,vz,wx,wy,wz){
    return [vy*wz-vz*wy, vz*wx-vx*wz, vx*wy-vy*wx];
}

function plot_psf(gx,f,d,ustep,vstep){
    var u,v,p00,p01,p10,p11,e;
    var p0,p1,p2,p3;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var du = 0.25*d;
    var dv = 0.25*d;
    var wx = 10/ax;
    var wy = wx;
    var u0 = ftab["u0"];
    var u1 = ftab["u1"];
    var v0 = ftab["v0"];
    var v1 = ftab["v1"];

    var a = gx.tile_buffer;
    var ku=0;
    for(u = u0; u<u1; u+=du){
        var kv=1;
        for(v = v0; v<v1; v+=dv){
            p00 = f(u,v);
            p01 = f(u,v+dv);
            p11 = f(u+du,v+dv);
            p10 = f(u+du,v);
            p0 = proj(p00[0],p00[1],p00[2]);
            p1 = proj(p01[0],p01[1],p01[2]);
            p2 = proj(p11[0],p11[1],p11[2]);
            p3 = proj(p10[0],p10[1],p10[2]);

            e = vector_product(
                p10[0]-p00[0],p10[1]-p00[1],p10[2]-p00[2],
                p01[0]-p00[0],p01[1]-p00[1],p01[2]-p00[2]
            );
            a.push([-gxt-gyt,p0,p1,p2,p3,p00[2],
                mesh_cond(ku/ustep),mesh_cond(kv/vstep),e]);
            kv++;
        }
        ku++;
    }
}

function plot_node(gx,t,index){
    var m = gtile;
    if(Array.isArray(t) && t[0]==="[]"){
        var f = compile(t,["u","v"]);
        if(plot_refresh){
            plot_psf(gx,f,1,1,1);
            plot_refresh = false;
        }else{
            plot_psf(gx,f,m*0.5,gstep[0]*2/m,gstep[1]*2/m);
        }
    }else{
        var f = compile(t,["x","y"]);
        if(plot_refresh){
            plot_sf(gx,f,1,1,1);
            plot_refresh = false;
        }else{
            plot_sf(gx,f,m*0.25,gstep[0]*4/m,gstep[1]*4/m);
        }
    }
}

function plot_node_relief(gx,t,index){
    var fc = ccompile(t,["z"]);
    var f = function(x,y){
        return fc({re: x, im: y}).re;
    };
    pftab = cftab;
    var m = gtile;
    if(plot_refresh){
        plot_sf(gx,f,1,1,1);
        plot_refresh = false;
    }else{
        plot_sf(gx,f,m*0.25,gstep[0]*4/m,gstep[1]*4/m);
    }
}

function plot(gx){
    var input = get_value("inputf").trim();
    var a = input.split(";");
    process_statements(a);
    pid_stack = [];

    clear(gx,gx.color_bg);
    flush(gx);

    var mx = ax*get_mx(gx);
    gx.px0 = Math.floor(gx.w/2);
    gx.py0 = Math.floor(gx.h/2);
    gx.proj = new_proj(gx.phi,gx.theta,gx.px0,gx.py0,mx);
    gx.tile_buffer = [];
    
    if(input.length>0){
        var t = ast(a[0]);
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
    system_xyz(gx,10/ax);
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

