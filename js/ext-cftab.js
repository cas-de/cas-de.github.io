
function chf(x){
var xm1,xm2,xm4,xm6,xm8,xm10,xm12,xm14,xm16,xm18,xm20;
xm1=crdiv(1,x); xm2=cmul(xm1,xm1); xm4=cmul(xm2,xm2);
xm6=cmul(xm4,xm2); xm8=cmul(xm6,xm2); xm10=cmul(xm8,xm2);
xm12=cmul(xm10,xm2); xm14=cmul(xm12,xm2); xm16=cmul(xm14,xm2);
xm18=cmul(xm16,xm2); xm20=cmul(xm18,xm2);
return cmul(xm1,cdiv({re:1
+7.44437068161936700618E2*xm2.re
+1.96396372895146869801E5*xm4.re
+2.37750310125431834034E7*xm6.re
+1.43073403821274636888E9*xm8.re
+4.33736238870432522765E10*xm10.re
+6.40533830574022022911E11*xm12.re
+4.20968180571076940208E12*xm14.re
+1.00795182980368574617E13*xm16.re
+4.94816688199951963482E12*xm18.re
-4.94701168645415959931E11*xm20.re,
im:
+7.44437068161936700618E2*xm2.im
+1.96396372895146869801E5*xm4.im
+2.37750310125431834034E7*xm6.im
+1.43073403821274636888E9*xm8.im
+4.33736238870432522765E10*xm10.im
+6.40533830574022022911E11*xm12.im
+4.20968180571076940208E12*xm14.im
+1.00795182980368574617E13*xm16.im
+4.94816688199951963482E12*xm18.im
-4.94701168645415959931E11*xm20.im
},{re:1
+7.46437068161927678031E2*xm2.re
+1.97865247031583951450E5*xm4.re
+2.41535670165126845144E7*xm6.re
+1.47478952192985464958E9*xm8.re
+4.58595115847765779830E10*xm10.re
+7.08501308149515401563E11*xm12.re
+5.06084464593475076774E12*xm14.re
+1.43468549171581016479E13*xm16.re
+1.11535493509914254097E13*xm18.re,
im:
+7.46437068161927678031E2*xm2.im
+1.97865247031583951450E5*xm4.im
+2.41535670165126845144E7*xm6.im
+1.47478952192985464958E9*xm8.im
+4.58595115847765779830E10*xm10.im
+7.08501308149515401563E11*xm12.im
+5.06084464593475076774E12*xm14.im
+1.43468549171581016479E13*xm16.im
+1.11535493509914254097E13*xm18.im
}));
}

function chg(x){
var xm1,xm2,xm4,xm6,xm8,xm10,xm12,xm14,xm16,xm18,xm20;
xm1=crdiv(1,x); xm2=cmul(xm1,xm1); xm4=cmul(xm2,xm2);
xm6=cmul(xm4,xm2); xm8=cmul(xm6,xm2); xm10=cmul(xm8,xm2);
xm12=cmul(xm10,xm2); xm14=cmul(xm12,xm2); xm16=cmul(xm14,xm2);
xm18=cmul(xm16,xm2); xm20=cmul(xm18,xm2);
return cmul(xm2,cdiv({re:1
+8.1359520115168615E2*xm2.re
+2.35239181626478200E5*xm4.re
+3.12557570795778731E7*xm6.re
+2.06297595146763354E9*xm8.re
+6.83052205423625007E10*xm10.re
+1.09049528450362786E12*xm12.re
+7.57664583257834349E12*xm14.re
+1.81004487464664575E13*xm16.re
+6.43291613143049485E12*xm18.re
-1.36517137670871689E12*xm20.re,
im:
+8.1359520115168615E2*xm2.im
+2.35239181626478200E5*xm4.im
+3.12557570795778731E7*xm6.im
+2.06297595146763354E9*xm8.im
+6.83052205423625007E10*xm10.im
+1.09049528450362786E12*xm12.im
+7.57664583257834349E12*xm14.im
+1.81004487464664575E13*xm16.im
+6.43291613143049485E12*xm18.im
-1.36517137670871689E12*xm20.im
},{re:1
+8.19595201151451564E2*xm2.re
+2.40036752835578777E5*xm4.re
+3.26026661647090822E7*xm6.re
+2.23355543278099360E9*xm8.re
+7.87465017341829930E10*xm10.re
+1.39866710696414565E12*xm12.re
+1.17164723371736605E13*xm14.re
+4.01839087307656620E13*xm16.re
+3.99653257887490811E13*xm18.re,
im:
+8.19595201151451564E2*xm2.im
+2.40036752835578777E5*xm4.im
+3.26026661647090822E7*xm6.im
+2.23355543278099360E9*xm8.im
+7.87465017341829930E10*xm10.im
+1.39866710696414565E12*xm12.im
+1.17164723371736605E13*xm14.im
+4.01839087307656620E13*xm16.im
+3.99653257887490811E13*xm18.im
}));
}

