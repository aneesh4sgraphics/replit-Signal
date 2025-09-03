import { request } from "undici";
import * as iconv from "iconv-lite";
import { decode } from "html-entities";
import { JSDOM } from "jsdom";

const BYTE_LIMIT = 1_000_000; // 1 MB
const TIMEOUT_MS = 15_000;

export function normalizeURL(input: string): string {
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.toString();
  } catch {
    return input;
  }
}

export async function fetchURL(rawUrl: string) {
  const url = normalizeURL(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await request(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
    });

    if (res.statusCode < 200 || res.statusCode >= 400) {
      throw new Error(`Fetch failed with status ${res.statusCode}`);
    }

    // Size guard (stream read up to limit)
    const chunks: Uint8Array[] = [];
    let received = 0;
    for await (const chunk of res.body) {
      const c = chunk as Uint8Array;
      received += c.byteLength;
      if (received > BYTE_LIMIT) {
        throw new Error("Response too large");
      }
      chunks.push(c);
    }
    const buf = Buffer.concat(chunks);

    // Charset detection (very light)
    const contentType = res.headers["content-type"]?.toString() || "";
    const match = contentType.match(/charset=([^;]+)/i);
    const charset = (match?.[1] || "utf-8").trim().toLowerCase();
    const htmlRaw =
      charset === "utf-8" || charset === "utf8"
        ? buf.toString("utf8")
        : iconv.decode(buf, charset);

    const html = decode(htmlRaw, { level: "html5" });

    const finalUrl =
      (res.headers["content-location"] as string) ||
      (res.headers["x-final-url"] as string) ||
      url;

    return { finalUrl, contentType, html };
  } finally {
    clearTimeout(timer);
  }
}

export function findLikelyContactLink(html: string, baseUrl: string): string | null {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const anchors = Array.from(doc.querySelectorAll("a[href]")) as HTMLAnchorElement[];
    const candidates = anchors
      .filter((a) => {
        const txt = (a.textContent || "").toLowerCase();
        const href = a.getAttribute("href")?.toLowerCase() || "";
        return /contact|about|impressum/.test(txt) || /contact|about|impressum/.test(href);
      })
      .map((a) => a.getAttribute("href") || "")
      .filter(Boolean)
      .slice(0, 5);

    const base = new URL(baseUrl);
    for (const c of candidates) {
      try {
        const u = new URL(c, base);
        if (u.origin === base.origin) return u.toString();
      } catch {/* ignore */}
    }
    return null;
  } catch {
    return null;
  }
}