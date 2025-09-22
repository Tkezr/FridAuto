Java.perform(function () {
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            if (className.indexOf("safetynet") !== -1 || className.toLowerCase().includes("attestation")) {
                console.log("[+] Class: " + className);
            }
        },
        onComplete: function() {
            console.log("[*] Enumeration complete.");
        }
    });
});
