import fs from "fs";
import path from "path";

type Chunk = { id: string; file: string; pageHint?: number; text: string };

let chunks: Chunk[] = [];
let bm25: any = null;
let isLoaded = false;

// Load index on first use
function loadIndex() {
  if (isLoaded) return true;
  
  try {
    const chunksPath = path.join(process.cwd(), "data/index/chunks.json");
    const bm25Path = path.join(process.cwd(), "data/index/bm25.json");
    
    if (!fs.existsSync(chunksPath) || !fs.existsSync(bm25Path)) {
      console.log("Search index not found. Please run: npx tsx scripts/ingest.ts");
      return false;
    }
    
    chunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));
    const bm25Json = JSON.parse(fs.readFileSync(bm25Path, "utf-8"));
    
    // Use dynamic import for ES modules
    const bm25Lib = require("wink-bm25-text-search");
    bm25 = bm25Lib();
    
    // Define same preprocessing as ingest
    const winkUtils = require("wink-nlp-utils");
    bm25.defineConfig({ fldWeights: { text: 1 } });
    bm25.definePrepTasks([
      winkUtils.string.lowerCase,
      winkUtils.string.removePunctuations,
      winkUtils.string.tokenize0,
      winkUtils.tokens.stem,
      winkUtils.tokens.removeWords
    ]);
    
    bm25.importJSON(bm25Json);
    isLoaded = true;
    return true;
  } catch (error) {
    console.error("Error loading search index:", error);
    return false;
  }
}

export function localSearch(query: string, k = 6): Chunk[] {
  if (!loadIndex()) return [];
  
  try {
    const hits = bm25.search(query).slice(0, k);
    const byId = new Map(chunks.map(c => [c.id, c]));
    return hits.map((h: any) => byId.get(h[0])).filter(Boolean) as Chunk[];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export function buildLocalAnswer(question: string) {
  const top = localSearch(question, 5);
  
  if (!top.length) {
    return { 
      message: "I couldn't find a relevant passage in the local docs.", 
      sources: [] as any[] 
    };
  }
  
  const bullets = top.map(t =>
    `• **${t.file}** (p${t.pageHint ?? "?"}):\n"${t.text.slice(0, 450).replace(/\s+/g," ")}"`
  ).join("\n\n");

  return {
    message: `Here's what I found in your TROUBLESHOOTING PDFs:\n\n${bullets}\n\n(Answer generated in **Local Mode**; enable OpenAI for a concise synthesis.)`,
    sources: top.map(t => ({ file: t.file, page: t.pageHint ?? null }))
  };
}