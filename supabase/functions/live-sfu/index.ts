// Supabase Edge Function: live-sfu
// Proxy autenticado para Cloudflare Realtime SFU (broadcast 1→muitos)
// Secrets: CF_SFU_APP_ID, CF_SFU_APP_SECRET

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

/** Notifica seguidores: insere em notifications + tenta send-push */
async function notifyFollowers(
  sbAdmin: any,
  hostUserId: string,
  hostUsername: string,
  displayName: string,
  title: string,
  liveId: string
) {
  try {
    const { data: follows } = await sbAdmin
      .from("follows")
      .select("follower_id")
      .eq("following_id", hostUserId)
      .limit(500);

    const followerIds = (follows || [])
      .map((f: any) => f.follower_id)
      .filter(Boolean);

    if (!followerIds.length) return { notified: 0 };

    const who = displayName || hostUsername || "Alguém";
    const msg = title
      ? `${who} está ao vivo: ${title}`
      : `${who} está ao vivo no Tchilo`;

    const rows = followerIds.map((uid: string) => ({
      user_id: uid,
      type: "live",
      message: msg,
      content: msg,
      created_at: new Date().toISOString(),
    }));

    // inserir notificações em lotes
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      try {
        await sbAdmin.from("notifications").insert(batch);
      } catch (e) {
        console.warn("notif batch", e);
      }
    }

    // Push (best-effort) via function send-push já existente
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_SERVICE_ROLE") ||
      "";

    if (supabaseUrl && serviceKey) {
      for (const uid of followerIds.slice(0, 80)) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-push`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "custom",
              recipient_user_id: uid,
              title: "Live no Tchilo",
              body: msg,
              data: {
                type: "live",
                live_id: liveId,
                username: hostUsername,
              },
              actor_username: hostUsername,
              actor_name: who,
            }),
          });
        } catch (e) {
          /* ignore individual push failures */
        }
      }
    }

    return { notified: followerIds.length };
  } catch (e) {
    console.warn("notifyFollowers", e);
    return { notified: 0 };
  }
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

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const sbUser = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY") || serviceKey,
    {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

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
    if (action === "create_session") {
      const data = await sfuFetch("/sessions/new", appId, appSecret, "POST");
      return json({
        ok: true,
        sessionId: data.sessionId || data.sessionID || data.id,
      });
    }

    if (action === "publish") {
      const sessionId = body.sessionId;
      const sessionDescription = body.sessionDescription;
      const tracks = body.tracks;
      if (!sessionId || !sessionDescription || !Array.isArray(tracks)) {
        return json(
          { error: "sessionId, sessionDescription, tracks required" },
          400
        );
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

    if (action === "subscribe") {
      const sessionId = body.sessionId;
      const tracks = body.tracks;
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

    if (action === "renegotiate") {
      const sessionId = body.sessionId;
      const sessionDescription = body.sessionDescription;
      if (!sessionId || !sessionDescription) {
        return json(
          { error: "sessionId and sessionDescription required" },
          400
        );
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

    if (action === "start_live") {
      const title = String(body.title || "").slice(0, 120);
      const username = String(body.username || "").slice(0, 64);
      const displayName = String(
        body.display_name || body.displayName || username
      ).slice(0, 80);

      if (!username) return json({ error: "username required" }, 400);

      const sbAdmin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      await sbAdmin
        .from("lives")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "live");

      const sess = await sfuFetch("/sessions/new", appId, appSecret, "POST");
      const publisherSessionId =
        sess.sessionId || sess.sessionID || sess.id;
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

      // Notificar seguidores (não bloqueia a resposta)
      const notif = await notifyFollowers(
        sbAdmin,
        user.id,
        username,
        displayName,
        title,
        row.id
      );

      return json({
        ok: true,
        live: row,
        sessionId: publisherSessionId,
        followers_notified: notif.notified,
      });
    }

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

      if (live.publisher_session_id) {
        try {
          await sfuFetch(
            `/sessions/${live.publisher_session_id}/tracks/close`,
            appId,
            appSecret,
            "PUT",
            {
              tracks: [{ mid: "0" }, { mid: "1" }],
              force: true,
            }
          );
        } catch (e) {
          console.warn("close tracks", e);
        }
      }

      return json({ ok: true });
    }

    return json(
      {
        error:
          "Unknown action. Use: create_session, publish, subscribe, renegotiate, close_tracks, start_live, end_live",
      },
      400
    );
  } catch (err: any) {
    console.error("live-sfu", err);
    return json({ error: err?.message || String(err) }, 500);
  }
});
