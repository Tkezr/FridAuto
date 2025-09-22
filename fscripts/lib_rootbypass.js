var do_dlopen = null;
var call_constructor = null;
Process.findModuleByName('linker64').enumerateSymbols().forEach(function(symbol) {
    if (symbol.name.indexOf("do_dlopen") >= 0) {
        do_dlopen = symbol.address;
    } else if (symbol.name.indexOf("call_constructor") >= 0) {
        call_constructor = symbol.address;
    }
});

if (do_dlopen !== null) {
    var lib_Loaded = 0;
    Interceptor.attach(do_dlopen, {
        onEnter: function(args) {
            var libpath = this.context.x0.readCString();
            if (libpath.indexOf("libinappprotections.so") >= 0) {
                Interceptor.attach(call_constructor, {
                    onEnter: function(args) {
                        if (lib_Loaded == 0) {
                            var native_mod = Process.findModuleByName("libinappprotections.so");
                            console.log(`inappprotections Lib is loaded at ${native_mod.base}`);
                            hookImportedFunction(); //call Imports function
                            hookSvc(native_mod.base);              // call svc function
                        }
                        lib_Loaded = 1;
                    }
                });
            }
        }
    });
}

Java.perform(function(){
    let MainActivity = Java.use("com.fatalsec.inappprotections.MainActivity")
    
    MainActivity.detectRoot.implementation = function(){
        var result = this.detectRoot();
        
        console.log(`Method Called Returned: ${result}`);
 
        return result;

    }
})



function hookImportedFunction(){

    Interceptor.attach(Module.findExportByName("libc.so", "stat"),{
        onEnter: function(args){
            if (args[0].readCString().indexOf("/selinux") >= 0 ){
                Memory.protect(args[0], Process.pointerSize,"rwx");
                 args[0].writeUtf8String("/dosen't/nopath")
            }
            console.log(`Stat: ${args[0].readCString()}`)

        }
    })
    Interceptor.attach(Module.findExportByName("libc.so", "fopen"),{
        onEnter: function(args){
            console.log(`Fopen: ${args[0].readCString()}`)

        }
    })

    Interceptor.attach(Module.findExportByName("libc.so", "strstr"),{
        onEnter: function(args){
            if (args[1].readCString().indexOf("zygote") >= 0){
                args[1].writeUtf8String("Potato");

            }
            if (args[1].readCString().indexOf("magisk") >= 0){
                args[1].writeUtf8String("Potato");
            }
            console.log(`Strstr: Orignal Output: ${args[0].readCString()}, Patched Output:  ${args[1].readCString()}`);

        }
    })

    Interceptor.attach(Module.findExportByName("libc.so", "access"),{
        onEnter: function(args){
            if (args[0].readCString().indexOf("/su") >= 0 ){
                 args[0].writeUtf8String("/dosen't/exsit")
            }
            console.log(`Access ${args[0].readCString()}`)

        }
    })
}

function hookSvc(base_addr){

    Interceptor.attach(base_addr.add(0x00001f8c),function(){  
        var path = this.context.x1.readCString();
        this.context.x1.writeUtf8String("/nothing");
        console.log(`SVC: ${path}`);
    }) 
    Interceptor.attach(base_addr.add(0x00001fa8),function(){  
        this.context.x1.writeUtf8String("/nothing");
        var path = this.context.x1.readCString();
        console.log(`SVC: ${path}`);
    }) 
    Interceptor.attach(base_addr.add(0x00001fc4),function(){
        this.context.x1.writeUtf8String("/nothing");  
        var path = this.context.x1.readCString();
        console.log(`SVC: ${path}`);
    }) 
    Interceptor.attach(base_addr.add(0x00001fe0),function(){
        this.context.x1.writeUtf8String("/nothing");  
        var path = this.context.x1.readCString();
        console.log(`SVC: ${path}`);
    }) 
    Interceptor.attach(base_addr.add(0x00001ffc),function(){
        this.context.x1.writeUtf8String("/nothing"); 
        var path = this.context.x1.readCString();
        console.log(`SVC: ${path}`);
    }) 
}