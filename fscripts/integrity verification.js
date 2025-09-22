Java.perform(function () {
    const JSONObject = Java.use("org.json.JSONObject");

    JSONObject.getBoolean.implementation = function (key) {
        if (key === "ctsProfileMatch" || key === "basicIntegrity") {
            console.log("[+] Overriding integrity check: " + key);
            return true;
        }
        return this.getBoolean(key);
    };

    JSONObject.getString.implementation = function (key) {
        var value = this.getString(key);
        console.log(`[+] getString(${key}) => ${value}`);
        return value;
    };
});