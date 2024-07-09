"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";
interface Sentence {
    text: string;
    createdAt: Date;
    deviceIdentifier: string;
}
export async function validate(sentences: Sentence[], trimmedSentence: string) {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const story = sentences.map((sentence) => sentence.text).join(" ");
    const prompt = `
      You are a validator for a collaborative chain story. Your task is to determine if a new sentence fits seamlessly into the ongoing story. The story so far is: "${story}". The new sentence to evaluate is: "${trimmedSentence}". 
      Please assess the new sentence for:
      1. Coherence with the existing story.
      2. Logical continuity and relevance.
      3. Smooth flow from the last sentence.
      4. Make sure the sentence is always in English if not send appropriate message.
      5. Make sure the sentence doesn't repeat.
      
      IF the sentence can be added to the story, return a JSON response: {"isValid":"yes", "sentence":"correct ${trimmedSentence} for grammatical errors do not add extra stuff just correct the grammar", "updatedSummary":"short summary of the whole story including the current sentence. Make sure it is short and concise"}.
      IF the sentence cannot be added, return a JSON response: {"isValid":"no", "message":"short msg in 10 words"}.
    `;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonString = text.replace(/^```json\s*|```\s*$/g, '');
    const parsedJson = JSON.parse(jsonString.trim());
    return parsedJson;
}