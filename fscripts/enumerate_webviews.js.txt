// enumerate_webviews.js
Java.perform(function(){
  var WebView = Java.use('android.webkit.WebView');
  Java.enumerateLoadedClasses({
    onMatch: function(className){
      if (className.indexOf('WebView') !== -1) {
        // no-op, just discovery in logs
      }
    },
    onComplete: function(){}
  });

  // Hook addJavascriptInterface to capture JS bridge names and objects
  var AJI = Java.use('android.webkit.WebView').addJavascriptInterface.overload('java.lang.Object','java.lang.String');
  AJI.implementation = function(obj, name){
    console.log('[+] addJavascriptInterface -> name=' + name + ' obj=' + obj);
    return this.addJavascriptInterface(obj, name);
  };

  // Hook ctor to log pages created
  var C = Java.use('android.webkit.WebView').$init.overload('android.content.Context');
  C.implementation = function(ctx){
    console.log('[+] WebView created: ' + ctx);
    return this.$init(ctx);
  };
});
