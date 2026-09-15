// Supabase Edge Function: send-push
// Envia notificações FCM (like, comment, message)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  type: "like" | "comment" | "message" | "follow" | "story" | "custom";
  recipient_user_id: string;
  title?: string;
  body?: string;
  data?: Record<string, string>;
  actor_username?: string;
  actor_name?: string;
};

function buildNotification(payload: Payload) {
  const actor = payload.actor_name || payload.actor_username || "Alguém";
  let title = payload.title || "tchilo-Pop";
  let body = payload.body || "";

  if (!payload.title || !payload.body) {
    switch (payload.type) {
      case "like":
        title = "Novo like";
        body = `${actor} gostou da tua publicação`;
        break;
      case "comment":
        title = "Novo comentário";
        body = `${actor} comentou na tua publicação`;
        break;
      case "message":
        title = "Nova mensagem";
        body = `${actor} enviou-te uma mensagem`;
        break;
      case "follow":
        title = "Novo seguidor";
        body = `${actor} começou a seguir-te`;
        break;
      case "story":
        title = "Story";
        body = `${actor} respondeu ao teu story`;
        break;
      default:
        title = payload.title || "tchilo-Pop";
        body = payload.body || "Tens uma nova notificação";
    }
  }

  return { title, body };
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const enc = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const unsigned = `${enc(header)}.${enc(claim)}`;

  const pem = serviceAccount.private_key as string;
  const pemContents = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${unsigned}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    throw new Error("Failed to get FCM access token: " + JSON.stringify(tokenJson));
  }
  return tokenJson.access_token as string;
}

async function sendFcm(
  accessToken: string,
  projectId: string,
  deviceToken: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message = {
    message: {
      token: deviceToken,
      notification: { title, body },
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      android: {
        priority: "HIGH",
        notification: {
          sound: "default",
          channel_id: "tchilo_default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as Payload;

    if (!payload.recipient_user_id) {
      return new Response(JSON.stringify({ error: "recipient_user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firebaseSaJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

    if (!firebaseSaJson) {
      return new Response(
        JSON.stringify({ error: "FIREBASE_SERVICE_ACCOUNT secret not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceAccount = JSON.parse(firebaseSaJson);
    const projectId = serviceAccount.project_id;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: tokens, error: tokenErr } = await supabase
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", payload.recipient_user_id);

    if (tokenErr) {
      throw new Error("device_tokens query failed: " + tokenErr.message);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "No device tokens for user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, body } = buildNotification(payload);
    const data = {
      type: payload.type || "custom",
      ...(payload.data || {}),
    };

    const accessToken = await getAccessToken(serviceAccount);

    const results = [];
    for (const row of tokens) {
      const r = await sendFcm(accessToken, projectId, row.token, title, body, data);
      results.push({ token: row.token.slice(0, 12) + "…", platform: row.platform, ...r });
    }

    return new Response(
      JSON.stringify({ ok: true, sent: results.filter((r) => r.ok).length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
