Java.perform(function() {
    console.log("[+] Advanced Multi-Layer Security Bypass Script Loaded");
    
    // ========== COMPREHENSIVE PACKAGE LIST ==========
    var DetectedPackages = [
        // SSL/Network Capture Tools
        "app.greyshirts.sslcapture",
        "app.greyshirts.sslcapturess", 
        "com.crazyricky.androidsslstrip",
        "com.simo.ssl.killer",
        
        // Root Detection Bypass Tools
        "com.devadvance.rootcloak",
        "com.devadvance.rootcloak2", 
        "com.devadvance.rootcloakplus",
        "com.gauravssnl.bypassrootcheck.pro",
        
        // Root Management Apps
        "com.kingroot.kinguser",
        "com.koushikdutta.superuser",
        "com.noshufou.android.su",
        "com.noshufou.android.su.elite",
        "com.thirdparty.superuser",
        "com.topjohnwu.magisk",
        "com.yellowes.su",
        "eu.chainfire.suhide",
        "eu.chainfire.supersu",
        "eu.chainfire.supersu.pro",
        "me.phh.superuser",
        "me.weishu.kernelsu",
        "io.github.huskydg.magisk",
        "io.github.vvb2060.magisk",
        "me.bmax.apatch",
        
        // Hacking Tools
        "com.dimonvideo.luckypatcher",
        "com.dimonvideo.luckypatcherrao",
        "com.efngames.supermacro",
        "apps.zhasik007.hack",
        "cn.com.opda.gamemaster",
        
        // Privacy/Security Tools
        "com.ramdroid.appquarantine",
        "be.uhasselt.privacypolice",
        "biz.bokhorst.xprivacy",
        "com.samsung.knox.securefolder",
        
        // Emulator Detection
        "com.device.emulator",
        
        // Analysis/Debug Tools
        "me.shingle.fridaserver",
        "blake.hamilton.bitsharktrial",
        "catch_.me_.if_.you_.can_",
        
        // Root Utilities
        "com.shuame.rootgenius",
        "com.smedialink.oneclickroot", 
        "com.z4mod.z4root",
        "com.zachspong.temprootremovejb"
    ];

    // ========== HOOK PACKAGE MANAGER ==========
    try {
        var PackageManager = Java.use("android.app.ApplicationPackageManager");
        
        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
            var shouldFakePackage = (DetectedPackages.indexOf(pname) > -1);
            if (shouldFakePackage) {
                console.log("[+] Blocked package info request for: " + pname);
                var PackageNameNotFoundEx = Java.use("android.content.pm.PackageManager$NameNotFoundException");
                throw PackageNameNotFoundEx.$new("Package not found: " + pname);
            }
            return this.getPackageInfo.call(this, pname, flags);
        };

        PackageManager.getInstalledPackages.overload('int').implementation = function(flags) {
            var packageList = this.getInstalledPackages.call(this, flags);
            var filteredList = Java.use("java.util.ArrayList").$new();
            
            var iterator = packageList.iterator();
            while (iterator.hasNext()) {
                var packageInfo = iterator.next();
                var packageName = packageInfo.packageName.value;
                
                if (DetectedPackages.indexOf(packageName) === -1) {
                    filteredList.add(packageInfo);
                } else {
                    console.log("[+] Filtered out package: " + packageName);
                }
            }
            return filteredList;
        };

        PackageManager.getApplicationInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
            if (DetectedPackages.indexOf(pname) > -1) {
                console.log("[+] Blocked application info request for: " + pname);
                var PackageNameNotFoundEx = Java.use("android.content.pm.PackageManager$NameNotFoundException");
                throw PackageNameNotFoundEx.$new("Application not found: " + pname);
            }
            return this.getApplicationInfo.call(this, pname, flags);
        };
        
        console.log("[+] PackageManager methods hooked");
    } catch (err) {
        console.log("[-] PackageManager hook failed: " + err);
    }

    // ========== HOOK FILE OPERATIONS ==========
    try {
        var File = Java.use('java.io.File');
        File.exists.implementation = function() {
            var name = this.getName();
            var path = this.getAbsolutePath();
            
            // Block root binaries and detection tools
            var blockedNames = ["su", "busybox", "magisk", "xposed"];
            var blockedPaths = [
                "/system/bin/su", "/system/xbin/su", "/sbin/su",
                "/data/local/tmp/frida-server", "/data/local/tmp/re.frida.server",
                "/system/framework/XposedBridge.jar"
            ];
            
            var shouldBlock = blockedNames.some(blocked => name.toLowerCase().indexOf(blocked) !== -1) ||
                            blockedPaths.some(blocked => path.indexOf(blocked) !== -1);
            
            if (shouldBlock) {
                console.log("[+] Blocked file existence check: " + path);
                return false;
            }
            return this.exists.call(this);
        };
        console.log("[+] File.exists hooked");
    } catch (err) {
        console.log("[-] File.exists hook failed: " + err);
    }

    // ========== HOOK RUNTIME EXEC ==========
    try {
        var Runtime = Java.use('java.lang.Runtime');
        var exec1 = Runtime.exec.overload('[Ljava.lang.String;');
        var exec2 = Runtime.exec.overload('java.lang.String');
        var exec3 = Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;');
        
        exec1.implementation = function(cmd) {
            var command = cmd.join(" ");
            if (shouldBlockCommand(command)) {
                console.log("[+] Blocked Runtime.exec: " + command);
                return createFakeProcess();
            }
            return this.exec.call(this, cmd);
        };

        exec2.implementation = function(cmd) {
            if (shouldBlockCommand(cmd)) {
                console.log("[+] Blocked Runtime.exec: " + cmd);
                return createFakeProcess();
            }
            return this.exec.call(this, cmd);
        };
        
        exec3.implementation = function(cmd, env) {
            var command = cmd.join(" ");
            if (shouldBlockCommand(command)) {
                console.log("[+] Blocked Runtime.exec with env: " + command);
                return createFakeProcess();
            }
            return this.exec.call(this, cmd, env);
        };

        function shouldBlockCommand(cmd) {
            var blockedCommands = [
                "su", "which su", "busybox", "id", "getprop", "mount",
                "ps", "netstat", "lsof", "cat /proc",
                "pm list packages", "dumpsys", "service list"
            ];
            return blockedCommands.some(blocked => cmd.toLowerCase().indexOf(blocked) !== -1);
        }

        function createFakeProcess() {
            var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
            var emptyCmd = Java.use('java.util.ArrayList').$new();
            emptyCmd.add("echo");
            return ProcessBuilder.$new(emptyCmd).start();
        }
        
        console.log("[+] Runtime.exec hooked");
    } catch (err) {
        console.log("[-] Runtime.exec hook failed: " + err);
    }

    // ========== SYSTEM PROPERTIES BYPASS ==========
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload("java.lang.String").implementation = function(key) {
            var spoofedProps = {
                "ro.debuggable": "0",
                "ro.secure": "1", 
                "ro.build.type": "user",
                "ro.build.tags": "release-keys",
                "ro.kernel.qemu": "0",
                "ro.hardware": "qcom",
                "ro.product.device": "OnePlus9Pro",
                "ro.product.model": "OnePlus 9 Pro",
                "ro.product.manufacturer": "OnePlus",
                "ro.boot.verifiedbootstate": "green",
                "ro.boot.flash.locked": "1",
                "ro.boot.ddrinfo": "",
                "ro.boot.warranty_bit": "0"
            };
            
            if (spoofedProps.hasOwnProperty(key)) {
                console.log("[+] Spoofed system property: " + key + " = " + spoofedProps[key]);
                return spoofedProps[key];
            }
            return this.get.call(this, key);
        };
        console.log("[+] SystemProperties.get hooked");
    } catch (err) {
        console.log("[-] SystemProperties hook failed: " + err);
    }

    // ========== BUILD CLASS SPOOFING ==========
    try {
        var Build = Java.use("android.os.Build");
        Build.TAGS.value = "release-keys";
        Build.TYPE.value = "user"; 
        Build.IS_DEBUGGABLE.value = false;
        Build.FINGERPRINT.value = "OnePlus/OnePlus9Pro/OnePlus9Pro:12/SKQ1.210216.001/2022010100:user/release-keys";
        
        // Emulator detection bypass
        Build.MANUFACTURER.value = "OnePlus";
        Build.MODEL.value = "OnePlus 9 Pro";
        Build.PRODUCT.value = "OnePlus9Pro";
        Build.DEVICE.value = "OnePlus9Pro";
        Build.BOARD.value = "lahaina";
        Build.HARDWARE.value = "qcom";
        Build.BRAND.value = "OnePlus";
        
        console.log("[+] Build properties spoofed");
    } catch (err) {
        console.log("[-] Build spoofing failed: " + err);
    }

    // ========== ROOT BEER BYPASS ==========
    try {
        var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
        var rootMethods = [
            "isRooted", "isRootedWithoutBusyBoxCheck", "checkForSuBinary", 
            "checkForBusyBoxBinary", "checkForRootManagementApps", "checkTestKeys",
            "checkForDangerousProps", "checkForRWPaths", "checkSuExists",
            "checkForMagiskBinary", "checkForRootCloakingApps"
        ];
        
        rootMethods.forEach(function(method) {
            try {
                RootBeer[method].implementation = function() {
                    console.log("[+] RootBeer." + method + " bypassed");
                    return false;
                };
            } catch (e) {
                // Method might not exist in this version
            }
        });
        console.log("[+] RootBeer bypass applied");
    } catch (err) {
        console.log("[-] RootBeer not found or hook failed");
    }

    // ========== EMULATOR DETECTION BYPASS ==========
    try {
        // TelephonyManager spoofing
        var TelephonyManager = Java.use("android.telephony.TelephonyManager");
        
        TelephonyManager.getDeviceId.overload().implementation = function() {
            console.log("[+] Spoofed device ID");
            return "864398061234567"; // Fake IMEI
        };
        
        TelephonyManager.getSubscriberId.implementation = function() {
            console.log("[+] Spoofed subscriber ID");
            return "310260000000000"; // Fake IMSI
        };
        
        TelephonyManager.getSimSerialNumber.implementation = function() {
            console.log("[+] Spoofed SIM serial");
            return "89014103211118510720"; // Fake ICCID
        };

        TelephonyManager.getNetworkOperatorName.implementation = function() {
            return "Vodafone IN";
        };

        console.log("[+] TelephonyManager spoofed");
    } catch (err) {
        console.log("[-] TelephonyManager spoofing failed: " + err);
    }

    // ========== SSL PINNING BYPASS ==========
    try {
        // OkHttp 3.x Certificate Pinning
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCerts) {
            console.log("[+] Bypassed OkHttp3 certificate pinning for: " + hostname);
            return;
        };

        // X509TrustManager bypass
        var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        var TrustManager = Java.registerClass({
            name: "com.fake.TrustManager",
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function(chain, authType) {},
                checkServerTrusted: function(chain, authType) {},
                getAcceptedIssuers: function() { return []; }
            }
        });

        // Replace default SSLContext
        var TrustManagerArray = Java.array("javax.net.ssl.TrustManager", [TrustManager.$new()]);
        var SSLContextInstance = SSLContext.getInstance("TLS");
        SSLContextInstance.init(null, TrustManagerArray, null);
        SSLContext.getDefault.implementation = function() {
            return SSLContextInstance;
        };

        console.log("[+] SSL Pinning bypass applied");
    } catch (err) {
        console.log("[-] SSL Pinning bypass failed: " + err);
    }

    // ========== FRIDA DETECTION BYPASS ==========
    try {
        // Hook common Frida detection patterns
        var String = Java.use("java.lang.String");
        String.contains.implementation = function(str) {
            var fridaStrings = ["frida", "gum-js-loop", "gmain"];
            if (fridaStrings.indexOf(str.toLowerCase()) !== -1) {
                console.log("[+] Blocked Frida string detection: " + str);
                return false;
            }
            return this.contains.call(this, str);
        };
        
        console.log("[+] Frida detection bypass applied");
    } catch (err) {
        console.log("[-] Frida detection bypass failed: " + err);
    }

    // ========== XPRIVACY/PRIVACY TOOL BYPASS ==========  
    try {
        // Hook methods commonly used by privacy tools
        var ActivityManager = Java.use("android.app.ActivityManager");
        ActivityManager.getRunningServices.implementation = function(maxNum) {
            var services = this.getRunningServices.call(this, maxNum);
            var filteredServices = Java.use("java.util.ArrayList").$new();
            
            var iterator = services.iterator();
            while (iterator.hasNext()) {
                var service = iterator.next();
                var serviceName = service.service.getClassName();
                
                var blockedServices = ["xprivacy", "lsposed", "edxposed"];
                var shouldFilter = blockedServices.some(blocked => 
                    serviceName.toLowerCase().indexOf(blocked) !== -1);
                
                if (!shouldFilter) {
                    filteredServices.add(service);
                } else {
                    console.log("[+] Filtered service: " + serviceName);
                }
            }
            return filteredServices;
        };
        console.log("[+] ActivityManager.getRunningServices hooked");
    } catch (err) {
        console.log("[-] ActivityManager hook failed: " + err);
    }

});

