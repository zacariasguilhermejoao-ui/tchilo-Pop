import UIKit
import Social
import MobileCoreServices
import UniformTypeIdentifiers
import AVFoundation

/// Share Extension — grava media/texto no App Group e abre a app Tchilo.
class ShareViewController: UIViewController {

    private let appGroupId = "group.com.tchilo.isabstudio"
    private let maxBytes = 12 * 1024 * 1024 // ~12 MB por ficheiro

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(white: 0.05, alpha: 0.4)
        processShare()
    }

    private func processShare() {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
            finish()
            return
        }

        var title = ""
        var text = ""
        var urlStr = ""
        var files: [[String: Any]] = []
        let group = DispatchGroup()

        for item in items {
            if let atts = item.attachments {
                for provider in atts {
                    // Imagem
                    if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { [weak self] data, _ in
                            defer { group.leave() }
                            guard let self = self else { return }
                            if let file = self.encodeItem(data, fallbackName: "photo.jpg", fallbackMime: "image/jpeg") {
                                files.append(file)
                            }
                        }
                        continue
                    }
                    // Vídeo
                    if provider.hasItemConformingToTypeIdentifier(UTType.movie.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.movie.identifier, options: nil) { [weak self] data, _ in
                            defer { group.leave() }
                            guard let self = self else { return }
                            if let file = self.encodeItem(data, fallbackName: "video.mp4", fallbackMime: "video/mp4") {
                                files.append(file)
                            }
                        }
                        continue
                    }
                    // Ficheiro genérico / PDF
                    if provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { [weak self] data, _ in
                            defer { group.leave() }
                            guard let self = self else { return }
                            if let file = self.encodeItem(data, fallbackName: "file.bin", fallbackMime: "application/octet-stream") {
                                files.append(file)
                            }
                        }
                        continue
                    }
                    if provider.hasItemConformingToTypeIdentifier(UTType.pdf.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.pdf.identifier, options: nil) { [weak self] data, _ in
                            defer { group.leave() }
                            guard let self = self else { return }
                            if let file = self.encodeItem(data, fallbackName: "document.pdf", fallbackMime: "application/pdf") {
                                files.append(file)
                            }
                        }
                        continue
                    }
                    // URL
                    if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { data, _ in
                            defer { group.leave() }
                            if let u = data as? URL {
                                urlStr = u.absoluteString
                            }
                        }
                        continue
                    }
                    // Texto
                    if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                        group.enter()
                        provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { data, _ in
                            defer { group.leave() }
                            if let s = data as? String {
                                text = s
                            }
                        }
                        continue
                    }
                }
            }
            if let t = item.attributedContentText?.string, !t.isEmpty {
                if text.isEmpty { text = t }
            }
            if let t = item.attributedTitle?.string, !t.isEmpty {
                title = t
            }
        }

        group.notify(queue: .main) { [weak self] in
            guard let self = self else { return }
            self.saveAndOpen(title: title, text: text, url: urlStr, files: files)
        }
    }

    private func encodeItem(_ data: NSSecureCoding?, fallbackName: String, fallbackMime: String) -> [String: Any]? {
        var fileData: Data?
        var name = fallbackName
        var mime = fallbackMime

        if let url = data as? URL {
            name = url.lastPathComponent.isEmpty ? fallbackName : url.lastPathComponent
            mime = mimeForExtension(url.pathExtension) ?? fallbackMime
            fileData = try? Data(contentsOf: url, options: [.mappedIfSafe])
        } else if let img = data as? UIImage {
            fileData = img.jpegData(compressionQuality: 0.9)
            name = "photo.jpg"
            mime = "image/jpeg"
        } else if let d = data as? Data {
            fileData = d
        }

        guard var bytes = fileData, !bytes.isEmpty else { return nil }
        if bytes.count > maxBytes {
            // tenta comprimir imagem; senão corta
            if mime.hasPrefix("image/"), let img = UIImage(data: bytes),
               let smaller = img.jpegData(compressionQuality: 0.7), smaller.count <= maxBytes {
                bytes = smaller
                name = (name as NSString).deletingPathExtension + ".jpg"
                mime = "image/jpeg"
            } else if bytes.count > maxBytes {
                return nil
            }
        }

        let b64 = bytes.base64EncodedString(options: [])
        return [
            "name": name,
            "mime": mime,
            "dataUrl": "data:\(mime);base64,\(b64)"
        ]
    }

    private func mimeForExtension(_ ext: String) -> String? {
        let e = ext.lowercased()
        switch e {
        case "jpg", "jpeg": return "image/jpeg"
        case "png": return "image/png"
        case "gif": return "image/gif"
        case "webp": return "image/webp"
        case "heic", "heif": return "image/heic"
        case "mp4": return "video/mp4"
        case "mov": return "video/quicktime"
        case "m4v": return "video/x-m4v"
        case "pdf": return "application/pdf"
        default: return nil
        }
    }

    private func saveAndOpen(title: String, text: String, url: String, files: [[String: Any]]) {
        let payload: [String: Any] = [
            "title": title,
            "text": text,
            "url": url,
            "files": files,
            "at": Date().timeIntervalSince1970
        ]

        if let defaults = UserDefaults(suiteName: appGroupId),
           let json = try? JSONSerialization.data(withJSONObject: payload),
           let str = String(data: json, encoding: .utf8) {
            defaults.set(str, forKey: "pendingSharePayload")
            defaults.synchronize()
        }

        // Abre a app principal
        if let openURL = URL(string: "tchilo://share?pending=1") {
            var responder: UIResponder? = self
            while let r = responder {
                if let application = r as? UIApplication {
                    application.open(openURL, options: [:], completionHandler: nil)
                    break
                }
                // iOS 18+ / extension: selector openURL
                if r.responds(to: Selector(("openURL:options:completionHandler:"))) {
                    r.perform(Selector(("openURL:options:completionHandler:")), with: openURL, with: [:])
                    break
                }
                if r.responds(to: Selector("openURL:")) {
                    r.perform(Selector("openURL:"), with: openURL)
                    break
                }
                responder = r.next
            }
            // Fallback moderno
            extensionContext?.open(openURL, completionHandler: { _ in })
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            self?.finish()
        }
    }

    private func finish() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
