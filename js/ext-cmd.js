

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


function pli_vec(x0,d,y){
    var n = y.length;
    var m = y[0].length;
    return function(x){
        var k = Math.floor((x-x0)/d);
        var v = [];
        if(k<0 || k+1>=n){
            for(var i=0; i<m; i++){v.push(NaN);}
        }else{
            var a = 1/d*(x-x0-k*d);
            for(var i=0; i<m; i++){
                v.push(y[k][i]+a*(y[k+1][i]-y[k][i]));
            }
        }
        return v;
    };
}

function vadd_scaled(n,m,v,x,a,y){
    for(var i=0; i<n; i++){
        for(var j=0; j<m; j++){
            v[i][j] = x[i][j]+a*y[i][j];
        }
    }
    return v;
}

function clone_matrix(a){
    return a.map(function(x){return x.slice();});
}

function runge_kutta_vec_unilateral(f,h,N,x0,y0){
    var n = y0.length;
    var size = y0[0].length;
    var m = n-1;
    var F = function(v,x,y){
        for(var i=0; i<m; i++) v[i] = y[i+1].slice();
        v[m] = f(x,y);
    };
    var x = x0;
    var y = clone_matrix(y0);
    var yt = clone_matrix(y);
    var k1 = clone_matrix(y);
    var k2 = clone_matrix(y);
    var k3 = clone_matrix(y);
    var k4 = clone_matrix(y);
    var a = [y[0].slice()];
    for(var k=1; k<=N; k++){
        F(k1,x,y);
        F(k2,x+0.5*h,vadd_scaled(n,size,yt,y,0.5*h,k1));
        F(k3,x+0.5*h,vadd_scaled(n,size,yt,y,0.5*h,k2));
        F(k4,x+h,vadd_scaled(n,size,yt,y,h,k3));
        for(var i=0; i<n; i++){
            for(var j=0; j<size; j++){
                y[i][j] = y[i][j]+h/6*(k1[i][j]+2*(k2[i][j]+k3[i][j])+k4[i][j]);
            }
        }
        x = x0+k*h;
        a.push(y[0].slice());
    }
    return pli_vec(x0,h,a);
}

function runge_kutta_vec(f,h,wm,wp,x0,y0){
    var gm = runge_kutta_vec_unilateral(f,-h,Math.abs(wm/h),x0,y0);
    var gp = runge_kutta_vec_unilateral(f,h,Math.abs(wp/h),x0,y0);
    return function(x){return x<x0?gm(x):gp(x);};
}

function vec_ode_as_fn_rec(v,t){
    if(Array.isArray(t)){
        if(t[0]==="D" && t[1]===v){
            return ["index","_x_",t[2]];
        }else{
            var a = [];
            for(var i=0; i<t.length; i++){
                a.push(vec_ode_as_fn_rec(v,t[i]));
            }
            return a;        
        }
    }else if(t===v){
        return ["index","_x_",0];
    }else{
        return t;
    }
}

function vec_ode_as_fn(t,v,order){
    var u = vec_ode_as_fn_rec(v,t[2]);
    id_type_table["_x_"] = TypeMatrix;
    infer_type(u);
    return compile(u,["t","_x_"]);
}

function ode_vec(t){
    var v = t[1][1];
    var order = t[1][2];
    var f = vec_ode_as_fn(t,v,order);
    var p = ftab["p"];
    if(!ftab.hasOwnProperty("p") || !Array.isArray(p)){
        throw lang.initial_value_problem_msg();
    }
    if(p.length<order+1){
        throw new Err(lang.p_to_short);
    }else{
        p = p.slice(0,order+1);
    }
    var w = ftab["tw"];
    var h = ftab["step"];
    var fv = runge_kutta_vec(f,h,-w,w,p[0],p.slice(1));
    ftab[v] = fv;
    id_type_table[v] = [TypeVector];
}


function equation(t){
    if(Array.isArray(t[1]) && t[1][0]==="D"){
        var term = t[1][1];
        if(Array.isArray(term) && term[0]==="[]"){
            ode_system(t);
            return;
        }else{
            var p = ftab["p"];
            if(Array.isArray(p) && p.length>1 && Array.isArray(p[1])){
                ode_vec(t);
            }else{
                var f = from_ode(graphics,t);
                ftab[term] = f;
            }
            return;
        }
    }
    eval_node(t);
}

function round_prec(x,n){
    var m = Math.pow(10,n);
    return Math.round(m*x)/m;
}

var slider_table = {};

