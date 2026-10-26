// Apaga as contas cujo pedido de eliminação tem mais de 30 dias:
// 1) ficheiros no Storage  2) linhas nas tabelas  3) utilizador no Auth.
// Chamada todos os dias pelo agendamento (ver supabase/sql/account-deletion.sql).
// Variáveis: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (automáticas) e CRON_SECRET (tu defines).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("forbidden", { status: 403 });
  }
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const due = await sb.rpc("due_account_deletions");
  if (due.error) return new Response(due.error.message, { status: 500 });

  const done: string[] = [];
  const failed: { id: string; step: string; error: string }[] = [];

  for (const row of (due.data ?? []) as { user_id: string }[]) {
    const uid = row.user_id;
    try {
      // 1) ficheiros
      const objs = await sb.rpc("user_storage_objects", { p_user: uid });
      if (objs.error) throw new Error("storage list: " + objs.error.message);
      const byBucket = new Map<string, string[]>();
      for (const o of (objs.data ?? []) as { bucket_id: string; name: string }[]) {
        const list = byBucket.get(o.bucket_id) ?? [];
        list.push(o.name);
        byBucket.set(o.bucket_id, list);
      }
      for (const [bucket, names] of byBucket) {
        for (let i = 0; i < names.length; i += 100) {
          const r = await sb.storage.from(bucket).remove(names.slice(i, i + 100));
          if (r.error) throw new Error("storage remove: " + r.error.message);
        }
      }
      // 2) linhas
      const rows = await sb.rpc("purge_user_rows", { p_user: uid });
      if (rows.error) throw new Error("rows: " + rows.error.message);
      // 3) utilizador (apaga também o registo em account_deletions por cascata)
      const del = await sb.auth.admin.deleteUser(uid);
      if (del.error) throw new Error("auth: " + del.error.message);
      done.push(uid);
    } catch (e) {
      failed.push({ id: uid, step: "purge", error: String((e as Error).message ?? e) });
    }
  }
  return new Response(JSON.stringify({ deleted: done.length, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
