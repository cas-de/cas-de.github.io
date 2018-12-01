
var update_needed = true;
var export_input = false;
var tex_mode = false;

var Text = 0;
var Symbol = 1;
var Digits = 2;
var Macro = 3;
var Space = 4;
var Terminal = 5;

var standard_context = {
    font_extra: false
};

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

function scan(s){
    var i = 0;
    var n = s.length;
    var node = [];
    var a = [];
    while(i<n){
        if(s[i]=='`'){
            flush_node(a,node);
            a.push([Symbol,"`"]);
            i++;
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
        }else if(i+1<n && s[i]=='/' && s[i+1]=='/'){
            flush_node(a,node);
            a.push([Symbol,"//"]);
            i+=2;
        }else if(i+1<n && s[i]=='[' && s[i+1]=='/'){
            flush_node(a,node);
            a.push([Symbol,"[/"]);
            i+=2;
        }else if(s[i]=='[' || s[i]==']'){
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
            var j = i;
            while(i<n && isdigit(s[i])) i++;
            a.push([Digits,s.slice(j,i)]);
        }else if(s[i]=='\\'){
            i++;
            while(i<n && isspace(s[i])) i++;
            if(i<n && isalpha(s[i])){
                var j = i;
                while(i<n && isalpha(s[i])) i++;
                a.push([Macro,s.slice(j,i)]);
            }else if(i<n){
                a.push([Macro,s[i]]);
                i++;
            }
        }else if(i+1<n && s[i]==':' && s[i+1]=='='){
            a.push([Symbol,":="]);
            i+=2;
        }else{
            a.push([Symbol,s[i]]);
            i++;
        }
    }
    a.push([Terminal]);
    return a;
}

var argc_table = {
    "frac": 2,
    "mathrm": 1,
    "mathbf": 1,
    "mathbb": 1,
    "mathsf": 1,
    "mathcal": 1,    
    "sqrt": 1,
    "vec": 1,
    "left": 1,
    "right": 1
};

var greek_upper = {
    "Gamma": "&Gamma;",
    "Delta": "&Delta;",
    "Theta": "&Theta;",
    "Lambda": "&Lambda;",
    "Xi": "&Xi;",
    "Pi": "&Pi;",
    "Sigma": "&Sigma;",
    "Phi": "&Phi;",
    "Chi": "&Chi;",
    "Psi": "&Psi;",
    "Omega": "&Omega;"
};