function slider(t){
    var id = t[1];
    var a = compile(t[2],[])();
    var b = compile(t[3],[])();
    if(slider_table.hasOwnProperty(id)){
        var range = slider_table[id];
        range[0] = a;
        range[1] = b;
        return;
    }
    
    var range = [a,b];
    slider_table[id] = range;
    ftab_set(id,a);

    var slider = document.createElement("input");
    slider.setAttribute("type","range");
    slider.setAttribute("min","0");
    slider.setAttribute("max","100");
    slider.setAttribute("value","0");
    if(graphics.w>540){
        slider.setAttribute("style","width: 280px;");
    }

    var out = document.createElement("span");
    out.innerHTML = range[0];

    slider.addEventListener("input",function(){
        var t = this.value/100;
        var x = range[0]*(1-t)+range[1]*t;
        var size = 100/Math.abs(range[1]-range[0]);
        var n = 1+Math.round(Math.max(0,lg(size)));
        x = round_prec(x,n);
        ftab_set(id,x);
        graphics.animation = true;
        out.innerHTML = x;
        update(graphics);
    });
    slider.addEventListener("change",function(){
        graphics.animation = false;
        update(graphics);
    });
    var style = [
        "border-left: 6px solid #a0a0a0;",
        "padding-left: 10px;",
        "margin-top: 8px; margin-bottom: 8px;",
        "font-size: 60%"
    ].join("");
    
    var content = document.createElement("div");
    content.style = style;
    content.appendChild(document.createTextNode(id+": "));
    content.appendChild(out);
    content.appendChild(document.createElement("br"));
    content.appendChild(slider);

    var adds = document.getElementById("adds");
    adds.appendChild(content);
}

var ani_on = false;

function ani(t){
    if(ani_on) return;
    ani_on = true;
    var id = t[1];
    var fp,a;
    if(t.length<3){
        a = 0;
    }else{
        a = compile(t[2],[])();
    }
    if(t.length<4){
        fp = function(t){return a+t;};
    }else{
        var b = compile(t[3],[])();
        fp  = function(t){return 0.5*(a+b+(b-a)*Math.sin(t));};
    }
    var tstep = 0;
    var animation = async function(){
        while(1){
            ftab[id] = fp(tstep);
            tstep+=0.04;
            graphics.animation = true;
            update(graphics);
            await sleep(20);
        }
    };
    animation();
}

function line(gx,color,x1,y1,x2,y2){
    var x,y;
    var d = 1/Math.hypot(x2-x1,y2-y1);
    for(var t=0; t<1; t+=d){
        x = x1+t*(x2-x1);
        y = y1+t*(y2-y1);
        gx.fpsets(color[3],color,x,y);
    }
}

function arrow(gx,color,x,y,vx,vy){
    var x1 = gx.px0+ax*gx.mx*x;
    var y1 = gx.py0-ay*gx.my*y;
    var m = 20/Math.hypot(vx,vy);
    var x2 = x1+ax*gx.mx*vx;
    var y2 = y1-ay*gx.my*vy;
    if(Math.abs(x2-x1)<200000 && Math.abs(y2-y1)<200000){
        line(gx,color,x1,y1,x2,y2);
        var a = 0.5*m;
        var Lb = [0.2,0.14,0.07]
        for(var i=0; i<Lb.length; i++){
            var b = Lb[i]*m;
            line(gx,color,x2,y2,x2-a*vx-b*vy,y2+a*vy-b*vx);
            line(gx,color,x2,y2,x2-a*vx+b*vy,y2+a*vy+b*vx);
        }
    }
}

function vec(t){
    infer_type(t[1]);
    var p = compile(t[1],[])();
    if(p==0) p = [0,0];
    var a = t.slice(2).map(function(x){
        infer_type(x);
        return compile(x,[])();
    });
    post_app_stack.push(function(){
        var gx = graphics;
        var Ax = ax*gx.mx;
        var Ay = ay*gx.my;
        var px0 = gx.px0;
        var py0 = gx.py0;
        var n = color_table.length;
        for(var i=0; i<a.length; i++){
            var color = color_table[i%n];
            arrow(gx,color,p[0],p[1],a[i][0],a[i][1]);
        }
        flush(gx);
        labels(gx);
    });
}

function polygonal_chain(t,points){
    var a;
    if(t.length==2){
        infer_type(t[1]);
        a = compile(t[1],[])();
    }else{
        a = t.slice(1).map(function(x){
            infer_type(x);
            return compile(x,[])();
        });
    }
    post_app_stack.push(function(){
        var gx = graphics;
        var Ax = ax*gx.mx;
        var Ay = ay*gx.my;
        var px0 = gx.px0;
        var py0 = gx.py0;
        var color = color_table[0];
        for(var i=1; i<a.length; i++){
            var p = a[i-1];
            var q = a[i];
            line(gx,color,px0+Ax*p[0],py0-Ay*p[1],px0+Ax*q[0],py0-Ay*q[1]);
        }
        if(points){
            for(var i=0; i<a.length; i++){
                var t = a[i];
                gx.circle(color,t[0],t[1],4,true);
            }        
        }

        flush(gx);
        labels(gx);
    });
}

function cmd_line(t){
    polygonal_chain(t,false);
}

function cmd_chain(t){
    polygonal_chain(t,true);
}

extension_table.cmd = {
    "=": equation, slider: slider, Regler: slider,
    ani: ani, vec: vec, line: cmd_line, chain: cmd_chain
};

