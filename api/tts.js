export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text || typeof text !== "string") return res.status(400).json({ error: "Missing text" });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID; // ex: "21m00Tcm4TlvDq8ikWAM"
  const baseUrl = "https://api.elevenlabs.io";

  if (!apiKey || !voiceId) {
    return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID" });
  }

  // 1) On demande à ElevenLabs un audio (mp3) (réponse binaire)
  const r = await fetch(`${baseUrl}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.85 },
    }),
  });

  if (!r.ok) {
    const err = await r.text();
    return res.status(r.status).send(err);
  }

  // 2) On renvoie un URL "blob" en base64 (simple pour commencer)
  const arrayBuffer = await r.arrayBuffer();
  const b64 = Buffer.from(arrayBuffer).toString("base64");
  const audioUrl = `data:audio/mpeg;base64,${b64}`;

  return res.status(200).json({ audioUrl });
}