function cSi4(x){
var x2,x4,x6,x8,x10,x12,x14;
x2=cmul(x,x); x4=cmul(x2,x2); x6=cmul(x4,x2); x8=cmul(x6,x2);
x10=cmul(x8,x2); x12=cmul(x10,x2); x14=cmul(x12,x2);
return cmul(x,cdiv({re:1
-4.54393409816329991E-2*x2.re
+1.15457225751016682E-3*x4.re
-1.41018536821330254E-5*x6.re
+9.43280809438713025E-8*x8.re
-3.53201978997168357E-10*x10.re
+7.08240282274875911E-13*x12.re
-6.05338212010422477E-16*x14.re,
im:
-4.54393409816329991E-2*x2.im
+1.15457225751016682E-3*x4.im
-1.41018536821330254E-5*x6.im
+9.43280809438713025E-8*x8.im
-3.53201978997168357E-10*x10.im
+7.08240282274875911E-13*x12.im
-6.05338212010422477E-16*x14.im
},{re:1
+1.01162145739225565E-2*x2.re
+4.99175116169755106E-5*x4.re
+1.55654986308745614E-7*x6.re
+3.28067571055789734E-10*x8.re
+4.5049097575386581E-13*x10.re
+3.21107051193712168E-16*x12.re,
im:
+1.01162145739225565E-2*x2.im
+4.99175116169755106E-5*x4.im
+1.55654986308745614E-7*x6.im
+3.28067571055789734E-10*x8.im
+4.5049097575386581E-13*x10.im
+3.21107051193712168E-16*x12.im
}));
}

function cCi4(x){
var x2,x4,x6,x8,x10,x12,x14;
x2=cmul(x,x); x4=cmul(x2,x2); x6=cmul(x4,x2); x8=cmul(x6,x2);
x10=cmul(x8,x2); x12=cmul(x10,x2); x14=cmul(x12,x2);
return cadd(caddr(cln(x),GAMMA),cmul(x2,cdiv({re: -0.25
+7.51851524438898291E-3*x2.re
-1.27528342240267686E-4*x4.re
+1.05297363846239184E-6*x6.re
-4.68889508144848019E-9*x8.re
+1.06480802891189243E-11*x10.re
-9.93728488857585407E-15*x12.re,
im:
+7.51851524438898291E-3*x2.im
-1.27528342240267686E-4*x4.im
+1.05297363846239184E-6*x6.im
-4.68889508144848019E-9*x8.im
+1.06480802891189243E-11*x10.im
-9.93728488857585407E-15*x12.im
},{re:1
+1.1592605689110735E-2*x2.re
+6.72126800814254432E-5*x4.re
+2.55533277086129636E-7*x6.re
+6.97071295760958946E-10*x8.re
+1.38536352772778619E-12*x10.re
+1.89106054713059759E-15*x12.re
+1.39759616731376855E-18*x14.re,
im:
+1.1592605689110735E-2*x2.im
+6.72126800814254432E-5*x4.im
+2.55533277086129636E-7*x6.im
+6.97071295760958946E-10*x8.im
+1.38536352772778619E-12*x10.im
+1.89106054713059759E-15*x12.im
+1.39759616731376855E-18*x14.im
})));
}

