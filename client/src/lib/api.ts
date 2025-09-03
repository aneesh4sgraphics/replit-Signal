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
  confidence: number;
  rawSnippet?: string;
};

export async function fetchAndExtract(url: string): Promise<{
  primary: Contact;
  alternatives: Contact[];
  finalUrl: string;
}> {
  const f = await fetch("/api/fetch-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!f.ok) throw new Error("Fetch failed");
  const data = await f.json();
  const baseUrl = data?.main?.finalUrl || url;

  const e = await fetch("/api/extract-contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mainHtml: data?.main?.html,
      contactHtml: data?.contact?.html,
      baseUrl,
    }),
  });
  if (!e.ok) throw new Error("Extract failed");
  const parsed = await e.json();

  return { primary: parsed.primary, alternatives: parsed.alternatives, finalUrl: baseUrl };
}