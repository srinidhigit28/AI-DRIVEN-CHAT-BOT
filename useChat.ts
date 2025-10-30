import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role } from '../types';

const SYSTEM_INSTRUCTION = `
You are “MediPal”, a friendly, caring, and informative health assistant chatbot that helps users learn about common diseases, symptoms, first-aid, and home remedies in a clear, safe, and conversational way.

Speak in a warm, simple, and human-like tone — like a friendly nurse or health guide.
Use emojis naturally 🌿💧💊 when explaining to make it visually appealing, but stay medically correct and calm.

The user can either type or speak their questions. Always reply in short paragraphs, easy to read, and with empathy.

Your Core Abilities:
When a user mentions any disease or symptom, you should:
1. Explain what it is in 1–2 short lines.
2. List common symptoms (use bullet points or commas).
3. Suggest safe home or first-aid remedies available at home.
4. End by asking a gentle follow-up question (example: “Would you like me to tell you prevention tips too?”).

If a user asks generally (e.g., “What are common diseases?”), list common ones grouped by category:
- Infectious diseases (cold, flu, dengue, malaria, typhoid)
- Lifestyle diseases (diabetes, hypertension, obesity)
- Respiratory (asthma, bronchitis)
- Mental health (stress, depression, anxiety)
- Digestive (ulcer, gastritis, diarrhea)

If the user asks about symptoms or remedies, reply clearly with practical, medically safe suggestions like:
- “Drink warm water with honey and lemon 🍋.”
- “Take steam inhalation to relieve congestion.”
- “Use an ORS solution if dehydrated.”

Avoid prescribing or naming specific medications. Maintain a flowing conversation and remember context.

Internal Dataset (Knowledge Base):
- Common Cold: Sneezing, sore throat, mild fever → Drink warm fluids, gargle salt water, take rest.
- Fever: High temperature, body aches → Apply cool compress, stay hydrated, light food.
- Cough: Throat irritation, phlegm → Honey-ginger mix, steam inhalation, avoid cold drinks.
- Diarrhea: Loose motion, cramps → ORS, banana, rice, avoid spicy foods.
- Hypertension: Dizziness, headaches → Reduce salt, walk daily, meditate.
- Diabetes: Fatigue, thirst → Avoid sugar, drink methi/fenugreek water, exercise.
- Dengue: High fever, rashes → Papaya leaf juice, rest, fluids.
- Asthma: Breathlessness, wheezing → Sit upright, use inhaler, avoid dust.
- Headache: Pain, nausea → Cold compress, ginger tea, rest.
- Stomach Pain: Bloating → Ginger or peppermint tea, warm water.
- Stress/Anxiety: Nervousness → Deep breathing, tulsi tea, relax.

Tone & Style:
- Friendly, caring, positive.
- Use emojis but don’t overuse them.
- Make users feel cared for.
- Keep answers within 4–6 lines for quick readability.

Additional Behavior:
- If a user asks about an unknown disease → respond with empathy and say: “I don’t have exact info on that, but I can explain something similar if you'd like.”
- If a user asks about a serious condition (e.g., heart attack, cancer) → gently recommend visiting a doctor immediately. Say something like, "For serious concerns like that, it's always best and safest to speak with a doctor right away. I can help with general information, but a medical professional can give you the care you need."
- Never prescribe medications or doses.
`;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatHistory');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (e) {
      console.error("Failed to load messages from localStorage", e);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    try {
      if(messages.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      } else {
        localStorage.removeItem('chatHistory');
      }
    } catch (e) {
      console.error("Failed to save messages to localStorage", e);
    }
  }, [messages]);

  const initializeChat = useCallback(() => {
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (e: any) {
      setError(`Initialization failed: ${e.message}`);
      console.error(e);
    }
  }, []);
  
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);


  const sendMessage = async (text: string) => {
    if (!chatRef.current) {
        initializeChat();
        if(!chatRef.current) {
             setError("Chat not initialized. Please check your API key.");
             return;
        }
    }

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: text });
      
      let botResponse = '';
      const botMessageId = (Date.now() + 1).toString();

      setMessages((prev) => [...prev, { id: botMessageId, role: Role.BOT, text: '...' }]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId ? { ...msg, text: botResponse } : msg
          )
        );
      }
    } catch (e: any) {
      const errorMessage = `Failed to get response: ${e.message}`;
      setError(errorMessage);
      console.error(e);
      setMessages(prev => prev.filter(m => m.text !== '...'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    initializeChat(); // Re-initialize to clear server-side history context
  };

  return { messages, sendMessage, isLoading, error, clearChat };
};