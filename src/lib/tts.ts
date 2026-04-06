import { GoogleGenAI, Modality } from "@google/genai";

export async function speak(text: string) {
  console.log("Attempting to speak:", text);
  
  // Try Gemini TTS first
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `請用親切、緩慢且清晰的廣東話朗讀：${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      console.log("Gemini TTS success");
      const audioSrc = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioSrc);
      await audio.play();
      return;
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }

  // Fallback to Web Speech API
  console.log("Falling back to Web Speech API");
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-HK';
  utterance.rate = 0.8; // Slower for SEN students
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
