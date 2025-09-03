import React from "react";
import { normalizeState, normalizeCountry, isValidUSZip } from "@/lib/geo";

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

type Props = {
  value: Contact;
  onChange: (c: Contact) => void;
  alternatives: Contact[];
};

export default function ContactForm({ value, onChange, alternatives }: Props) {
  function update<K extends keyof Contact>(key: K, v: Contact[K]) {
    onChange({ ...value, [key]: v as any });
  }

  function normalize() {
    const state = normalizeState(value.state);
    const country = normalizeCountry(value.country);
    const zip = value.zip?.trim();
    onChange({ ...value, state, country, zip });
  }

  function toText() {
    const lines = [
      value.company,
      [value.address1, value.address2].filter(Boolean).join(", "),
      [value.city, value.state, value.zip].filter(Boolean).join(", "),
      value.country,
      value.email ? `Email: ${value.email}` : undefined,
    ].filter(Boolean);
    return lines.join("\n");
  }

  function download(name: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-4">
      {/* Confidence & Alternatives */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-sm ${value.confidence >= 0.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          Confidence: {(value.confidence * 100).toFixed(0)}% {value.sourceHint ? `• ${value.sourceHint}` : ""}
        </span>

        {alternatives.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Alternatives:</span>
            <select
              className="border rounded px-2 py-1"
              onChange={(e) => {
                const idx = Number(e.target.value);
                if (!Number.isNaN(idx)) onChange(alternatives[idx]);
              }}
            >
              <option value="">Select…</option>
              {alternatives.map((alt, i) => (
                <option key={i} value={i}>
                  {(alt.sourceHint || "Alt")} · {(alt.confidence * 100).toFixed(0)}%
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {value.confidence < 0.8 && value.rawSnippet && (
        <div className="border rounded p-3 bg-amber-50 text-amber-900">
          <div className="font-medium mb-1">We're not fully sure. Here's the text we think contains the details—please confirm:</div>
          <div className="text-sm whitespace-pre-wrap">{value.rawSnippet}</div>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Company</span>
          <input className="border rounded px-2 py-1" value={value.company || ""} onChange={(e) => update("company", e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Email</span>
          <input className="border rounded px-2 py-1" value={value.email || ""} onChange={(e) => update("email", e.target.value)} />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-gray-600 mb-1">Address 1</span>
          <input className="border rounded px-2 py-1" value={value.address1 || ""} onChange={(e) => update("address1", e.target.value)} />
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-gray-600 mb-1">Address 2</span>
          <input className="border rounded px-2 py-1" value={value.address2 || ""} onChange={(e) => update("address2", e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">City</span>
          <input className="border rounded px-2 py-1" value={value.city || ""} onChange={(e) => update("city", e.target.value)} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">State (US)</span>
          <input className="border rounded px-2 py-1" value={value.state || ""} onChange={(e) => update("state", e.target.value)} onBlur={normalize} />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Zip</span>
          <input className="border rounded px-2 py-1" value={value.zip || ""} onChange={(e) => update("zip", e.target.value)} onBlur={normalize} />
          {value.country?.toLowerCase() === "united states" && value.zip && !isValidUSZip(value.zip) && (
            <span className="text-xs text-red-600 mt-1">Invalid US ZIP</span>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">Country</span>
          <input className="border rounded px-2 py-1" value={value.country || ""} onChange={(e) => update("country", e.target.value)} onBlur={normalize} />
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={normalize}>Normalize</button>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => navigator.clipboard.writeText(toText())}
        >
          Copy
        </button>
        <button className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-black" onClick={() => download("contact.txt", toText(), "text/plain")}>
          Download .TXT
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-black"
          onClick={() => download("contact.md", `# ${value.company || "Company"}\n\n${toText()}\n`, "text/markdown")}
        >
          Download .MD
        </button>
      </div>
    </div>
  );
}