var macro_tab_mathml = {
    "sin": "<mi>sin</mi>",
    "cos": "<mi>cos</mi>",
    "tan": "<mi>tan</mi>",
    "lim": "<mo>lim</mo>",
    "int": "<mo>&int;</mo>",
    "iint": "<mo>∬</mo>",
    "iiint": "<mo>∭</mo>",
    "pm": "<mo>&plusmn;</mo>",
    "mp": "<mo>∓</mo>",
    "sum": "<mo>&sum;</mo>",
    "prod": "<mo>&prod;</mo>",
    "R": "<mi mathvariant='bold'>R</mi>",
    "N": "<mi mathvariant='bold'>N</mi>",
    "Z": "<mi mathvariant='bold'>Z</mi>",
    "C": "<mi mathvariant='bold'>C</mi>",
    "langle": "<mo stretchy='false'>&lang;</mo>",
    "rangle": "<mo stretchy='false'>&rang;</mo>",
    "nabla": "<mo>&nabla;</mo>",
    "partial": "<mo>&part;</mo>",
    "colon": ":<mspace width='4px'/>",
    "to": "<mo>&rarr;</mo>",
    "infty": "<mo>&infin;</mo>",
    "in": "<mo>&in;</mo>",
    "implies": "<mo>⟹</mo>",
    "iff": "<mo>⟺</mo>",
    "subset": "<mo>&sub;</mo>",
    "subseteq": "<mo>&sube;</mo>",
    "emptyset": "<mi>&empty;</mi>",
    "cup": "<mo>&cup;</mo>",
    "cap": "<mo>&cap;</mo>",
    "circ": "<mo>∘</mo>",
    "oplus": "<mo>&oplus;</mo>",
    "otimes": "<mo>&otimes;</mo>",
    "bot": "<mo>&perp;</mo>",
    "le": "<mo>&le;</mo>",
    "ge": "<mo>&ge;</mo>",
    "neq": "<mo>&ne;</mo>",
    "cong": "<mo>&cong;</mo>",
    "sim": "<mo>&sim;</mo>",
    "simeq": "<mo>≃</mo>",
    "approx": "<mo>&asymp;</mo>",
    "leftarrow": "<mo>&larr;</mo>",
    "rightarrow": "<mo>&rarr;</mo>",
    "Leftarrow": "<mo>&lArr;</mo>",
    "Rightarrow": "<mo>&rArr;</mo>",
    "rightleftarrow": "<mo>&harr;</mo>",
    "Rightleftarrow": "<mo>&hArr;</mo>",
    "lor": "<mo>&or;</mo>",
    "land": "<mo>&and;</mo>",
    "ldots": "<mo>&hellip;</mo>",
    "cdots": "<mo>&hellip;</mo>",
    "mid": "<mo>|</mo>",
    "forall": "<mo>&forall;</mo>",
    "exists": "<mo>&exist;</mo>",
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
    "mu": "<mi>&mu;</mi>",
    "nu": "<mi>&nu;</mi>",
    "xi": "<mi>&xi;</mi>",
    "omicron": "<mo>&omicron;</mi>",
    "pi": "<mi>&pi;</mi>",
    "rho": "<mi>&rho;</mi>",
    "sigma": "<mi>&sigma;</mi>",
    "tau": "<mi>&tau;</mi>",
    "phi": "<mi>&phi;</mi>",
    "chi": "<mi>&chi;</mi>",
    "psi": "<mi>&psi;</mi>",
    "omega": "<mi>&omega</mi>",
    ",": "<mspace width='3px'/>",
    "{": "<mo>{</mo>",
    "}": "<mo>}</mo>",
    "|": "<mo stretchy='false'>||</mo>"
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

function tex_macro(id,i){
    var argc = 0;
    var argv = [];
    if(argc_table.hasOwnProperty(id)){
        argc = argc_table[id];
    }
    for(var k=0; k<argc; k++){
        var t = i.a[i.index];
        if(t==Terminal) break;
        var y = tex_node(i);
        argv.push(y);
    }
    return ["\\",id,argv];
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

function tex_sub_sup(i){
    var x = tex_node(i);
    while(1){
        var t = i.a[i.index];
        if(t[0]==Symbol && (t[1]=='_' || t[1]=='^')){
            i.index++;
            var y = tex_node(i);
            x = [t[1],x,y];
        }else{
            break;
        }
    }
    return x;
}

function tex_ast(i){
    var a = ["{}"];
    while(1){
        var t = i.a[i.index];
        if(t[0]==Terminal){
            break;
        }else if(t[0]==Symbol && t[1]=="}"){
            break;
        }else{
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
    var id = t[1];
    i.index++;
    t = i.a[i.index];
    if(t[0]!=Symbol || t[1]!="]"){
        a.push("["+id);
        return;
    }
    i.index++;
    var y = ast(i,"[/");
    var t = i.a[i.index];
    if(t[0]!=Symbol || t[1]!="[/"){
        a.push([id,y]);
        return;
    }
    i.index++;
    t = i.a[i.index];
    if(t[0]==Text) i.index++;
    t = i.a[i.index];
    if(t[0]==Symbol && t[1]=="]") i.index++;
    a.push([id,y]);
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
                if(tex_mode){
                    a.push(["tex",i.a[i.index][1]]);
                }else{
                    a.push(["tex",tex_parse(i.a[i.index][1])]);
                }
                i.index++;
            }else if(t[1]=="`"){
                wiki_syntax(a,i,"`","code");
            }else if(t[1]=="**"){
                wiki_syntax(a,i,"**","b");
            }else if(t[1]=="//"){
                wiki_syntax(a,i,"//","i");
            }else if(t[1]=="["){
                bbcode(a,i);
            }else{
                throw "unknown symbol '"+t[1]+"'";
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

function tex_macro_mathml(buffer,id,a,context){
    if(id=="frac"){
        buffer.push("<mfrac>");
        tex_export_mathml(buffer,a[0],context);
        tex_export_mathml(buffer,a[1],context);
        buffer.push("</mfrac>");
    }else if(id=="mathrm" || id=="mathbf" || id=="mathbb" || id=="mathsf" || id=="mathcal"){
        buffer.push("<mrow>");
        tex_export_mathml(buffer,a[0],{font_extra: true, font_type: id});
        buffer.push("</mrow>");
    }else if(id=="sqrt"){
        buffer.push("<msqrt>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("</msqrt>");
    }else if(id=="vec"){
        buffer.push("<mover accent='true'>");
        tex_export_mathml(buffer,a[0],context);
        buffer.push("<mo mathsize='60%'>&rarr;</mo>"); // &#8407;
        buffer.push("</mover>");
    }else if(id=="left"){
        if(Array.isArray(a[0])){
            var t = a[0];
            buffer.push("<mo>"+t[0]+"</mo>");
        }else{
            buffer.push("<mo>"+a[0]+"</mo>");
        }
    }else if(id=="right"){
        if(Array.isArray(a[0])){
            var t = a[0];
            buffer.push("<mo>"+t[0]+"</mo>");
        }else{
            buffer.push("<mo>"+a[0]+"</mo>");
        }
    }else{
        if(macro_tab_mathml.hasOwnProperty(id)){
            buffer.push(macro_tab_mathml[id]);
        }else{
            buffer.push("<mo>\\"+id+"</mo>");
        }
    }
}

var under_over_table = {
    "sum":0, "lim":0
};

function is_under_over(t){
    if(Array.isArray(t)){
        if(t[0]=="\\"){
            if(under_over_table.hasOwnProperty(t[1])) return true;
        }
    }
    return false;
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
            tex_macro_mathml(buffer,t[1],t[2],context);
        }else if(op=="_"){
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
        }else if(op=="("){
            buffer.push("<mo stretchy='false'>(</mo>");
        }else if(op==")"){
            buffer.push("<mo stretchy='false'>)</mo>");
        }else if(op=="|"){
            buffer.push("<mo stretchy='false'>|</mo>");
        }else{
            buffer.push("<mo>");
            buffer.push(op);
            buffer.push("</mo>");
        }
    }else{
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
        }else if(op=="code"){
            buffer.push("<code>");
            export_html_node(buffer,t[1]);
            buffer.push("</code>");
        }else if(op=="b"){
            buffer.push("<b>");
            export_html_node(buffer,t[1]);
            buffer.push("</b>");
        }else if(op=="i"){
            buffer.push("<i>");
            export_html_node(buffer,t[1]);
            buffer.push("</i>");
        }else if(op=="tex"){
            buffer.push("<math displaystyle='true'>");
            tex_export_mathml(buffer,t[1],standard_context);
            buffer.push("</math>");
        }else{
            throw "unknown function: "+t[1];
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
    tex_mode = false;
    var t = parse(s);
    // return JSON.stringify(t);
    return export_html(t);
}

var tex_substitution_table = {
    "N": "\\mathbb N",
    "Z": "\\mathbb Z",
    "R": "\\mathbb R",
    "C": "\\mathbb C"
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
        }else if(op=="code"){
            buffer.push("[FONT=COURIER]");
            export_mb_node(buffer,t[1]);
            buffer.push("[/FONT]");
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
        }else{
            throw "unknown function: "+t[1];
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
    tex_mode = true;
    var t = parse(s);
    return export_mb(t);
}

function update(force){
    if(update_needed || force==true){
        update_needed = false;
        var input = document.getElementById("input");
        var output = document.getElementById("output");
        if(export_input){
            var out = into_mb(input.value);
            // console.log(out);
            output.innerHTML = out;
        }else{
            var out = into_html(input.value);
            // console.log(out);
            output.innerHTML = out;
        }
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
    update(true);
}

function button_preview(){
    export_input = false;
    update(true);
}

function button_export(){
    export_input = true;
    update(true);
}

function button_example(){
    var a = [
        "\n**Differentialqoutient**, auch //Ableitung//:\n\n",
        "$f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$\n"
    ];
    insert_text(a.join(""));
}

function button_sqrt(){
    insert_text("\\sqrt{}",1);
}

function button_parens(){
    insert_text("\\left(\\right)",7);
}

function button_frac(){
    insert_text("\\frac{a}{b}");
}

function button_pm(){
    insert_text("\\pm ");
}

function button_mp(){
    insert_text("\\mp ");
}

function button_implies(){
    insert_text("\\implies ");
}
function button_iff(){
    insert_text("\\iff ");
}

function button_forall(){
    insert_text("\\forall ");
}

function button_exists(){
    insert_text("\\exists");
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

function button_matrix(){
    insert_text("\\begin{pmatrix}\na & b\\\\\nc & d\n\\end{pmatrix}");
}

function button_vector(){
    insert_text("\\begin{pmatrix}x \\\\ y\\end{pmatrix}");
}

window.onload = function(){
    setInterval(update,500);
};

