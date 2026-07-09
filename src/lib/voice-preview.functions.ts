import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const VoiceInput = z.object({
  scenario: z.enum(["cafe", "clinic", "salon", "studio"]),
  message: z.string().trim().min(2).max(280),
  businessName: z.string().trim().min(1).max(60).optional().default("your business"),
});

const SYSTEM = `You are Crixy — a warm, concise voice AI assistant working on behalf of a small business.
Reply in ONE short spoken paragraph (2-4 sentences, under 60 words). Sound natural, friendly, and helpful.
Never mention that you are an AI. Never say "As an AI". Reply as if speaking on a phone call.`;

export type VoiceReplyResult = {
  reply: string;
  audioBase64: string | null;
  mime: string;
};

export const generateVoiceReply = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => VoiceInput.parse(raw))
  .handler(async ({ data }): Promise<VoiceReplyResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Voice preview is temporarily unavailable.");
    }

    const scenarioContext: Record<typeof data.scenario, string> = {
      cafe: `You handle calls for ${data.businessName}, a neighbourhood cafe. Take orders, answer menu questions, book tables.`,
      clinic: `You handle calls for ${data.businessName}, a small clinic. Book appointments, answer basic hours/location questions. Never give medical advice.`,
      salon: `You handle calls for ${data.businessName}, a hair & beauty salon. Book slots, quote basic prices, describe services.`,
      studio: `You handle calls for ${data.businessName}, a fitness studio. Book classes, describe schedules, answer membership questions.`,
    };

    // 1. Generate the text reply
    const chatRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${SYSTEM}\n\nContext: ${scenarioContext[data.scenario]}` },
          { role: "user", content: data.message },
        ],
      }),
    });

    if (!chatRes.ok) {
      const body = await chatRes.text();
      console.error("[voice-preview] chat failed", chatRes.status, body);
      if (chatRes.status === 429) throw new Error("Too many previews right now. Try again in a moment.");
      if (chatRes.status === 402) throw new Error("Voice preview quota reached. Try again later.");
      throw new Error("Couldn't generate a reply.");
    }

    const chatJson = (await chatRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = chatJson.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) throw new Error("Empty reply from voice model.");

    // 2. Synthesize audio
    let audioBase64: string | null = null;
    let mime = "audio/mpeg";
    try {
      const ttsRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: reply,
          voice: "alloy",
          instructions:
            "Warm, professional, natural cadence — like a friendly receptionist answering the phone.",
          response_format: "mp3",
        }),
      });

      if (ttsRes.ok) {
        const buf = new Uint8Array(await ttsRes.arrayBuffer());
        // base64 encode
        let binary = "";
        for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
        audioBase64 = btoa(binary);
        mime = ttsRes.headers.get("content-type") ?? "audio/mpeg";
      } else {
        console.warn("[voice-preview] tts failed", ttsRes.status, await ttsRes.text());
      }
    } catch (err) {
      console.warn("[voice-preview] tts error", err);
    }

    return { reply, audioBase64, mime };
  });
