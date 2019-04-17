
ftab["mesh"] = 0.2;
ftab["maxcount"] = 4000;
ftab["parts"] = 2;

var last_input = "";

function enqueue(a,node,value){
    for(var i=0; i<a.length; i++){
        if(a[i][1] < value){
            a.splice(i,0,[node,value]);
            return;
        }
    }
    a.push([node,value]);
}

function reconstruct_path(node,predecessor){
    var a = [];
    a.push(node);
    while(predecessor.hasOwnProperty(node)){
        node = predecessor[node];
        a.push(node);
    }
    a.reverse();
    return a;
}

function contains(a,node){
    return a.findIndex(function(x){
        return x[0][0]==node[0] && x[0][1]==node[1]
    });
}

function new_expand_node(constraint,cost,g,h,predecessor){
    return function expand_node(node,open,closed){
        for(var i=-1; i<=1; i++){
            for(var j=-1; j<=1; j++){
                if(i==j) continue;
                var successor = [node[0]+i,node[1]+j];
                if(constraint(successor) || closed.hasOwnProperty(successor)){
                    continue;
                }
                var tentative_g = g[node] + cost(node,successor);
                var index = contains(open,successor);
                if(index>=0 && tentative_g >= g[successor]){
                    continue;
                }
                predecessor[successor] = node;
                g[successor] = tentative_g;
                var f = tentative_g + h(successor);
                if(index>0){
                    var value = open[index][0];
                    open.splice(index,1);
                    enqueue(open,value,f);
                }else{
                    enqueue(open,successor,f);
                }
            }
        }
    };
}

function a_star(start,goal,constraint){
    var cost = function(p,q){
        return Math.hypot(p[0]-q[0],p[1]-q[1]);
    };
    var h = function(node){
        return Math.hypot(goal[0]-node[0],goal[1]-node[1]);
    };
    var g = {};
    var predecessor = {};
    var expand_node = new_expand_node(constraint,cost,g,h,predecessor);

    var open = [];
    var closed = {};

    open.push([start,0]);
    g[start] = 0;
    var count = 0;
    while(open.length!=0){
        var node = open.pop()[0];
        if(node[0]==goal[0] && node[1]==goal[1]){
            return reconstruct_path(node,predecessor);
        }
        closed[node] = 1;
        expand_node(node,open,closed);
        if(count>ftab["maxcount"]){
            return null;
        }
        count++;
    }
    return null;
}

function find_path(fconstraint,fstart,fgoal){
    var m = ftab["mesh"];
    var constraint = function(node){
        var x = fstart[0]+m*node[0];
        var y = fstart[1]+m*node[1];
        return fconstraint(x,y)!=0;
    };
    var goal = [
        Math.round((fgoal[0]-fstart[0])/m),
        Math.round((fgoal[1]-fstart[1])/m)
    ];
    var path = a_star([0,0],goal,constraint);
    if(path===null){
        return [];
    }else{
        var fpath = path.map(function(node){
            return [
                fstart[0]+m*node[0],
                fstart[1]+m*node[1]
            ];
        });
        var end = fpath[fpath.length-1];
        if(Math.abs(end[0]-fgoal[0])>1E-9 || Math.abs(end[1]-fgoal[1]>1E-9)){
            fpath.push(fgoal);
        }
        return fpath;
    }
}

function fine_path(a,m){
    var b = [];
    var n = a.length-1;
    var c = 1/m;
    for(var i=0; i<n; i++){
        var p = a[i];
        var q = a[i+1];
        for(var j=0; j<m; j++){
            var alpha = c*j;
            x = p[0]*(1-alpha)+alpha*q[0];
            y = p[1]*(1-alpha)+alpha*q[1];
            b.push([x,y]);
        }
    }
    b.push(a[a.length-1]);
    return b;
}

function tauten(a,constraint){
    var n = a.length-2;
    var count = 0;
    while(1){
        var modification = false;
        for(var i=0; i<n; i++){
            var p = a[i];
            var q = a[i+2];
            var m = [0.5*(p[0]+q[0]),0.5*(p[1]+q[1])];
            if(Math.abs(m[0]-a[i+1][0])<1E-9 && Math.abs(m[1]-a[i+1][1])<1E-9){
                continue;
            }
            if(!constraint(m[0],m[1])){
                a[i+1] = m;
                modification = true;
            }
        }
        if(!modification){
            // console.log("iterations needed: "+count);
            break;
        }
        count++;
    }
}

function path_length(a){
    var L = 0;
    var n = a.length-1;
    for(var i=0; i<n; i++){
        var p = a[i];
        var q = a[i+1];
        L += Math.hypot(p[0]-q[0],p[1]-q[1]);
    }
    return L;
}

function plot_node(gx,t,color){
    if(Array.isArray(t) && (t[0]==="path" || t[0]==="Pfad")){
        var constraint = compile(t[1],["x","y"]);
        var p = compile(t[2],[])();
        var q = compile(t[3],[])();
        plot_node_basic(gx,t[1],[0,60,0]);
        var input = document.getElementById("inputf").value;
        if(input == last_input){
            points_list(gx,color_table[0],ftab["p"],2);
        }else{
            last_input = input;
            var a = find_path(constraint,p,q);
            a = fine_path(a,ftab["parts"]);
            tauten(a,constraint);
            points_list(gx,color_table[0],a,1.6);
            var len = path_length(a);
            ftab["p"] = a;
            ftab["L"] = len;
            var adds = document.getElementById("adds");
            adds.innerHTML = "<p>Pfadlänge: "+len.toFixed(4);
        }
    }else{
        plot_node_basic(gx,t,color);
    }
}