function csi(z){
    return cdiv(csin(z),z);
}

function cSi(x){
    var s;
    if(x.re<0){
        x = {re:-x.re,im:-x.im};
        s = -1;
    }else{
        s = 1;
    }
    if(x.re<5 && Math.abs(x.im)<6){
        return cmulr(cSi4(x),s);
    }else if(x.re>10 || Math.abs(x.im)>60){
        return cmulr(csub(crsub(0.5*Math.PI,cmul(chf(x),ccos(x))),cmul(chg(x),csin(x))),s);
    }else{
        return cmulr(cint([{re:0,im:0},x],csi),s);
    }
}

function cci(z){
    return cdiv(csubr(ccos(z),1),z);
}

function cCip(x){
    if(cabs(x)<5){
        return cCi4(x);
    }else if(x.re>10 || Math.abs(x.im)>60){
        return csub(cmul(chf(x),csin(x)),cmul(chg(x),ccos(x)));
    }else{
        return caddr(cadd(cln(x),cint([{re:0,im:0},x],cci)),GAMMA);
    }
}

function cCi(x){
    if(x.re<0){
        var w = cCip({re: -x.re, im: -x.im});
        var spi = x.im<=0?Math.PI:-Math.PI;
        return {re: w.re, im: w.im-spi};
    }else{
        return cCip(x);
    }
}

function cCi90(x){
    if(x.re<0){
        var w = cCip({re: -x.re, im: -x.im});
        return {re: w.re, im: w.im-Math.PI};
    }else{
        return cCip(x);
    }
}

function cCin(z){
    return csub(caddr(cln(z),GAMMA),cCi(z));
}

function cE1(z){
    var miz = {re: z.im, im: -z.re};
    var y = csubr(cSi(miz),0.5*Math.PI);
    return csub({re: -y.im, im: y.re},cCi90(miz));
}

function cEi(z){
    var iz = {re: -z.im, im: z.re};
    var y = crsub(0.5*Math.PI,cSi(iz));
    var w = cadd({re: -y.im, im: y.re},cCi90(iz));
    return {re:w.re,im:0};
}

function cEin(z){
    return cadd(caddr(cln(z),GAMMA),cE1(z));
}

function cli(z){
    return cEi(cln(z));
}

function cLi(z){
    var w = cEi(cln(z));
    return {re: w.re-1.04516378011749278484, im: w.im};
}

var B2ndivfac2n = [
1.0,
0.08333333333333333,
-0.001388888888888889,
3.306878306878307e-5,
-8.267195767195768e-7,
2.08767569878681e-8,
-5.284190138687493e-10,
1.3382536530684679e-11,
-3.3896802963225827e-13,
8.586062056277845e-15,
-2.174868698558062e-16,
5.50900282836023e-18,
-1.3954464685812525e-19,
3.534707039629468e-21,
-8.953517427037547e-23,
2.2679524523376833e-24,
-5.744790668872202e-26,
1.455172475614865e-27,
-3.68599494066531e-29,
9.336734257095045e-31,
-2.36502241570063e-32,
5.990671762482134e-34,
-1.5174548844682903e-35,
3.843758125454189e-37,
-9.736353072646691e-39,
];

