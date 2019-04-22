

var update_needed = true;
var export_input = false;
var mathjax_mode = false;
var last_input = undefined;
var export_fn = into_latex;

var Text = 0;
var Symbol = 1;
var Digits = 2;
var Macro = 3;
var Space = 4;
var Terminal = 5;

var standard_context = {
    font_extra: false
};

var formula_list = [];
var formula_map = {};

var valid_bbcode = {
    "b":1, "i":1, "u":1, "tt":1, "code":1, "url":1, "quote":1
};

var argc_table = {
"frac": 2,
"mathrm": 1,
"mathbf": 1,
"mathbb": 1,
"mathsf": 1,
"mathcal": 1,    
"sqrt": 1,
"vec": 1,
"bar": 1,
"dot": 1,
"ddot": 1,
"dddot": 1,
"ddddot": 1,
"overline": 1,
"underline": 1,
"ol": 1,
"ul": 1,
"overset": 2,
"underset": 2,
"underbrace": 1,
"overbrace": 1,
"ub":1,
"ob":1,
"operatorname": 1,
"op": 1,
"binom": 2,
"big": 1,
"bigg": 1,
"Big": 1,
"Bigg": 1,
"begin": 1,
"end": 1,
"tilde": 1,
"hat": 1,
"text": 1
};

var opt_table = {
    "sqrt": 1
};

var greek_upper = {
"Gamma": "&Gamma;",
"Delta": "&Delta;",
"Theta": "&Theta;",
"Lambda": "&Lambda;",
"Xi": "&Xi;",
"Pi": "&Pi;",
"Sigma": "&Sigma;",
"Upsilon": "&Upsilon;",
"Phi": "&Phi;",
"Chi": "&Chi;",
"Psi": "&Psi;",
"Omega": "&Omega;"
};

