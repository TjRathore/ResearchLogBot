import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key"
});

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

export interface ProblemSolutionPair {
  problem: string;
  solution: string;
  confidence: number;
}

export async function extractProblemSolution(content: string): Promise<ProblemSolutionPair | null> {
  if (!isOpenAIConfigured) {
    console.log("OpenAI not configured, skipping extraction for:", content.substring(0, 50));
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an R&D group scribe. Given a chat message, extract exactly one problem and its corresponding solution, if present. 
          Only extract if there's a clear problem-solution relationship. Return JSON with this exact format:
          { "problem": "...", "solution": "...", "confidence": 0.85 }
          
          Confidence should be 0.0-1.0 based on how clear the problem-solution relationship is.
          Return null if no clear problem-solution pair exists.`
        },
        {
          role: "user",
          content: `Message: "${content}"`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.problem || !result.solution) {
      return null;
    }

    return {
      problem: result.problem,
      solution: result.solution,
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("Failed to extract problem-solution pair:", error);
    return null;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!isOpenAIConfigured) {
    console.log("OpenAI not configured, returning dummy embedding");
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw new Error("Failed to generate embedding: " + (error as Error).message);
  }
}

export async function generateAnswer(query: string, knowledgePairs: any[]): Promise<string> {
  if (!isOpenAIConfigured) {
    if (knowledgePairs.length === 0) {
      return "I couldn't find relevant information in the knowledge base. (Note: OpenAI is not configured)";
    }
    
    return `Based on the knowledge base, here are relevant solutions:\n\n${knowledgePairs.slice(0, 3).map((pair, i) => 
      `${i + 1}. **${pair.problem}**\n   ${pair.solution}`
    ).join('\n\n')}\n\n(Note: OpenAI is not configured for enhanced responses)`;
  }

  try {
    const context = knowledgePairs
      .map((pair, index) => `${index + 1}. Problem: ${pair.problem}\n   Solution: ${pair.solution}`)
      .join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant for a research team. Based on the knowledge base provided, answer the user's question comprehensively.
          
          If you find relevant information in the knowledge base, use it to provide a detailed answer.
          If the knowledge base doesn't contain relevant information, say so clearly and suggest what kind of information might be helpful.
          
          Format your response in a clear, structured way with bullet points or numbered lists when appropriate.`
        },
        {
          role: "user",
          content: `Question: ${query}

Knowledge Base:
${context}

Please provide a helpful answer based on this knowledge base.`
        }
      ],
    });

    return response.choices[0].message.content || "I couldn't generate an answer for your question.";
  } catch (error) {
    console.error("Failed to generate answer:", error);
    throw new Error("Failed to generate answer: " + (error as Error).message);
  }
}
