Java.perform(function () {
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

    console.log("[*] Frida script loaded second wala to bypass Developer Options and USB Debugging checks.");
});
