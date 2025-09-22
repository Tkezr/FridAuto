Java.perform(function() {
    var RootPackages = ["com.noshufou.android.su", "com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch", "com.ramdroid.appquarantine", "com.devadvance.rootcloak", "de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot", "me.phh.superuser", "com.kingouser.com", "com.topjohnwu.magisk"];

    var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];

    var RootProperties = {"ro.build.selinux": "1", "ro.debuggable": "0", "service.adb.root": "0", "ro.secure": "1"};

    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    var Runtime = Java.use('java.lang.Runtime');
    var NativeFile = Java.use('java.io.File');
    var String = Java.use('java.lang.String');
    var SystemProperties = Java.use('android.os.SystemProperties');
    var BufferedReader = Java.use('java.io.BufferedReader');
    var ProcessBuilder = Java.use('java.lang.ProcessBuilder');

    PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
        if (RootPackages.indexOf(pname) > -1) pname = "set.package.name.to.a.fake.one.so.we.can.bypass.it";
        return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
    };

    NativeFile.exists.implementation = function() {
        var name = NativeFile.getName.call(this);
        if (RootBinaries.indexOf(name) > -1) return false;
        return this.exists.call(this);
    };

    var execMethods = [
        Runtime.exec.overload('[Ljava.lang.String;'),
        Runtime.exec.overload('java.lang.String'),
        Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;'),
        Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File')
    ];

    execMethods.forEach(function(exec) {
        exec.implementation = function() {
            var cmd = arguments[0];
            if (typeof cmd === 'string' && (cmd.indexOf("getprop") != -1 || cmd == "mount" || cmd.indexOf("build.prop") != -1 || cmd == "id" || cmd == "sh")) {
                var fakeCmd = "grep";
                return exec.call(this, fakeCmd);
            }
            return exec.apply(this, arguments);
        };
    });

    String.contains.implementation = function(name) {
        if (name == "test-keys") return false;
        return this.contains.call(this, name);
    };

    SystemProperties.get.overload('java.lang.String').implementation = function(name) {
        if (RootProperties.hasOwnProperty(name)) return RootProperties[name];
        return this.get.call(this, name);
    };

    BufferedReader.readLine.overload('boolean').implementation = function() {
        var text = this.readLine.overload('boolean').call(this);
        if (text && text.indexOf("ro.build.tags=test-keys") > -1) {
            text = text.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
        }
        return text;
    };

    ProcessBuilder.start.implementation = function() {
        var cmd = this.command.call(this);
        if (cmd.indexOf("su") != -1) {
            this.command.call(this, ["justafakecommandthatcannotexistsusingthisshouldthowanexceptionwheneversuiscalled"]);
        }
        return this.start.call(this);
    };

});
