import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { sendChatMessage, MAA_SYSTEM_INSTRUCTION } from '../services/gemini';
import { ChatMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Audio Helpers for Gemini Live ---

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] then scale to Int16 range
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return new Blob([int16], { type: 'audio/pcm' });
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MAAChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Text Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Greetings. I am the MAA System AI. How can I assist you with our safety protocols today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Mode State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // --- Text Chat Logic ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isVoiceMode) scrollToBottom();
  }, [messages, isOpen, isVoiceMode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(historyForApi, userMsg.text);
      
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Critical Error: Unable to reach satellite uplink.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- Voice Mode Logic ---

  const startVoiceSession = async () => {
    try {
      setIsVoiceMode(true);
      setIsVoiceConnected(false); // Connecting...

      // 1. Setup Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      outputContextRef.current = new AudioCtx({ sampleRate: 24000 });
      
      inputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current = outputContextRef.current.createGain();
      outputNodeRef.current.connect(outputContextRef.current.destination);

      // 2. Get Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Initialize Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: MAA_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            console.log('MAA Live Session Connected');
            setIsVoiceConnected(true);
            
            // Start streaming input
            if (!audioContextRef.current || !streamRef.current) return;
            
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Visualizer update
              let sum = 0;
              for (let i=0; i<inputData.length; i+=100) sum += Math.abs(inputData[i]);
              setVolumeLevel(sum / (inputData.length/100));

              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Encode(inputData) // Helper for base64
                    }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current && outputNodeRef.current) {
               const ctx = outputContextRef.current;
               const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const source = ctx.createBufferSource();
               source.buffer = buffer;
               source.connect(outputNodeRef.current);
               source.start(nextStartTimeRef.current);
               
               nextStartTimeRef.current += buffer.duration;
            }
          },
          onclose: () => {
            console.log('MAA Live Session Closed');
            setIsVoiceConnected(false);
          },
          onerror: (err) => {
            console.error('MAA Live Session Error', err);
            stopVoiceSession();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start voice session", error);
      setIsVoiceMode(false);
    }
  };
  
  // Helper to base64 encode raw float32 for sending (alternative to Blob if SDK expects specific format)
  // The prompt example uses `session.sendRealtimeInput({ media: pcmBlob })`.
  // But standard `createBlob` returns a Blob object.
  // Let's stick to the prompt example strictly.
  // Wait, prompt example: `session.sendRealtimeInput({ media: pcmBlob });` 
  // where `createBlob` returns `{ data: base64string, mimeType: ... }`
  // I need to adjust `createBlob` to match the prompt's expected return type if I use it that way.
  
  // Let's redefine createBlob to match prompt exactly:
  function createLivePayload(data: Float32Array) {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      let binary = '';
      const bytes = new Uint8Array(int16.buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      return {
        data: base64,
        mimeType: 'audio/pcm;rate=16000'
      };
  }
  
  // Re-implement logic with correct payload helper
  const startVoiceSessionCorrected = async () => {
    setIsVoiceMode(true);
    setIsVoiceConnected(false);
    setIsOpen(true);

    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioCtx({ sampleRate: 16000 });
        audioContextRef.current = inputCtx;
        
        const outCtx = new AudioCtx({ sampleRate: 24000 });
        outputContextRef.current = outCtx;
        outputNodeRef.current = outCtx.createGain();
        outputNodeRef.current.connect(outCtx.destination);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            systemInstruction: MAA_SYSTEM_INSTRUCTION
          },
          callbacks: {
            onopen: () => {
               setIsVoiceConnected(true);
               const source = inputCtx.createMediaStreamSource(stream);
               const processor = inputCtx.createScriptProcessor(4096, 1, 1);
               processorRef.current = processor;
               
               processor.onaudioprocess = (e) => {
                   const inputData = e.inputBuffer.getChannelData(0);
                   // Calculate volume for visualizer
                   let sum = 0;
                   for(let i=0; i<inputData.length; i+=50) sum += Math.abs(inputData[i]);
                   setVolumeLevel(sum / (inputData.length/50));
                   
                   const payload = createLivePayload(inputData);
                   sessionPromise.then(session => session.sendRealtimeInput({ media: payload }));
               };
               
               source.connect(processor);
               processor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
               const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
               if (data && outputContextRef.current) {
                   const ctx = outputContextRef.current;
                   // Simple decode
                   const binary = atob(data);
                   const bytes = new Uint8Array(binary.length);
                   for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
                   
                   const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
                   
                   nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                   const source = ctx.createBufferSource();
                   source.buffer = buffer;
                   source.connect(outputNodeRef.current!);
                   source.start(nextStartTimeRef.current);
                   nextStartTimeRef.current += buffer.duration;
               }
            },
            onclose: () => {
               console.log("Closed");
               setIsVoiceConnected(false);
            },
            onerror: (e) => {
               console.error(e);
            }
          }
        });
        sessionPromiseRef.current = sessionPromise;
    } catch (err) {
        console.error(err);
        setIsVoiceMode(false);
    }
  };

  const stopVoiceSession = () => {
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
    }
    setIsVoiceMode(false);
    setIsVoiceConnected(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopVoiceSession();
  }, []);

  // Function to handle base64 encoding helper locally
  function base64Encode(data: Float32Array) { 
      // ... implemented inside createLivePayload
      return ""; 
  }

  return (
    <>
      {/* Voice Trigger Button */}
      <button
        onClick={() => isVoiceMode ? stopVoiceSession() : startVoiceSessionCorrected()}
        className={`fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-110 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'} bg-emerald-500 text-white`}
        title="Voice Mode"
      >
        {isVoiceMode ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Main Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'bg-sky-500 text-white scale-100 opacity-100'}`}
      >
        <Bot size={28} />
      </button>

      {/* Chat Interface */}
      <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm sm:w-[400px] h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right border-sky-500/30 shadow-2xl ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-sky-900/50 p-4 flex justify-between items-center border-b border-white/10 relative z-20">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="text-sky-400" size={24} />
              <span className={`absolute top-0 right-0 w-2 h-2 rounded-full animate-pulse ${isVoiceConnected ? 'bg-emerald-500' : 'bg-green-500'}`}></span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-sm">MAA Assistant</h3>
              <p className="text-[10px] text-sky-300 uppercase tracking-widest">{isVoiceMode ? (isVoiceConnected ? 'Voice Uplink Active' : 'Connecting...') : 'Text System Online'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isVoiceMode && (
                <button onClick={startVoiceSessionCorrected} className="p-2 rounded-full hover:bg-white/10 text-sky-300 transition-colors" title="Switch to Voice">
                    <Mic size={18} />
                </button>
            )}
            <button onClick={() => { setIsOpen(false); if(isVoiceMode) stopVoiceSession(); }} className="text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-black/40">
            
            {isVoiceMode ? (
                // VOICE MODE UI
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative mb-8">
                        {/* Pulsing Visualizer */}
                        <div 
                            className="w-32 h-32 rounded-full bg-sky-500/20 flex items-center justify-center transition-all duration-75 ease-linear"
                            style={{ transform: `scale(${1 + volumeLevel * 5})` }}
                        >
                             <div className="w-24 h-24 rounded-full bg-sky-500/40 flex items-center justify-center blur-md"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <Volume2 size={40} className={`text-white ${isVoiceConnected ? 'opacity-100' : 'opacity-50'}`} />
                        </div>
                        
                        {/* Rings */}
                        <div className="absolute inset-0 border border-sky-500/30 rounded-full animate-[ping_3s_linear_infinite]"></div>
                        <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_2s_linear_infinite] delay-75"></div>
                    </div>
                    
                    <h4 className="text-xl font-serif text-white mb-2">{isVoiceConnected ? "Listening..." : "Establishing Uplink..."}</h4>
                    <p className="text-slate-400 text-sm">Speak naturally. MAA is listening.</p>
                    
                    <button 
                        onClick={stopVoiceSession}
                        className="mt-12 px-6 py-2 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-xs uppercase tracking-widest"
                    >
                        End Voice Session
                    </button>
                </div>
            ) : (
                // TEXT MODE UI
                <div className="p-4 space-y-4 h-full overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed font-light ${
                        msg.role === 'user' 
                          ? 'bg-sky-600 text-white rounded-br-none' 
                          : 'bg-slate-800/90 text-slate-200 border border-white/10 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/80 p-3 rounded-xl rounded-bl-none border border-white/10 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-sky-400" />
                        <span className="text-xs text-slate-400">Processing data...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
            )}
        </div>

        {/* Input Area (Hidden in Voice Mode) */}
        {!isVoiceMode && (
            <div className="p-3 bg-slate-900/90 border-t border-white/10 backdrop-blur-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about safety protocols..."
                  className="w-full bg-slate-950/50 text-white border border-white/10 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 placeholder-slate-500 text-sm transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-sky-600 rounded-full text-white hover:bg-sky-500 disabled:opacity-50 disabled:hover:bg-sky-600 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
        )}
      </div>
    </>
  );
};

export default MAAChatBot;