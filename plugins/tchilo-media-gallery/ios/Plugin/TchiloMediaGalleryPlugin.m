#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(TchiloMediaGalleryPlugin, "TchiloMediaGallery",
    CAP_PLUGIN_METHOD(checkPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestPermissions, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getRecentMedia, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAlbums, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAlbumMedia, CAPPluginReturnPromise);
)
