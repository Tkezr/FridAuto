Java.perform(function () {
    // Bypass Developer Options and USB Debugging Detection

    // Access the Settings.Global and Settings.Secure classes
    var SettingsGlobal = Java.use("android.provider.Settings$Global");
    var SettingsSecure = Java.use("android.provider.Settings$Secure");

    // Hook the getInt method that checks for developer options in Settings.Global
    SettingsGlobal.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function (resolver, name, def) {
        
        // Check if the method is querying for "development_settings_enabled" (Developer Options)
        if (name === "development_settings_enabled") {
            console.log("[*] Developer options check intercepted! Returning 'disabled' state.");
            // Always return 0 (disabled)
            return 0;
        }

        // Check if the method is querying for "adb_enabled" (USB Debugging)
        if (name === "adb_enabled") {
            console.log("[*] USB Debugging check intercepted! Returning 'disabled' state.");
            // Always return 0 (disabled)
            return 0;
        }

        // For all other settings, return the original value
        return this.getInt(resolver, name, def);
    };

    // Hook the getInt method that checks for USB Debugging in Settings.Secure
    SettingsSecure.getInt.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function (resolver, name, def) {
        
        // Check if the method is querying for "adb_enabled" (USB Debugging)
        if (name === "adb_enabled") {
            console.log("[*] USB Debugging check intercepted in Settings.Secure! Returning 'disabled' state.");
            // Always return 0 (disabled)
            return 0;
        }

        // For all other settings, return the original value
        return this.getInt(resolver, name, def);
    };

    // Bypass SSL Pinning

    // Hook TrustManagerImpl to bypass SSL pinning
    var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
    TrustManagerImpl.verifyChain.implementation = function (untrustedChain, authChain, host, clientAuth, ocspData, tlsSctData) {
        console.log("[*] SSL Pinning bypassed!");
        return untrustedChain; // Allow all certificates
    };

    // Hook other SSL-related methods if necessary
    var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    X509TrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function (chain, authType) {
        console.log("[*] SSL Pinning Bypass - checkServerTrusted");
    };

    console.log("[*] USB Debugging, Developer Options, and SSL Pinning Bypass applied!");
});
