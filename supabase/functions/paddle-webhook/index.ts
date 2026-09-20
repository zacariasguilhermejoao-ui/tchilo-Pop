// Supabase Edge Function: paddle-webhook
// Verifica assinatura Paddle e atualiza profiles.is_premium

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paddle-signature",
};

const PRICE_ID = "pri_01m2ztke3vf0v4xwj13t0hbdav";
const PRODUCT_ID = "pro_01m2ztbfaqeme2ycp5ehf2zakk";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;
  let ts = "";
  let h1 = "";
  for (const part of signatureHeader.split(";")) {
    const [k, v] = part.split("=", 2);
    if (k === "ts") ts = v || "";
    if (k === "h1") h1 = v || "";
  }
  if (!ts || !h1) return false;

  // tolerância 5 min contra replay
  const tsNum = parseInt(ts, 10);
  if (!Number.isFinite(tsNum)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tsNum) > 300) return false;

  const expected = await hmacSha256Hex(secret, `${ts}:${rawBody}`);
  return timingSafeEqual(expected, h1);
}

function collectCustomData(data: any): Record<string, string> {
  const out: Record<string, string> = {};
  const sources = [
    data?.custom_data,
    data?.transaction?.custom_data,
    data?.data?.custom_data,
  ];
  for (const src of sources) {
    if (src && typeof src === "object") {
      for (const [k, v] of Object.entries(src)) {
        if (v != null) out[k] = String(v);
      }
    }
  }
  return out;
}

function extractUserId(event: any): string | null {
  const custom = collectCustomData(event?.data || event);
  const uid = custom.user_id || custom.userId || custom.uid || "";
  if (uid && /^[0-9a-f-]{36}$/i.test(uid)) return uid;
  return null;
}

function extractEmail(event: any): string | null {
  const d = event?.data || {};
  const email =
    d?.customer?.email ||
    d?.email ||
    d?.transaction?.customer?.email ||
    "";
  return email ? String(email).toLowerCase().trim() : null;
}

function extractTxnId(event: any): string | null {
  const d = event?.data || {};
  return d?.id || d?.transaction_id || d?.transaction?.id || null;
}

function eventGrantsPremium(eventType: string, data: any): boolean {
  if (eventType === "transaction.completed") {
    // confirmar que inclui o nosso preço (quando disponível)
    const items = data?.items || data?.details?.line_items || [];
    if (Array.isArray(items) && items.length) {
      const hit = items.some((it: any) => {
        const pid = it?.price?.id || it?.price_id || it?.priceId;
        const prod = it?.price?.product_id || it?.product?.id;
        return pid === PRICE_ID || prod === PRODUCT_ID;
      });
      // se não conseguir ler items, ainda assim confia no completed
      if (items.length && !hit) return false;
    }
    return true;
  }
  if (
    eventType === "subscription.activated" ||
    eventType === "subscription.created" ||
    eventType === "subscription.updated"
  ) {
    const status = data?.status || "";
    return status === "active" || status === "trialing" || !status;
  }
  return false;
}

function eventRevokesPremium(eventType: string, data: any): boolean {
  if (
    eventType === "subscription.canceled" ||
    eventType === "subscription.past_due"
  ) {
    return true;
  }
  if (eventType === "subscription.updated") {
    const status = data?.status || "";
    return status === "canceled" || status === "past_due" || status === "paused";
  }
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE") ||
    "";

  if (!webhookSecret) {
    console.error("PADDLE_WEBHOOK_SECRET em falta");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature");

  const valid = await verifyPaddleSignature(rawBody, signature, webhookSecret);
  if (!valid) {
    console.warn("Assinatura Paddle inválida");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventType = event?.event_type || event?.eventType || "";
  const data = event?.data || {};
  console.log("Paddle event", eventType, extractTxnId(event));

  if (!supabaseUrl || !serviceKey) {
    console.error("Supabase env em falta");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userId = extractUserId(event);
  const email = extractEmail(event);
  const txnId = extractTxnId(event);

  // resolver user por email se não veio custom_data.user_id
  if (!userId && email) {
    try {
      const { data: listed, error } = await sb.auth.admin.listUsers({ perPage: 1000 });
      if (!error && listed?.users) {
        const found = listed.users.find(
          (u) => (u.email || "").toLowerCase() === email
        );
        if (found) userId = found.id;
      }
    } catch (e) {
      console.warn("listUsers", e);
    }
    if (!userId) {
      const { data: prof } = await sb
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (prof?.id) userId = prof.id;
    }
  }

  if (!userId) {
    console.warn("Sem user_id para evento", eventType, email);
    // 200 para o Paddle não reenviar indefinidamente; log fica para análise
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: "no_user" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (eventGrantsPremium(eventType, data)) {
    const row: Record<string, unknown> = {
      id: userId,
      is_premium: true,
      premium_updated_at: new Date().toISOString(),
    };
    if (txnId) row.premium_txn = String(txnId).slice(0, 120);

    const { error } = await sb.from("profiles").upsert(row, { onConflict: "id" });
    if (error) {
      console.error("upsert premium", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Premium ON", userId, txnId);
    return new Response(
      JSON.stringify({ ok: true, premium: true, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (eventRevokesPremium(eventType, data)) {
    const { error } = await sb
      .from("profiles")
      .update({
        is_premium: false,
        premium_updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) {
      console.error("revoke premium", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Premium OFF", userId);
    return new Response(
      JSON.stringify({ ok: true, premium: false, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, ignored: eventType }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
