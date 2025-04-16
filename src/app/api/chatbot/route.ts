import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // System prompt for legal assistant
    const systemPrompt = `You are an AI legal assistant, expertly trained in analyzing and explaining Indian law, particularly the Indian Penal Code (IPC) and the Indian legal system. Your primary functions are:

1. Explaining legal concepts from the Indian legal system in clear, concise terms.
2. Providing information about IPC sections and their interpretations.
3. Answering general questions about Indian legal procedures and rights.
4. Clarifying legal terminology used in Indian courts.
5. Providing general legal information (but not specific legal advice).

When responding:
- Use clear, professional language, but explain legal terms when necessary.
- Keep responses focused on Indian law and the IPC.
- If asked about specific legal advice, remind the user that you're an AI assistant and recommend consulting with a qualified legal professional.
- Keep responses concise and to the point, under 200 words unless more detail is necessary.`;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Start a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Generate response
    const result = await chat.sendMessage([
      { text: systemPrompt + "\n\n" + message },
    ]);
    const aiResponse = result.response.text();

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
