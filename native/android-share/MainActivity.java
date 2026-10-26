package __PACKAGE__;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.res.Configuration;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Tchilo — recebe partilhas do Android (intent SEND / SEND_MULTIPLE).
 * Copia os ficheiros para a cache da app e entrega o resultado à página
 * através de window.TchiloAndroidShare.consume() (lido em native/tchilo-share-target.js).
 * Ficheiro copiado para o projeto Android por scripts/patch_android_share.py
 */
public class MainActivity extends BridgeActivity {

    private static final int MAX_FILES = 10;
    private static volatile String pendingShare = null;

    public class ShareBridge {
        @JavascriptInterface
        public String consume() {
            String s = pendingShare;
            pendingShare = null;
            return s == null ? "" : s;
        }
    }

    /** Tema do telemóvel (escuro ou claro) para a página */
    public class SystemBridge {
        @JavascriptInterface
        public boolean isDark() {
            int m = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
            return m == Configuration.UI_MODE_NIGHT_YES;
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        try {
            getBridge().getWebView().evaluateJavascript(
                "try{window.dispatchEvent(new Event('tchilo-system-theme'))}catch(e){}", null);
        } catch (Throwable t) {
            // ignora
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView wv = getBridge().getWebView();
            wv.addJavascriptInterface(new ShareBridge(), "TchiloAndroidShare");
            wv.addJavascriptInterface(new SystemBridge(), "TchiloSystemTheme");
        } catch (Throwable t) {
            // sem ponte, a partilha simplesmente não chega à página
        }
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShareIntent(intent);
    }

    private void handleShareIntent(final Intent intent) {
        if (intent == null) return;
        final String action = intent.getAction();
        if (!Intent.ACTION_SEND.equals(action) && !Intent.ACTION_SEND_MULTIPLE.equals(action)) return;

        final String type = intent.getType();
        final String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        final String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
        final ArrayList<Uri> uris = collectUris(intent);

        // não voltar a processar a mesma partilha (rotação do ecrã, etc.)
        setIntent(new Intent(Intent.ACTION_MAIN));

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    cleanOldFiles();
                    JSONObject json = new JSONObject();
                    json.put("title", subject == null ? "" : subject);
                    json.put("text", text == null ? "" : text);
                    JSONArray files = new JSONArray();
                    int n = 0;
                    for (Uri uri : uris) {
                        if (n >= MAX_FILES) break;
                        try {
                            JSONObject f = copyUri(uri, n, type);
                            if (f != null) {
                                files.put(f);
                                n++;
                            }
                        } catch (Throwable e) {
                            // ficheiro ilegível: segue para o próximo
                        }
                    }
                    json.put("files", files);
                    pendingShare = json.toString();
                    notifyPage();
                } catch (Throwable t) {
                    // ignora
                }
            }
        }).start();
    }

    private void notifyPage() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    WebView wv = getBridge().getWebView();
                    wv.evaluateJavascript(
                        "try{window.dispatchEvent(new Event('tchilo-share-pending'))}catch(e){}", null);
                } catch (Throwable t) {
                    // página ainda não pronta: a página lê a partilha pendente ao arrancar
                }
            }
        });
    }

    @SuppressWarnings({"deprecation", "unchecked"})
    private ArrayList<Uri> collectUris(Intent intent) {
        ArrayList<Uri> list = new ArrayList<Uri>();
        try {
            if (Intent.ACTION_SEND.equals(intent.getAction())) {
                Uri u;
                if (Build.VERSION.SDK_INT >= 33) {
                    u = intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class);
                } else {
                    u = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
                }
                if (u != null) list.add(u);
            } else {
                ArrayList<Uri> many;
                if (Build.VERSION.SDK_INT >= 33) {
                    many = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM, Uri.class);
                } else {
                    many = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                }
                if (many != null) list.addAll(many);
            }
        } catch (Throwable t) {
            // ignora
        }
        if (list.isEmpty()) {
            try {
                ClipData cd = intent.getClipData();
                if (cd != null) {
                    for (int i = 0; i < cd.getItemCount(); i++) {
                        Uri u = cd.getItemAt(i).getUri();
                        if (u != null) list.add(u);
                    }
                }
            } catch (Throwable t) {
                // ignora
            }
        }
        return list;
    }

    private JSONObject copyUri(Uri uri, int idx, String fallbackType) throws Exception {
        ContentResolver cr = getContentResolver();
        String mime = cr.getType(uri);
        if (mime == null || mime.endsWith("/*")) mime = fallbackType;
        String name = queryName(cr, uri);
        if (name == null || name.length() == 0) name = "shared-" + idx;
        if (name.indexOf('.') < 0) {
            String ext = extensionFor(mime);
            if (ext != null) name = name + "." + ext;
        }
        if (mime == null || mime.endsWith("/*")) mime = mimeFor(name);
        name = name.replaceAll("[^A-Za-z0-9._-]", "_");

        File dir = new File(getCacheDir(), "share");
        dir.mkdirs();
        File dest = new File(dir, System.currentTimeMillis() + "-" + idx + "-" + name);

        InputStream in = cr.openInputStream(uri);
        if (in == null) return null;
        OutputStream out = new FileOutputStream(dest);
        try {
            byte[] buf = new byte[64 * 1024];
            int r;
            while ((r = in.read(buf)) != -1) out.write(buf, 0, r);
        } finally {
            try { in.close(); } catch (Throwable t) { }
            try { out.close(); } catch (Throwable t) { }
        }

        JSONObject o = new JSONObject();
        o.put("path", dest.getAbsolutePath());
        o.put("name", name);
        o.put("mime", mime == null ? "application/octet-stream" : mime);
        return o;
    }

    private String queryName(ContentResolver cr, Uri uri) {
        Cursor c = null;
        try {
            c = cr.query(uri, new String[] {OpenableColumns.DISPLAY_NAME}, null, null, null);
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Throwable t) {
            // ignora
        } finally {
            if (c != null) c.close();
        }
        String last = uri.getLastPathSegment();
        return last;
    }

    private String extensionFor(String mime) {
        if (mime == null) return null;
        return MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
    }

    private String mimeFor(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 0) return null;
        String ext = name.substring(dot + 1).toLowerCase(Locale.ROOT);
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
    }

    private void cleanOldFiles() {
        try {
            File dir = new File(getCacheDir(), "share");
            File[] list = dir.listFiles();
            if (list == null) return;
            long limit = System.currentTimeMillis() - 24L * 60L * 60L * 1000L;
            for (File f : list) {
                if (f.lastModified() < limit) f.delete();
            }
        } catch (Throwable t) {
            // ignora
        }
    }
}
