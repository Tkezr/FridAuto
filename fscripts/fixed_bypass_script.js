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
            
            var size = packageList.size();
            for (var i = 0; i < size; i++) {
                var packageInfo = packageList.get(i);
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
            
            var shouldBlock = false;
            for (var i = 0; i < blockedNames.length; i++) {
                if (name.toLowerCase().indexOf(blockedNames[i]) !== -1) {
                    shouldBlock = true;
                    break;
                }
            }
            
            if (!shouldBlock) {
                for (var i = 0; i < blockedPaths.length; i++) {
                    if (path.indexOf(blockedPaths[i]) !== -1) {
                        shouldBlock = true;
                        break;
                    }
                }
            }
            
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
        
        Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmd) {
            var command = cmd.join(" ");
            if (shouldBlockCommand(command)) {
                console.log("[+] Blocked Runtime.exec: " + command);
                return createFakeProcess();
            }
            return this.exec.call(this, cmd);
        };

        Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
            if (shouldBlockCommand(cmd)) {
                console.log("[+] Blocked Runtime.exec: " + cmd);
                return createFakeProcess();
            }
            return this.exec.call(this, cmd);
        };
        
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(cmd, env) {
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
            
            for (var i = 0; i < blockedCommands.length; i++) {
                if (cmd.toLowerCase().indexOf(blockedCommands[i]) !== -1) {
                    return true;
                }
            }
            return false;
        }

        function createFakeProcess() {
            try {
                var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
                var ArrayList = Java.use('java.util.ArrayList');
                var emptyCmd = ArrayList.$new();
                emptyCmd.add("echo");
                return ProcessBuilder.$new(emptyCmd).start();
            } catch (e) {
                // Fallback: return null process
                return null;
            }
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
        
        // Emulator detection bypass
        Build.MANUFACTURER.value = "OnePlus";
        Build.MODEL.value = "OnePlus 9 Pro";
        Build.PRODUCT.value = "OnePlus9Pro";
        Build.DEVICE.value = "OnePlus9Pro";
        Build.BOARD.value = "lahaina";
        Build.HARDWARE.value = "qcom";
        Build.BRAND.value = "OnePlus";
        Build.FINGERPRINT.value = "OnePlus/OnePlus9Pro/OnePlus9Pro:12/SKQ1.210216.001/2022010100:user/release-keys";
        
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
        
        for (var i = 0; i < rootMethods.length; i++) {
            var method = rootMethods[i];
            try {
                RootBeer[method].implementation = function() {
                    console.log("[+] RootBeer." + method + " bypassed");
                    return false;
                };
            } catch (e) {
                // Method might not exist in this version
            }
        }
        console.log("[+] RootBeer bypass applied");
    } catch (err) {
        console.log("[-] RootBeer not found or hook failed");
    }

    // ========== EMULATOR DETECTION BYPASS ==========
    try {
        var TelephonyManager = Java.use("android.telephony.TelephonyManager");
        
        TelephonyManager.getDeviceId.overload().implementation = function() {
            console.log("[+] Spoofed device ID");
            return "864398061234567";
        };
        
        TelephonyManager.getSubscriberId.implementation = function() {
            console.log("[+] Spoofed subscriber ID");
            return "310260000000000";
        };
        
        TelephonyManager.getSimSerialNumber.implementation = function() {
            console.log("[+] Spoofed SIM serial");
            return "89014103211118510720";
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
        try {
            var CertificatePinner = Java.use("okhttp3.CertificatePinner");
            CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCerts) {
                console.log("[+] Bypassed OkHttp3 certificate pinning for: " + hostname);
                return;
            };
        } catch (e) {
            console.log("[-] OkHttp3 CertificatePinner not found");
        }

        // X509TrustManager bypass - Simplified version
        try {
            var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
            var SSLContext = Java.use("javax.net.ssl.SSLContext");
            
            // Hook verify methods if they exist
            if (HostnameVerifier.verify) {
                HostnameVerifier.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(hostname, session) {
                    console.log("[+] Bypassed hostname verification for: " + hostname);
                    return true;
                };
            }
        } catch (e) {
            console.log("[-] SSL bypass failed: " + e);
        }

        console.log("[+] SSL Pinning bypass applied");
    } catch (err) {
        console.log("[-] SSL Pinning bypass failed: " + err);
    }

    // ========== FRIDA DETECTION BYPASS ==========
    try {
        var String = Java.use("java.lang.String");
        String.contains.implementation = function(str) {
            var fridaStrings = ["frida", "gum-js-loop", "gmain"];
            var strLower = str.toLowerCase();
            
            for (var i = 0; i < fridaStrings.length; i++) {
                if (strLower.indexOf(fridaStrings[i]) !== -1) {
                    console.log("[+] Blocked Frida string detection: " + str);
                    return false;
                }
            }
            return this.contains.call(this, str);
        };
        
        console.log("[+] Frida detection bypass applied");
    } catch (err) {
        console.log("[-] Frida detection bypass failed: " + err);
    }

    // ========== ACTIVITY MANAGER BYPASS ==========  
    try {
        var ActivityManager = Java.use("android.app.ActivityManager");
        ActivityManager.getRunningServices.implementation = function(maxNum) {
            var services = this.getRunningServices.call(this, maxNum);
            var filteredServices = Java.use("java.util.ArrayList").$new();
            
            var size = services.size();
            for (var i = 0; i < size; i++) {
                var service = services.get(i);
                var serviceName = service.service.getClassName();
                
                var blockedServices = ["xprivacy", "lsposed", "edxposed", "frida"];
                var shouldFilter = false;
                
                for (var j = 0; j < blockedServices.length; j++) {
                    if (serviceName.toLowerCase().indexOf(blockedServices[j]) !== -1) {
                        shouldFilter = true;
                        console.log("[+] Filtered service: " + serviceName);
                        break;
                    }
                }
                
                if (!shouldFilter) {
                    filteredServices.add(service);
                }
            }
            return filteredServices;
        };
        console.log("[+] ActivityManager.getRunningServices hooked");
    } catch (err) {
        console.log("[-] ActivityManager hook failed: " + err);
    }

    console.log("[+] Java hooks completed successfully");
});

