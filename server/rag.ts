import fs from "fs";
import path from "path";
import OpenAI from "openai";

type Chunk = { 
  id: string; 
  file: string; 
  pageHint?: number; 
  text: string;
};

let chunks: Chunk[] = [];
let bm25: any = null;
let isIndexLoaded = false;

// Load the search index
function loadIndex() {
  if (isIndexLoaded) return true;
  
  try {
    const chunksPath = path.join(process.cwd(), "data/index/chunks.json");
    const bm25Path = path.join(process.cwd(), "data/index/bm25.json");
    
    if (!fs.existsSync(chunksPath) || !fs.existsSync(bm25Path)) {
      console.log("Search index not found. Please run: npx ts-node scripts/ingest.ts");
      return false;
    }
    
    chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));
    const bm25Json = JSON.parse(fs.readFileSync(bm25Path, "utf-8"));
    
    const bm25Lib = require("wink-bm25-text-search");
    bm25 = bm25Lib();
    bm25.importJSON(bm25Json);
    
    isIndexLoaded = true;
    console.log(`Loaded search index with ${chunks.length} chunks`);
    return true;
  } catch (error) {
    console.error("Error loading search index:", error);
    return false;
  }
}

export function localSearch(query: string, k = 5): (Chunk & { score: number })[] {
  if (!loadIndex()) {
    return [];
  }
  
  try {
    const hits = bm25.search(query).slice(0, k);
    const byId = new Map(chunks.map(c => [c.id, c]));
    
    return hits.map((h: any) => {
      const c = byId.get(h[0]);
      return c ? { ...c, score: h[1] } : null;
    }).filter(Boolean) as (Chunk & { score: number })[];
  } catch (error) {
    console.error("Error in local search:", error);
    return [];
  }
}

// Build a local answer without OpenAI
export function buildLocalAnswer(query: string) {
  const top = localSearch(query, 5);
  
  if (!top.length) {
    return {
      message: "I couldn't find any matching information in our troubleshooting documents. Please try rephrasing your question or check the Price List and Quote Calculator for product information.",
      sources: []
    };
  }

  // Compose a helpful response with excerpts
  const bullets = top.map((t, i) => {
    const excerpt = t.text.slice(0, 450).replace(/\s+/g, " ").trim();
    return `${i + 1}. **${t.file}** (page ${t.pageHint ?? "?"})\n   "${excerpt}..."`;
  }).join("\n\n");

  const message = `Based on our troubleshooting documentation:\n\n${bullets}\n\n*Note: This is a local search result. For more detailed answers, ensure OpenAI API credits are available.*`;

  const sources = top.map(t => ({ 
    file: t.file, 
    page: t.pageHint ?? null,
    score: t.score 
  }));
  
  return { message, sources };
}

// Try OpenAI first, fallback to local search
export async function hybridRAG(
  query: string, 
  conversationHistory: any[] = [],
  openaiApiKey?: string
): Promise<{ message: string; sources: any[] }> {
  
  // First, always do local search to get context
  const searchResults = localSearch(query, 5);
  const hasLocalResults = searchResults.length > 0;
  
  // Build context from search results
  let contextData = "";
  if (hasLocalResults) {
    contextData = "\n\nRelevant Troubleshooting Documentation:\n";
    searchResults.forEach((result, i) => {
      contextData += `\n${i + 1}. From "${result.file}" (page ${result.pageHint ?? "?"}):`;
      contextData += `\n   ${result.text.slice(0, 500).replace(/\s+/g, " ")}...\n`;
    });
  }
  
  // Try OpenAI if we have an API key
  if (openaiApiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      
      const systemMessage = `You are a helpful assistant for 4S Graphics. You answer questions based on the provided troubleshooting documentation context.
      
${contextData}

Important rules:
1. Answer ONLY based on the provided context
2. If the context doesn't contain the answer, say so clearly
3. Be concise and helpful
4. Reference the source document when possible`;

      const userPrompt = `User Question: ${query}\n\nProvide a helpful answer based only on the context above.`;
      
      const messages = [
        { role: "system" as const, content: systemMessage },
        ...(conversationHistory || []).slice(-4).map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: "user" as const, content: userPrompt }
      ];
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: messages,
        max_tokens: 500,
        temperature: 0.2,
      });
      
      const answer = response.choices[0].message.content || "I couldn't generate a response.";
      
      return {
        message: answer,
        sources: searchResults.map(r => ({
          file: r.file,
          page: r.pageHint,
          relevance: Math.round(r.score * 100)
        }))
      };
      
    } catch (error: any) {
      console.log("OpenAI API failed, falling back to local search:", error.code || error.message);
      // Fall through to local answer
    }
  }
  
  // Fallback to local answer
  return buildLocalAnswer(query);
}

// Check if troubleshooting PDFs are available
export function hasTroubleshootingDocs(): boolean {
  return loadIndex() && chunks.length > 0;
}