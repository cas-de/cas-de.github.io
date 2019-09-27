
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
];

function hzeta(s,a,N,M){
    var y=0;
    for(var k=0; k<N; k++){
        y+=Math.pow(a+k,-s);
    }
    var p = s;
    var x = B2ndivfac2n[1]*Math.pow(N+a,-1)*p;
    for(var n=2; n<=M; n++){
        var kmax = 2*n-2;
        p = p*(s+kmax-1)*(s+kmax);
        x+=B2ndivfac2n[n]*Math.pow(N+a,1-2*n)*p;
    }
    return y+Math.pow(N+a,-s)*((N+a)/(s-1)+0.5+x);
};

function zeta(s,a){
    if(a==undefined){
        if(s>-1){
            return s>60?1:hzeta(s,1,18,6);
        }else{
            var a = 2*Math.pow(2*Math.PI,s-1)*Math.sin(Math.PI*s/2);
            return a*gamma(1-s)*hzeta(1-s,1,18,6);
        }
    }else{
        var N = a>-10?18:Math.floor(Math.abs(a))+4;
        return hzeta(s,a,N,6);
    }
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

function bernoulliB(n){
    if(n==Math.floor(n) && n>=0 && n<260){
        return tabB(n);
    }else{
        return -n*zeta(1-n);
    }
}

function bernoulliBm(n){
    return n==1?-0.5:bernoulliB(n);
}

function Beta(x,y){
    if(x<0 || y<0){
        return gamma(x)*gamma(y)/gamma(x+y);
    }else{
        return Math.exp(lngammapx(x)+lngammapx(y)-lngammapx(x+y));
    }
}

function Bvariadic(x,y){
    if(y==undefined){
        return bernoulliB(x);
    }else{
        return Beta(x,y);
    }
}

function digamma(x){
    return gamma_diff(x)/gamma(x);
}

function polygamma(m,x){
    if(m==0){
        return digamma(x);
    }else{
        var N = x>-10?18:Math.floor(Math.abs(x))+4;
        return Math.cos(Math.PI*(m+1))*gamma(m+1)*hzeta(m+1,x,N,6);
    }
}

function generalized_polygamma(s,x){
    var f = function(s){
        return Math.exp(GAMMA*s)*hzeta(s+1,x,18,6)/gamma(-s);
    };
    return Math.exp(-GAMMA*s)*diff(f,s);
}

function psi(x,y){
    if(y==undefined){
        return digamma(x);
    }else if(x>=0 && x==Math.round(x)){
        return polygamma(x,y);
    }else{
        return generalized_polygamma(x,y);
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

function Delta(f,x,n){
    if(n==undefined || n==1){
        return f(x+1)-f(x);
    }else if(n==0){
        return f(x);
    }else{
        return Delta(f,x+1,n-1)-Delta(f,x,n-1);
    }
}

function stirling1(n,k){
    if(n==k){
        return 1;
    }else if(n<=0 || k<=0){
        return 0;
    }else{
        return (n-1)*stirling1(n-1,k)+stirling1(n-1,k-1);
    }
}

function stirling2(n,k){
    if(n==k){
        return 1;
    }else if(n<=0 || k<=0){
        return 0;
    }else{
        return k*stirling2(n-1,k)+stirling2(n-1,k-1);
    }
}

function s1(n,k){
    n = Math.round(n);
    k = Math.round(k);
    if(n<0 && k<0){
        return s2(-k,-n);
    }else{
        return n<k?0:stirling1(n,k);
    }
}

function s2(n,k){
    n = Math.round(n);
    k = Math.round(k);
    if(n<0 && k<0){
        return s1(-k,-n);
    }else{
        return n<k?0:stirling2(n,k);
    }

}

function trailing_zero_count(s){
    var decimal_point = false;
    for(var i=0; i<s.length; i++){
        if(s[i]=='.'){decimal_point = true;}
        else if(s[i]=='e' || s[i]=='E'){return 0;}
    }
    if(!decimal_point) return 0;
    var i = s.length-1;
    var count = 0;
    while(i>=0 && (s[i]=='0' || s[i]=='.')){
        count++;
        i--;
    }
    return count;
}

function trailing_zero_count_min(a){
    if(a.length==0) return 0;
    var count = trailing_zero_count(a[0]);
    for(var i=1; i<a.length; i++){
        count = Math.min(count,trailing_zero_count(a[i]));
    }
    return count;
}

function trim_by_count(a,count){
    for(var i=0; i<a.length; i++){
        var n = a[i].length;
        a[i] = a[i].slice(0,n-count);
    }
}

function trim_trailing_zeroes_min(a){
    var count = trailing_zero_count_min(a);
    trim_by_count(a,count);
}

function ftos_prec(n){
    return function(x){return x.toFixed(n);};
}

function table(f,a,prec){
    if(prec==undefined) prec=10;
    var ftos = ftos_prec(prec);
    var ax = [];
    var ay = [];
    for(var i=0; i<a.length; i++){
        ax.push(str(a[i],ftos));
    }
    for(var i=0; i<a.length; i++){
        ay.push(str(f(a[i]),ftos));
    }
    trim_trailing_zeroes_min(ax);
    trim_trailing_zeroes_min(ay);
    
    var b = ["<table class='bt'><tr><th>x<th>y"];
    for(var i=0; i<a.length; i++){
        b.push("<tr><td style='text-align: right'>");
        b.push(ax[i]);
        if(ay[i].length>0 && ay[i][0]=='['){
            b.push("<td>");
        }else{
            b.push("<td style='text-align: right'>");
        }
        b.push(ay[i]);
    }
    b.push("</table>");
    return b.join("");
}

function idm(n){
    var a = [];
    for(var i=0; i<n; i++){
        var t = [];
        for(var j=0; j<n; j++){t.push(i==j?1:0);}
        a.push(t);
    }
    return a;
}

function diag(v){
    var a = [];
    for(var i=0; i<v.length; i++){
        var t = [];
        for(var j=0; j<v.length; j++){t.push(i==j?v[i]:0);}
        a.push(t);
    }
    return a;
}

function diag_variadic(){
    if(arguments.length==1 && Array.isArray(arguments[0])){
        return diag(arguments[0]);
    }else{
        return diag(arguments);
    }
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

function mul_inplace(r,v){
    for(var i=0; i<v.length; i++){
        v[i] = r*v[i];
    }
}

function mul_add_inplace(a,v,b,w){
    for(var i=0; i<v.length; i++){
        v[i] = a*v[i]+b*w[i];
    }
}

function swap(a,i,j){
    var t = a[i];
    a[i] = a[j];
    a[j] = t;
}

function pivoting(A,B,n,j){
    var m = Math.abs(A[j][j]);
    var k = j;
    for(var i=j+1; i<n; i++){
        if(m<Math.abs(A[i][j])){
            m = Math.abs(A[i][j]);
            k = i;
        }
    }
    swap(A,k,j);
    swap(B,k,j);
}

function gauss_jordan(A,B,n){
    var i,j;
    for(j=0; j<n; j++){
        pivoting(A,B,n,j);
        mul_inplace(1/A[j][j],B[j]);
        mul_inplace(1/A[j][j],A[j]);
        for(i=j+1; i<n; i++){
            if(A[i][j]!=0){
                mul_add_inplace(1/A[i][j],B[i],-1,B[j]);
                mul_add_inplace(1/A[i][j],A[i],-1,A[j]);
            }
        }
    }
    for(i=0; i<n-1; i++){
        for(j=i+1; j<n; j++){
            mul_add_inplace(1,B[i],-A[i][j],B[j]);
            mul_add_inplace(1,A[i],-A[i][j],A[j]);
        }
    }
    return B;
}

function matrix_inv(A){
    var n = A[0].length;
    var E = idm(n);
    A = copy_array(A);
    return gauss_jordan(A,E,n);
}

function matrix_pow(A,n){
    if(n<0){
        A = matrix_inv(A);
        n = -n;
    }else if(n==0){
        return idm(A.length);
    }
    n--;
    var M = A;
    while(n>0){
        if(n%2==1){
            M = mul_matrix_matrix(M,A);
        }
        A = mul_matrix_matrix(A,A);
        n = Math.floor(n/2);
    }
    return M;
}

function pivoting_det(A,n,j){
    var m = Math.abs(A[j][j]);
    var k = j;
    for(var i=j+1; i<n; i++){
        if(m<Math.abs(A[i][j])){
            m = Math.abs(A[i][j]);
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

function gauss_det(A,n){
    A = copy_array(A);
    var y = 1;
    for(var j=0; j<n; j++){
        if(pivoting_det(A,n,j)){y = -y;}
        for(var i=j+1; i<n; i++){
            if(A[i][j]!=0){
                y = y/A[j][j];
                mul_add_inplace(A[j][j],A[i],-A[i][j],A[j]);
            }
        }
        y = y*A[j][j];
    }
    return y;
}

function det(A){
    var n = A.length;
    if(n==2){
        return A[0][0]*A[1][1]-A[0][1]*A[1][0];
    }else if(n==3){
        return (
            A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1]) -
            A[1][0]*(A[0][1]*A[2][2]-A[0][2]*A[2][1]) +
            A[2][0]*(A[0][1]*A[1][2]-A[0][2]*A[1][1])
        );
    }else{
        return gauss_det(A,n);
    }
}

function trace(A){
    var n = A.length;
    var y = 0;
    for(var i=0; i<n; i++){
        y+=A[i][i];
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

function mul_vector_matrix(v,A){
    return mul_matrix_vector(transpose(A),v);
}

function unit_vector(v){
    var r = abs_vec(v);
    return mul_scalar_vector(1/r,v);
}

function vdiff(f,t,n){
    if(n==undefined || n==1){
        return mul_scalar_tensor(500,
            sub_tensor_tensor(f(t+0.001),f(t-0.001))
        );
    }else{
        var h = n<3? 0.001:(n<4? 0.01:0.1);
        return mul_scalar_tensor(0.5/h,
            sub_tensor_tensor(vdiff(f,t+h,n-1),vdiff(f,t-h,n-1))
        );
    }
}

function nablah(h){
    return function nabla(f,x){
        if(x.length==2){
            return [
                (f(x[0]+h,x[1])-f(x[0]-h,x[1]))/(2*h),
                (f(x[0],x[1]+h)-f(x[0],x[1]-h))/(2*h),
            ];
        }else{
            return [
                (f(x[0]+h,x[1],x[2])-f(x[0]-h,x[1],x[2]))/(2*h),
                (f(x[0],x[1]+h,x[2])-f(x[0],x[1]-h,x[2]))/(2*h),
                (f(x[0],x[1],x[2]+h)-f(x[0],x[1],x[2]-h))/(2*h)
            ];
        }
    };
}

function jacobih(h){
    var sub_tt = sub_tensor_tensor;
    var mul_st = mul_scalar_tensor;
    return function jacobi(f,x){
        if(x.length==2){
            return transpose([
                mul_st(0.5/h,sub_tt(f(x[0]+h,x[1]),f(x[0]-h,x[1]))),
                mul_st(0.5/h,sub_tt(f(x[0],x[1]+h),f(x[0],x[1]-h))),
            ]);
        }else{
            return transpose([
                mul_st(0.5/h,sub_tt(f(x[0]+h,x[1],x[2]),f(x[0]-h,x[1],x[2]))),
                mul_st(0.5/h,sub_tt(f(x[0],x[1]+h,x[2])-f(x[0],x[1]-h,x[2]))),
                mul_st(0.5/h,sub_tt(f(x[0],x[1],x[2]+h)-f(x[0],x[1],x[2]-h)))
            ]);
        }
    };
}

function divoph(h){
    return function divop(F,x){
        if(x.length==2){
            return (
                (F(x[0]+h,x[1])[0]-F(x[0]-h,x[1])[0])/(2*h)+
                (F(x[0],x[1]+h)[1]-F(x[0],x[1]-h)[1])/(2*h)
            );
        }else{
            return NaN;
        }
    };
}

function rotation_matrix(phi){
    return [
        [Math.cos(phi),-Math.sin(phi)],
        [Math.sin(phi), Math.cos(phi)]
    ];
}

function matrix_mul_add_inplace(m,n,A,x,B){
    for(var i=0; i<m; i++){
        for(var j=0; j<n; j++){
            A[i][j] = A[i][j]+x*B[i][j];
        }
    }
}

function expm(A){
    var X = mul_scalar_tensor(1/1024,A);
    var n = X.length;
    var M = X;
    var Y = idm(n);
    var p = 1;
    matrix_mul_add_inplace(n,n,Y,1,M);
    for(var k=2; k<6; k++){
        p = p*k;
        M = mul_matrix_matrix(M,X);
        matrix_mul_add_inplace(n,n,Y,1/p,M);
    }
    return matrix_pow(Y,1024);
}

function apply(f,v){
    return f.apply(null,v);
}

function pli_nodes(t){
    return function(x){
        if(t.length==0){return NaN;}
        var a = 0;
        var b = t.length-1;
        if(x<t[a][0] || x>t[b][0]){return NaN;}
        var i;
        while(a<=b){
            i = a+Math.round((b-a)/2);
            if(x<t[i][0]){b = i-1;}else{a = i+1;}
        }
        i = a;
        if(i>0){
            var p1 = t[i-1];
            var p2 = t[i];
            return (p2[1]-p1[1])/(p2[0]-p1[0])*(x-p2[0])+p2[1];
        }else{
            return NaN;
        }
    };
}

function pli_fn(f,xa,xb,d){
    var a = range(xa,xb,d).map(function(x){return f(x);});
    return pli(xa,d,a);
}

function pli_general(x,y,z,w){
    if(y==undefined || z==undefined){
        return pli_nodes(x);
    }else if(w==undefined){
        return pli(x,y,z);
    }else{
        return pli_fn(x,y,z,w);
    }
}

function laplace_transform(f,x){
    var g = function(t){return f(t)*Math.exp(-x*t);};
    return gauss(g,0,40,1);
}

function delta(x,a){
    var t = Math.sqrt(Math.PI)*a*x;
    return a*Math.exp(-t*t);
}

function gcd(a,b){
    a = Math.round(Math.abs(a));
    b = Math.round(Math.abs(b));
    var h;
    while(b>0){
        h = a%b; a=b; b=h;
    }
    return a;
}

function lcm(a,b){
    a = Math.abs(a);
    b = Math.abs(b);
    return a/gcd(a,b)*b;
}

function gcd_list(a){
    if(a.length==0) return 0;
    var y = a[0];
    for(var i=1; i<a.length; i++){
        y = gcd(y,a[i]);
    }
    return y;
}

function lcm_list(a){
    if(a.length==0) return 0;
    var y = a[0];
    for(var i=1; i<a.length; i++){
        y = lcm(y,a[i]);
    }
    return y;
}

function gcd_variadic(){
    if(arguments.length==1 && Array.isArray(arguments[0])){
        return gcd_list(arguments[0]);
    }else{
        return gcd_list(arguments);
    }
}

function lcm_variadic(){
    if(arguments.length==1 && Array.isArray(arguments[0])){
        return lcm_list(arguments[0]);
    }else{
        return lcm_list(arguments);
    }
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

function euler_phi(n){
    n = Math.round(n);
    if(n<1) return NaN;
    var y = 1;
    for(var p=2; p<=n; p++){
        if(isprime(p) && n%p==0){
            y = y*(1-1/p);
        }
    }
    return Math.round(n*y);
}

function carmichael_lambda(n){
    if(n<1) return NaN;
    if(n==1) return 1;
    var a = factor(n).slice();
    for(var i=0; i<a.length; i++){
        var y = a[i];
        if(y[0]==2){
            if(y[1]==1) y = 1;
            else if(y[1]==2) y = 2;
            else y = Math.pow(2,y[1]-2);
        }else{
            y = Math.pow(y[0],y[1]-1)*(y[0]-1);
        }
        a[i] = y;
    }
    return lcm_list(a);
}

function nextprime(n){
    while(!isprime(n))n++;
    return n;
}

var factor_tab = {};

function factor(n){
    n = Math.round(n);
    var sn = String(n);
    if(factor_tab.hasOwnProperty(sn)){
        return factor_tab[sn];
    }
    var a,k,m;
    a = [];
    k = 2;
    while(k<=n){
        m = 0;
        while(n%k==0){n=n/k; m++;}
        if(m!=0) a.push([k,m]);
        k = nextprime(k+1);
    }
    factor_tab[sn] = a;
    return a;
}

function pcf(x){
    var y = 0;
    for(var k=1; k<=x; k++){
        y+=isprime(k);
    }
    return y;
}

var pseq_tab = [0,2];

function prime_sequence(n){
    if(n<pseq_tab.length){
        return pseq_tab[n];
    }else{
        var p = pseq_tab[pseq_tab.length-1];
        while(n>=pseq_tab.length){
            p = nextprime(p+1);
            pseq_tab.push(p);
        }
        return p;
    }
}

function sigma(k,n){
    k = Math.round(k);
    n = Math.round(n);
    if(n<1) return NaN;
    var y = 0;
    for(var d=1; d<=n; d++){
        if(n%d==0) y+=Math.pow(d,k);
    }
    return y;
}

function divisors(n){
    var a = [];
    for(var d=1; d<=n; d++){
        if(n%d==0) a.push(d);
    }
    return a;
}

function moebius(n){
    if(Math.round(n)<=0) return 0;
    var a = factor(n);
    for(var i=0; i<a.length; i++){
        if(a[i][1]>1) return 0;
    }
    return a.length%2==0?1:-1;
}

function all(p,a){
    for(var i=0; i<a.length; i++){
        if(p(a[i])==0) return 0;
    }
    return 1;
}

function any(p,a){
    for(var i=0; i<a.length; i++){
        if(p(a[i])==1) return 1;
    }
    return 0;
}

function count(p,a){
    var y = 0;
    for(var i=0; i<a.length; i++){
        if(p(a[i])==1) y++;
    }
    return y;
}

function sample(F){
    return invab(F,Math.random(),-100,100);
}

function samples(F,n){
    var a = [];
    for(var i=0; i<n; i++){
        a.push(sample(F));
    }
    return a;
}

function cdf(a,x){
    if(x==undefined){
        return function(x){return cdf(a,x);};
    }else{
        var y = 0;
        for(var k=0; k<a.length; k++){
            if(a[k]<=x) y++;
        }
        return y/a.length;
    }
}

function F21(a1,a2,b,x){
    var s = 1;
    var p = 1;
    for(var k=0; k<80; k++){
        p = p*x*(a1+k)*(a2+k)/(b+k)/(k+1);
        s+=p;
    }
    return s;
}

function iBeta(x,a,b){
    return Math.pow(x,a)/a*F21(a,1-b,a+1,x);
}

function riBeta(x,a,b){
    return iBeta(x,a,b)/Beta(a,b);
}

function pdfu(x,a,b){
    if(a==undefined) a=0;
    if(b==undefined) b=1;
    return a<=x && x<=b? 1/(b-a):0;
}

function cdfu(x,a,b){
    if(a==undefined) a=0;
    if(b==undefined) b=1;
    return x<a? 0:(x<=b? (x-a)/(b-a):1);
}

function pdfN(x,mu,sigma){
    if(sigma==undefined) sigma = 1;
    if(mu==undefined) mu = 0;
    var a = (x-mu)/sigma;
    return Math.exp(-0.5*a*a)/(Math.sqrt(2*Math.PI)*sigma);
}

function cdfN(x,mu,sigma){
    if(sigma==undefined) sigma = 1;
    if(mu==undefined) mu = 0;
    return 0.5+0.5*erf((x-mu)/(Math.SQRT2*sigma));
}

function pdfLogN(x,mu,sigma){
    var a = 1/(x*sigma*Math.sqrt(2*Math.PI));
    return a*Math.exp(-0.5*Math.pow((Math.log(x)-mu)/sigma,2));
}

function cdfLogN(x,mu,sigma){
    return 0.5+0.5*erf((Math.log(x)-mu)/(sigma*Math.sqrt(2)));
}

function pdfExp(x,lambda){
    if(x<0) return 0;
    return lambda*Math.exp(-lambda*x);
}

function cdfExp(x,lambda){
    if(x<0) return 0;
    return 1-Math.exp(-lambda*x);
}

function pdfchisq(x,n){
    if(x<=0) return 0;
    return Math.pow(x,n/2-1)*Math.exp(-x/2)/(Math.pow(2,n/2)*gamma(n/2));
}

function cdfchisq(x,n){
    if(x<=0) return 0;
    return igamma(n/2,x/2)/gamma(n/2);
}

function qfchisq(p,n){
    var F = function(x){return cdfchisq(x,n);};
    return inv(F,p);
}

function pdfst(x,n){
    var a = gamma((n+1)/2)/(gamma(n/2)*Math.sqrt(n*Math.PI));
    return a*Math.pow(1+x*x/n,-(n+1)/2);
}

function cdfst(x,n){
    var a = Math.sqrt(x*x+n);
    return riBeta((x+a)/(2*a),n/2,n/2);
}

function pdfF(x,m,n){
    if(x<0) return 0;
    var a = Math.pow(m,0.5*m)*Math.pow(n,0.5*n)/Beta(0.5*m,0.5*n);
    return a*Math.pow(x,0.5*m-1)/Math.pow(m*x+n,0.5*(m+n));
}

function cdfF(x,m,n){
    if(x<=0) return 0;
    return riBeta(m*x/(m*x+n),0.5*m,0.5*n);
}

function qfF(p,m,n){
    var F = function(x){return cdfF(m,n,x);};
    return inv(F,p);
}

function pdfW(x,a,b){
    if(x<0) return 0;
    return a/b*Math.pow(x/b,a-1)*Math.exp(-Math.pow(x/b,a));
}

function cdfW(x,a,b){
    if(x<0) return 0;
    return 1-Math.exp(-Math.pow(x/b,a));
}

function pdfGamma(x,b,p){
    if(x<=0) return 0;
    return Math.pow(b,p)/gamma(p)*Math.pow(x,p-1)*Math.exp(-b*x);
}

function cdfGamma(x,b,p){
    if(x<0) return 0;
    return igamma(p,b*x)/gamma(p);
}

function pdfBeta(x,p,q){
    if(x<0 || x>1) return 0;
    return Math.pow(x,p-1)*Math.pow(1-x,q-1)/Beta(p,q);
}

function cdfBeta(x,p,q){
    if(x<0) return 0;
    if(x>1) return 1;
    return riBeta(x,p,q);
}

function pmfB(k,n,p){
    k = Math.round(k);
    if(k<0 || k>n) return 0;
    return bc(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);
}

function cdfB(x,n,p){
    var s = 0;
    x = Math.round(x);
    for(var k=0; k<=x; k++){
      s+=bc(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);
    }
    return s;
}

function pmfG(k,p){
    k = Math.round(k);
    if(k<1) return 0;
    return p*Math.pow(1-p,k-1);
}

function cdfG(x,p){
    x = Math.round(x);
    if(x<1) return 0;
    return 1-Math.pow(1-p,x);
}

function pmfH(k,N,K,n){
    N = Math.round(N); K = Math.round(K);
    n = Math.round(n); k = Math.round(k);
    if(k<Math.max(0,n+K-N) || k>Math.min(n,K)) return 0;
    return bc(K,k)*bc(N-K,n-k)/bc(N,n);
}

function cdfH(x,N,K,n){
    var s=0;
    for(var k=0; k<=x; k++){
        s+=pmfH(N,K,n,k);
    }
    return s;
}

function pmfP(k,lambda){
    k = Math.round(k);
    if(k<0) return 0;
    return Math.exp(-lambda)*Math.pow(lambda,k)/fac(k);
}

function cdfP(x,lambda){
    x = Math.round(x);
    var s=0;
    for(var k=0; k<=x; k++){
        s+=pmfP(lambda,k);
    }
    return s;
}

function pmfLog(k,p){
    k = Math.round(k);
    if(k<1) return 0;
    return -Math.pow(p,k)/(k*Math.log(1-p));
}

function cdfLog(x,p){
    x = Math.round(x);
    var s=0;
    for(var k=1; k<=x; k++){
        s+=pmfLog(p,k);
    }
    return s;
}

function quality_level(n){
    if(n==undefined) n = 0;
    max_count = 600*Math.pow(10,n);
}

function dot(a){
    dot_alpha = a;
}

extension_table.ftab = {
PT: ChebyshevT, PU: ChebyshevU, PH: Hermite, 
PP: Legendre, PL: Laguerre, bc: bc, s1: s1, s2: s2,
psi: psi, digamma: digamma, tabB: tabB,
zeta: zeta, B: Bvariadic, Bm: bernoulliBm, ipp: ipp,
table: table, Wertetabelle: table, Delta: Delta,
Si: Si, Ci: Ci, det: det, unit: unit_vector, I: idm,
diag: diag_variadic, _matrix_pow_: matrix_pow, expm: expm,
_vdiff_: vdiff, nabla: nablah(0.001), divop: divoph(0.001),
jacobi: jacobih(0.001), _mulvm_: mul_vector_matrix,
apply: apply, rot: rotation_matrix, tr: trace, tp: transpose,
pli: pli_general, L: laplace_transform, delta: delta,
gcd: gcd_variadic, ggT: gcd_variadic,
lcm: lcm_variadic, kgV: lcm_variadic,
isprime: isprime, prim: isprime, pcf: pcf, factor: factor,
phi: euler_phi, lambda: carmichael_lambda, sigma: sigma,
pseq: prime_sequence, divisors: divisors, Teiler: divisors,
mu: moebius, all: all, any: any, count: count,
sample: sample, samples: samples, cdf: cdf,
cdfu: cdfu, pdfu: pdfu, cdfN: cdfN, pdfN: pdfN,
cdfLogN: cdfLogN, pdfLogN: pdfLogN, cdfExp: cdfExp, pdfExp: pdfExp,
cdfchisq: cdfchisq, pdfchisq: pdfchisq, cdfst: cdfst, pdfst: pdfst,
cdfF: cdfF, pdfF: pdfF, cdfW: cdfW, pdfW: pdfW,
cdfGamma: cdfGamma, pdfGamma: pdfGamma,
cdfBeta: cdfBeta, pdfBeta: pdfBeta, pmfB: pmfB, cdfB: cdfB,
cmfG: pmfG, cdfG: cdfG, pmfH: pmfH, cdfH: cdfH,
pmfP: pmfP, cdfP: cdfP, pmfLog: pmfLog, cdfLog: cdfLog,
level: quality_level, dot: dot
};


