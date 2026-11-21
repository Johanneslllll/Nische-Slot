import { getStore } from "@netlify/blobs";
// Speichert den kompletten Tool-Stand (Sprint + Leads) in Netlify Blobs.
export default async (req) => {
  const tok = process.env.SYNC_TOKEN;
  if (tok && req.headers.get("x-sync-token") !== tok) return new Response("unauthorized", { status: 401 });
  const store = getStore("niche-slot");
  if (req.method === "GET") {
    const v = await store.get("state", { type: "json" });
    return Response.json(v || null);
  }
  if (req.method === "PUT") {
    const body = await req.json();
    if (!body || !Array.isArray(body.leads)) return new Response("bad request", { status: 400 });
    await store.setJSON("state", body);
    // Tages-Backup, damit nichts verloren geht
    await store.setJSON("backup-" + new Date().toISOString().slice(0, 10), body);
    return Response.json({ ok: true });
  }
  return new Response("method not allowed", { status: 405 });
};
export const config = { path: "/api/state" };
