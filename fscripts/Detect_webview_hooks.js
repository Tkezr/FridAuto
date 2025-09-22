// detect_webview_hooks.js
Java.perform(function () {
  var WebView = Java.use('android.webkit.WebView');
  var WebSettings = Java.use('android.webkit.WebSettings');
  var Exception = Java.use('java.lang.Exception');
  var Log = Java.use('android.util.Log');

  function dumpStack() {
    try {
      var e = Exception.$new();
      return Log.getStackTraceString(e);
    } catch (err) {
      return 'stack-unavailable: ' + err;
    }
  }

  // addJavascriptInterface(Object obj, String name)
  try {
    WebView.addJavascriptInterface.overloads['java.lang.Object', 'java.lang.String'].implementation = function (obj, name) {
      console.log('=== addJavascriptInterface ===');
      console.log('package: ' + Java.use('android.app.ActivityThread').currentPackageName ? Java.use('android.app.ActivityThread').currentPackageName() : 'unknown');
      console.log('interface name: ' + name);
      console.log('object: ' + obj);
      console.log(dumpStack());
      return this.addJavascriptInterface.apply(this, arguments);
    };
  } catch (e) { /* ignore if not present */ }

  // loadUrl(String url)
  try {
    WebView.loadUrl.overloads['java.lang.String'].implementation = function (url) {
      console.log('=== loadUrl(String) ===');
      console.log('url: ' + url);
      console.log(dumpStack());
      return this.loadUrl.apply(this, arguments);
    };
  } catch (e) {}

  // loadUrl(String url, Map headers)
  try {
    WebView.loadUrl.overloads['java.lang.String', 'java.util.Map'].implementation = function (url, headers) {
      console.log('=== loadUrl(String, Map) ===');
      console.log('url: ' + url);
      try { console.log('headers: ' + headers.toString()); } catch (x) {}
      console.log(dumpStack());
      return this.loadUrl.apply(this, arguments);
    };
  } catch (e) {}

  // loadDataWithBaseURL(String baseUrl, String data, String mimeType, String encoding, String historyUrl)
  try {
    WebView.loadDataWithBaseURL.overloads['java.lang.String','java.lang.String','java.lang.String','java.lang.String','java.lang.String'].implementation =
      function (baseUrl, data, mimeType, encoding, historyUrl) {
        console.log('=== loadDataWithBaseURL ===');
        console.log('baseUrl: ' + baseUrl);
        try { console.log('data (truncated): ' + (data ? data.substring(0, Math.min(300, data.length)) : data)); } catch (x) {}
        console.log('mimeType: ' + mimeType + ' encoding: ' + encoding);
        console.log(dumpStack());
        return this.loadDataWithBaseURL.apply(this, arguments);
      };
  } catch (e) {}

  // evaluateJavascript(String script, ValueCallback callback)
  try {
    WebView.evaluateJavascript.overloads['java.lang.String', 'android.webkit.ValueCallback'].implementation = function (script, cb) {
      console.log('=== evaluateJavascript ===');
      try { console.log('script (truncated): ' + (script ? script.substring(0, Math.min(300, script.length)) : script)); } catch (x) {}
      console.log(dumpStack());
      return this.evaluateJavascript.apply(this, arguments);
    };
  } catch (e) {}

  // WebSettings.setJavaScriptEnabled(boolean)
  try {
    WebSettings.setJavaScriptEnabled.overloads['boolean'].implementation = function (flag) {
      console.log('=== WebSettings.setJavaScriptEnabled ===');
      console.log('enabled: ' + flag);
      console.log(dumpStack());
      return this.setJavaScriptEnabled.apply(this, arguments);
    };
  } catch (e) {}

  console.log('[*] WebView hooks installed');
});
