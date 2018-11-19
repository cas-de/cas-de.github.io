
"use strict";

ftab["alpha"] = 0.60;

function zeroes_bisection_fast(f,a,b,n){
    var zeroes = [];
    var h = (b-a)/n;
    var x,x0,cond;
    var state = undefined;
    for(var x=a; x<b; x+=h){
        cond = f(x)<0;
        if(cond != state){
            if(state != undefined){
                x0 = bisection_fast(14,state,f,x-h,x+h);
                if(Math.abs(f(x0))<0.1){
                    zeroes.push(x0);
                }
            }
            state = cond;
        }
    }
    return zeroes;
}

function plot_implicit_sf(gx,f,d,xstep,ystep){
    var x,y,z,w00,v;
    var kx,ky,kz;
    var context = gx.context;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var dx = d/ax;
    var dy = d/ax;
    var dz = d/ax;
    var x0 = grx[0]/ax;
    var x1 = grx[1]/ax;
    var y0 = gry[0]/ax;
    var y1 = gry[1]/ax;
    var z0 = x0;
    var z1 = x1;
    var n = 20;
    var epsilon = 2*d/ax;

    var zip_buffer = [];
    var shift,shift1,shift2,shift3;

    kx = 0;
    for(x = x0; x<x1; x+=dx){
        ky = 1;
        for(y = y0; y<y1; y+=dy){
            var g00 = function(z){return f(x,y,z);};
            var g01 = function(z){return f(x,y+dy,z);};
            var g11 = function(z){return f(x+dx,y+dy,z);};
            var g10 = function(z){return f(x+dx,y,z);};
            var a00 = zeroes_bisection_fast(g00,z0,z1,n);
            var a01 = zeroes_bisection_fast(g01,z0,z1,n);
            var a11 = zeroes_bisection_fast(g11,z0,z1,n);
            var a10 = zeroes_bisection_fast(g10,z0,z1,n);
            var len = Math.min(a00.length,a01.length,a11.length,a10.length);
            shift1=0; shift2=0; shift3=0;
            for(var k=0; k<len; k++){
                w00 = a00[k];
                shift=false;
                if(Math.abs(w00-a01[k-shift1])>epsilon){shift1++; shift=true;}
                if(Math.abs(w00-a11[k-shift2])>epsilon){shift2++; shift=true;}
                if(Math.abs(w00-a10[k-shift3])>epsilon){shift3++; shift=true;}
                if(shift){continue;}
                zip_buffer.push([
                    [x,y,a00[k]],
                    [x,y+dy,a01[k-shift1]],
                    [x+dx,y+dy,a11[k-shift2]],
                    [x+dx,y,a10[k-shift3]],
                    kx, ky
                ]);
            }
            ky++;
        }
        kx++;
    }

    kx = 0;
    for(x = x0; x<x1; x+=dx){
        kz = 1;
        for(z = z0; z<z1; z+=dz){
            var g00 = function(y){return f(x,y,z);};
            var g01 = function(y){return f(x,y,z+dz);};
            var g11 = function(y){return f(x+dx,y,z+dz);};
            var g10 = function(y){return f(x+dx,y,z);};
            var a00 = zeroes_bisection_fast(g00,y0,y1,n);
            var a01 = zeroes_bisection_fast(g01,y0,y1,n);
            var a11 = zeroes_bisection_fast(g11,y0,y1,n);
            var a10 = zeroes_bisection_fast(g10,y0,y1,n);
            var len = Math.min(a00.length,a01.length,a11.length,a10.length);
            shift1=0; shift2=0; shift3=0;
            for(var k=0; k<len; k++){
                w00 = a00[k];
                shift=false;
                if(Math.abs(w00-a01[k-shift1])>epsilon){shift1++; shift=true;}
                if(Math.abs(w00-a11[k-shift2])>epsilon){shift2++; shift=true;}
                if(Math.abs(w00-a10[k-shift3])>epsilon){shift3++; shift=true;}
                if(shift){continue;}
                zip_buffer.push([
                    [x,a00[k],z],
                    [x,a01[k-shift1],z+dz],
                    [x+dx,a11[k-shift2],z+dz],
                    [x+dx,a10[k-shift3],z],
                    kx, kz
                ]);
            }
            kz++;
        }
        kx++;
    }

    ky = 0;
    for(y = y0; y<y1; y+=dy){
        kz = 1;
        for(z = z0; z<z1; z+=dz){
            var g00 = function(x){return f(x,y,z);};
            var g01 = function(x){return f(x,y,z+dz);};
            var g11 = function(x){return f(x,y+dy,z+dz);};
            var g10 = function(x){return f(x,y+dy,z);};
            var a00 = zeroes_bisection_fast(g00,x0,x1,n);
            var a01 = zeroes_bisection_fast(g01,x0,x1,n);
            var a11 = zeroes_bisection_fast(g11,x0,x1,n);
            var a10 = zeroes_bisection_fast(g10,x0,x1,n);
            var len = Math.min(a00.length,a01.length,a11.length,a10.length);
            shift1=0; shift2=0; shift3=0;
            for(var k=0; k<len; k++){
                w00 = a00[k];
                shift=false;
                if(Math.abs(w00-a01[k-shift1])>epsilon){shift1++; shift=true;}
                if(Math.abs(w00-a11[k-shift2])>epsilon){shift2++; shift=true;}
                if(Math.abs(w00-a10[k-shift3])>epsilon){shift3++; shift=true;}
                if(shift){continue;}
                zip_buffer.push([
                    [a00[k],y,z],
                    [a01[k-shift1],y,z+dz],
                    [a11[k-shift2],y+dy,z+dz],
                    [a10[k-shift3],y+dy,z],
                    ky, kz
                ]);
            }
            kz++;
        }
        ky++;
    }

    var proj = gx.proj;
    var tile_buffer = gx.tile_buffer;
    var p00,p01,p11,p10;
    var p0,p1,p2,p3;
    var t;
    for(var i=0; i<zip_buffer.length; i++){
        t = zip_buffer[i];
        p00=t[0]; p01=t[1]; p11=t[2]; p10=t[3];
        kx=t[4]; ky=t[5];

        p0 = proj(p00[0],p00[1],p00[2]);
        p1 = proj(p01[0],p01[1],p01[2]);
        p2 = proj(p11[0],p11[1],p11[2]);
        p3 = proj(p10[0],p10[1],p10[2]);

        v = vector_product(
            p10[0]-p00[0],p10[1]-p00[1],p10[2]-p00[2],
            p01[0]-p00[0],p01[1]-p00[1],p01[2]-p00[2]
        );

        tile_buffer.push([TILE,s*p00[1]-c*p00[0],p0,p1,p2,p3,p00[2],
            mesh_cond(kx/xstep),mesh_cond(ky/ystep),v]);
    }
}

function plot_node(gx,t,index){
    if(Array.isArray(t) && t[0]==="="){
        t = ["-",t[1],t[2]];
    }
    var f = compile(t,["x","y","z"]);
    var m = gtile;
    if(plot_refresh){
        plot_implicit_sf(gx,f,2,1,1);
        plot_refresh = false;
    }else{
        plot_implicit_sf(gx,f,m*0.5,gstep[0]*4/m,gstep[1]*4/m);
    }
}