function new_czeta(N,m){
    if(m==0){m=1;}
    var lnN = Math.log(N);
    var ln_one_half = Math.log(0.5);
    var coeff = [0];
    for(var n=1; n<=m; n++){
        coeff.push(B2ndivfac2n[n]*Math.pow(N,1-2*n));
    }

    var Euler_MacLaurin_term = function(s,N,m){
        var y = {re: s.re*coeff[1], im: s.im*coeff[1]};
        var p = s;
        for(var n=2; n<=m; n++){
            var kmax = 2*n-2;
            p = cmul(p,caddr(s,kmax-1));
            p = cmul(p,caddr(s,kmax));
            y.re += p.re*coeff[n];
            y.im += p.im*coeff[n];
        }
        return y;
    };
    return function(s){
        var y = {re: 0, im: 0};
        for(var k=1; k<N; k++){
            var x = crdiv(1,cexp(cmulr(s,Math.log(k))));
            y.re += x.re;
            y.im += x.im;
        }
        var term = cadd(
            caddr(crdiv(N,csubr(s,1)),0.5),
            Euler_MacLaurin_term(s,N,m)
        );
        return cadd(y,cmul(cexp({re: -lnN*s.re, im: -lnN*s.im}),term));
    };
}

var czetaN6m0 = new_czeta(6,0);
var czetaN18m0 = new_czeta(18,0);
var czetaN36m10 = new_czeta(36,10);

function czeta_re_positive(s){
    if(s.re>50){
        return {re: 1, im: 0};
    }else if(s.re>30){
        return czetaN6m0(s);
    }else if(s.re>15){
        return czetaN18m0(s);
    }else{
        return czetaN36m10(s);
    }
}

var lnpi = Math.log(Math.PI);
function czeta(s){
    if(s.re<0){
        var one_minus_s = {re: 1-s.re, im: -s.im};
        var exponent = cadd(cmulr(s,Math.LN2),{re: lnpi*(s.re-1), im: lnpi*s.im});
        return cmul(cmul(
            cmul(cexp(exponent),csin(cmulr(s,0.5*Math.PI))),
            cgamma(one_minus_s)
        ), czeta_re_positive(one_minus_s));    
    }else{
        return czeta_re_positive(s);
    }
}

function chzeta(s,a,N,M){
    var y={re: 0, im: 0};
    for(var k=0; k<N; k++){
        y = cadd(y,cpow({re: a.re+k, im: a.im},{re: -s.re, im: -s.im}));
    }
    var Npa = caddr(a,N);
    var p = s;
    var x = cmulr(cdiv(p,Npa),B2ndivfac2n[1]);
    for(var n=2; n<=M; n++){
        var kmax = 2*n-2;
        p = cmul(p,caddr(s,kmax-1));
        p = cmul(p,caddr(s,kmax));
        x = cadd(x,cmulr(
            cmul(p,cpow(Npa,{re: 1-2*n, im: 0})),
            B2ndivfac2n[n]
        ));
    }
    return cadd(y,cmul(
        cpow(Npa,{re: -s.re, im: -s.im}),
        cadd(caddr(cdiv(Npa,caddr(s,-1)),0.5),x)
    ));
};

function czeta_variadic(s,a){
    if(a==undefined){
        return czeta(s);
    }else{
        var N = a.re>-10?18:Math.floor(Math.abs(a.re))+4;
        return chzeta(s,a,N,6);
    }
}

function bc(x,k){
    var y=1;
    for(var i=1; i<=k; i++){
        y = y*(x-i+1)/i;
    }
    return y;
}

var Btab = [1];

function tabB(n){
    while(n>=Btab.length){
        var m = Btab.length;
        var s = 0;
        for(var k=0; k<m; k++){s+=bc(m+1,k)*Btab[k];}
        Btab.push(1-s/(m+1));
    }
    return Btab[n];
}

function cbernoulliB(n){
    if(n.im==0 && n.re==Math.floor(n.re) && n.re>=0 && n.re<260){
        return {re: tabB(n.re), im: 0};
    }else{
        return cneg(cmul(n,czeta(crsub(1,n))));
    }
}

function cbernoulliBm(n){
    return n.re==1 && n.im==0? {re:-0.5,im:0} : cbernoulliB(n);
}

