Java.perform(function() {
    // Root Detection Bypass

    var array_list = Java.use("java.util.ArrayList");
    var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
        "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
        "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
        "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
        "eu.chainfire.supersu.pro", "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN","com.topjohnwu.magisk"
    ];

    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk","magisk"];
    var RootProperties = {
        "ro.build.selinux": "1",
        "ro.debuggable": "0",
        "service.adb.root": "0",
        "ro.secure": "1"
    };
    var RootPropertiesKeys = Object.keys(RootProperties);

    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Runtime = Java.use('java.lang.Runtime');
    var NativeFile = Java.use('java.io.File');
    var SystemProperties = Java.use('android.os.SystemProperties');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        if (RootPackages.indexOf(pname) > -1) {
            pname = "fake.package.name";
        }
        return this.getPackageInfo(pname, flags);
    };

    NativeFile.exists.implementation = function() {
        var name = this.getName();
        return RootBinaries.indexOf(name) > -1 ? false : this.exists();
    };

    var execOverloads = [
        Runtime.exec.overload('[Ljava.lang.String;'),
        Runtime.exec.overload('java.lang.String'),
        Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File'),
        Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File')
    ];

    execOverloads.forEach(function(exec) {
        exec.implementation = function() {
            var cmd = arguments[0];
            if (typeof cmd === 'string' && isRootCommand(cmd)) {
                return Runtime.getRuntime().exec("fake_command");
            }
            if (Array.isArray(cmd) && cmd.some(isRootCommand)) {
                return Runtime.getRuntime().exec("fake_command");
            }
            return exec.apply(this, arguments);
        };
    });

    function isRootCommand(cmd) {
        return /getprop|mount|build.prop|id|sh|su|which/.test(cmd);
    }

    SystemProperties.get.overload('java.lang.String').implementation = function(name) {
        return RootProperties[name] || this.get(name);
    };

    // Native layer root detection bypass
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            if (path.includes("su") || path.includes("magisk")) {
                Memory.writeUtf8String(args[0], "/fake_path");
            }
        }
    });

    Interceptor.attach(Module.findExportByName("libc.so", "system"), {
        onEnter: function(args) {
            var cmd = Memory.readCString(args[0]);
            if (isRootCommand(cmd)) {
                Memory.writeUtf8String(args[0], "fake_command");
            }
        }
    });
});

// SSL Pinning Bypass
function hook_ssl_crypto_x509_session_verify_cert_chain(address) {
    Interceptor.attach(address, {
        onEnter: function(args) {
            console.log("Bypassing SSL certificate validation");
        },
        onLeave: function(retval) {
            retval.replace(0x1);
        }
    });
}

function disable_certificate_validation() {
    var targetLib = 'libflutter.so';
    var module = Process.findModuleByName(targetLib);
    
    if (module) {
        console.log(`${targetLib} base: ${module.base}`);
        var jni_onload = module.findExportByName("JNI_OnLoad");
        var ssl_verify_offset = -0x1C6A8; // Adjust this offset as needed
        var ssl_verify_addr = jni_onload.add(ssl_verify_offset);
        
        console.log(`SSL verify address: ${ssl_verify_addr}`);
        hook_ssl_crypto_x509_session_verify_cert_chain(ssl_verify_addr);
    } else {
        console.log(`${targetLib} not found, retrying...`);
        setTimeout(disable_certificate_validation, 1000);
    }
}

setTimeout(disable_certificate_validation, 2000);