var macro_tab_mathml = {
"sin": "<mi>sin</mi>",
"cos": "<mi>cos</mi>",
"tan": "<mi>tan</mi>",
"cot": "<mi>cot</mi>",
"sec": "<mi>sec</mi>",
"csc": "<mi>csc</mi>",
"sinh": "<mi>sinh</mi>",
"cosh": "<mi>cosh</mi>",
"tanh": "<mi>tanh</mi>",
"coth": "<mi>coth</mi>",
"arcsin": "<mi>arcsin</mi>",
"arccos": "<mi>arccos</mi>",
"arctan": "<mi>arctan</mi>",
"arccot": "<mi>arccot</mi>",
"arg": "<mi>arg</mi>",
"deg": "<mi>deg</mi>",
"det": "<mi>det</mi>",
"dim": "<mi>dim</mi>",
"hom": "<mi>hom</mi>",
"inf": "<mi>inf</mi>",
"sup": "<mi>sup</mi>",
"ker": "<mi>ker</mi>",
"lim": "<mi>lim</mi>",
"liminf": "<mi>liminf</mi>",
"limsup": "<mi>limsup</mi>",
"Pr": "<mi>Pr</mi>",
"exp": "<mi>exp</mi>",
"ln": "<mi>ln</mi>",
"lg": "<mi>lg</mi>",
"log": "<mi>log</mi>",
"min": "<mi>min</mi>",
"max": "<mi>max</mi>",
"gcd": "<mi>gcd</mi>",
"int": "<mo>&int;</mo>",
"iint": "<mo>∬</mo>",
"iiint": "<mo>∭</mo>",
"oint": "<mo>∮</mo>",
"pm": "<mo>&plusmn;</mo>",
"mp": "<mo>∓</mo>",
"sum": "<mo>&sum;</mo>",
"prod": "<mo>&prod;</mo>",
"coprod": "<mo>∐</mo>",
"bigcap": "<mo>⋂</mo>",
"bigcup": "<mo>⋃</mo>",
"bigwedge": "<mo>⋀ </mo>",
"bigvee": "<mo>⋁</mo>",

"langle": "<mo stretchy='false'>&lang;</mo>",
"rangle": "<mo stretchy='false'>&rang;</mo>",
"lfloor": "<mo stretchy='false'>⌊</mo>",
"rfloor": "<mo stretchy='false'>⌋</mo>",
"lceil": "<mo stretchy='false'>⌈</mo>",
"rceil": "<mo stretchy='false'>⌉</mo>",
"nabla": "<mo>&nabla;</mo>",
"partial": "<mo>&part;</mo>",
"Re": "<mo>&real;</mo>",
"Im": "<mo>&image;</mo>",
"emptyset": "<mi>&empty;</mi>",
"varnothing": "<mi>&empty;</mi>",
"colon": ":<mspace width='4px'/>",
"infty": "<mi>&infin;</mi>",
"div": "<mo>&divide;</mo>",
"surd": "<mo>√</mo>",
"backslash": "<mo>\\</mo>",
"prime": "<mo>'</mo>",
"forall": "<mo>&forall;</mo>",
"exists": "<mo>&exist;</mo>",
"ell": "<mi>ℓ</mi>",
"aleph": "<mi></mi>",
"wp": "<mi>℘</mi>",

"cap": "<mo>&cap;</mo>",
"cup": "<mo>&cup;</mo>",
"land": "<mo>&and;</mo>",
"lor": "<mo>&or;</mo>",
"wedge": "<mo>&and;</mo>",
"vee": "<mo>&or;</mo>",
"sqcap": "<mo>⊓</mo>",
"sqcup": "<mo>⊔</mo>",
"circ": "<mo>∘</mo>",
"ast": "<mo>*</mo>",
"cdot": "<mo>&sdot;</mo>",
"star": "<mo>⋆</mo>",
"bullet": "<mo>∙</mo>",
"times": "<mo>&times;</mo>",
"oplus": "<mo>&oplus;</mo>",
"ominus": "<mo>⊖</mo>",
"otimes": "<mo>&otimes;</mo>",
"odot": "<mo>⊙</mo>",
"oslash": "<mo>⊘</mo>",
"boxplus": "<mo>⊞</mo>",
"boxminus": "<mo>⊟</mo>",
"boxtimes": "<mo>⊠</mo>",
"boxdot": "<mo>⊡</mo>",
"uplus": "<mo>⊎</mo>",
"setminus": "<mo>\\</mo>",
"sharp": "<mo>♯</mo>",
"flat": "<mo>♭</mo>",
"natural": "<mo>♮</mo>",
"neg": "<mo>&not;</mo>",

"in": "<mo>&isin;</mo>",
"notin": "<mo>&notin;</mo>",
"subset": "<mo>&sub;</mo>",
"subseteq": "<mo>&sube;</mo>",
"supset": "<mo>&sup;</mo>",
"supseteq": "<mo>&supe;</mo>",
"bot": "<mo>&perp;</mo>",
"top": "<mo>⊤</mo>",
"perp": "<mo>&perp;</mo>",
"models": "<mo>⊨</mo>",
"vdash": "<mo>⊢</mo>",
"le": "<mo>&le;</mo>",
"ge": "<mo>&ge;</mo>",
"leq": "<mo>&le;</mo>",
"geq": "<mo>&geq;</mo>",
"ne": "<mo>&ne;</mo>",
"neq": "<mo>&ne;</mo>",
"equiv": "<mo>&equiv;</mo>",
"cong": "<mo>&cong;</mo>",
"sim": "<mo>&sim;</mo>",
"simeq": "<mo>≃</mo>",
"approx": "<mo>&asymp;</mo>",
"lhd": "<mo>⊲</mo>",
"rhd": "<mo>⊳</mo>",
"unlhd": "<mo>⊴</mo>",
"unrhd": "<mo>⊵</mo>",
"parallel": "<mo>||</mo>",
"propto": "<mo>&prop;</mo>",

"to": "<mo>&rarr;</mo>",
"mapsto": "<mo>↦</mo>",
"longmapsto": "<mo>⟼</mo>",
"implies": "<mo>⟹</mo>",
"iff": "<mo>⟺</mo>",
"leftarrow": "<mo>&larr;</mo>",
"rightarrow": "<mo>&rarr;</mo>",
"Leftarrow": "<mo>&lArr;</mo>",
"Rightarrow": "<mo>&rArr;</mo>",
"leftrightarrow": "<mo>&harr;</mo>",
"Leftrightarrow": "<mo>&hArr;</mo>",
"uparrow": "<mo>&uarr;</mo>",
"downarrow": "<mo>&darr;</mo>",
"Uparrow": "<mo>⇑</mo>",
"Downarrow": "<mo>⇓</mo>",
"nearrow": "<mo>↗</mo>",
"searrow": "<mo>↘</mo>",
"nwarrow": "<mo>↖</mo>",
"swarrow": "<mo>↙</mo>",
"longrightarrow": "<mo>⟶</mo>",
"longleftarrow": "<mo>⟵</mo>",
"longleftrightarrow": "<mo>⟷</mo>",
"Longrightarrow": "<mo>⟹</mo>",
"Longleftarrow": "<mo>⟸</mo>",
"Longleftrightarrow": "<mo>⟺</mo>",
"rightharpoonup": "<mo>⇀</mo>",
"leftharpoonup": "<mo>↼</mo>",
"rightharpoondown": "<mo>↽</mo>",
"leftharpoondown": "<mo>⇁</mo>",

"ldots": "<mo>&hellip;</mo>",
"cdots": "<mo>⋯</mo>",
"vdots": "<mo>⋮</mo>",
"ddots": "<mo>⋱</mo>",
"dotsm": "<mo>⋯</mo>",
"dotsb": "<mo>⋯</mo>",
"dotsi": "<mo>⋯</mo>",
"dotso": "<mo>&hellip;</mo>",
"dotsc": "<mo>&hellip;</mo>",
"mid": "<mo stretchy='false'>|</mo>",
"quad": "<mspace width='14px'/>",
"qquad": "<mspace width='28px'/>",
"alpha": "<mi>&alpha;</mi>",
"beta": "<mi>&beta;</mi>",
"gamma": "<mi>&gamma;</mi>",
"delta": "<mi>&delta;</mi>",
"epsilon": "<mi>&epsilon;</mi>",
"varepsilon": "<mi>&epsilon;</mi>",
"zeta": "<mi>&zeta;</mi>",
"eta": "<mi>&eta;</mi>",
"theta": "<mi>&theta;</mi>",
"iota": "<mi>&iota;</mi>",
"kappa": "<mi>&kappa;</mi>",
"lambda": "<mi>&lambda;</mi>",
"mu": "<mi>&mu;</mi>",
"nu": "<mi>&nu;</mi>",
"xi": "<mi>&xi;</mi>",
"omicron": "<mo>&omicron;</mi>",
"pi": "<mi>&pi;</mi>",
"rho": "<mi>&rho;</mi>",
"varrho": "<mi>&rho;</mi>",
"sigma": "<mi>&sigma;</mi>",
"tau": "<mi>&tau;</mi>",
"upsilon": "<mi>&upsilon;</mi>",
"phi": "<mi>&phi;</mi>",
"varphi": "<mi>&phi;</mi>",
"chi": "<mi>&chi;</mi>",
"psi": "<mi>&psi;</mi>",
"omega": "<mi>&omega;</mi>",
",": "<mspace width='3px'/>",
":": "<mspace width='4px'/>",
";": "<mspace width='5px'/>",
"{": "<mo stretchy='false'>{</mo>",
"}": "<mo stretchy='false'>}</mo>",
"|": "<mo stretchy='false'>||</mo>",
"%": "<mo>%</mo>",
"#": "<mo>#</mo>",
"&": "<mo>&amp;</mo>",
"_": "<mo>_</mo>",
"!": "",

"N": "<mi mathvariant='bold'>N</mi>",
"Z": "<mi mathvariant='bold'>Z</mi>",
"Q": "<mi mathvariant='bold'>Q</mi>",
"R": "<mi mathvariant='bold'>R</mi>",
"C": "<mi mathvariant='bold'>C</mi>",
"H": "<mi mathvariant='bold'>H</mi>",
"P": "<mi mathvariant='bold'>P</mi>",
"K": "<mi mathvariant='bold'>K</mi>",
"F": "<mi mathvariant='bold'>F</mi>",
"la": "<mo>&larr;</mo>",
"ra": "<mo>&rarr;</mo>",
"lra": "<mo>&harr;</mo>",
"La": "<mo>&lArr;</mo>",
"Ra": "<mo>&rArr;</mo>",
"Lra": "<mo>&hArr;</mo>",
"longra": "<mo>⟶</mo>",
"longla": "<mo>⟵</mo>",
"longlra": "<mo>⟷</mo>",
"Longra": "<mo>⟹</mo>",
"Longla": "<mo>⟸</mo>",
"Longlra": "<mo>⟺</mo>",
"ua": "<mo>&uarr;</mo>",
"da": "<mo>&darr;</mo>",
"Ua": "<mo>⇑</mo>",
"Da": "<mo>⇓</mo>",
"re": "<mi>Re</mi>",
"im": "<mi>Im</mi>",
"grad": "<mi>grad</mi>",
"Bild": "<mi>Bild</mi>",
"Kern": "<mi>Kern</mi>",
"rk": "<mi>rk</mi>",
"rg": "<mi>rg</mi>",
"rank": "<mi>rank</mi>",
"rang": "<mi>rang</mi>",
"id": "<mi>id</mi>",
"map": "<mi>map</mi>",
"Abb": "<mi>Abb</mi>",
"sur": "<mi>sur</mi>",
"inj": "<mi>inj</mi>",
"bij": "<mi>bij</mi>",
"Eig": "<mi>Eig</mi>",
"lcm": "<mi>lcm</mi>",
"ggT": "<mi>ggT</mi>",
"kgV": "<mi>kgV</mi>",
"ord": "<mi>ord</mi>",
"const": "<mi>const</mi>",
"proj": "<mi>proj</mi>",
"adj": "<mi>adj</mi>",
"tr": "<mi>tr</mi>",
"GL": "<mi>GL</mi>",
"var": "<mi>var</mi>",
"dd": "<mo mathvariant='normal' lspace='0px' rspace='0px'>d</mo>"
};

var macro_symbol_table = {
  "over": 1, "atop": 1, "above": 1,
  "limits": 1, "nolimits": 1,
  "left": 1, "right": 1
};