function cpolygamma(m,z){
    var m = m.re;
    if(m==0){
        return cdiv(csub(
            cgamma({re: z.re+0.0001, im: z.im}),
            cgamma({re: z.re-0.0001, im: z.im})
        ),cmulr(cgamma(z),0.0002));
    }else{
        var N = z.re>-10?18:Math.floor(Math.abs(z.re))+4;
        var mp1 = {re: m+1, im: 0};
        return cmulr(chzeta(mp1,z,N,6),Math.pow(-1,m+1)*cgamma(mp1).re);
    }
}

function cpsi(x,y){
    if(y==undefined){
        return cpolygamma({re: 0, im: 0},x);
    }else{
        return cpolygamma(x,y);
    }
}

function cffac(z,n){
    if(z.im==0 && n.im==0){
        return {re:ffac(z.re,n.re),im:0};
    }else{
        return cdiv(cgamma(caddr(z,1)),cgamma(caddr(csub(z,n),1)));
    }
}

function crfac(z,n){
    if(z.im==0 && n.im==0){
        return {re:rfac(z.re,n.re),im:0};
    }else{
        return cdiv(cgamma(cadd(z,n)),cgamma(z));
    }
}

function cerf(x){
    var a = {re:0.5,im:0};
    var b = cmul(x,x);
    var y;
    if(cabs(x)<1.7){
        y = cmulr(cpsgamma(a,b,24),1/Math.sqrt(Math.PI));
    }else if(Math.abs(x.re)<1 && Math.abs(x.im)<4){
        y = cmulr(cpsgamma(a,b,60),1/Math.sqrt(Math.PI));
    }else{
        y = cmulr(csub(cgamma(a),ccfGamma(a,b,24)),1/Math.sqrt(Math.PI));
    }
    if(x.re==0 && x.im<0){
        return cneg(y);
    }else if(x.re<0){
        return cneg(y);
    }else{
        return y;
    }
}

function cerfc(z){
    return crsub(1,cerf(z));
}

/*
function cEn(n,x){
    return mpy(cpow(x,addr(n,-1)),ciGamma(sub({re:1,im:0},n),x));
}

function cEi(x){
    return neg(ciGamma({re:0,im:0},neg(x)));
}
*/

function cbc(z,k){
    if(k.im!=0 || k.re!=Math.round(k.re)){
        return cdiv(cgamma(caddr(z,1)),cmul(
            cgamma(caddr(k,1)),
            cgamma({re: z.re-k.re+1, im: z.im-k.im})
        ));
    }else if(k.re<0){
        return 0;
    }
    k = k.re;
    var y = {re: 1, im: 0};
    for(var i=1; i<=k; i++){
        y = cmul(y,{re: (z.re-i+1)/i, im: z.im/i});
    }
    return y;
}

function isprime(n){
    n = Math.round(n);
    if(n<2) return 0;
    var m = Math.floor(Math.sqrt(n));
    for(var k=2; k<=m; k++){
        if(n%k==0) return 0;
    }
    return 1;
}

function nextprime(n){
    while(!isprime(n))n++;
    return n;
}

var pseq_tab = [0,2];

function cprime_sequence(n){
    n = Math.round(n.re);
    if(n<pseq_tab.length){
        return {re: pseq_tab[n], im: 0};
    }else{
        var p = pseq_tab[pseq_tab.length-1];
        while(n>=pseq_tab.length){
            p = nextprime(p+1);
            pseq_tab.push(p);
        }
        return {re: p, im: 0};
    }
}

function ctable(f,a){
    var buffer = ["<table class='bt'>"];
    for(var k=0; k<a.length; k++){
        var x = a[k];
        var y = f(x);
        buffer.push("<tr><td>");
        buffer.push(str(x));
        buffer.push("<td>");
        buffer.push(str(y));
    }
    buffer.push("</table>");
    return buffer.join("");
}

