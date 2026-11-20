// In-app reader for site pages (guides, legal pages). Only tracksideselections.com loads inside the
// app; other links open in the system browser. Payment, tip and VIP links are not shown in the app
// (App Store rule 3.1.1: digital purchases and tips inside an app must use Apple in-app purchase).
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { SITE } from '../lib/site';
import { useColors } from '../lib/theme';

const HOST = 'tracksideselections.com';
const BLOCKED = /(\/vip(\.html|\/)|\/tip-jar|cash\.app|venmo\.com|buymeacoffee\.com|paypal\.com)/i;

// Hide the site's own header/nav, ads, tip boxes, VIP buttons and email sign-up inside the app.
const HIDE_CSS = [
  'header',
  '.skip-link',
  '.tipbox',
  '.vip-btn',
  '.growth-signup',
  'ins.adsbygoogle',
  '.ad-slot',
  'a[href*="vip"]',
  'a[href*="tip-jar"]',
  'a[href*="cash.app"]',
  'a[href*="venmo.com"]',
  'a[href*="buymeacoffee"]',
].join(',');

const INJECT = `
(function(){
  var s=document.createElement('style');
  s.textContent='${HIDE_CSS}{display:none!important}body{padding-top:4px}';
  (document.head||document.documentElement).appendChild(s);
  window.adsbygoogle={push:function(){}};
  // Drop the site's ad script so pages in the app stay ad-free and tracker-free.
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){
    if(n.tagName==='SCRIPT'&&/googlesyndication|doubleclick/.test(n.src||'')){n.type='javascript/blocked';n.remove();}
  })})}).observe(document.documentElement,{childList:true,subtree:true});
})();
true;`;

function isAllowedInApp(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.hostname === HOST || u.hostname === `www.${HOST}`) && !BLOCKED.test(url);
  } catch {
    return false;
  }
}

export default function WebScreen() {
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const c = useColors();
  const [loading, setLoading] = useState(true);
  const start = params.url && isAllowedInApp(params.url) ? params.url : SITE;

  const onRequest = (req: WebViewNavigation) => {
    const url = req.url;
    if (url.startsWith('about:') || url.startsWith('data:')) return true;
    if (isAllowedInApp(url)) return true;
    if (BLOCKED.test(url)) return false;
    if (/^(tel|mailto|sms):/i.test(url)) {
      Linking.openURL(url);
      return false;
    }
    if (/^https?:/i.test(url)) WebBrowser.openBrowserAsync(url);
    return false;
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ title: params.title ?? 'Trackside Selections' }} />
      <WebView
        source={{ uri: start }}
        style={{ flex: 1, backgroundColor: c.bg }}
        injectedJavaScriptBeforeContentLoaded={INJECT}
        onShouldStartLoadWithRequest={onRequest}
        onLoadEnd={() => setLoading(false)}
        pullToRefreshEnabled
        allowsBackForwardNavigationGestures
        decelerationRate="normal"
        setSupportMultipleWindows={false}
      />
      {loading ? (
        <View style={{ position: 'absolute', top: 24, left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
          <ActivityIndicator color={c.red} />
        </View>
      ) : null}
    </View>
  );
}
