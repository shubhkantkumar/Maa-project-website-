import { GoogleGenAI } from "@google/genai";

export const MAA_SYSTEM_INSTRUCTION = `
You are the AI Assistant for "MAA - Mindful Auto Alert", a revolutionary safety project.
Your tone is protective, advanced, professional, and empathetic (like a mother figure combined with a top-tier engineer).

Project Details you must know:
1. Mission: "Every Life Matters. Every Second Counts."
2. Core Tech: Satellite chips, IoT sensors, AI prediction, Drone deployment.
3. Key Features: 
   - Satellite + Drone Auto-Rescue (Autonomous flight to accident spots).
   - Human Vital Tracking Chip (Heart rate, temp, fall detection).
   - Earthquake/Disaster Alerts (Gas, Fire, Shock sensors).
   - Offline Mode (LoRaWAN for rural areas).
   - AI Behavior Prediction (Predicts accidents before they happen).
   - BlackBox System (Secure data recording).
   - Global ID (NFC/QR for instant identification).
   - <5 Second Alert time.

If asked about how to build these, provide high-level engineering guidance suitable for a college innovation project.
Keep answers concise (under 150 words) unless asked for detailed technical specs.
Always emphasize the "Life Saving" aspect.
`;

export const sendChatMessage = async (history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    // Initialize client inside function to ensure we use the latest API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: MAA_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster chat response
      },
      history: history,
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I am currently calibrating my sensors. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Connection to MAA Mainframe unstable. Please check your network or API key.";
  }
};

export const generatePromoVideo = async (): Promise<string | null> => {
  try {
    // Create a new instance for the Veo operation to ensure fresh config if needed
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    console.log("Starting Veo generation...");
    
    let operation = await videoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic trailer for advanced safety technology. A futuristic transparent car driving safely, a medical drone flying overhead with red cross, satellite data connecting everything. Blue and white neon aesthetic, clean, high tech. Text overlay: "Every Life Matters". Photorealistic, 4k.',
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    console.log("Video operation started", operation);

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      console.log("Polling video status...");
      operation = await videoAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      console.error("No video URI returned");
      return null;
    }

    // Fetch the video content securely using the API key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download video bytes");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo Video Generation Error:", error);
    throw error; // Propagate error to UI
  }
};