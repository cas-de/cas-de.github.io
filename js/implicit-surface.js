
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

function buffer_zip(a00,a01,a11,a10,epsilon){
    var len = a00.length;
    var a = [];
    var t0,t1,t2,t3;
    var j,j0,j1,jmin,d,dmin;
    var n = 2;
    for(var i=0; i<len; i++){
        t0 = a00[i];
        j0 = Math.max(0,i-n);

        j1 = Math.min(i+n,a01.length-1);
        jmin = j0;
        dmin = Math.abs(t0-a01[jmin]);
        for(j=j0+1; j<=j1; j++){
            d = Math.abs(t0-a01[j]);
            if(d<dmin){jmin = j; dmin = d;}
        }
        if(!(dmin<epsilon)) continue;
        t1 = a01[jmin];

        j1 = Math.min(i+n,a11.length-1);
        jmin = j0;
        dmin = Math.abs(t0-a11[jmin]);
        for(j=j0+1; j<=j1; j++){
            d = Math.abs(t0-a11[j]);
            if(d<dmin){jmin = j; dmin = d;}
        }
        if(!(dmin<epsilon)) continue;
        t2 = a11[jmin];

        j1 = Math.min(i+n,a10.length-1);
        jmin = j0;
        dmin = Math.abs(t1-a10[jmin]);
        for(j=j0+1; j<=j1; j++){
            d = Math.abs(t1-a10[j]);
            if(d<dmin){jmin = j; dmin = d;}
        }
        if(!(dmin<epsilon)) continue;
        t3 = a10[jmin];
        a.push([t0,t1,t2,t3]);
    }
    return a;
}

function exterior_product(ax,ay,bx,by){
    return ax*by-bx*ay;
}

function plot_implicit_sf(gx,f,index,d,xstep,ystep,epsilon){
    index = index % color_gradient_table.length;
    var x,y,z,w00,v;
    var kx,ky,kz;
    var context = gx.context;
    var c = Math.cos(gx.phi);
    var s = Math.sin(gx.phi);

    var dx = d/ax;
    var dy = d/ay;
    var dz = d/az;
    var mz = az/ax;
    var px = position[0];
    var py = position[1];
    var pz = position[2];
    
    var x0 = px+grx[0]/ax;
    var x1 = px+grx[1]/ax;
    var y0 = py+gry[0]/ay;
    var y1 = py+gry[1]/ay;
    var z0 = pz+grx[0]/az;
    var z1 = pz+grx[1]/az;
    var n = 20;

    var zip_buffer = [];
    var g00,g01,g11,g10,a00,a01,a11,a10;
    var a,t;

    kx = 0;
    for(x = x0; x<x1; x+=dx){
        ky = 1;
        g00 = function(z){return f(x,y0,z);};
        g10 = function(z){return f(x+dx,y0,z);};
        a00 = zeroes_bisection_fast(g00,z0,z1,n);
        a10 = zeroes_bisection_fast(g10,z0,z1,n);
        for(y = y0; y<y1; y+=dy){
            g01 = function(z){return f(x,y+dy,z);};
            g11 = function(z){return f(x+dx,y+dy,z);};
            a01 = zeroes_bisection_fast(g01,z0,z1,n);
            a11 = zeroes_bisection_fast(g11,z0,z1,n);

            a = buffer_zip(a00,a01,a11,a10,epsilon/mz);
            a00 = a01;
            a10 = a11;
            for(var i=0; i<a.length; i++){
                t = a[i];
                zip_buffer.push([
                    [x-px,y-py,mz*(t[0]-pz)],
                    [x-px,y-py+dy,mz*(t[1]-pz)],
                    [x-px+dx,y-py+dy,mz*(t[2]-pz)],
                    [x-px+dx,y-py,mz*(t[3]-pz)],
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
        g00 = function(y){return f(x,y,z0);};
        g10 = function(y){return f(x+dx,y,z0);};
        a00 = zeroes_bisection_fast(g00,y0,y1,n);
        a10 = zeroes_bisection_fast(g10,y0,y1,n);
        for(z = z0; z<z1; z+=dz){
            g01 = function(y){return f(x,y,z+dz);};
            g11 = function(y){return f(x+dx,y,z+dz);};
            a01 = zeroes_bisection_fast(g01,y0,y1,n);
            a11 = zeroes_bisection_fast(g11,y0,y1,n);

            a = buffer_zip(a00,a01,a11,a10,epsilon);
            a00 = a01;
            a10 = a11;
            for(var i=0; i<a.length; i++){
                t = a[i];
                zip_buffer.push([
                    [x-px,t[0]-py,mz*(z-pz)],
                    [x-px,t[1]-py,mz*(z-pz+dz)],
                    [x-px+dx,t[2]-py,mz*(z-pz+dz)],
                    [x-px+dx,t[3]-py,mz*(z-pz)],
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
        g00 = function(x){return f(x,y,z);};
        g10 = function(x){return f(x,y+dy,z);};
        a00 = zeroes_bisection_fast(g00,x0,x1,n);
        a10 = zeroes_bisection_fast(g10,x0,x1,n);
        for(z = z0; z<z1; z+=dz){
            g01 = function(x){return f(x,y,z+dz);};
            g11 = function(x){return f(x,y+dy,z+dz);};
            a01 = zeroes_bisection_fast(g01,x0,x1,n);
            a11 = zeroes_bisection_fast(g11,x0,x1,n);

            a = buffer_zip(a00,a01,a11,a10,epsilon);
            a00 = a01;
            a10 = a11;
            for(var i=0; i<a.length; i++){
                t = a[i];
                zip_buffer.push([
                    [t[0]-px,y-py,mz*(z-pz)],
                    [t[1]-px,y-py,mz*(z-pz+dz)],
                    [t[2]-px,y-py+dy,mz*(z-pz+dz)],
                    [t[3]-px,y-py+dy,mz*(z-pz)],
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
    var p0,p1,p2,p3,sign;
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

        sign = Math.sign(exterior_product(
            p1[0]-p0[0], p1[1]-p0[1],
            p3[0]-p0[0], p3[1]-p0[1]
        ));
        v[0] = sign*v[0];
        v[1] = sign*v[1];
        v[2] = sign*v[2];

        tile_buffer.push([TILE,s*p00[1]-c*p00[0],p0,p1,p2,p3,p00[2],
            mesh_cond(kx/xstep),mesh_cond(ky/ystep),v,index]);
    }
}

function plot_node(gx,t,index){
    if(Array.isArray(t) && t[0]==="extern"){
        plot_node_bivariate(gx,t[1],index);
        return;
    }
    if(Array.isArray(t) && t[0]==="="){
        t = ["-",t[1],t[2]];
    }
    infer_type(t);
    var f = compile(t,["x","y","z"]);
    var m = gtile;
    if(refresh){
        plot_implicit_sf(gx,f,index,2,1,1,4/ax);
    }else if(gx.animation){
        plot_implicit_sf(gx,f,index,1,2,2,4/ax);
    }else{
        plot_implicit_sf(gx,f,index,m*0.5,gstep[0]*4/m,gstep[1]*4/m,1.2/ax);
    }
}