var macro_operator_table = {
  "over": [2,"frac"],
  "atop": [2,"_atop_"],
  "above": [2,"_above_"],
  "limits": [1,"_limits_"],
  "nolimits": [1,"_nolimits_"]
};

function object_update(x,y,f){
    var a = Object.keys(y);
    for(var i=0; i<a.length; i++){
        x[a[i]] = f(y[a[i]]);
    }
}

object_update(macro_tab_mathml,greek_upper,function(x){
    return "<mi mathvariant='normal'>"+x+"</mi>";
});

function isalpha(s){
    return /^[a-zäöü]+$/i.test(s);
}

function isdigit(s){
    return /^\d+$/.test(s);
}

function isspace(s){
    return s==' ' || s=='\t' || s=='\n';
}


function flush_node(a,node){
    if(node.length>0){
        a.push([Text,node.join("")]);
        node.length = 0;
    }
}

function consume_until(buffer,s,i,n,end){
    var m = end.length;
    while(i<n){
        if(s[i]==end[0] && s.slice(i,i+m)==end){
            return i+m;
        }
        buffer.push(s[i]);
        i++;
    }
    return i;
}

function is_valid_bbcode(s,i,n){
    var id = [];
    var m = Math.min(n,i+10);
    for(var j=i+1; j<m; j++){
        if(isalpha(s[j])){
            id.push(s[j]);
        }else{
            return valid_bbcode.hasOwnProperty(id.join(""));
        }
    }
    return false;
}

function scan_bbcode(a,s,i,n){
    if(!is_valid_bbcode(s,i,n)){
        a.push([Text,"["]);
        return i+1;
    }else{
        a.push([Symbol,"["]);
        i+=1;
    }
    var node = [];
    while(i<n && s[i]!=']'){
        if(s[i]=='='){
            flush_node(a,node);
            a.push([Symbol,"="]);
        }else{
            node.push(s[i]);
        }
        i++;
    }
    flush_node(a,node);
    return i;
}

function scan(s){
    var i = 0;
    var n = s.length;
    var node = [];
    var a = [];
    while(i<n){
        if(s[i]=='`'){
            if(i+2<n && s[i+1]=='`' && s[i+2]=='`'){
                flush_node(a,node);
                a.push([Symbol,"```"]);
                i+=3;
            }else{
                flush_node(a,node);
                a.push([Symbol,"`"]);
                i++;
            }
        }else if(s[i]=='\n'){
            flush_node(a,node);
            a.push([Symbol,"n"]);
            i++;
        }else if(s[i]=='$'){
            flush_node(a,node);
            i++;
            var fs = [];
            while(i<n && s[i]!='$'){
                fs.push(s[i]);
                i++;
            }
            if(i<n && s[i]=='$') i++;
            a.push([Symbol,"$"]);
            a.push([Text,fs.join("")]);
        }else if(i+1<n && s[i]=='*' && s[i+1]=='*'){
            flush_node(a,node);
            a.push([Symbol,"**"]);
            i+=2;
        }else if(i+1<n && s[i]=='_' && s[i+1]=='_'){
            flush_node(a,node);
            a.push([Symbol,"__"]);
            i+=2;
        }else if(i+1<n && s[i]=='[' && s[i+1]=='/'){
            flush_node(a,node);
            a.push([Symbol,"[/"]);
            i+=2;
        }else if(s[i]=='['){
            flush_node(a,node);
            if(i+1<n && s[i+1]=='l'){
                if(s.slice(i,i+3)=="[l]"){
                    i+=3;
                    var buffer = [];
                    i = consume_until(buffer,s,i,n,"[/l]");
                    a.push([Symbol,"$"]);
                    a.push([Text,buffer.join("")]);
                    continue;
                }else if(s.slice(i,i+7)=="[latex]"){
                    i+=7;
                    var buffer = [];
                    i = consume_until(buffer,s,i,n,"[/latex]");
                    a.push([Symbol,"$"]);
                    a.push([Text,buffer.join("")]);
                    continue;
                }
            }else if(i+2<n && s[i+1]=='*' && s[i+2]==']'){
                i+=3;
                a.push([Symbol,"*"]);
                continue;
            }
            i = scan_bbcode(a,s,i,n);
        }else if(s[i]==']'){
            flush_node(a,node);
            a.push([Symbol,s[i]]);
            i+=1;        
        }else{
            node.push(s[i]);
            i++;
        }
    }
    flush_node(a,node);
    a.push([Terminal]);
    return a;
}

function tex_scan(s){
    var i = 0;
    var n = s.length;
    var a = [];
    while(i<n){
        if(isspace(s[i])){
            i++;
        }else if(isalpha(s[i])){
            a.push([Text,s[i]]);
            i++;
        }else if(isdigit(s[i])){
            a.push([Digits,s[i]]);
            i++;
        }else if(s[i]=='\\'){
            i++;
            if(i<n && s[i]=='\\'){
                a.push([Symbol,"br"]);
                i++;
            }else{
                while(i<n && isspace(s[i])) i++;
                if(i<n && isalpha(s[i])){
                    var j = i;
                    while(i<n && isalpha(s[i])) i++;
                    var u = s.slice(j,i);
                    if(macro_symbol_table.hasOwnProperty(u)){
                        a.push([Symbol,u]);
                    }else{
                        a.push([Macro,u]);
                    }
                }else if(i<n){
                    a.push([Macro,s[i]]);
                    i++;
                }
            }
        }else if(i+1<n && s[i]==':' && s[i+1]=='='){
            a.push([Symbol,":="]);
            i+=2;
        }else if(s[i]=="'"){
            var j = i;
            while(i<n && s[i]=="'") i++;
            a.push([Symbol,s.slice(j,i)]);
        }else{
            a.push([Symbol,s[i]]);
            i++;
        }
    }
    a.push([Terminal]);
    return a;
}

function tex_join(t){
    if(Array.isArray(t)){
        var a = [];
        for(var i=1; i<t.length; i++){
            a.push(tex_join(t[i]));
        }
        return a.join("");
    }else{
        return t;
    }
}

function tex_macro(id,i){
    var argc = 0;
    var argv = [];
    var argv_opt = [];
    if(argc_table.hasOwnProperty(id)){
        argc = argc_table[id];
    }
    if(opt_table.hasOwnProperty(id)){
        var t = i.a[i.index];
        if(t[0]==Symbol && t[1]=="["){
            i.index++;
            var y = tex_ast(i,"]");
            argv_opt.push(y);
            t = i.a[i.index];
            if(t[0]==Symbol && t[1]=="]") i.index++;
        }
    }
    for(var k=0; k<argc; k++){
        var t = i.a[i.index];
        if(t[0]==Terminal) break;
        var y = tex_node(i);
        argv.push(y);
    }
    if(id=="begin" && argv.length==1){
        id = tex_join(argv[0]);
        var x = tex_matrix(i);
        var t = i.a[i.index];
        if(t[0]==Macro){
            var terminal = tex_macro(t[1],i);
        }
        return ["\\",id,[x],[]];
    }else{
        return ["\\",id,argv,argv_opt];
    }
}

