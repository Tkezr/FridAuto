Java.perform(function() {
  console.log("[*] Streaming JSON bypass for Play Integrity loaded");

  // 1) Keep your org.json hooks (in case any JSONTokener/JSONObject is used)
  try {
    var JSONObject = Java.use("org.json.JSONObject");
    JSONObject.getBoolean.overload("java.lang.String").implementation = function (key) {
      var orig = this.getBoolean.call(this, key);
      if (key === "ctsProfileMatch" || key === "basicIntegrity") {
        console.log(`[ORG.JSON OVERRIDE] ${key}: ${orig} → true`);
        return true;
      }
      return orig;
    };
    JSONObject.optBoolean.overload("java.lang.String", "boolean").implementation = function (key, def) {
      var orig = this.optBoolean.call(this, key, def);
      if (key === "ctsProfileMatch" || key === "basicIntegrity") {
        console.log(`[ORG.JSON OVERRIDE] ${key}: ${orig} → true`);
        return true;
      }
      return orig;
    };
    console.log("[*] org.json hooks installed");
  } catch (e) {
    console.log("[!] org.json not present:", e);
  }

  // 2) Hook android.util.JsonReader for streaming parsing
  try {
    var JsonReader = Java.use("android.util.JsonReader");
    // Map reader instance hash → last field name
    var lastNameMap = {};

    // nextName(): capture the field name
    JsonReader.nextName.overload().implementation = function () {
      var name = this.nextName.call(this);
      var id = this.hashCode();
      lastNameMap[id] = name;
      // Log only if it’s one of our targets
      if (name === "ctsProfileMatch" || name === "basicIntegrity") {
        console.log(`[JSON READER] reading field name → ${name}`);
      }
      return name;
    };

    // nextBoolean(): override after our target names
    JsonReader.nextBoolean.overload().implementation = function () {
      var id = this.hashCode();
      var field = lastNameMap[id];
      var value = this.nextBoolean.call(this);
      if (field === "ctsProfileMatch" || field === "basicIntegrity") {
        console.log(`[JSON READER OVERRIDE] ${field}: ${value} → true`);
        return true;
      }
      return value;
    };

    console.log("[*] android.util.JsonReader hooks installed");
  } catch (e) {
    console.log("[!] JsonReader hooks failed:", e);
  }

  console.log("[*] All streaming–JSON and org.json hooks are active. Look for “OVERRIDE” logs.");
});
