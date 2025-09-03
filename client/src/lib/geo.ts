export const US_STATES: Record<string, string> = {
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

export function normalizeState(input?: string) {
  if (!input) return undefined;
  const s = input.trim();
  const up = s.toUpperCase();
  if (US_STATES[up]) return up;
  const byName = STATE_NAMES.get(s.toLowerCase());
  return byName || undefined;
}

export function normalizeCountry(input?: string) {
  if (!input) return undefined;
  const s = input.trim().toLowerCase();
  if (["usa", "u.s.a.", "united states", "united states of america", "us", "u.s."].includes(s)) {
    return "United States";
  }
  return input.trim();
}

export function isValidUSZip(zip?: string) {
  if (!zip) return false;
  return /^\d{5}(?:-\d{4})?$/.test(zip.trim());
}