// ========== NATIVE LAYER HOOKS ==========
setImmediate(function() {
    console.log("[+] Applying native layer hooks");
    
    // Hook network-related functions for SSL capture detection
    try {
        var connectPtr = Module.findExportByName("libc.so", "connect");
        if (connectPtr != null) {
            Interceptor.attach(connectPtr, {
                onEnter: function(args) {
                    // Could be used to detect proxy connections
                    // For now, just log
                },
                onLeave: function(retval) {
                    // Modify return value if needed
                }
            });
        }
    } catch (err) {
        console.log("[-] Native connect hook failed: " + err);
    }

    // Hook file system calls
    var fileCalls = ["fopen", "access", "stat", "lstat"];
    fileCalls.forEach(function(funcName) {
        try {
            var funcPtr = Module.findExportByName("libc.so", funcName);
            if (funcPtr != null) {
                Interceptor.attach(funcPtr, {
                    onEnter: function(args) {
                        var path = Memory.readUtf8String(args[0]);
                        this.path = path;
                        
                        var blockedPaths = [
                            "/data/local/tmp/frida",
                            "/data/local/tmp/re.frida.server",
                            "/proc/net/tcp", // Often used for port scanning
                            "/system/xbin/su",
                            "/system/bin/su"
                        ];
                        
                        this.shouldBlock = blockedPaths.some(blocked => 
                            path.indexOf(blocked) !== -1);
                    },
                    onLeave: function(retval) {
                        if (this.shouldBlock) {
                            console.log("[+] Blocked " + funcName + " call to: " + this.path);
                            retval.replace(-1); // Return failure
                        }
                    }
                });
            }
        } catch (err) {
            console.log("[-] Native " + funcName + " hook failed: " + err);
        }
    });

    console.log("[+] Native hooks applied");
});

console.log("[+] Advanced Multi-Layer Security Bypass Script Ready");
