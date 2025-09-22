Java.perform(function() {
    var Process = Java.use('android.os.Process');    
    Process.killProcess.implementation = function(pid) {
        console.log('killProcess called,overriding it to do nothing.');
        return;
    };
    
    let MainActivity = Java.use("com.dropbox.android");
    MainActivity["checKCounter"].implementation = function (counter) {
    console.log(`MainActivity.checKCounter is called: counter=${counter}`);
    
    let result = this["checKCounter"](counter);
    console.log(`MainActivity.checKCounter result=${result}`);
    result = true;
    return result;
};

MainActivity["cheCkCounter"].implementation = function (counter) {
    console.log(`MainActivity.cheCkCounter is called: counter=${counter}`);
    let result = this["cheCkCounter"](counter);
    console.log(`MainActivity.cheCkCounter result=${result}`);
    result = true;
    return result;
};


});

