// Lead-Suche über die Google Places API (Text Search). Benötigt GOOGLE_PLACES_KEY.
export default async (req) => {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return Response.json({ error: "GOOGLE_PLACES_KEY fehlt in den Netlify-Umgebungsvariablen." }, { status: 500 });
  const tok = process.env.SYNC_TOKEN;
  if (tok && req.headers.get("x-sync-token") !== tok) return new Response("unauthorized", { status: 401 });
  const q = new URL(req.url).searchParams.get("q");
  if (!q) return Response.json({ error: "Suchbegriff fehlt" }, { status: 400 });
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount" },
    body: JSON.stringify({ textQuery: q, languageCode: "de", regionCode: "DE", pageSize: 20 })
  });
  const j = await r.json();
  if (!r.ok) return Response.json({ error: j.error?.message || "Places-Fehler" }, { status: 502 });
  return Response.json((j.places || []).map(p => ({
    name: p.displayName?.text || "", addr: p.formattedAddress || "", tel: p.nationalPhoneNumber || "",
    web: p.websiteUri || "", rating: p.rating || null, reviews: p.userRatingCount || 0 })));
};
export const config = { path: "/api/places" };
