
cftab["d"] = function(z){return {re:set_distance(z.re),im:0};};
cftab["alpha"] = {re:0.94,im:0};

cftab["u0"] = {re:-4,im:0};
cftab["u1"] = {re:2,im:0}
cftab["v0"] = {re:-2*Math.PI,im:0};
cftab["v1"] = {re:2*Math.PI,im:0};

ftab["real"] = function(){
    var method = document.getElementById("method");
    method.value = "re";
};

ftab["imag"] = function(){
    var method = document.getElementById("method");
    method.value = "im";
};

function color_phase(w){
    var r = cabs(w);
    var phi = carg_positive(w);
    return hsl_to_rgb_u8(phi,1,0.44);
}

function new_color_map(gx){
    return function(t,alpha){
        var color = color_phase(t[9]);
        return rgba_to_hex(
            Math.round(color[0]),
            Math.round(color[1]),
            Math.round(color[2]),
            alpha
        );
    };
}

new_colorfn = new_color_map;

function plot_psf_color(gx,f,index,d,ustep,vstep){
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
    var u,v,p00,p01,p10,p11;
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

            a.push([TILE,-gxt-gyt,p0,p1,p2,p3,p00[2],
                mesh_cond(ku/ustep),mesh_cond(kv/vstep),{re:u,im:v},index]);
            kv++;
        }
        ku++;
    }
}

function plot_node(gx,t,index){
    var method = document.getElementById("method").value;

    ftab.u0 = cftab.u0.re;
    ftab.u1 = cftab.u1.re;
    ftab.v0 = cftab.v0.re;
    ftab.v1 = cftab.v1.re;
    infer_type(t);
    var f = ccompile(t,["z"]);
    var F;
    if(method=="re"){
        F = function(u,v){
            var w = f({re:u,im:v});
            return [w.re,w.im,u];
        };
    }else{
        F = function(u,v){
            var w = f({re:u,im:v});
            return [w.re,w.im,v];
        };
    }
    pftab = cftab;
    var m = gtile;
    if(refresh || gx.animation){
        plot_psf_color(gx,F,index,1,1,1);
    }else{
        plot_psf_color(gx,F,index,m*0.5,gstep[0]*2/m,gstep[1]*2/m);
    }
}
