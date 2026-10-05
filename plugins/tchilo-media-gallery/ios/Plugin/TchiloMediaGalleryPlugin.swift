import Foundation
import Capacitor
import Photos
import UIKit

@objc(TchiloMediaGalleryPlugin)
public class TchiloMediaGalleryPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TchiloMediaGalleryPlugin"
    public let jsName = "TchiloMediaGallery"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getRecentMedia", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAlbums", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAlbumMedia", returnType: CAPPluginReturnPromise)
    ]

    private let thumbCache = NSCache<NSString, NSURL>()

    private func statusString(_ status: PHAuthorizationStatus) -> String {
        switch status {
        case .authorized: return "granted"
        case .limited: return "limited"
        case .denied, .restricted: return "denied"
        case .notDetermined: return "prompt"
        @unknown default: return "prompt"
        }
    }

    private func currentStatus() -> PHAuthorizationStatus {
        if #available(iOS 14, *) {
            return PHPhotoLibrary.authorizationStatus(for: .readWrite)
        }
        return PHPhotoLibrary.authorizationStatus()
    }

    @objc func checkPermissions(_ call: CAPPluginCall) {
        call.resolve(["photos": statusString(currentStatus())])
    }

    @objc func requestPermissions(_ call: CAPPluginCall) {
        let handler: (PHAuthorizationStatus) -> Void = { status in
            call.resolve(["photos": self.statusString(status)])
        }
        if #available(iOS 14, *) {
            PHPhotoLibrary.requestAuthorization(for: .readWrite, handler: handler)
        } else {
            PHPhotoLibrary.requestAuthorization(handler)
        }
    }

    @objc func getRecentMedia(_ call: CAPPluginCall) {
        let status = currentStatus()
        if status == .denied || status == .restricted {
            call.reject("permission denied")
            return
        }
        if status == .notDetermined {
            call.reject("permission denied")
            return
        }

        let limit = call.getInt("limit") ?? 60
        let offset = call.getInt("offset") ?? 0
        let mediaType = call.getString("mediaType") ?? "all"

        DispatchQueue.global(qos: .userInitiated).async {
            let items = self.fetchAssets(album: nil, limit: limit, offset: offset, mediaType: mediaType)
            let limited = status == .limited
            call.resolve(["items": items, "limited": limited])
        }
    }

    @objc func getAlbums(_ call: CAPPluginCall) {
        let status = currentStatus()
        if status != .authorized && status != .limited {
            call.reject("permission denied")
            return
        }

        DispatchQueue.global(qos: .userInitiated).async {
            var albums: [[String: Any]] = []

            let smart = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .any, options: nil)
            smart.enumerateObjects { col, _, _ in
                let count = PHAsset.fetchAssets(in: col, options: nil).count
                if count == 0 { return }
                albums.append([
                    "id": col.localIdentifier,
                    "title": col.localizedTitle ?? "Álbum",
                    "count": count
                ])
            }

            let user = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: nil)
            user.enumerateObjects { col, _, _ in
                let count = PHAsset.fetchAssets(in: col, options: nil).count
                if count == 0 { return }
                albums.append([
                    "id": col.localIdentifier,
                    "title": col.localizedTitle ?? "Álbum",
                    "count": count
                ])
            }

            call.resolve(["albums": albums])
        }
    }

    @objc func getAlbumMedia(_ call: CAPPluginCall) {
        guard let albumId = call.getString("albumId") else {
            call.reject("albumId required")
            return
        }
        let status = currentStatus()
        if status != .authorized && status != .limited {
            call.reject("permission denied")
            return
        }
        let limit = call.getInt("limit") ?? 60
        let offset = call.getInt("offset") ?? 0
        let mediaType = call.getString("mediaType") ?? "all"

        DispatchQueue.global(qos: .userInitiated).async {
            let result = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [albumId], options: nil)
            let col = result.firstObject
            let items = self.fetchAssets(album: col, limit: limit, offset: offset, mediaType: mediaType)
            call.resolve(["items": items])
        }
    }

    private func fetchAssets(album: PHAssetCollection?, limit: Int, offset: Int, mediaType: String) -> [[String: Any]] {
        let opts = PHFetchOptions()
        opts.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        if mediaType == "image" {
            opts.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
        } else if mediaType == "video" {
            opts.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
        } else {
            opts.predicate = NSPredicate(format: "mediaType == %d OR mediaType == %d",
                                        PHAssetMediaType.image.rawValue,
                                        PHAssetMediaType.video.rawValue)
        }

        let fetch: PHFetchResult<PHAsset>
        if let album = album {
            fetch = PHAsset.fetchAssets(in: album, options: opts)
        } else {
            fetch = PHAsset.fetchAssets(with: opts)
        }

        var items: [[String: Any]] = []
        let end = min(offset + limit, fetch.count)
        guard offset < fetch.count else { return items }

        for i in offset..<end {
            let asset = fetch.object(at: i)
            var dict: [String: Any] = [
                "id": asset.localIdentifier,
                "mediaType": asset.mediaType == .video ? "video" : "image",
                "width": asset.pixelWidth,
                "height": asset.pixelHeight,
                "duration": asset.mediaType == .video ? asset.duration : 0
            ]
            if let d = asset.creationDate {
                dict["creationTime"] = d.timeIntervalSince1970 * 1000
            }
            if let thumb = self.thumbnailURL(for: asset) {
                dict["thumbUri"] = thumb.absoluteString
                dict["uri"] = thumb.absoluteString
            } else {
                dict["uri"] = "ph://\(asset.localIdentifier)"
            }
            // full resource path for export when needed
            if let full = self.resourceURL(for: asset) {
                dict["uri"] = full.absoluteString
            }
            items.append(dict)
        }
        return items
    }

    private func thumbnailURL(for asset: PHAsset) -> URL? {
        let key = asset.localIdentifier as NSString
        if let cached = thumbCache.object(forKey: key) {
            return cached as URL
        }

        let opts = PHImageRequestOptions()
        opts.isSynchronous = true
        opts.deliveryMode = .fastFormat
        opts.resizeMode = .fast
        opts.isNetworkAccessAllowed = true

        var outURL: URL?
        let target = CGSize(width: 256, height: 256)
        PHImageManager.default().requestImage(for: asset, targetSize: target, contentMode: .aspectFill, options: opts) { image, _ in
            guard let image = image, let data = image.jpegData(compressionQuality: 0.75) else { return }
            let dir = FileManager.default.temporaryDirectory.appendingPathComponent("tchilo_thumbs", isDirectory: true)
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            let safe = asset.localIdentifier.replacingOccurrences(of: "/", with: "_")
            let file = dir.appendingPathComponent("\(safe).jpg")
            try? data.write(to: file, options: .atomic)
            outURL = file
            self.thumbCache.setObject(file as NSURL, forKey: key)
        }
        return outURL
    }

    private func resourceURL(for asset: PHAsset) -> URL? {
        let resources = PHAssetResource.assetResources(for: asset)
        guard let resource = resources.first else { return nil }
        // For videos/images we export to temp for WebView consumption when possible
        let opts = PHImageRequestOptions()
        opts.isSynchronous = true
        opts.isNetworkAccessAllowed = true

        if asset.mediaType == .image {
            var url: URL?
            PHImageManager.default().requestImageDataAndOrientation(for: asset, options: opts) { data, _, _, _ in
                guard let data = data else { return }
                let dir = FileManager.default.temporaryDirectory.appendingPathComponent("tchilo_full", isDirectory: true)
                try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
                let safe = asset.localIdentifier.replacingOccurrences(of: "/", with: "_")
                let file = dir.appendingPathComponent("\(safe).jpg")
                try? data.write(to: file, options: .atomic)
                url = file
            }
            return url
        }

        if asset.mediaType == .video {
            var url: URL?
            let vopts = PHVideoRequestOptions()
            vopts.isNetworkAccessAllowed = true
            let sem = DispatchSemaphore(value: 0)
            PHImageManager.default().requestAVAsset(forVideo: asset, options: vopts) { av, _, _ in
                if let urlAsset = av as? AVURLAsset {
                    url = urlAsset.url
                }
                sem.signal()
            }
            _ = sem.wait(timeout: .now() + 8)
            return url
        }
        return nil
    }
}
