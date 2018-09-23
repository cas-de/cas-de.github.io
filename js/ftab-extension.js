
"use strict";

// Lanczos approximation
function lngammapx(x){
  var p=[0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  x--;
  var y=p[0];
  for(var i=1; i<9; i++){
    y+=p[i]/(x+i);
  }
  var t=x+7.5;
  return 0.5*Math.log(2*Math.PI)+(x+0.5)*Math.log(t)-t+Math.log(y);
}

function bc(x,k){
    if(k!=Math.round(k)){
        return gamma(x+1)/gamma(k+1)/gamma(x-k+1);
    }else if(k<0){
        return 0;
    }
    var y=1;
    for(var i=1; i<=k; i++){
        y = y*(x-i+1)/i;
    }
    return y;
}

function ChebyshevT(n,x){
    if(Math.abs(x)<1){
        return Math.cos(n*Math.acos(x));
    }else if(x>=1){
        return cosh(n*acosh(x));
    }else{
        return Math.cos(Math.PI*n)*cosh(n*acosh(-x));
    }
}

function ChebyshevU(n,x){
    return (ChebyshevT(n+2,x)-x*ChebyshevT(n+1,x))/(x*x-1);
}

function Hermite(n,x){
    var y=0, m=Math.floor(n/2);
    for(var k=0; k<=m; k++){
        y += Math.cos(k*Math.PI)/fac(k)/fac(n-2*k)*Math.pow(2*x,n-2*k);
    }
    return y*fac(n);
}

function Laguerre(n,a,x){
    var y=0;
    for(var k=0; k<=n; k++){
        y += Math.cos(k*Math.PI)*bc(n+a,n-k)/fac(k)*Math.pow(x,k);
    }
    return y;
}

function ALP(n,m,x){
    if(n==m){
        return Math.sqrt(Math.PI)/gamma(0.5-n)*Math.pow(2*Math.sqrt(1-x*x),n);
    }else if(n-1==m){
        return x*(2.0*n-1)*ALP(m,m,x);
    }else{
        var a = ALP(m,m,x);
        var b = ALP(m+1,m,x);
        var h;
        for(var k=m+2; k<=n; k++){
          h = ((2.0*k-1)*x*b-(k-1.0+m)*a)/(k-m);
          a=b; b=h;
        }
        return b;
    }
}

function Legendre(n,m,x){
    n = Math.round(n);
    m = Math.round(m);
    if(n<0) n=-n-1;
    if(Math.abs(m)>n){
        return 0;
    }else if(m<0){
        m = -m;
        return((m%2<0.5?1:-1)*
          Math.exp(lngammapx(n-m+1)-lngammapx(n+m+1))*
          ALP(n,m,x)
        );
    }else{
        return ALP(n,m,x);
    }
}

// Lanczos approximation
function lanczos_gamma_diff(x0){
    var p=[0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    var x = x0-1;
    var y=p[0];
    for(var i=1; i<9; i++){
        y+=p[i]/(x+i);
    }
    var y1=0;
    for(var i=1; i<9; i++){
        y1-=p[i]/((x+i)*(x+i));
    }
    var t=x+7.5;
    var a = Math.sqrt(2*Math.PI)*Math.pow(t,x+0.5)*Math.exp(-t);
    return a*(((x+0.5)/t+Math.log(t)-1)*y+y1);
}

function gamma_diff(x){
    if(x<0.5){
        var c = Math.cos(Math.PI*x);
        var s = Math.sin(Math.PI*x);
        var g = lanczos_gamma(1-x);
        return Math.PI*(s*lanczos_gamma_diff(1-x)-Math.PI*c*g)/(s*s*g*g);
    }else{
        return lanczos_gamma_diff(x);
    }
}

function hzeta(s,a){
    var y=0, N=18, Npa=N+a;
    for(var k=a; k<Npa; k++){
        y+=Math.pow(k,-s);
    }
    var s2=s*(s+1)*(s+2);
    var s4=s2*(s+3)*(s+4);
    y+=Math.pow(Npa,1-s)/(s-1)+0.5*Math.pow(Npa,-s);
    y+=s*Math.pow(Npa,-s-1)/12;
    y-=s2*Math.pow(Npa,-s-3)/720;
    y+=s4*Math.pow(Npa,-s-5)/30240;
    y-=s4*(s+5)*(s+6)*Math.pow(Npa,-s-7)/1209600;
    return y;
}

function zeta(s,a){
    if(a==undefined){
        if(s>-1){
            return hzeta(s,1);
        }else{
            var a = 2*Math.pow(2*Math.PI,s-1)*Math.sin(Math.PI*s/2);
            return a*gamma(1-s)*hzeta(1-s,1);
        }
    }else{
        return hzeta(s,a);
    }
}

function digamma(x){
    return gamma_diff(x)/gamma(x);
}

function polygamma(m,x){
    if(m==0){
        return digamma(x);
    }else{
        return Math.pow(-1,m+1)*gamma(m+1)*hzeta(m+1,x);
    }
}

function psi(x,y){
    if(y==undefined){
        return digamma(x);
    }else{
        return polygamma(x,y);
    }
}

function hf(x){
var xm1,xm2,xm4,xm6,xm8,xm10,xm12,xm14,xm16,xm18,xm20;
xm1=1/x; xm2=xm1*xm1; xm4=xm2*xm2; xm6=xm4*xm2; xm8=xm6*xm2;
xm10=xm8*xm2; xm12=xm10*xm2; xm14=xm12*xm2; xm16=xm14*xm2;
xm18=xm16*xm2; xm20=xm18*xm2;
return xm1*(1
+7.44437068161936700618E2*xm2
+1.96396372895146869801E5*xm4+
2.37750310125431834034E7*xm6
+1.43073403821274636888E9*xm8
+4.33736238870432522765E10*xm10
+6.40533830574022022911E11*xm12
+4.20968180571076940208E12*xm14
+1.00795182980368574617E13*xm16
+4.94816688199951963482E12*xm18
-4.94701168645415959931E11*xm20
)/(
1+7.46437068161927678031E2*xm2
+1.97865247031583951450E5*xm4
+2.41535670165126845144E7*xm6
+1.47478952192985464958E9*xm8
+4.58595115847765779830E10*xm10
+7.08501308149515401563E11*xm12
+5.06084464593475076774E12*xm14
+1.43468549171581016479E13*xm16
+1.11535493509914254097E13*xm18
);
}

function hg(x){
var xm1,xm2,xm4,xm6,xm8,xm10,xm12,xm14,xm16,xm18,xm20;
xm1=1/x; xm2=xm1*xm1; xm4=xm2*xm2; xm6=xm4*xm2; xm8=xm6*xm2;
xm10=xm8*xm2; xm12=xm10*xm2; xm14=xm12*xm2; xm16=xm14*xm2;
xm18=xm16*xm2; xm20=xm18*xm2;
return xm2*(1
+8.1359520115168615E2*xm2
+2.35239181626478200E5*xm4
+3.12557570795778731E7*xm6
+2.06297595146763354E9*xm8
+6.83052205423625007E10*xm10
+1.09049528450362786E12*xm12
+7.57664583257834349E12*xm14
+1.81004487464664575E13*xm16
+6.43291613143049485E12*xm18
-1.36517137670871689E12*xm20
)/(1
+8.19595201151451564E2*xm2
+2.40036752835578777E5*xm4
+3.26026661647090822E7*xm6
+2.23355543278099360E9*xm8
+7.87465017341829930E10*xm10
+1.39866710696414565E12*xm12
+1.17164723371736605E13*xm14
+4.01839087307656620E13*xm16
+3.99653257887490811E13*xm18
);
}

function Si4(x){
var x2,x4,x6,x8,x10,x12,x14;
x2=x*x; x4=x2*x2; x6=x4*x2; x8=x6*x2;
x10=x8*x2; x12=x10*x2; x14=x12*x2;
return x*(1
-4.54393409816329991E-2*x2
+1.15457225751016682E-3*x4
-1.41018536821330254E-5*x6
+9.43280809438713025E-8*x8
-3.53201978997168357E-10*x10
+7.08240282274875911E-13*x12
-6.05338212010422477E-16*x14
)/(1
+1.01162145739225565E-2*x2
+4.99175116169755106E-5*x4
+1.55654986308745614E-7*x6
+3.28067571055789734E-10*x8
+4.5049097575386581E-13*x10
+3.21107051193712168E-16*x12
);
}

function Ci4(x){
var x2,x4,x6,x8,x10,x12,x14;
x2=x*x; x4=x2*x2; x6=x4*x2; x8=x6*x2;
x10=x8*x2; x12=x10*x2; x14=x12*x2;
return GAMMA+Math.log(x)+x2*(-0.25
+7.51851524438898291E-3*x2
-1.27528342240267686E-4*x4
+1.05297363846239184E-6*x6
-4.68889508144848019E-9*x8
+1.06480802891189243E-11*x10
-9.93728488857585407E-15*x12
)/(1
+1.1592605689110735E-2*x2
+6.72126800814254432E-5*x4
+2.55533277086129636E-7*x6
+6.97071295760958946E-10*x8
+1.38536352772778619E-12*x10
+1.89106054713059759E-15*x12
+1.39759616731376855E-18*x14
);
}

function Si(x){
    var s = Math.sign(x);
    x = Math.abs(x);
    if(x<4){
        return s*Si4(x);
    }else{
        return s*(0.5*Math.PI-hf(x)*Math.cos(x)-hg(x)*Math.sin(x));
    }
}

function Ci(x){
    if(x<=0){
        return NaN;
    }else if(x<4){
        return Ci4(x);
    }else{
        return hf(x)*Math.sin(x)-hg(x)*Math.cos(x);
    }
}

function ipp(a){
    if(arguments.length>1){
        a = arguments;
    }
    var i,j,d=[];
    var n = a.length;
    for(i=0; i<n; i++){
        d.push(a[i][1]);
    }
    for(i=1; i<n; i++){
        for(j=n-1; j>=i; j--){
            d[j] = (d[j]-d[j-1])/(a[j][0]-a[j-i][0]);
        }
    }
    return function(x){
        var y = d[n-1];
        for(var i=n-2; i>=0; i--){
            y = d[i]+(x-a[i][0])*y;
        }
        return y;
    };
}

function table(f,a){
    var b = ["<table class='bt'><tr><th>x<th>y"];
    for(var i=0; i<a.length; i++){
        b.push("<tr><td style='text-align: right'>");
        b.push(str(a[i]));
        b.push("<td style='text-align: right'>");
        b.push(str(f(a[i])));
    }
    b.push("</table>");
    return b.join("");
}

var ftab_extension = {
  PT: ChebyshevT, PU: ChebyshevU, PH: Hermite, 
  PP: Legendre, PL: Laguerre, bc: bc,
  psi: psi, digamma: digamma,
  zeta: zeta, table: table, ipp: ipp,
  Si: Si, Ci: Ci
};


