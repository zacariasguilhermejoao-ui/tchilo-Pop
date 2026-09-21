// Supabase Edge Function: paddle-webhook
// Premium + Anúncios Tchilo

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, paddle-signature",
};

const PREMIUM_PRICE_ID = "pri_01m2ztke3vf0v4xwj13t0hbdav";
const PREMIUM_PRODUCT_ID = "pro_01m2ztbfaqeme2ycp5ehf2zakk";
const AD_PRICE_ID = "pri_01m31nb48pzvs976yz2nd1wtbp";
const AD_PRODUCT_ID = "pro_01m31ms9xn7ec78wssjp61eb01";

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

function extractItems(data: any): any[] {
  const items =
    data?.items ||
    data?.details?.line_items ||
    data?.details?.lineItems ||
    [];
  return Array.isArray(items) ? items : [];
}

function itemsMatchPrice(data: any, priceId: string, productId: string): boolean {
  const items = extractItems(data);
  if (!items.length) return false;
  return items.some((it: any) => {
    const pid = it?.price?.id || it?.price_id || it?.priceId;
    const prod = it?.price?.product_id || it?.product?.id || it?.product_id;
    return pid === priceId || prod === productId;
  });
}

function extractQuantity(data: any, priceId: string): number {
  const items = extractItems(data);
  for (const it of items) {
    const pid = it?.price?.id || it?.price_id || it?.priceId;
    if (pid === priceId) {
      const q = parseInt(String(it?.quantity ?? it?.qty ?? 1), 10);
      return Number.isFinite(q) && q > 0 ? Math.min(30, q) : 1;
    }
  }
  return 1;
}

function extractUserId(event: any): string | null {
  const custom = collectCustomData(event?.data || event);
  const uid = custom.user_id || custom.userId || custom.uid || "";
  if (uid && /^[0-9a-f-]{36}$/i.test(uid)) return uid;
  return null;
}

function extractAdId(event: any): string | null {
  const custom = collectCustomData(event?.data || event);
  const id = custom.ad_id || custom.adId || "";
  if (id && /^[0-9a-f-]{36}$/i.test(id)) return id;
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
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const signature =
    req.headers.get("paddle-signature") ||
    req.headers.get("Paddle-Signature");
  const valid = await verifyPaddleSignature(rawBody, signature, webhookSecret);
  if (!valid) {
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
  const custom = collectCustomData(data);
  const txnId = extractTxnId(event);
  console.log("Paddle event", eventType, txnId, custom.kind || "");

  if (!supabaseUrl || !serviceKey) {
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
  if (!userId && email) {
    try {
      const { data: listed, error } = await sb.auth.admin.listUsers({
        perPage: 1000,
      });
      if (!error && listed?.users) {
        const found = listed.users.find(
          (u) => (u.email || "").toLowerCase() === email
        );
        if (found) userId = found.id;
      }
    } catch (e) {
      console.warn("listUsers", e);
    }
  }

  const isAdPurchase =
    eventType === "transaction.completed" &&
    (custom.kind === "ad" ||
      itemsMatchPrice(data, AD_PRICE_ID, AD_PRODUCT_ID));

  const isPremiumPurchase =
    eventType === "transaction.completed" &&
    !isAdPurchase &&
    (itemsMatchPrice(data, PREMIUM_PRICE_ID, PREMIUM_PRODUCT_ID) ||
      custom.kind === "premium");

  // --- ANÚNCIO ---
  if (isAdPurchase) {
    const adId = extractAdId(event);
    const daysFromQty = extractQuantity(data, AD_PRICE_ID);
    const daysCustom = parseInt(custom.days || "", 10);
    const days =
      Number.isFinite(daysCustom) && daysCustom > 0
        ? Math.min(30, daysCustom)
        : daysFromQty;

    const starts = new Date();
    const ends = new Date(starts.getTime() + days * 86400000);
    const reachMin = days * 800;
    const reachMax = days * 1000;

    if (adId) {
      const { error } = await sb
        .from("ads")
        .update({
          status: "active",
          days,
          reach_min: reachMin,
          reach_max: reachMax,
          starts_at: starts.toISOString(),
          ends_at: ends.toISOString(),
          paddle_txn: txnId ? String(txnId).slice(0, 120) : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adId)
        .eq("status", "pending");

      if (error) {
        console.error("activate ad", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("Ad ON", adId, days);
      return new Response(
        JSON.stringify({ ok: true, ad: true, ad_id: adId, days }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // sem ad_id: ativar o pending mais recente do user
    if (userId) {
      const { data: pending } = await sb
        .from("ads")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (pending?.id) {
        await sb
          .from("ads")
          .update({
            status: "active",
            days,
            reach_min: reachMin,
            reach_max: reachMax,
            starts_at: starts.toISOString(),
            ends_at: ends.toISOString(),
            paddle_txn: txnId ? String(txnId).slice(0, 120) : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pending.id);
        console.log("Ad ON (fallback)", pending.id, days);
        return new Response(
          JSON.stringify({ ok: true, ad: true, ad_id: pending.id, days }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.warn("Ad payment without ad row", userId, txnId);
    return new Response(
      JSON.stringify({ ok: true, ad: false, reason: "no_ad_row" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // --- PREMIUM ---
  if (isPremiumPurchase || (eventType === "subscription.activated" && !isAdPurchase)) {
    if (!userId) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "no_user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const row: Record<string, unknown> = {
      id: userId,
      is_premium: true,
      premium_updated_at: new Date().toISOString(),
    };
    if (txnId) row.premium_txn = String(txnId).slice(0, 120);
    const { error } = await sb.from("profiles").upsert(row, { onConflict: "id" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({ ok: true, premium: true, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (
    eventType === "subscription.canceled" ||
    eventType === "subscription.past_due"
  ) {
    if (userId) {
      await sb
        .from("profiles")
        .update({
          is_premium: false,
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
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
