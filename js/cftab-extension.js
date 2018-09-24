
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

var ftab_extension = {
    Si: "cSi", Ci: "cCi", Ci90: "cCi90", Cin: "cCin",
    E1: "cE1", Ei: "cEi", Ein: "cEin", li: "cli", Li: "cLi"
};