function tex_node(i){
    var t = i.a[i.index];
    if(t[0]==Text){
        i.index++;
        return t[1];
    }else if(t[0]==Symbol){
        var op = t[1];
        if(op=="{"){
            i.index++;
            var y = tex_ast(i);
            var t = i.a[i.index];
            if(t[0]==Symbol && t[1]=="}"){i.index++;}
            return y;
        }else if(op=="left"){
            i.index++;
            var a = tex_node(i);
            if(a===undefined) a = "";
            var x = tex_ast(i,"right");
            var t = i.a[i.index];
            if(t[0]==Symbol && t[1]=="right"){i.index++;}
            var t = i.a[i.index];
            var b = tex_node(i);
            if(b===undefined) b = "";
            return ["\\","_brackets_",[x,a,b],[]];
        }else{
            i.index++;
            return [op];
        }
    }else if(t[0]==Macro){
        i.index++;
        return tex_macro(t[1],i);
    }else if(t[0]==Digits){
        i.index++;
        return ["number",t[1]];
    }else if(t[0]==Space){
        i.index++;
        var x = tex_node(i);
        return ["space",t[1],x];
    }
}

function tex_postfix(i){
    var x = tex_node(i);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="limits" || t[1]=="nolimits"){
        i.index++;
        var op = macro_operator_table[t[1]];
        return ["\\",op[1],[x],[]];
    }else{
        return x;
    }
}

function tex_sub_sup(i){
    var x = tex_postfix(i);
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && (t[1]=='_' || t[1]=='^')){
            i.index++;
            var y = tex_postfix(i);
            x = [t[1],x,y];
        }else{
            break;
        }
    }
    return x;
}

