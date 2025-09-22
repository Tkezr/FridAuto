// === Full Root Detection Bypass ===
function bypass_root_detection() {
    console.log("[+] Bypassing Root Detection");

    // Hook `access` system call (used to check if a file exists)
    Interceptor.attach(Module.findExportByName(null, 'access'), {
        onEnter: function (args) {
            var path = Memory.readUtf8String(args[0]);
            if (path.includes("su") || path.includes("busybox") || path.includes("magisk")) {
                console.log("[!] Root check blocked: " + path);
                args[0] = ptr(0); // Prevent access check
            }
        }
    });

    // Hook `fopen` to prevent opening of root-related files
    Interceptor.attach(Module.findExportByName(null, 'fopen'), {
        onEnter: function (args) {
            var path = Memory.readUtf8String(args[0]);
            if (path.includes("su") || path.includes("magisk") || path.includes("xposed")) {
                console.log("[!] fopen blocked: " + path);
                args[0] = ptr(0);
            }
        }
    });

    // Hook `stat` to hide root-related files
    Interceptor.attach(Module.findExportByName(null, 'stat'), {
        onEnter: function (args) {
            var path = Memory.readUtf8String(args[0]);
            if (path.includes("su") || path.includes("magisk")) {
                console.log("[!] stat blocked: " + path);
                args[0] = ptr(0);
            }
        }
    });

    // Hook Build.TAGS to prevent root detection based on system properties
    var SystemProperties = Java.use("android.os.SystemProperties");
    SystemProperties.get.overload("java.lang.String").implementation = function (key) {
        if (key === "ro.build.tags") {
            console.log("[!] Hiding ro.build.tags");
            return "release-keys"; // Normal non-rooted device value
        }
        return this.get.call(this, key);
    };

    // Hook isDebuggerConnected to return false
    var Debug = Java.use("android.os.Debug");
    Debug.isDebuggerConnected.implementation = function () {
        console.log("[!] Hiding Debugger Connection");
        return false;
    };

    // Hook getprop command execution
    var Runtime = Java.use("java.lang.Runtime");
    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        console.log("[!] Blocking getprop execution: " + cmd);
        if (cmd.includes("getprop ro.debuggable") || cmd.includes("getprop ro.secure")) {
            return this.exec.call(this, "echo 0");
        }
        return this.exec.call(this, cmd);
    };

    // Hook getApplicationInfo to hide root apps
    var ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
    ApplicationInfo.flags.value = ApplicationInfo.flags.value & ~0x00000080;

    console.log("[+] Root Detection Bypass Applied");
}

// === Flutter SSL Pinning Bypass ===
function hook_ssl_crypto_x509_session_verify_cert_chain(address) {
    Interceptor.attach(address, {
        onEnter: function (args) { console.log("[+] Disabling SSL certificate validation"); },
        onLeave: function (retval) { 
            console.log("[!] SSL Check Bypassed. Original Retval: " + retval);
            retval.replace(0x1); // Forces SSL verification to always return success
        }
    });
}

// === Locate libflutter.so and Disable SSL Pinning ===
function disable_certificate_validation() {
    var m = Process.findModuleByName("libflutter.so");
    if (!m) {
        console.log("[X] libflutter.so not found!");
        return;
    }

    console.log("[+] libflutter.so loaded at ", m.base);
    var jni_onload_addr = m.enumerateExports()[0].address;
    console.log("[+] JNI_OnLoad found at: ", jni_onload_addr);

    // Offset between ssl_crypto_x509_session_verify_cert_chain and JNI_OnLoad
    let addr = ptr(jni_onload_addr).add(0xffffffffffe63958);
    console.log("[+] ssl_crypto_x509_session_verify_cert_chain_addr: ", addr);

    let buf = Memory.readByteArray(addr, 12);
    console.log(hexdump(buf, { offset: 0, length: 64, header: false, ansi: false }));

    hook_ssl_crypto_x509_session_verify_cert_chain(addr);
}

// === Execute Root Bypass First, Then SSL Bypass ===
setTimeout(() => {
    bypass_root_detection(); // Apply root detection bypass
    setTimeout(disable_certificate_validation, 2000); // Wait 2 sec, then apply SSL bypass
}, 1000);
