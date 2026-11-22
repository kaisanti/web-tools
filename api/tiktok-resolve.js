const ALLOWED_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]);
function isTikTokUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && (ALLOWED_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith(".tiktok.com"));
  } catch { return false; }
}
function send(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status === 200 ? "public, s-maxage=300, stale-while-revalidate=600" : "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
  return res.send(JSON.stringify(body));
}
module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return send(res, 405, { error: "Method not allowed." });
  }
  const videoUrl = typeof req.query.url === "string" ? req.query.url.trim() : "";
  if (!videoUrl || !isTikTokUrl(videoUrl)) return send(res, 400, { error: "Masukkan URL video TikTok publik yang valid." });
  try {
    const form = new URLSearchParams({ url: videoUrl, count: "12", cursor: "0", web: "1", hd: "1" });
    const upstream = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "Accept": "application/json", "User-Agent": "Mozilla/5.0 TikTokAnalyzer/1.0" },
      body: form,
      signal: AbortSignal.timeout(15000)
    });
    if (!upstream.ok) return send(res, 502, { error: "Layanan metadata TikTok sedang tidak tersedia.", upstream_status: upstream.status });
    const json = await upstream.json();
    if (json.code !== 0 || !json.data) return send(res, 422, { error: json.msg || "Video tidak ditemukan, privat, atau tidak dapat diproses." });
    const d = json.data;
    const author = d.author || {};
    const absolute = value => {
      if (!value || typeof value !== "string") return null;
      try { return new URL(value, "https://www.tikwm.com").toString(); } catch { return null; }
    };
    const normalized = {
      id: String(d.id || d.video_id || ""), title: d.title || "", cover: absolute(d.cover),
      author_nickname: d.author_nickname || author.nickname || "",
      author_unique_id: d.author_unique_id || author.unique_id || "",
      author_avatar: absolute(d.author_avatar || author.avatar), region: d.region || "",
      duration: Number(d.duration) || 0, size: Number(d.size) || 0,
      play_count: Number(d.play_count) || 0, digg_count: Number(d.digg_count) || 0,
      comment_count: Number(d.comment_count) || 0, share_count: Number(d.share_count) || 0,
      collect_count: Number(d.collect_count) || 0, create_time: Number(d.create_time) || 0,
      play: absolute(d.play), hdplay: absolute(d.hdplay)
    };
    if (!normalized.id) return send(res, 502, { error: "Layanan metadata mengembalikan data yang tidak lengkap." });
    return send(res, 200, normalized);
  } catch (error) {
    return send(res, 502, { error: error.name === "TimeoutError" ? "Layanan metadata kehabisan waktu. Coba lagi." : "Tidak dapat menghubungi layanan metadata TikTok." });
  }
};