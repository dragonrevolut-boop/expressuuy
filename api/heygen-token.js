export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // vérif variable env
    if (!process.env.HEYGEN_API_KEY) {
      return res.status(500).json({ error: "Missing HEYGEN_API_KEY env var" });
    }

    const r = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.HEYGEN_API_KEY,
      },
      body: JSON.stringify({}),
    });

    const text = await r.text(); // on lit en texte pour voir l’erreur exacte

    return res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      heygen_raw: text,
    });
  } catch (e) {
    return res.status(500).json({
      error: "Fetch failed",
      message: String(e?.message || e),
    });
  }
}
