// import { OpenAIApi, Configuration } from "openai-edge";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const config = new Configuration({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, ""),
//     });
//     const result = await response.json();
//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.log("error calling openai embeddings api", error);
//     throw error;
//   }
// }

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    // Remove newlines and get the embedding
    console.log(text)
    const result = await embeddingModel.embedContent(text.replace(/\n/g, " "));

    // Extract the embedding from the result
    const embedding = result.embedding;

    if (
      !embedding ||
      !Array.isArray(embedding.values) ||
      embedding.values.length === 0
    ) {
      throw new Error("Invalid embedding result");
    }

    return embedding.values;
  } catch (error) {
    console.error("Error calling Gemini embeddings API:", error);
    throw error;
  }
}
