
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

var ftab_extension = {
  PT: ChebyshevT, PU: ChebyshevU, PH: Hermite, 
  PP: Legendre, PL: Laguerre, bc: bc,
  psi: psi, digamma: digamma,
  zeta: zeta
};


