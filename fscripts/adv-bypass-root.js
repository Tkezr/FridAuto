Java.perform(() => {
    const Runtime = Java.use('java.lang.Runtime');
    const File = Java.use('java.io.File');
    const SystemProperties = Java.use('android.os.SystemProperties');

    // Hook Runtime.exec to block root-related commands
    Runtime.exec.overload('[Ljava.lang.String;').implementation = function (cmdArray) {
        const cmd = cmdArray.join(' ');
        console.log(`[*] Intercepting command: ${cmd}`);
        if (cmd.includes('which su') || cmd.includes('su')) {
            console.warn(`[*] Blocking root-related command: ${cmd}`);
            throw new Error("Command not allowed");
        }
        return this.exec(cmdArray);
    };

    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        console.log(`[*] Intercepting command: ${cmd}`);
        if (cmd.includes('which su') || cmd.includes('su')) {
            console.warn(`[*] Blocking root-related command: ${cmd}`);
            throw new Error("Command not allowed");
        }
        return this.exec(cmd);
    };

    // Hook File.exists to block specific file checks
    File.exists.implementation = function () {
        const path = this.getAbsolutePath();
        if (path.includes('/data/user/0/com.example.smoketesting/shared_prefs/')) {
            console.warn(`[*] Blocking file check: ${path}`);
            return false;
        }
        return this.exists();
    };

    // Hook SystemProperties.get to block detection via getprop
    SystemProperties.get.overload('java.lang.String').implementation = function (key) {
        console.log(`[*] Intercepting getprop: ${key}`);
        const blockedKeys = [
            'init.svc.magisk_pfs',
            'init.svc.magisk_pfsd',
            'init.svc.magisk_service',
            'persist.magisk.hide',
            'service.adb.root',
            'ro.factorytest',
            'ro.hardware.virtual_device',
            'ro.kernel.androidboot.hardware',
            'ro.hardware',
            'ro.boot.hardware',
        ];
        if (blockedKeys.includes(key)) {
            console.warn(`[*] Blocking getprop: ${key}`);
            return ''; // Return an empty or benign value
        }
        return this.get(key);
    };

    // Add additional hooks for other root-detection methods if required
    console.log('[+] Root detection hooks initialized successfully.');
});
