Java.perform(function() {
    // Hook Java System.exit(int) to block normal exit
    var System = Java.use("java.lang.System");
    System.exit.overload('int').implementation = function(code) {
        send("Blocked java.lang.System.exit(" + code + ")");
        // Do nothing here to hold the process
    };

    // Hook Java Runtime.exit(int)
    var Runtime = Java.use("java.lang.Runtime");
    Runtime.exit.overload('int').implementation = function(code) {
        send("Blocked java.lang.Runtime.exit(" + code + ")");
        // Do nothing here
    };
});

// Hook native exit() to block native calls to exit
Interceptor.attach(Module.findExportByName("libc.so", "exit"), {
    onEnter: function (args) {
        send("Blocked native libc exit call");
        // Do nothing, block exit
    }
});

// Keep script alive indefinitely
setInterval(function() {
    // no-operation to prevent script termination
}, 1999999999999999999999999999999999999999999999);
