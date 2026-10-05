package com.tchilo.mediagallery;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Size;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CapacitorPlugin(
    name = "TchiloMediaGallery",
    permissions = {
        @Permission(
            strings = {
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO
            },
            alias = "photos33"
        ),
        @Permission(
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE },
            alias = "photosLegacy"
        )
    }
)
public class TchiloMediaGalleryPlugin extends Plugin {

    private String permissionAlias() {
        return Build.VERSION.SDK_INT >= 33 ? "photos33" : "photosLegacy";
    }

    private boolean hasPhotosPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED;
        }
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("photos", hasPhotosPermission() ? "granted" : "prompt");
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasPhotosPermission()) {
            JSObject ret = new JSObject();
            ret.put("photos", "granted");
            call.resolve(ret);
            return;
        }
        requestPermissionForAlias(permissionAlias(), call, "permissionsCallback");
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("photos", hasPhotosPermission() ? "granted" : "denied");
        call.resolve(ret);
    }

    @PluginMethod
    public void getRecentMedia(PluginCall call) {
        if (!hasPhotosPermission()) {
            call.reject("permission denied");
            return;
        }
        int limit = call.getInt("limit", 60);
        int offset = call.getInt("offset", 0);
        String mediaType = call.getString("mediaType", "all");
        try {
            JSArray items = queryMedia(null, limit, offset, mediaType);
            JSObject ret = new JSObject();
            ret.put("items", items);
            ret.put("limited", false);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("query failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getAlbums(PluginCall call) {
        if (!hasPhotosPermission()) {
            call.reject("permission denied");
            return;
        }
        try {
            ContentResolver cr = getContext().getContentResolver();
            Map<String, JSObject> map = new HashMap<>();

            Uri collection = MediaStore.Files.getContentUri("external");
            String[] proj = new String[]{
                MediaStore.Files.FileColumns.BUCKET_ID,
                MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME
            };
            String sel = MediaStore.Files.FileColumns.MEDIA_TYPE + "=? OR " +
                MediaStore.Files.FileColumns.MEDIA_TYPE + "=?";
            String[] selArgs = new String[]{
                String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE),
                String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO)
            };

            try (Cursor c = cr.query(collection, proj, sel, selArgs, null)) {
                if (c != null) {
                    int idIdx = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.BUCKET_ID);
                    int nameIdx = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.BUCKET_DISPLAY_NAME);
                    while (c.moveToNext()) {
                        String id = c.getString(idIdx);
                        String title = c.getString(nameIdx);
                        if (id == null) continue;
                        if (!map.containsKey(id)) {
                            JSObject a = new JSObject();
                            a.put("id", id);
                            a.put("title", title != null ? title : "Álbum");
                            a.put("count", 1);
                            map.put(id, a);
                        } else {
                            JSObject a = map.get(id);
                            a.put("count", a.getInteger("count") + 1);
                        }
                    }
                }
            }

            JSArray albums = new JSArray();
            for (JSObject a : map.values()) albums.put(a);
            JSObject ret = new JSObject();
            ret.put("albums", albums);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("albums failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getAlbumMedia(PluginCall call) {
        if (!hasPhotosPermission()) {
            call.reject("permission denied");
            return;
        }
        String albumId = call.getString("albumId");
        if (albumId == null) {
            call.reject("albumId required");
            return;
        }
        int limit = call.getInt("limit", 60);
        int offset = call.getInt("offset", 0);
        String mediaType = call.getString("mediaType", "all");
        try {
            JSArray items = queryMedia(albumId, limit, offset, mediaType);
            JSObject ret = new JSObject();
            ret.put("items", items);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("album media failed: " + e.getMessage(), e);
        }
    }

    private JSArray queryMedia(String bucketId, int limit, int offset, String mediaType) throws Exception {
        ContentResolver cr = getContext().getContentResolver();
        Uri collection = MediaStore.Files.getContentUri("external");

        List<String> selParts = new ArrayList<>();
        List<String> args = new ArrayList<>();

        if ("image".equals(mediaType)) {
            selParts.add(MediaStore.Files.FileColumns.MEDIA_TYPE + "=?");
            args.add(String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE));
        } else if ("video".equals(mediaType)) {
            selParts.add(MediaStore.Files.FileColumns.MEDIA_TYPE + "=?");
            args.add(String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO));
        } else {
            selParts.add("(" + MediaStore.Files.FileColumns.MEDIA_TYPE + "=? OR " +
                MediaStore.Files.FileColumns.MEDIA_TYPE + "=?)");
            args.add(String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE));
            args.add(String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO));
        }

        if (bucketId != null) {
            selParts.add(MediaStore.Files.FileColumns.BUCKET_ID + "=?");
            args.add(bucketId);
        }

        String selection = String.join(" AND ", selParts);
        String[] projection = new String[]{
            MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.MEDIA_TYPE,
            MediaStore.Files.FileColumns.DATE_ADDED,
            MediaStore.Files.FileColumns.DURATION,
            MediaStore.Files.FileColumns.WIDTH,
            MediaStore.Files.FileColumns.HEIGHT,
            MediaStore.Files.FileColumns.DISPLAY_NAME
        };
        String order = MediaStore.Files.FileColumns.DATE_ADDED + " DESC";

        JSArray items = new JSArray();
        int skipped = 0;
        int collected = 0;

        try (Cursor c = cr.query(collection, projection, selection, args.toArray(new String[0]), order)) {
            if (c == null) return items;
            int idIdx = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID);
            int typeIdx = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.MEDIA_TYPE);
            int dateIdx = c.getColumnIndexOrThrow(MediaStore.Files.FileColumns.DATE_ADDED);
            int durIdx = c.getColumnIndex(MediaStore.Files.FileColumns.DURATION);
            int wIdx = c.getColumnIndex(MediaStore.Files.FileColumns.WIDTH);
            int hIdx = c.getColumnIndex(MediaStore.Files.FileColumns.HEIGHT);

            while (c.moveToNext()) {
                if (skipped < offset) { skipped++; continue; }
                if (collected >= limit) break;

                long id = c.getLong(idIdx);
                int mt = c.getInt(typeIdx);
                boolean isVideo = mt == MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO;
                Uri contentUri = ContentUris.withAppendedId(
                    isVideo ? MediaStore.Video.Media.EXTERNAL_CONTENT_URI : MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    id
                );

                JSObject item = new JSObject();
                item.put("id", String.valueOf(id));
                item.put("uri", contentUri.toString());
                item.put("mediaType", isVideo ? "video" : "image");
                item.put("creationTime", c.getLong(dateIdx) * 1000L);
                if (durIdx >= 0 && !c.isNull(durIdx)) {
                    // duration ms on some APIs
                    long dur = c.getLong(durIdx);
                    item.put("duration", dur > 10000 ? dur / 1000.0 : dur);
                }
                if (wIdx >= 0 && !c.isNull(wIdx)) item.put("width", c.getInt(wIdx));
                if (hIdx >= 0 && !c.isNull(hIdx)) item.put("height", c.getInt(hIdx));

                String thumb = makeThumb(cr, contentUri, id, isVideo);
                if (thumb != null) item.put("thumbUri", thumb);

                items.put(item);
                collected++;
            }
        }
        return items;
    }

    private String makeThumb(ContentResolver cr, Uri uri, long id, boolean isVideo) {
        try {
            File dir = new File(getContext().getCacheDir(), "tchilo_thumbs");
            if (!dir.exists()) dir.mkdirs();
            File out = new File(dir, (isVideo ? "v" : "i") + id + ".jpg");
            if (out.exists() && out.length() > 0) {
                return Uri.fromFile(out).toString();
            }
            if (Build.VERSION.SDK_INT >= 29) {
                android.graphics.Bitmap bmp = cr.loadThumbnail(uri, new Size(256, 256), null);
                FileOutputStream fos = new FileOutputStream(out);
                bmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, fos);
                fos.close();
                bmp.recycle();
                return Uri.fromFile(out).toString();
            }
            // fallback: copy stream head not needed — return content uri
            return uri.toString();
        } catch (Exception e) {
            return uri.toString();
        }
    }
}
