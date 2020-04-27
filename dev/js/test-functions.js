
function crc_table(){
    var a = [];
    for(var n=0; n<256; n++){
        var c = n;
        for(var k=0; k<8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        a[n] = c;
    }
    return a;
}

function new_crc32(){
    var a = crc_table();
    return function(str){
        var crc = 0 ^ (-1);
        for(var i=0; i<str.length; i++){
            crc = (crc >>> 8) ^ a[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    }
};

var hash = new_crc32();

function check_isprime(buffer){
    var count = 0;
    var sum = 0;
    for(var k=0; k<1000000; k++){
        if(isprime(k)){
            count += 1; sum = (sum+k)%1000000;
        }
    }
    if(count!=78498 || sum!=402023){ 
        buffer.push("<p>Primality test failed.");
        return "err";
    }
    return "ok";
}

function check_factor(buffer){
    var a = [];
    for(var k=0; k<10000; k++){
        a.push(JSON.stringify(factor(k)));
    }
    var h = hash(a.join(""));
    if(h != 1121456376){
        buffer.push("<p>Factor failed.");
        return "err";
    }
    return "ok";
}

var checks = [
    check_isprime,
    check_factor
];

function all_tests(){
    var output = document.getElementById("output");
    var buffer = [];
    var all_ok = true;
    for(var i=0; i<checks.length; i++){
        if(checks[i](buffer)=="err") {all_ok = false;}
    }
    if(all_ok){
        buffer.push("<p><b style='color: #006000'>Success.</b>");
    }
    output.innerHTML = buffer.join("");
}

window.onload = function(){};
