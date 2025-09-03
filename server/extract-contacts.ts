import { JSDOM } from "jsdom";

export type Contact = {
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  email?: string;
  sourceHint?: string;
  confidence: number; // 0..1
  rawSnippet?: string;
};

const US_STATES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa",
  KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland",
  MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi",
  MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire",
  NJ:"New Jersey", NM:"New Mexico", NY:"New York", NC:"North Carolina",
  ND:"North Dakota", OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania",
  RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota", TN:"Tennessee",
  TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia", WA:"Washington",
  WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming", DC:"District of Columbia",
};

const STATE_NAMES = new Map(Object.entries(US_STATES).map(([abbr, name]) => [name.toLowerCase(), abbr]));

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const ZIP_RE = /\b\d{5}(?:-\d{4})?\b/;

function textFrom(node: Element | Document): string {
  return (node.textContent || "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}

function normState(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input.trim();
  const up = s.toUpperCase();
  if (US_STATES[up]) return up;
  const byName = STATE_NAMES.get(s.toLowerCase());
  return byName || undefined;
}

function parseJSONLD(doc: Document): Contact | null {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const s of scripts) {
    try {
      const raw = s.textContent?.trim();
      if (!raw) continue;
      const json = JSON.parse(raw);
      const arr = Array.isArray(json) ? json : [json];
      for (const node of arr) {
        const t = node["@type"];
        if (!t) continue;
        const types = Array.isArray(t) ? t : [t];
        if (types.map((x: string) => x.toLowerCase()).includes("organization")) {
          const out: Contact = { confidence: 0.9, sourceHint: "JSON-LD" };
          out.company = node.name || node.legalName || node.alternateName;
          const addr = node.address;
          if (addr && (addr["@type"] === "PostalAddress" || addr.streetAddress)) {
            out.address1 = addr.streetAddress || undefined;
            out.city = addr.addressLocality || undefined;
            out.state = normState(addr.addressRegion);
            out.zip = addr.postalCode || undefined;
            out.country = addr.addressCountry?.name || addr.addressCountry || undefined;
          }
          if (!out.email && node.email) out.email = node.email;
          const cp = node.contactPoint;
          if (!out.email && cp) {
            const cpa = Array.isArray(cp) ? cp : [cp];
            const first = cpa.find((x: any) => x.email);
            if (first) out.email = first.email;
          }
          if (out.company || out.address1 || out.email) return out;
        }
      }
    } catch {/* ignore parse errors */}
  }
  return null;
}

function parseMicroformats(doc: Document): Contact | null {
  // Very light: look for address itemtypes or h-card class
  const addrNodes = Array.from(
    doc.querySelectorAll('[itemtype*="PostalAddress"], .h-card, address')
  );
  for (const el of addrNodes) {
    const txt = textFrom(el);
    const email = txt.match(EMAIL_RE)?.[0];
    const zip = txt.match(ZIP_RE)?.[0];
    let state: string | undefined;
    const parts = txt.split(/[,|\n]/).map((s) => s.trim()).filter(Boolean);
    // Try to find state: either 2-letter or by name
    for (const p of parts) {
      const n = normState(p);
      if (n) { state = n; break; }
    }
    if (zip || state || email) {
      const c: Contact = { confidence: 0.75, sourceHint: "Microformats", rawSnippet: txt };
      c.email = email || undefined;
      c.zip = zip || undefined;
      c.state = state || undefined;
      // Naive address slicing
      c.company = parts[0] && parts[0].length < 80 ? parts[0] : undefined;
      c.city = parts.find((p) => p !== c.company && p.length < 60 && !EMAIL_RE.test(p) && p !== c.state) || undefined;
      return c;
    }
  }
  return null;
}

function parseFooterHeuristic(doc: Document): Contact | null {
  const footer = doc.querySelector("footer, #footer, .footer, [role='contentinfo']") || doc.body;
  const txt = textFrom(footer);
  const email = txt.match(EMAIL_RE)?.[0];
  const zip = txt.match(ZIP_RE)?.[0];

  // Try to pick a line cluster around the zip
  const lines = (footer.textContent || "").split(/\n|<br\s*\/?>/i).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  let idx = -1;
  if (zip) {
    idx = lines.findIndex((l) => ZIP_RE.test(l));
  }
  const windowLines = idx >= 0 ? lines.slice(Math.max(0, idx - 2), idx + 2) : lines.slice(0, 4);
  const cluster = windowLines.join(", ");

  // Guess company as a short line near the top of the cluster
  let company: string | undefined = undefined;
  for (const l of windowLines) {
    if (l.length >= 3 && l.length <= 80 && !EMAIL_RE.test(l)) {
      company = l;
      break;
    }
  }

  // Extract potential city/state from cluster
  let state: string | undefined;
  const parts = cluster.split(/[,\-–•|]/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const n = normState(p);
    if (n) { state = n; break; }
  }

  const c: Contact = {
    confidence: (zip ? 0.62 : 0.5) + (email ? 0.08 : 0),
    sourceHint: "Footer",
    rawSnippet: cluster || txt.slice(0, 240),
    company, zip, state, email
  };

  // Best effort: split possible address1/address2
  if (parts.length >= 2) {
    c.address1 = parts[0];
    c.city = parts.find((p) => p !== c.address1 && p !== c.state && !EMAIL_RE.test(p) && !ZIP_RE.test(p));
  }
  return c;
}

function fillCountry(c: Contact, baseUrl: string) {
  if (c.country) return;
  try {
    const u = new URL(baseUrl);
    if (u.hostname.endsWith(".us")) c.country = "United States";
    if (!c.country && c.zip && /^\d/.test(c.zip)) c.country = "United States";
  } catch {/* ignore */}
}

export function extractFromHTML(html: string, baseUrl: string): { primary: Contact; alternatives: Contact[] } {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const candidates: Contact[] = [];

  const a = parseJSONLD(doc);
  if (a) { fillCountry(a, baseUrl); candidates.push(a); }

  const b = parseMicroformats(doc);
  if (b) { fillCountry(b, baseUrl); candidates.push(b); }

  const c = parseFooterHeuristic(doc);
  if (c) { fillCountry(c, baseUrl); candidates.push(c); }

  // Pick primary by confidence
  candidates.sort((x, y) => y.confidence - x.confidence);
  const primary = candidates[0] || { confidence: 0, sourceHint: "None" };
  const alternatives = candidates.slice(1, 3);

  // Ensure rawSnippet for low confidence
  if (primary.confidence < 0.8 && !primary.rawSnippet) {
    primary.rawSnippet = doc.body ? doc.body.textContent?.slice(0, 400)?.replace(/\s+/g, " ").trim() : undefined;
  }

  return { primary, alternatives };
}