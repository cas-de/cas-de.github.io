

ftab["tw"] = 10;
ftab["step"] = 0.001;

function runge_kutta_system_unilateral(f,h,N,x0,y0){
    var n = y0.length;
    var m = n-1;
    var F = function(v,x,y){
        w = f(x,y);
        for(var i=0; i<n; i++){v[i] = w[i];}
    };
    var x = x0;
    var y = y0.slice();
    var yt = y.slice();
    var k1 = y.slice();
    var k2 = y.slice();
    var k3 = y.slice();
    var k4 = y.slice();
    var va = y.map(function(yi){return [yi];});
    for(var k=1; k<=N; k++){
        F(k1,x,y);
        F(k2,x+0.5*h,add_scaled(n,yt,y,0.5*h,k1));
        F(k3,x+0.5*h,add_scaled(n,yt,y,0.5*h,k2));
        F(k4,x+h,add_scaled(n,yt,y,h,k3));
        for(var i=0; i<n; i++){
            y[i] = y[i]+h/6*(k1[i]+2*(k2[i]+k3[i])+k4[i]);
        }
        x = x0+k*h;
        for(var i=0; i<n; i++){
            va[i].push(y[i]);
        }
    }
    return va.map(function(a){return pli(x0,h,a);});
}

function runge_kutta_push_fn(buffer,x0,gm,gp,index){
    buffer.push(function(x){return x<x0?gm[index](x):gp[index](x);});
}

function runge_kutta_system(f,h,wm,wp,x0,y0){
    var gm = runge_kutta_system_unilateral(f,-h,Math.abs(wm/h),x0,y0);
    var gp = runge_kutta_system_unilateral(f,h,Math.abs(wp/h),x0,y0);
    var buffer = [];
    for(var i=0; i<y0.length; i++){
        runge_kutta_push_fn(buffer,x0,gm,gp,i);
    }
    return buffer;
}

function ode_system_as_fn_rec(v,t,replace){
    if(Array.isArray(t)){
        var a = [];
        for(var i=0; i<t.length; i++){
            a.push(ode_system_as_fn_rec(v,t[i],replace));
        }
        return a;
    }else{
        for(var i=0; i<v.length; i++){
            if(t===v[i]){return ["index","_x_",i];}
        }
        if(replace && t==="x"){
            return "t";
        }else{
            return t;
        }
    }
}

function ode_system_as_fn(t,v){
    var replace = !contains_variable(v,"x");
    var u = ode_system_as_fn_rec(v,t[2],replace);
    infer_type(u);
    return compile(u,["t","_x_"]);
}

function ode_system(t){
    var v = t[1][1].slice(1);
    var f = ode_system_as_fn(t,v);
    var p = ftab["p"];
    if(!ftab.hasOwnProperty("p") || !Array.isArray(p)){
        throw lang.initial_value_problem_msg();
    }
    if(p.length<v.length+1){
        throw new Err(lang.p_to_short);
    }else{
        p = p.slice(0,v.length+1);
    }
    var w = ftab["tw"];
    var h = ftab["step"];
    var vf = runge_kutta_system(f,h,-w,w,p[0],p.slice(1));
    for(var i=0; i<v.length; i++){
        ftab[v[i]] = vf[i];
    }
}

function equation(t){
    if(Array.isArray(t[1]) && t[1][0]==="D"){
        var term = t[1][1];
        if(Array.isArray(term) && term[0]==="[]"){
            ode_system(t);
            return;
        }
    }
    eval_node(t);
}

var cmd_extension = {
    "=": equation
};



