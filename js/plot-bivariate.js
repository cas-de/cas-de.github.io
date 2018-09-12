
"use strict";

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

function draw_line(context,proj,px0,py0,mx,x0,y0,z0,x1,y1,z1){
    var t0 = proj(x0,y0,z0);
    var t1 = proj(x1,y1,z1);
    context.beginPath();
    context.moveTo(Math.round(px0+mx*t0[0]),Math.round(py0-mx*t0[1]));
    context.lineTo(Math.round(px0+mx*t1[0]),Math.round(py0-mx*t1[1]));
    context.stroke();
}

function new_projection(phi,theta){
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
        return [y-x,z-0.5*x-0.5*y];
    };
}

function new_puts(context,proj,px0,py0,mx){
    return function(s,x,y,z){
        var p = proj(x,y,z);
        context.fillText(s,px0+mx*p[0],py0-mx*p[1]);
    };
}

function new_draw_line(context,proj,px0,py0,mx){
    return function(x0,y0,z0,x1,y1,z1){
        draw_line(context,proj,px0,py0,mx,x0,y0,z0,x1,y1,z1);
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
    var puts = new_puts(context,proj,px0,py0,mx);
    var line = new_draw_line(context,proj,px0,py0,mx);
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

function plot_sf(gx,f,d,alpha){
    if(d==undefined) d=0.5;
    var t,x,y,z00,z01,z10,z11;
    var p0,p1,p2,p3;
    var context = gx.context;
    var proj = new_projection(gx.phi,gx.theta);
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);
    var px0 = Math.floor(gx.w/2);
    var py0 = Math.floor(gx.h/2);
    var mx = ax*get_mx(gx);

    var rd = Math.round;
    var dx = d/ax;
    var dy = d/ax;
    var wx = 10/ax;
    var wy = wx;

    var a = [];
    for(x = -wx; x<wx; x+=dx){
        for(y = -wy; y<wy; y+=dy){
            z00 = f(x,y);
            z01 = f(x,y+dy);
            z11 = f(x+dx,y+dy);
            z10 = f(x+dx,y);
            p0 = proj(x,y,z00);
            p1 = proj(x,y+dy,z01);
            p2 = proj(x+dx,y+dy,z11);
            p3 = proj(x+dx,y,z10);
            a.push([s*y-c*x,p0,p1,p2,p3,z00]);
        }
    }
    a.sort(function(x,y){
        return x[0]<y[0];
    });
    context.lineWidth = 1;
    context.fillStyle = "#d0d0d0b0";
    context.strokeStyle = "#40404020";
    for(var i=0; i<a.length; i++){
        t = a[i];
        p0 = t[1]; p1 = t[2]; p2 = t[3]; p3 = t[4];
        context.fillStyle = colorfn2(0.5+0.2*t[5],alpha);
        context.beginPath();
        context.moveTo(rd(px0+mx*p0[0]),rd(py0-mx*p0[1]));
        context.lineTo(rd(px0+mx*p1[0]),rd(py0-mx*p1[1]));
        context.lineTo(rd(px0+mx*p2[0]),rd(py0-mx*p2[1]));
        context.lineTo(rd(px0+mx*p3[0]),rd(py0-mx*p3[1]));
        context.fill();
        context.stroke();
    }

    context.strokeStyle = "#00000060";
    context.fillStyle = "#000000a0";
    context.lineWidth = 4;
    draw_line(context,proj,px0,py0,mx,-wx,-wx,0,wx,-wx,0);
    draw_line(context,proj,px0,py0,mx,-wx,-wx,0,-wx,wx,0);
    draw_line(context,proj,px0,py0,mx,-wx,-wx,0,-wx,-wx,wx);
    context.lineWidth = 2;
    labels(gx,proj,ax);
}

function index_to_alpha(index){
    if(index==0) return 240;
    else return 100;
}

function plot_node(gx,t,index){
    var f = compile(t,["x","y"]);
    var alpha = index_to_alpha(index);
    if(plot_refresh){
        plot_sf(gx,f,1,alpha);
        plot_refresh = false;
    }else{
        plot_sf(gx,f,0.5,alpha);
    }
}

function plot(gx){
    var input = get_value("inputf").trim();
    var a = input.split(";");
    process_statements(a);
    pid_stack = [];

    gx.context.clearRect(0,0,gx.w,gx.h);

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
}

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