function cadd_tensor_tensor(a,b){
    var c = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            c.push(cadd_tensor_tensor(a[i],b[i]));
        }else{
            c.push(cadd(a[i],b[i]));
        }
    }
    return c;
}

function csub_tensor_tensor(a,b){
    var c = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            c.push(csub_tensor_tensor(a[i],b[i]));
        }else{
            c.push(csub(a[i],b[i]));
        }
    }
    return c;
}

function cmul_scalar_tensor(r,a){
    var b = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            b.push(cmul_scalar_tensor(r,a[i]));
        }else{
            b.push(cmul(r,a[i]));
        }
    }
    return b;
}

function cneg_tensor(a){
    return cmul_scalar_tensor({re: -1, im: 0},a);
}

function cmul_matrix_vector(A,v){
    var m = A.length;
    var nv = v.length;
    var w = [];
    for(var i=0; i<m; i++){
        var y = {re: 0, im: 0};
        var n = Math.min(nv,A[i].length);
        for(var j=0; j<n; j++){y = cadd(y,cmul(A[i][j],v[j]));}
        w.push(y);
    }
    return w;
}

function cmul_matrix_matrix(A,B){
    var m = A.length;
    var n = B[0].length;
    var p = A[0].length;
    var C = [];
    for(var i=0; i<m; i++){
        var v = [];
        for(var j=0; j<n; j++){
            var y = {re: 0, im: 0};
            for(var k=0; k<p; k++){y=cadd(y,cmul(A[i][k],B[k][j]));}
            v.push(y);
        }
        C.push(v);
    }
    return C;
}

function cabs_vec(v){
    var y = 0;
    for(var i=0; i<v.length; i++){
        var r = cabs(v[i]);
        y+=r*r;
    }
    return {re: Math.sqrt(y), im: 0};
}

function cscalar_product(v,w){
    var n = Math.min(v.length,w.length);
    var y = {re: 0, im: 0};
    for(var i=0; i<n; i++){
        y = cadd(y,cmul(conj(v[i]),w[i]));
    }
    return y;
}

function cidm(n){
    var a = [];
    for(var i=0; i<n; i++){
        var t = [];
        for(var j=0; j<n; j++){t.push({re: i==j?1:0, im: 0});}
        a.push(t);
    }
    return a;
}

function copy_array(a){
    var b = [];
    for(var i=0; i<a.length; i++){
        if(Array.isArray(a[i])){
            b.push(copy_array(a[i]));
        }else{
            b.push(a[i]);
        }
    }
    return b;
}

function cmul_inplace(r,v){
    for(var i=0; i<v.length; i++){
        v[i] = cmul(r,v[i]);
    }
}

function cmul_add_inplace(a,v,b,w){
    for(var i=0; i<v.length; i++){
        v[i] = cadd(cmul(a,v[i]),cmul(b,w[i]));
    }
}

function swap(a,i,j){
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
}

function cpivoting(A,B,n,j){
    var m = cabs(A[j][j]);
    var k = j;
    for(var i=j+1; i<n; i++){
        if(m<cabs(A[i][j])){
            m = cabs(A[i][j]);
            k = i;
        }
    }
    swap(A,k,j);
    swap(B,k,j);
}

function cgauss_jordan(A,B,n){
    var i,j;
    for(j=0; j<n; j++){
        cpivoting(A,B,n,j);
        cmul_inplace(crdiv(1,A[j][j]),B[j]);
        cmul_inplace(crdiv(1,A[j][j]),A[j]);
        for(i=j+1; i<n; i++){
            if(A[i][j]!=0){
                cmul_add_inplace(crdiv(1,A[i][j]),B[i],{re:-1,im:0},B[j]);
                cmul_add_inplace(crdiv(1,A[i][j]),A[i],{re:-1,im:0},A[j]);
            }
        }
    }
    for(i=0; i<n-1; i++){
        for(j=i+1; j<n; j++){
            cmul_add_inplace({re:1,im:0},B[i],cneg(A[i][j]),B[j]);
            cmul_add_inplace({re:1,im:0},A[i],cneg(A[i][j]),A[j]);
        }
    }
    return B;
}

