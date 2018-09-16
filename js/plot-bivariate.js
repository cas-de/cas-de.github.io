
"use strict";

ftab["w"] = 10;
ftab["u0"] = 0;
ftab["u1"] = 2*Math.PI;
ftab["v0"] = 0;
ftab["v1"] = Math.PI;

var plot_refresh = false;

function refresh(gx){
    plot_refresh = true;
    update(gx);
}

function mouse_move_handler(e){
    if(e.buttons==1){
        moved = true;
        var gx = graphics;
        pid_stack = [];
        var dx = e.clientX-clientXp;
        var dy = e.clientY-clientYp;
        gx.phi += 0.004*dx;
        gx.theta = clamp(gx.theta+0.004*dy,-0.45*Math.PI,0.304086*Math.PI);
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

function interpolate_color(c1,c2){
    return function(t,a){
        var R = clamp(Math.round(255*((1-t)*c1[0]+t*c2[0])),0,255);
        var G = clamp(Math.round(255*((1-t)*c1[1]+t*c2[1])),0,255);
        var B = clamp(Math.round(255*((1-t)*c1[2]+t*c2[2])),0,255);
        return rgba_to_hex(R,G,B,a);
    };
}

var colorfn1 = interpolate_color([0.6,0.6,1],[1,0.6,0.6]);

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

function new_projection(phi,theta,px0,py0,mx){
    var c = Math.cos(phi);
    var s = Math.sin(phi);
    var ct = Math.cos(theta);
    var st = Math.sin(theta);
    var q = 1/Math.sqrt(2);
    return function(x,y,z){
        var xt = c*x-s*y;
        var yt = s*x+c*y;
        x = 0.5*(1+ct)*xt+0.5*(1-ct)*yt+q*st*z;
        y = 0.5*(1-ct)*xt+0.5*(1+ct)*yt+q*st*z;
        z = ct*z-q*st*xt-q*st*yt;
        return [px0+mx*(y-x),py0-mx*(z-0.5*x-0.5*y)];
    };
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
        s = float_str(x/ax);
        puts(s,x,-11,-0.5);
        line(x,-10,0,x,-10.4,0);
    }
    for(var y=-8; y<=8; y+=2){
        s = float_str(y/ax);
        puts(s,-11,y,-0.5);
        line(-10,y,0,-10.4,y,0);
    }
    for(var z=2; z<10; z+=2){
        s = float_str(z/ax);
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
    var f = interpolate_color([0.5,0.7,0.7],[1,0.9,0.7]);
    w = normalize(rot(0.5*Math.PI-phi,w));
    return function(v,a){
        var vv = v[0]*v[0]+v[1]*v[1]+v[2]*v[2];
        var s = (v[0]*w[0]+v[1]*w[1]+v[2]*w[2])/Math.sqrt(vv);
        return f(0.5*s+0.5,a);
        // var c = hsl_to_rgb(3.3,0.5,Math.abs(s/4+3/5));
        // return rgba_to_hex(Math.round(255*c[0]),Math.round(255*c[1]),Math.round(255*c[2]),a);
    };
}

function flush_tile_buffer(gx,alpha){
    var a = gx.tile_buffer;
    var context = gx.context;
    var t,p0,p1,p2,p3;

    a.sort(function(x,y){
        return x[0]<y[0];
    });

    var colorfn = new_light_source(gx.phi,[1,0,0.8]);

    context.lineWidth = 1;
    context.fillStyle = "#d0d0d0b0";
    var line_color = "#00000040";
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
            context.lineWidth = 1.4;
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
            context.lineWidth = 1.4;
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

function plot_sf(gx,f,d,step){
    if(d==undefined) d=0.5;
    var x,y,z00,z01,z10,z11,v;
    var p0,p1,p2,p3;
    var context = gx.context;
    var proj = gx.proj;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var dx = d/ax;
    var dy = d/ax;
    var wx = ftab["w"]/ax;
    var wy = wx;

    var a = gx.tile_buffer;
    var kx = 0;
    for(x = -wx; x<wx; x+=dx){
        var ky = 0;
        for(y = -wy; y<wy; y+=dy){
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
                kx%step==0,ky%step==0,v]);
            ky++;
        }
        kx++;
    }
}

function vector_product(vx,vy,vz,wx,wy,wz){
    return [vy*wz-vz*wy, vz*wx-vx*wz, vx*wy-vy*wx];
}

function plot_psf(gx,f,d,step){
    if(d==undefined) d=0.5;
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

            a.push([s*p00[1]-c*p00[0],p0,p1,p2,p3,p00[2],
                ku%step==0,kv%step==0,e]);
            kv++;
        }
        ku++;
    }
}

function plot_node(gx,t,index){
    if(Array.isArray(t) && t[0]==="[]"){
        var f = compile(t,["u","v"]);
        if(plot_refresh){
            plot_psf(gx,f,1,1);
            plot_refresh = false;
        }else{
            plot_psf(gx,f,0.5,2);
        }
    }else{
        var f = compile(t,["x","y"]);
        if(plot_refresh){
            plot_sf(gx,f,1,1);
            plot_refresh = false;
        }else{
            plot_sf(gx,f,0.25,4);
        }
    }
}

function plot_node_relief(gx,t,index){
    var fc = ccompile(t,["z"]);
    var f = function(x,y){
        return fc({re: x, im: y}).re;
    };
    if(plot_refresh){
        plot_sf(gx,f,1,1);
        plot_refresh = false;
    }else{
        plot_sf(gx,f,0.25,4);
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
    gx.proj = new_projection(gx.phi,gx.theta,gx.px0,gx.py0,mx);
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

    flush_tile_buffer(gx,240);
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

