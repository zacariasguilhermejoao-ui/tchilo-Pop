import Foundation
import UIKit
import WebKit

/// Lê partilha pendente do App Group e injeta no WebView Capacitor.
@objc class TchiloShareBridge: NSObject {
    static let appGroupId = "group.com.tchilo.isabstudio"
    static let defaultsKey = "pendingSharePayload"

    @objc static func consumePendingShareJSON() -> String? {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let str = defaults.string(forKey: defaultsKey),
              !str.isEmpty else {
            return nil
        }
        defaults.removeObject(forKey: defaultsKey)
        defaults.synchronize()
        return str
    }

    @objc static func injectShareIntoWebView(_ webView: WKWebView?, json: String) {
        guard let webView = webView else { return }
        // Escapar para string JS
        let escaped = json
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\r", with: "")

        let js = """
        (function(){try{
          var p=JSON.parse('\(escaped)');
          window.__tchiloSharePayload=p;
          if(window.TchiloShareTarget&&window.TchiloShareTarget.handle){
            window.TchiloShareTarget.handle(p);
          }else{
            try{window.dispatchEvent(new CustomEvent('tchilo-native-share',{detail:p}));}catch(e){}
          }
        }catch(e){console.warn('TchiloShare iOS inject',e);}})();
        """

        DispatchQueue.main.async {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    /// Procura o WKWebView na hierarquia (Capacitor)
    @objc static func findWebView(in root: UIView?) -> WKWebView? {
        guard let root = root else { return nil }
        if let wv = root as? WKWebView { return wv }
        for sub in root.subviews {
            if let found = findWebView(in: sub) { return found }
        }
        return nil
    }

    @objc static func tryInjectFromAppGroup() {
        guard let json = consumePendingShareJSON() else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let window = scene.windows.first(where: { $0.isKeyWindow }) ?? scene.windows.first else {
                // fallback iOS antigo
                if let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) {
                    let wv = findWebView(in: window)
                    injectShareIntoWebView(wv, json: json)
                }
                return
            }
            let wv = findWebView(in: window)
            injectShareIntoWebView(wv, json: json)
        }
    }
}
