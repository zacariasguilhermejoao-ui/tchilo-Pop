package com.tchilo.isabstudio;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.database.Cursor;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.MimeTypeMap;
import android.content.ContentResolver;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

@CapacitorPlugin(name = "TchiloShareTarget")
public class TchiloShareTargetPlugin extends Plugin {
  private String consumedId = "";

  @PluginMethod
  public void getPendingShare(PluginCall call) {
    Intent intent = getActivity().getIntent();
    String action = intent == null ? null : intent.getAction();
    if (intent == null || (!Intent.ACTION_SEND.equals(action) && !Intent.ACTION_SEND_MULTIPLE.equals(action))) {
      JSObject out = new JSObject(); out.put("item", JSObject.NULL); call.resolve(out); return;
    }
    String id = intent.getStringExtra("_tchilo_share_id");
    if (id == null) { id = UUID.randomUUID().toString(); intent.putExtra("_tchilo_share_id", id); }
    if (id.equals(consumedId)) { JSObject out = new JSObject(); out.put("item", JSObject.NULL); call.resolve(out); return; }

    Uri uri = null;
    String text = intent.getStringExtra(Intent.EXTRA_TEXT);
    if (Intent.ACTION_SEND.equals(action)) {
      Object stream = intent.getParcelableExtra(Intent.EXTRA_STREAM);
      if (stream instanceof Uri) uri = (Uri) stream;
    } else {
      ClipData clip = intent.getClipData();
      if (clip != null && clip.getItemCount() > 0) uri = clip.getItemAt(0).getUri();
    }
    JSObject item = new JSObject();
    item.put("id", id);
    item.put("text", text == null ? "" : text);
    if (uri != null) {
      ContentResolver resolver = getContext().getContentResolver();
      String mime = resolver.getType(uri);
      if (mime == null) mime = intent.getType() == null ? "application/octet-stream" : intent.getType();
      item.put("mimeType", mime);
      item.put("fileName", queryName(uri));
      try (InputStream in = resolver.openInputStream(uri); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        if (in != null) {
          byte[] buf = new byte[8192]; int n; int total = 0;
          while ((n = in.read(buf)) > 0) {
            total += n;
            if (total > 15 * 1024 * 1024) throw new IllegalStateException("Ficheiro acima de 15 MB para partilha direta.");
            out.write(buf, 0, n);
          }
          item.put("dataUrl", "data:" + mime + ";base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
        }
      } catch (Exception e) {
        call.reject("Não foi possível ler o ficheiro partilhado: " + e.getMessage());
        return;
      }
    } else {
      item.put("mimeType", "text/plain");
      item.put("fileName", "Texto partilhado");
    }
    consumedId = id;
    JSObject result = new JSObject(); result.put("item", item); call.resolve(result);
  }

  private String queryName(Uri uri) {
    String name = null;
    try (Cursor c = getContext().getContentResolver().query(uri, null, null, null, null)) {
      if (c != null && c.moveToFirst()) {
        int ix = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
        if (ix >= 0) name = c.getString(ix);
      }
    } catch (Exception ignored) {}
    return name == null ? "ficheiro-partilhado" : name;
  }
}