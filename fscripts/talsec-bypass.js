Java.perform(function () {
    console.log("[*] Starting root detection bypass...");

    // Hook to block common methods used to check root
    var Runtime = Java.use('java.lang.Runtime');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

    // Hook Runtime.exec() to bypass commands like "su"
    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        console.log("[*] Blocking command: " + cmd);
        if (cmd.indexOf("su") >= 0) {
            return null; // Prevent execution of "su" command
        }
        return this.exec(cmd); // Pass through other commands
    };

    Runtime.exec.overload('[Ljava.lang.String;').implementation = function (cmd) {
        console.log("[*] Blocking command: " + cmd.join(" "));
        if (cmd.toString().indexOf("su") >= 0) {
            return null; // Prevent execution of "su" command
        }
        return this.exec(cmd); // Pass through other commands
    };

    // Hook ProcessBuilder to block execution of root-related commands
    ProcessBuilder.command.overload('java.util.List').implementation = function (cmdList) {
        console.log("[*] Blocking ProcessBuilder command: " + cmdList.toString());
        if (cmdList.toString().indexOf("su") >= 0) {
            return this; // Do nothing for "su" commands
        }
        return this.command(cmdList); // Pass through other commands
    };

    ProcessBuilder.command.overload('[Ljava.lang.String;').implementation = function (cmdArray) {
        console.log("[*] Blocking ProcessBuilder command: " + cmdArray.join(" "));
        if (cmdArray.toString().indexOf("su") >= 0) {
            return this; // Do nothing for "su" commands
        }
        return this.command(cmdArray); // Pass through other commands
    };

    // Hook common native libraries used for root detection
    var libc = Module.findExportByName("libc.so", "system");
    if (libc) {
        Interceptor.attach(libc, {
            onEnter: function (args) {
                var command = args[0].readUtf8String();
                console.log("[*] Intercepting system command: " + command);
                if (command.indexOf("su") >= 0) {
                    console.log("[*] Blocking 'su' command.");
                    args[0].writeUtf8String("false"); // Replace with benign command
                }
            }
        });
    }

    console.log("[*] Root detection bypass setup complete.");
});
