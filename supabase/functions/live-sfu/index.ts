// Supabase Edge Function: live-sfu
// Proxy autenticado para Cloudflare Realtime SFU (broadcast 1→muitos)
// Secrets necessários: CF_SFU_APP_ID, CF_SFU_APP_SECRET

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SFU_BASE = "https://rtc.live.cloudflare.com/v1";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sfuFetch(
  path: string,
  appId: string,
  appSecret: string,
  method: string,
  body?: unknown
) {
  const url = `${SFU_BASE}/apps/${appId}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${appSecret}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg =
      data?.errorDescription ||
      data?.error ||
      data?.message ||
      text ||
      res.statusText;
    throw new Error(`SFU ${method} ${path}: ${res.status} ${msg}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const appId = Deno.env.get("CF_SFU_APP_ID") || "";
  const appSecret = Deno.env.get("CF_SFU_APP_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE") ||
    "";

  if (!appId || !appSecret) {
    return json({ error: "CF_SFU_APP_ID / CF_SFU_APP_SECRET missing" }, 500);
  }

  // Auth do utilizador
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const sbUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || serviceKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await sbUser.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "Invalid session" }, 401);
  }
  const user = userData.user;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const action = String(body.action || "").toLowerCase();

  try {
    // ---------- create_session ----------
    if (action === "create_session") {
      const data = await sfuFetch("/sessions/new", appId, appSecret, "POST");
      return json({
        ok: true,
        sessionId: data.sessionId || data.sessionID || data.id,
      });
    }

    // ---------- publish (host) ----------
    if (action === "publish") {
      const sessionId = body.sessionId;
      const sessionDescription = body.sessionDescription;
      const tracks = body.tracks;
      if (!sessionId || !sessionDescription || !Array.isArray(tracks)) {
        return json({ error: "sessionId, sessionDescription, tracks required" }, 400);
      }
      const data = await sfuFetch(
        `/sessions/${sessionId}/tracks/new`,
        appId,
        appSecret,
        "POST",
        { sessionDescription, tracks }
      );
      return json({ ok: true, ...data });
    }

    // ---------- subscribe (viewer) ----------
    if (action === "subscribe") {
      const sessionId = body.sessionId; // viewer session
      const tracks = body.tracks; // remote tracks
      if (!sessionId || !Array.isArray(tracks)) {
        return json({ error: "sessionId and tracks required" }, 400);
      }
      const data = await sfuFetch(
        `/sessions/${sessionId}/tracks/new`,
        appId,
        appSecret,
        "POST",
        { tracks }
      );
      return json({ ok: true, ...data });
    }

    // ---------- renegotiate ----------
    if (action === "renegotiate") {
      const sessionId = body.sessionId;
      const sessionDescription = body.sessionDescription;
      if (!sessionId || !sessionDescription) {
        return json({ error: "sessionId and sessionDescription required" }, 400);
      }
      const data = await sfuFetch(
        `/sessions/${sessionId}/renegotiate`,
        appId,
        appSecret,
        "PUT",
        { sessionDescription }
      );
      return json({ ok: true, ...data });
    }

    // ---------- close_tracks ----------
    if (action === "close_tracks") {
      const sessionId = body.sessionId;
      const tracks = body.tracks || [];
      if (!sessionId) return json({ error: "sessionId required" }, 400);
      const data = await sfuFetch(
        `/sessions/${sessionId}/tracks/close`,
        appId,
        appSecret,
        "PUT",
        { tracks, force: true }
      );
      return json({ ok: true, ...data });
    }

    // ---------- start_live (cria row + session) ----------
    if (action === "start_live") {
      const title = String(body.title || "").slice(0, 120);
      const username = String(body.username || "").slice(0, 64);
      const displayName = String(body.display_name || body.displayName || username).slice(0, 80);

      if (!username) return json({ error: "username required" }, 400);

      // Terminar lives anteriores do mesmo user
      const sbAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      await sbAdmin
        .from("lives")
        .update({ status: "ended", ended_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "live");

      // Session no SFU
      const sess = await sfuFetch("/sessions/new", appId, appSecret, "POST");
      const publisherSessionId = sess.sessionId || sess.sessionID || sess.id;
      if (!publisherSessionId) {
        return json({ error: "Failed to create SFU session" }, 500);
      }

      const { data: row, error: insErr } = await sbAdmin
        .from("lives")
        .insert({
          user_id: user.id,
          username,
          display_name: displayName,
          title,
          status: "live",
          publisher_session_id: publisherSessionId,
          video_track_name: "camera",
          audio_track_name: "mic",
        })
        .select("*")
        .single();

      if (insErr) {
        return json({ error: insErr.message }, 500);
      }

      return json({
        ok: true,
        live: row,
        sessionId: publisherSessionId,
      });
    }

    // ---------- end_live ----------
    if (action === "end_live") {
      const liveId = body.liveId || body.live_id;
      if (!liveId) return json({ error: "liveId required" }, 400);

      const sbAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: live } = await sbAdmin
        .from("lives")
        .select("*")
        .eq("id", liveId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!live) return json({ error: "Live not found" }, 404);

      await sbAdmin
        .from("lives")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", liveId);

      // Tentar fechar tracks no SFU
      if (live.publisher_session_id) {
        try {
          await sfuFetch(
            `/sessions/${live.publisher_session_id}/tracks/close`,
            appId,
            appSecret,
            "PUT",
            {
              tracks: [
                { mid: "0" },
                { mid: "1" },
              ],
              force: true,
            }
          );
        } catch (e) {
          console.warn("close tracks", e);
        }
      }

      return json({ ok: true });
    }

    return json({ error: "Unknown action. Use: create_session, publish, subscribe, renegotiate, close_tracks, start_live, end_live" }, 400);
  } catch (err: any) {
    console.error("live-sfu", err);
    return json({ error: err?.message || String(err) }, 500);
  }
});