function cmatrix_inv(A){
    var n = A[0].length;
    var E = cidm(n);
    A = copy_array(A);
    return cgauss_jordan(A,E,n);
}

function cmatrix_pow(A,n){
    n = n.re;
    if(n<0){
        A = cmatrix_inv(A);
        n = -n;
    }else if(n==0){
        return cidm(A.length);
    }
    n--;
    var M = A;
    while(n>0){
        if(n%2==1){
            M = cmul_matrix_matrix(M,A);
        }
        A = cmul_matrix_matrix(A,A);
        n = Math.floor(n/2);
    }
    return M;
}

function cpivoting_det(A,n,j){
    var m = cabs(A[j][j]);
    var k = j;
    for(var i=j+1; i<n; i++){
        if(m<cabs(A[i][j])){
            m = cabs(A[i][j]);
            k = i;
        }
    }
    if(k==j){
        return false;
    }else{
        swap(A,k,j);
        return true;
    }
}

function cgauss_det(A,n){
    A = copy_array(A);
    var y = {re: 1, im: 0};
    for(var j=0; j<n; j++){
        if(cpivoting_det(A,n,j)){y = cneg(y);}
        for(var i=j+1; i<n; i++){
            if(A[i][j].re!=0 || A[i][j].im!=0){
                y = cdiv(y,A[j][j]);
                cmul_add_inplace(A[j][j],A[i],cneg(A[i][j]),A[j]);
            }
        }
        y = cmul(y,A[j][j]);
    }
    return y;
}

function cdet(A){
    var n = A.length;
    if(n==2){
        return csub(cmul(A[0][0],A[1][1]),cmul(A[0][1],A[1][0]));
    }else if(n==3){
        var M00 = csub(cmul(A[1][1],A[2][2]),cmul(A[1][2],A[2][1]));
        var M10 = csub(cmul(A[0][1],A[2][2]),cmul(A[0][2],A[2][1]));
        var M20 = csub(cmul(A[0][1],A[1][2]),cmul(A[0][2],A[1][1]));
        return cadd(
            csub(cmul(A[0][0],M00),cmul(A[1][0],M10)),
            cmul(A[2][0],M20)
        );
    }else{
        return cgauss_det(A,n);
    }
}

function ctrace(A){
    var n = A.length;
    var y = {re: 0, im: 0};
    for(var i=0; i<n; i++){
        y = cadd(y,A[i][i]);
    }
    return y;
}

function transpose(A){
    var m = A.length;
    var n = A[0].length;
    var B = [];
    for(var j=0; j<n; j++){
        var v = [];
        for(var i=0; i<m; i++){
            v.push(A[i][j]);
        }
        B.push(v);
    }
    return B;
}

extension_table.ftab = {
    Si: "cSi", Ci: "cCi", Ci90: "cCi90", Cin: "cCin",
    E1: "cE1", Ei: "cEi", Ein: "cEin", li: "cli", Li: "cLi",
    zeta: "czeta_variadic", pseq: "cprime_sequence",
    psi: "cpsi", ff: "cffac", rf: "crfac", bc: "cbc",
    erf: "cerf", erfc: "cerfc", B: "cbernoulliB", Bm: "cbernoulliBm",
    table: "ctable", Wertetabelle: "ctable",
    _addtt_: "cadd_tensor_tensor", _subtt_: "csub_tensor_tensor",
    _mulst_: "cmul_scalar_tensor", _mulmv_: "cmul_matrix_vector",
    _mulmm_: "cmul_matrix_matrix", _mulvv_: "cscalar_product",
    _vabs_: "cabs_vec", _negt_: "cneg_tensor",
    _matrix_pow_: "cmatrix_pow", det: "cdet",
    tr: "ctrace", tp: "transpose"
};