// ========== NATIVE LAYER HOOKS ==========
setImmediate(function() {
    console.log("[+] Applying native layer hooks");
    
    // Hook file system calls
    var fileCalls = ["fopen", "access", "stat", "lstat"];
    
    for (var i = 0; i < fileCalls.length; i++) {
        var funcName = fileCalls[i];
        try {
            var funcPtr = Module.findExportByName("libc.so", funcName);
            if (funcPtr != null) {
                Interceptor.attach(funcPtr, {
                    onEnter: function(args) {
                        if (args[0] != null && args[0] != undefined) {
                            var path = Memory.readUtf8String(args[0]);
                            this.path = path;
                            
                            var blockedPaths = [
                                "/data/local/tmp/frida",
                                "/data/local/tmp/re.frida.server",
                                "/proc/net/tcp",
                                "/system/xbin/su",
                                "/system/bin/su",
                                "/sbin/su"
                            ];
                            
                            this.shouldBlock = false;
                            for (var j = 0; j < blockedPaths.length; j++) {
                                if (path.indexOf(blockedPaths[j]) !== -1) {
                                    this.shouldBlock = true;
                                    break;
                                }
                            }
                        }
                    },
                    onLeave: function(retval) {
                        if (this.shouldBlock && this.path) {
                            console.log("[+] Blocked native " + funcName + " call to: " + this.path);
                            retval.replace(ptr(-1));
                        }
                    }
                });
                console.log("[+] " + funcName + " hooked successfully");
            }
        } catch (err) {
            console.log("[-] Native " + funcName + " hook failed: " + err);
        }
    }

    console.log("[+] Native hooks applied successfully");
});

console.log("[+] Advanced Multi-Layer Security Bypass Script Ready");