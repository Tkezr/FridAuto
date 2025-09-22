Java.perform(function () {
    const RaspConfiguration = Java.use("com.mainstreamsasp.amfm.base.model.config.RaspConfiguration");
    
    // Reference to Boolean class
    const JavaBoolean = Java.use("java.lang.Boolean");

    // Hook method to disable root detection
    RaspConfiguration.com.mainstreamsasp.amfm.implementation = function () {
        console.log("amfm is called");
        return JavaBoolean.$new(false); // Return false
    };

    // Hook method to disable developer mode detection
    RaspConfiguration.com.mainstreamsasp.amfm.implementation = function () {
        console.log("<AMFM> is called");
        return JavaBoolean.$new(false); // Return false
    };
});