function tex_row(i,t0){
    var a,t;
    t = i.a[i.index];
    if(t[0]==Symbol && t[1]=='&'){
        a = ["&",""];
    }else{
        a = ["&",tex_ast(i)];
    }
    while(1){
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]=='&'){
            i.index++;
            t = i.a[i.index];
            if(t[0]==Symbol && (t[1]=='&' || t[1]=='br')){
                a.push("");
            }else{
                a.push(tex_ast(i));
            }
        }else{
            break;
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function tex_matrix(i){
    var a,t;
    t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="br"){
        a = ["br",""];
    }else{
        a = ["br",tex_row(i)];
    }
    while(1){
        t = i.a[i.index];
        if(t[0]==Symbol && t[1]=="br"){
            i.index++;
            t = i.a[i.index];
            if(t[0]==Symbol && t[1]=="br"){
                a.push("");
            }else{
                a.push(tex_row(i));
            }
        }else{
            break;
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function tex_ast(i,stop){
    var a = ["{}"];
    while(1){
        var t = i.a[i.index];
        if(t[0]==Terminal){
            break;
        }else if(stop!=undefined && t[0]==Symbol && t[1]==stop){
            break;
        }else if(t[0]==Symbol && (t[1]=="}" || t[1]=="&" || t[1]=="br")){
            break;
        }else if(t[0]==Macro && t[1]=="end"){
            break;
        }else if(t[0]==Symbol && macro_operator_table.hasOwnProperty(t[1])){
            var op = macro_operator_table[t[1]];
            i.index++;
            var b = tex_ast(i);
            a = ["{}",["\\",op[1],[a,b],[]]];
        }else{1
            a.push(tex_sub_sup(i));
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function tex_parse(s){
    var a = tex_scan(s);
    var i = {a: a, index: 0, n: a.length};
    return tex_ast(i);
}

function wiki_syntax(a,i,end,op){
    i.index++;
    var y = ast(i,end);
    var t = i.a[i.index];
    if(t[0]==Symbol && t[1]==end){
        i.index++;
    }
    a.push([op,y]);
}

function bbcode(a,i){
    i.index++;
    var t = i.a[i.index];
    if(t[0]!=Text){
        a.push("[");
        return;
    }
    var id = t[1].toLowerCase();
    var value = null;
    i.index++;
    t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="="){
        i.index++;
        t = i.a[i.index];
        if(t[0]==Text){
            value = t[1];
            i.index++;
            t = i.a[i.index];
        }
    }
    if(t[0]!=Symbol || t[1]!="]"){
        a.push("["+id);
        return;
    }
    i.index++;
    var y = ast(i,"[/");
    var t = i.a[i.index];
    if(t[0]!=Symbol || t[1]!="[/"){
        a.push(value==null?[id,y]:[id,y,value]);
        return;
    }
    i.index++;
    t = i.a[i.index];
    if(t[0]==Text) i.index++;
    t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="]") i.index++;
    a.push(value==null?[id,y]:[id,y,value]);
}

function ast(i,stop){
    var a = ["block"];
    while(1){
        var t = i.a[i.index];
        if(t[0]==Terminal){
            break;
        }else if(t[0]==Text){
            a.push(t[1]);
            i.index++;
        }else if(t[0]==Symbol){
            if(t[1]==stop) break;
            if(t[1]=="n"){
                i.index++;
                a.push(["n"]);
            }else if(t[1]=="$"){
                i.index++;
                a.push(["tex",i.a[i.index][1]]);
                i.index++;
            }else if(t[1]=="`"){
                wiki_syntax(a,i,"`","tt");
            }else if(t[1]=="**"){
                wiki_syntax(a,i,"**","b");
            }else if(t[1]=="__"){
                wiki_syntax(a,i,"__","i");
            }else if(t[1]=="```"){
                wiki_syntax(a,i,"```","code");
            }else if(t[1]=="["){
                bbcode(a,i);
            }else if(t[1]=="*"){
                a.push(["li"]);
                i.index++;
            }else{
                a.push(t[1]);
                i.index++;
            }
        }
    }
    if(a.length==2){
        return a[1];
    }else{
        return a;
    }
}

function parse(s){
    var a = scan(s);
    var i = {a: a, index: 0, n: a.length};
    return ast(i);
}

function encode_html(s){
    var a = [];
    for(var i=0; i<s.length; i++){
        var c = s[i];
        if(c=='<'){
            a.push("&lt;");
        }else if(c=='>'){
            a.push("&gt;");
        }else if(c=='&'){
            a.push("&amp;");
        }else{
            a.push(s[i]);
        }
    }
    return a.join("");
}

function tex_cell_mathml(buffer,t,context){
    buffer.push("<mtd>");
    tex_export_mathml(buffer,t,context);
    buffer.push("</mtd>");
}

function tex_row_mathml(buffer,t,context){
    buffer.push("<mtr>");
    if(Array.isArray(t) && t[0]=="&"){
        for(var i=1; i<t.length; i++){
            tex_cell_mathml(buffer,t[i],context);
        }
    }else{
        tex_cell_mathml(buffer,t,context);
    }
    buffer.push("</mtr>");
}

function tex_matrix_mathml(buffer,t,context,left,right){
    buffer.push("<mrow><mo>");
    buffer.push(left);
    buffer.push("</mo><mtable>");
    if(Array.isArray(t) && t[0]=="br"){
        for(var i=1; i<t.length; i++){
            tex_row_mathml(buffer,t[i],context);
        }
    }else{
        tex_row_mathml(buffer,t,context);
    }
    buffer.push("</mtable><mo>");
    buffer.push(right);
    buffer.push("</mo></mrow>");
}

var brackets_table = {
    "pmatrix": ["(",")"],
    "bmatrix": ["[","]"],
    "vmatrix": ["|","|"],
    "Bmatrix": ["{","}"],
    "Vmatrix": ["‖","‖"],
    "matrix": ["",""],
    "cases": ["{",""]
};

function bracket_symbol(buffer,t){
    if(Array.isArray(t) && t[0]==="\\"){
        var op = t[1];
        if(op==="{"){buffer.push("{");}
        else if(op=="}"){buffer.push("}");}
        else if(op=="|"){buffer.push("‖");}
        else if(op=="langle"){buffer.push("&lang;");}
        else if(op=="rangle"){buffer.push("&rang;");}
    }else if(Array.isArray(t)){
        if(t[0]!==".") buffer.push(t[0]);
    }else{
        buffer.push(t);
    }
}

function tex_macro_mathml(buffer,id,a,opt,context){
    if(macro_tab_mathml.hasOwnProperty(id)){
        buffer.push(macro_tab_mathml[id]);
    }else if(id=="frac"){
        buffer.push("<mfrac>");
        tex_export_mathml(buffer,a[0],context);
        tex_export_mathml(buffer,a[1],context);
        buffer.push("</mfrac>");
    }else if(
        id=="mathrm" || id=="mathbf" || id=="mathbb" ||
        id=="mathsf" || id=="mathcal" || id=="text"
    ){
        if(id=="text") id="mathrm";
        buffer.push("<mrow>");
        tex_export_mathml(buffer,a[0],{font_extra: true, font_type: id});
        buffer.push("</mrow>");
    }else if(id=="sqrt"){
        if(opt.length!=0){
            buffer.push("<mroot>");
            tex_export_mathml(buffer,a[0],context);
            tex_export_mathml(buffer,opt[0],context);
            buffer.push("</mroot>");
        }else{
            buffer.push("<msqrt>");
            tex_export_mathml(buffer,a[0],context);
            buffer.push("</msqrt>");
        }
    }else if(id=="vec"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo mathsize='60%'>&rarr;</mo>"); // &#8407;
        buffer.push("</mover>");
    }else if(id=="_brackets_"){
        buffer.push("<mrow><mo>");
        bracket_symbol(buffer,a[1]);
        buffer.push("</mo>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo>");
        bracket_symbol(buffer,a[2]);
        buffer.push("</mo></mrow>");
    }else if(id=="big"){
        buffer.push("<mo minsize='1.2em' maxsize='1.2em'>");
        bracket_symbol(buffer,a);
        buffer.push("</mo>");
    }else if(id=="Big"){
        buffer.push("<mo minsize='1.7em' maxsize='1.7em'>");
        bracket_symbol(buffer,a);
        buffer.push("</mo>");
    }else if(id=="bigg"){
        buffer.push("<mo minsize='2.2em' maxsize='2.2em'>");
        bracket_symbol(buffer,a);
        buffer.push("</mo>");
    }else if(id=="Bigg"){
        buffer.push("<mo minsize='2.6em' maxsize='2.6em'>");
        bracket_symbol(buffer,a);
        buffer.push("</mo>");
    }else if(id=="bar" || id=="ol" || id=="overline"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='true'>&OverBar;</mo>");
        buffer.push("</mover>");
    }else if(id=="tilde"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='true'>~</mo>");
        buffer.push("</mover>");
    }else if(id=="hat"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='false'>ˆ</mo>");
        buffer.push("</mover>");
    }else if(id=="dot"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo>.</mo>");
        buffer.push("</mover>");
    }else if(id=="ddot"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo>..</mo>");
        buffer.push("</mover>");
    }else if(id=="dddot"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo>...</mo>");
        buffer.push("</mover>");
    }else if(id=="ddddot"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo>....</mo>");
        buffer.push("</mover>");
    }else if(id=="ul" || id=="underline"){
        buffer.push("<munder accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='true'>&UnderBar;</mo>");
        buffer.push("</munder>");
    }else if(id=="op" || id=="operatorname"){
        buffer.push("<mstyle mathvariant='normal'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mspace width='4px'/></mstyle>");
    }else if(id=="binom"){
        buffer.push("<mrow><mo>(</mo><mfrac linethickness='0pt'>");
        tex_export_mathml(buffer,a[0],context);
        tex_export_mathml(buffer,a[1],context);
        buffer.push("</mfrac><mo>)</mo></mrow>");
    }else if(brackets_table.hasOwnProperty(id)){
        var brackets = brackets_table[id];
        tex_matrix_mathml(buffer,a[0],context,brackets[0],brackets[1]);
    }else if(id=="_atop_"){
        buffer.push("<mfrac linethickness='0pt'>");
        tex_export_mathml(buffer,a[0],context);
        tex_export_mathml(buffer,a[1],context);
        buffer.push("</mfrac>");
    }else if(id=="overset"){
        buffer.push("<mover>");
        tex_export_mathml(buffer,a[1],context);
        tex_export_mathml(buffer,a[0],context);
        buffer.push("</mover>");
    }else if(id=="underset"){
        buffer.push("<munder>");
        tex_export_mathml(buffer,a[1],context);
        tex_export_mathml(buffer,a[0],context);
        buffer.push("</munder>");
    }else if(id=="underbrace" || id=="ub"){
        buffer.push("<munder>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='true'>&UnderBrace;</mo></munder>");
    }else if(id=="overbrace" || id=="ob"){
        buffer.push("<mover>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo stretchy='true'>&OverBrace;</mo></mover>");
    }else if(id=="_limits_" || id=="_nolimits_"){
        tex_export_mathml(buffer,a[0],context);
    }else{
        buffer.push("<mo>\\"+id+"</mo>");
    }
}

var under_over_table = {
    "sum":0, "lim":0, "coprod":0,
    "bigcap":0, "bigcup":0, "bigwedge":0, "bigvee":0,
    "underbrace":0, "overbrace":0, "ub":0, "ob":0,
    "_limits_":0
};

function is_under_over(t){
    if(Array.isArray(t)){
        if(t[0]=="\\"){
            if(under_over_table.hasOwnProperty(t[1])) return true;
        }
    }
    return false;
}

function tex_identifier_mathml(buffer,t,context){
    if(context.font_extra){
        if(context.font_type=="mathrm"){
            buffer.push("<mo mathvariant='normal' lspace='0px' rspace='0px'>");
            buffer.push(t);
            buffer.push("</mo>");
        }else if(context.font_type=="mathbf"){
            buffer.push("<mo mathvariant='bold' lspace='0px' rspace='0px'>");
            buffer.push(t);
            buffer.push("</mo>");
        }else if(context.font_type=="mathbb"){
            buffer.push("<mo mathvariant='double-struck' lspace='0px' rspace='0px'>");
            buffer.push(t);
            buffer.push("</mo>");
        }else if(context.font_type=="mathcal"){
            buffer.push("<mo mathvariant='script' lspace='0px' rspace='0px'>");
            buffer.push(t);
            buffer.push("</mo>");
        }else if(context.font_type=="mathsf"){
            buffer.push("<mo mathvariant='sans-serif' lspace='0px' rspace='0px'>");
            buffer.push(t);
            buffer.push("</mo>");
        }
    }else{
        buffer.push("<mi>");
        buffer.push(t);
        buffer.push("</mi>");
    }
}

function tex_export_mathml(buffer,t,context){
    if(Array.isArray(t)){
        var op = t[0];
        if(op=="{}"){
            buffer.push("<mrow>");
            for(var i=1; i<t.length; i++){
                tex_export_mathml(buffer,t[i],context);
            }
            buffer.push("</mrow>");
        }else if(op=="\\"){
            tex_macro_mathml(buffer,t[1],t[2],t[3],context);
        }else if(op=="_"){
            var x = t[1];
            if(Array.isArray(x) && x[0]=="^"){
                if(is_under_over(x[1])){
                    buffer.push("<munderover>");
                    tex_export_mathml(buffer,x[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    tex_export_mathml(buffer,x[2],context);
                    buffer.push("</munderover>");
                }else{
                    buffer.push("<msubsup>");
                    tex_export_mathml(buffer,x[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    tex_export_mathml(buffer,x[2],context);
                    buffer.push("</msubsup>");
                }
            }else{
                if(is_under_over(t[1])){
                    buffer.push("<munder>");
                    tex_export_mathml(buffer,t[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</munder>");
                }else{
                    buffer.push("<msub>");
                    tex_export_mathml(buffer,t[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</msub>");
                }
            }
        }else if(op=="^"){
            var x = t[1];
            if(Array.isArray(x) && x[0]=="_"){
                if(is_under_over(x[1])){
                    buffer.push("<munderover>");
                    tex_export_mathml(buffer,x[1],context);
                    tex_export_mathml(buffer,x[2],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</munderover>");
                }else{
                    buffer.push("<msubsup>");
                    tex_export_mathml(buffer,x[1],context);
                    tex_export_mathml(buffer,x[2],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</msubsup>");
                }
            }else{
                if(is_under_over(t[1])){
                    buffer.push("<mover>");
                    tex_export_mathml(buffer,t[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</mover>");
                }else{
                    buffer.push("<msup>");
                    tex_export_mathml(buffer,t[1],context);
                    tex_export_mathml(buffer,t[2],context);
                    buffer.push("</msup>");
                }
            }
        }else if(op=="number"){
            buffer.push("<mn>");
            buffer.push(t[1]);
            buffer.push("</mn>");
        }else if(op=="-"){
            buffer.push("<mo>&minus;</mo>");
        }else if(op=="<"){
            buffer.push("<mo>&lt;</mo>");
        }else if(op==">"){
            buffer.push("<mo>&gt;</mo>");
        }else if(op=="~"){
            buffer.push("<mspace width='5px'/>");
        }else if(op=="(" || op==")" || op=="[" || op=="]"){
            buffer.push("<mo stretchy='false'>");
            buffer.push(op);
            buffer.push("</mo>");
        }else if(op=="|"){
            buffer.push("<mo stretchy='false'>|</mo>");
        }else if(op=="&"){
            if(t.length>1){
                tex_export_mathml(buffer,t[1],context);            
                for(var i=2; i<t.length; i++){
                    buffer.push("<mspace width='18px'/>");
                    tex_export_mathml(buffer,t[i],context);
                }
            }
        }else if(op=="br"){
            for(var i=1; i<t.length; i++){
                tex_export_mathml(buffer,t[i],context);
                buffer.push("<mspace linebreak='newline'/>");
            }
        }else if(op.length>0 && op[0]=="'"){
            buffer.push("<mo lspace='0px' rspace='0px'>");
            buffer.push(Array(op.length+1).join("′"));
            buffer.push("</mo>");
        }else if(op=="."){
            buffer.push("<mo lspace='1px' rspace='1px'>.</mo>");
        }else{
            buffer.push("<mo>");
            buffer.push(op);
            buffer.push("</mo>");
        }
    }else{
        tex_identifier_mathml(buffer,t,context);
    }
}

function export_html_node(buffer,t){
    if(Array.isArray(t)){
        var op = t[0];
        if(op==="block"){
            for(var i=1; i<t.length; i++){
                export_html_node(buffer,t[i]);
            }
        }else if(op=="n"){
            buffer.push("<br>");
        }else if(op=="tt"){
            buffer.push("<code>");
            export_html_node(buffer,t[1]);
            buffer.push("</code>");
        }else if(op=="code"){
            buffer.push("<pre>");
            export_html_node(buffer,t[1]);
            buffer.push("</pre>");
        }else if(op=="b"){
            buffer.push("<b>");
            export_html_node(buffer,t[1]);
            buffer.push("</b>");
        }else if(op=="i"){
            buffer.push("<i>");
            export_html_node(buffer,t[1]);
            buffer.push("</i>");
        }else if(op=="u"){
            buffer.push("<u>");
            export_html_node(buffer,t[1]);
            buffer.push("</u>");
        }else if(op=="list"){
            if(t.length==3 && t[2]==="1"){
                buffer.push("<ol>");
                export_html_node(buffer,t[1]);
                buffer.push("</ol>");
            }else if(t.length==3 && t[2]=="a"){
                buffer.push("<ol style='list-style-type: lower-alpha'>");
                export_html_node(buffer,t[1]);
                buffer.push("</ol>");
            }else{
                buffer.push("<ul>");
                export_html_node(buffer,t[1]);
                buffer.push("</ul>");
            }
        }else if(op=="li"){
            buffer.push("<li>");
        }else if(op=="center"){
            buffer.push("<div style='text-align: center'>");
            export_html_node(buffer,t[1]);
            buffer.push("</div>");
        }else if(op=="tex"){
            if(mathjax_mode){
                buffer.push("<span id='",formula_list.length,"'></span>");
                formula_list.push(t[1]);
            }else{
                buffer.push("<math displaystyle='true'>");
                // console.log(JSON.stringify(tex_parse(t[1])));
                tex_export_mathml(buffer,tex_parse(t[1]),standard_context);
                buffer.push("</math>");
            }
        }else if(op=="quote"){
            buffer.push("<blockquote>");
            export_html_node(buffer,t[1]);
            buffer.push("</blockquote>");
        }else if(op=="url"){
            buffer.push("<a href='");
            export_html_node(buffer,t.length>2?t[2]:t[1])
            buffer.push("'>");
            export_html_node(buffer,t[1]);
            buffer.push("</a>");
        }else{
            buffer.push("[",op);
            if(t.length>2){
                buffer.push("=",t[2]);
            }
            buffer.push("]");
            export_html_node(buffer,t[1]);
            buffer.push("[/",op,"]");
        }
    }else{
        buffer.push(encode_html(t));
    }
}

function export_html(t){
    var buffer = [];
    export_html_node(buffer,t);
    return buffer.join("");
}

function into_html(s){
    var t = parse(s);
    // console.log(JSON.stringify(t));
    return export_html(t);
}

var tex_substitution_table = {
"N": "\\mathbb N",
"Z": "\\mathbb Z",
"Q": "\\mathbb Q",
"R": "\\mathbb R",
"C": "\\mathbb C",
"H": "\\mathbb H",
"P": "\\mathbb P",
"K": "\\mathbb K",
"F": "\\mathbb F",
"la": "\\leftarrow",
"ra": "\\rightarrow",
"lra": "\\leftrightarrow",
"La": "\\Leftarrow",
"Ra": "\\Rightarrow",
"Lra": "\\Leftrightarrow",
"longra": "\\longrightarrow",
"longla": "\\longleftarrow",
"longlra": "\\longleftrightarrow",
"Longra": "\\Longrightarrow",
"Longla": "\\Longleftarrow",
"Longlra": "\\Longleftrightarrow",
"ua": "\\uparrow",
"da": "\\downarrow",
"ol": "\\overline",
"ul": "\\underline",
"ob": "\\overbrace",
"ub": "\\underbrace",
"op": "\\operatorname",
"re": "\\operatorname{Re}",
"im": "\\operatorname{Im}",
"grad": "\\operatorname{grad}",
"Bild": "\\operatorname{Bild}",
"Kern": "\\operatorname{Kern}",
"rk": "\\operatorname{rk}",
"rg": "\\operatorname{rg}",
"rank": "\\operatorname{rank}",
"rang": "\\operatorname{rang}",
"id": "\\operatorname{id}",
"map": "\\operatorname{map}",
"Abb": "\\operatorname{Abb}",
"sur": "\\operatorname{sur}",
"inj": "\\operatorname{inj}",
"bij": "\\operatorname{bij}",
"Eig": "\\operatorname{Eig}",
"lcm": "\\operatorname{lcm}",
"ggT": "\\operatorname{ggT}",
"kgV": "\\operatorname{kgV}",
"const": "\\operatorname{const}",
"ord": "\\operatorname{ord}",
"proj": "\\operatorname{proj}",
"adj": "\\operatorname{adj}",
"tr": "\\operatorname{tr}",
"GL": "\\operatorname{GL}",
"var": "\\operatorname{var}",
"dd": "\\mathrm d"
};

function tex_export_tex(buffer,s){
    var a = [];
    var n = s.length;
    var i = 0;
    while(i<n){
        if(s[i]=='\\'){
            i++;
            var j = i;
            while(i<n && isalpha(s[i])) i++;
            var id = s.slice(j,i);
            if(tex_substitution_table.hasOwnProperty(id)){
                a.push(tex_substitution_table[id]);
            }else{
                a.push("\\");
                a.push(id);
            }
        }else if(s[i]=='<'){
            a.push("&lt;");
            i++;
        }else if(s[i]=='>'){
            a.push("&gt;");
            i++;
        }else if(s[i]=='&'){
            a.push("&amp;");
            i++;
        }else{
            a.push(s[i]);
            i++;
        }
    }
    buffer.push(a.join(""));
}

function export_mb_node(buffer,t){
    if(Array.isArray(t)){
        var op = t[0];
        if(op==="block"){
            for(var i=1; i<t.length; i++){
                export_mb_node(buffer,t[i]);
            }
        }else if(op=="n"){
            buffer.push("<br>");
        }else if(op=="tt"){
            buffer.push("[FONT=COURIER]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/FONT]");
        }else if(op=="code"){
            buffer.push("[code]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/code]");
        }else if(op=="b"){
            buffer.push("[b]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/b]");
        }else if(op=="i"){
            buffer.push("[i]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/i]");
        }else if(op=="tex"){
            buffer.push("[l]");
            tex_export_tex(buffer,t[1]);
            buffer.push("[/l]");
        }else if(op=="quote"){
            buffer.push("[quote]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/quote]");
        }else if(op=="li"){
            buffer.push("[*]");
        }else{
            buffer.push("[",op);
            if(t.length>2){
                buffer.push("=",t[2]);
            }
            buffer.push("]");
            if(t.length>1){
                export_mb_node(buffer,t[1]);
            }
            buffer.push("[/",op,"]");
        }
    }else{
        buffer.push(encode_html(t));
    }
}

function export_mb(t){
    var buffer = [];
    buffer.push("<div class='mono'>");
    export_mb_node(buffer,t);
    buffer.push("</div>");
    return buffer.join("");
}

function into_mb(s){
    var t = parse(s);
    return export_mb(t);
}

function export_latex_node(buffer,t){
    if(Array.isArray(t)){
        var op = t[0];
        if(op==="block"){
            for(var i=1; i<t.length; i++){
                export_latex_node(buffer,t[i]);
            }
        }else if(op=="n"){
            buffer.push("<br>");
        }else if(op=="tt"){
            buffer.push("\\texttt{");
            export_latex_node(buffer,t[1]);
            buffer.push("}");
        }else if(op=="code"){
            buffer.push("\\begin{verbatim}\n");
            export_latex_node(buffer,t[1]);
            buffer.push("\\end{verbatim}\n");
        }else if(op=="b"){
            buffer.push("\\textbf{");
            export_latex_node(buffer,t[1]);
            buffer.push("}");
        }else if(op=="i"){
            buffer.push("\\emph{");
            export_latex_node(buffer,t[1]);
            buffer.push("}");
        }else if(op=="tex"){
            buffer.push("$");
            tex_export_tex(buffer,t[1]);
            buffer.push("$");
        }else if(op=="quote"){
            buffer.push("\\begin{quote}");
            export_latex_node(buffer,t[1]);
            buffer.push("\\end{quote}");
        }else if(op=="li"){
            buffer.push("\\item ");
        }else if(op=="list"){
            buffer.push("\\begin{itemize}");
            export_latex_node(buffer,t[1]);
            buffer.push("\\end{itemize}");
        }else{
            buffer.push("\\begin{",op,"}");
            if(t.length>2){
                buffer.push("[",t[2],"]");
            }
            if(t.length>1){
                export_latex_node(buffer,t[1]);
            }
            buffer.push("\\end{",op,"}");
        }
    }else{
        buffer.push(encode_html(t));
    }
}

function export_latex(t){
    var buffer = [];
    buffer.push("<div class='mono'>");
    export_latex_node(buffer,t);
    buffer.push("</div>");
    return buffer.join("");
}

function into_latex(s){
    var t = parse(s);
    return export_latex(t);
}

function export_mw_node(buffer,t){
    if(Array.isArray(t)){
        var op = t[0];
        if(op==="block"){
            for(var i=1; i<t.length; i++){
                export_mw_node(buffer,t[i]);
            }
        }else if(op=="n"){
            buffer.push("<br>");
        }else if(op=="tt"){
            buffer.push("&lt;code&gt;");
            export_mw_node(buffer,t[1]);
            buffer.push("&lt;/code&gt;");
        }else if(op=="code"){
            buffer.push("&lt;pre&gt;");
            export_mw_node(buffer,t[1]);
            buffer.push("&lt;/pre&gt;");
        }else if(op=="b"){
            buffer.push("'''");
            export_mw_node(buffer,t[1]);
            buffer.push("'''");
        }else if(op=="i"){
            buffer.push("''");
            export_mw_node(buffer,t[1]);
            buffer.push("''");
        }else if(op=="tex"){
            buffer.push("&lt;math&gt;");
            tex_export_tex(buffer,t[1]);
            buffer.push("&lt;/math&gt;");
        }else if(op=="quote"){
            buffer.push("&lt;blockquote&gt;");
            export_mw_node(buffer,t[1]);
            buffer.push("&lt;/blockquote&gt;");
        }else if(op=="li"){
            buffer.push("* ");
        }else if(op=="list"){
            export_mw_node(buffer,t[1]);
        }else if(op=="url"){
            if(t.length>2){
                buffer.push("[");
                export_mw_node(buffer,t[2]);
                buffer.push(" ");
                export_mw_node(buffer,t[1]);
                buffer.push("]");
            }else{
                export_mw_node(buffer,t[1]);
            }
        }else{
            buffer.push("&lt;",op,"&gt;");
            if(t.length>1){
                export_mw_node(buffer,t[1]);
            }
            buffer.push("&lt;/",op,"&gt;");
        }
    }else{
        buffer.push(encode_html(t));
    }
}

function export_mw(t){
    var buffer = [];
    buffer.push("<div class='mono'>");
    export_mw_node(buffer,t);
    buffer.push("</div>");
    return buffer.join("");
}

function into_mw(s){
    var t = parse(s);
    return export_mw(t);
}

function mathjax_render(){
    var m = {};
    for(var i=0; i<formula_list.length; i++){
        var math = document.getElementById(String(i));
        var text = ["#",i,formula_list[i]].join("");
        if(formula_map.hasOwnProperty(text)){
            math.appendChild(formula_map[text]);
            m[text] = formula_map[text];
        }else{
            var buffer = [];        
            buffer.push("\\(\\displaystyle ");
            tex_export_tex(buffer,formula_list[i]);
            buffer.push("\\)");
            math.innerHTML = buffer.join("");
            MathJax.Hub.Queue(["Typeset",MathJax.Hub,math]);
            m[text] = math;
        }
    }
    formula_list = [];
    formula_map = m;
}

function update(force){
    if(update_needed || force==true){
        update_needed = false;
        var input = document.getElementById("input");
        var output = document.getElementById("output");
        var input_value = input.value;
        if(export_input){
            var out = export_fn(input_value);
            // console.log(out);
            output.innerHTML = out;
        }else{
            if(last_input!=input_value){
                var out = into_html(input_value);
                // console.log(out);
                output.innerHTML = out;
                if(mathjax_mode){
                    mathjax_render();
                }
            }
        }
        last_input = input_value;
    }
}

function input_mod(){
    update_needed = true;
}

function insert_text(text,offset){
    if(offset==undefined) offset=0;
    var input = document.getElementById("input");
    var i = input.selectionStart;
    var s = input.value;
    input.value = s.slice(0,i)+text+s.slice(i);
    input.selectionStart = i+text.length-offset;
    input.selectionEnd = input.selectionStart;
    input.focus();
    update(true);
}

function button_preview(){
    export_input = false;
    last_input = undefined;
    update(true);
}

function button_export(){
    export_input = true;
    update(true);
}

function button_formula(){
    insert_text("$$",1);
}

function button_sqrt(){
    insert_text("\\sqrt{}",1);
}

function button_parens(){
    insert_text("\\left(\\right)",7);
}

function button_brackets(){
    insert_text("\\left[\\right]",7);
}

function button_braces(){
    insert_text("\\left\\{\\right\\}",8);
}

function button_angles(){
    insert_text("\\left\\langle\\right\\rangle",13);
}

function button_frac(){
    insert_text("\\frac{a}{b}");
}

function button_pm(){insert_text("\\pm ");}
function button_mp(){insert_text("\\mp ");}
function button_neg(){insert_text("\\neg ");}
function button_and(){insert_text("\\land ");}
function button_or(){insert_text("\\lor ");}
function button_implies(){insert_text("\\implies ");}
function button_iff(){insert_text("\\iff ");}
function button_forall(){insert_text("\\forall ");}
function button_exists(){insert_text("\\exists ");}

function button_pi(){insert_text("\\pi ");}
function button_delta(){insert_text("\\Delta ")};
function button_equiv(){insert_text("\\equiv ");}
function button_approx(){insert_text("\\approx ");}
function button_ne(){insert_text("\\ne ");}
function button_le(){insert_text("\\le ");}
function button_ge(){insert_text("\\ge ");}
function button_in(){insert_text("\\in ");}
function button_notin(){insert_text("\\notin ");}
function button_sub(){insert_text("\\subset ");}
function button_sube(){insert_text("\\subseteq ");}
function button_cup(){insert_text("\\cup ");}
function button_cap(){insert_text("\\cap ");}
function button_times(){insert_text("\\times ");}

function button_set(){
    insert_text("\\{ \\mid \\}",8);
}

function button_diff(){
    insert_text("\\frac{\\mathrm d}{\\mathrm dx}");
}

function button_pdiff(){
    insert_text("\\frac{\\partial}{\\partial x}");
}

function button_int(){
    insert_text("\\int f(x)\\,\\mathrm dx");
}

function button_fn(){
    insert_text("f\\colon A\\to B");
}

function button_lim(){
    insert_text("\\lim_{n\\to\\infty}");
}

function button_sum(){
    insert_text("\\sum_{k=1}^n ");
}

function button_matrix22(){
    insert_text("\
\\begin{pmatrix}\n\
a_{11} & a_{12}\\\\\n\
a_{21} & a_{22}\n\
\\end{pmatrix}");
}

function button_matrix33(){
    insert_text("\
\\begin{pmatrix}\n\
a_{11} & a_{12} & a_{13}\\\\\n\
a_{21} & a_{22} & a_{23}\\\\\n\
a_{31} & a_{32} & a_{33}\n\
\\end{pmatrix}");
}

function button_matrix21(){
    insert_text("\\begin{pmatrix}x \\\\ y\\end{pmatrix}");
}

function button_matrix31(){
    insert_text("\\begin{pmatrix}x \\\\ y\\\\ z\\end{pmatrix}");
}

function dark_mode(){
    var style = document.getElementById("style");
    style.href = "css/ui-dark.css";
}

var export_table = {
    "matheboard": into_mb,
    "latex": into_latex,
    "mediawiki": into_mw
}

function query(){
    var a = window.location.href.split("?");
    if(a.length>1){
        a = a[1].split(",");
        for(var i=0; i<a.length; i++){
            if(a[i]=="mathjax"){mathjax_mode = true;}
            else if(a[i]=="dark" || a[i]=="dunkel"){dark_mode();}
            else if(export_table.hasOwnProperty(a[i])){
                export_fn = export_table[a[i]];
            }
        }
    }
}

function firefox(){
    var s = navigator.userAgent.toString().toLowerCase();
    return s.indexOf("firefox") != -1;
}

window.onload = function(){
    if(!firefox()){mathjax_mode = true;}
    query();
    if(mathjax_mode){
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src  = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
        script.onload = function(){
            MathJax.Hub.Config({messageStyle: "none"});
        };
        document.getElementsByTagName("head")[0].appendChild(script);
        setInterval(update,1000);
    }else{
        setInterval(update,250);
    }
};

