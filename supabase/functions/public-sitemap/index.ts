/**
 * Tchilo — sitemap dinâmico de perfis e posts públicos
 * Deploy: supabase functions deploy public-sitemap --no-verify-jwt
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE = "https://tchilopop.com";

function xmlEscape(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlEntry(loc: string, lastmod?: string, priority = "0.6") {
  const lm = lastmod ? `\n    <lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : "";
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lm}\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const urls: string[] = [];

    // Perfis públicos (username)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, updated_at, created_at, is_private")
      .not("username", "is", null)
      .order("updated_at", { ascending: false })
      .limit(2000);

    for (const row of profiles || []) {
      if (!row.username) continue;
      if (row.is_private === true) continue;
      const last = row.updated_at || row.created_at || "";
      urls.push(
        urlEntry(`${SITE}/u/${encodeURIComponent(row.username)}`, last, "0.7"),
      );
    }

    // Posts públicos
    const { data: posts } = await supabase
      .from("posts")
      .select("id, created_at, username")
      .order("created_at", { ascending: false })
      .limit(5000);

    for (const row of posts || []) {
      if (!row.id) continue;
      urls.push(
        urlEntry(`${SITE}/p/${encodeURIComponent(row.id)}`, row.created_at || "", "0.8"),
      );
    }

    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join("\n") +
      `\n</urlset>\n`;

    return new Response(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><!-- ${xmlEscape(msg)} --></urlset>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      },
    );
  }
});
