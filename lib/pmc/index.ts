// ASSUMPTION: Using Node crypto, runs only in server or Node tests.
import { createHash, randomBytes } from "crypto";
import { normalizeCrockford, b32EncodeBits20, mod3736Check } from "./crockford";

export type Tier = "F50" | "H1" | "FF";
export type Role = "X" | "A" | "B" | "C" | "D" | "E" | "F" | "G";

export function deriveNM2(firstName: string, lastName: string): string {
  // Get first letter of first name and first letter of last name
  const first = firstName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .charAt(0);
  
  const last = lastName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .charAt(0);
  
  // If either is missing, use X as fallback
  const firstLetter = first || 'X';
  const lastLetter = last || 'X';
  
  return firstLetter + lastLetter;
}

export function deriveSIG(dobYYYYMMDD: string, phoneLast6: string): string {
  const digits = `${dobYYYYMMDD}${phoneLast6}`.replace(/\D/g, "");
  const h = createHash("sha256").update(digits).digest();
  const n = (h[0] << 12) | (h[1] << 4) | (h[2] >> 4); // 20 bits
  return b32EncodeBits20(n);
}

export function randomRAND(): string {
  const b = randomBytes(3); // 24 bits
  const n = ((b[0] << 16) | (b[1] << 8) | b[2]) >>> 4; // top 20 bits
  return b32EncodeBits20(n);
}

export function buildCore(tier: Tier, nm2: string, sig: string, rand: string): { core: string; chk: string } {
  const T = tier.toUpperCase();
  const N = normalizeCrockford(nm2);
  const S = normalizeCrockford(sig);
  const R = normalizeCrockford(rand);
  const payload = `${T}${N}${S}${R}`;
  const chk = mod3736Check(payload);
  return { core: `${payload}${chk}`, chk };
}

export function formatDisplay(core: string, role: Role): string {
  const tier = core.slice(0, 3);
  const nm2 = core.slice(3, 5);
  const sig = core.slice(5, 9);
  const rand = core.slice(9, 13);
  const chk = core.slice(13, 14);
  return `${tier}${nm2}${sig}${rand}-${chk}-${role}`;
}

export function formatUrlSafe(core: string, role: Role): string {
  return `${core}${role}`;
}

export function parseUrlSafePmc(urlSafePmc: string): { core: string; role: Role } | null {
  // URL-safe format: CORE + ROLE (no separators)
  // Core is 14 characters: TIER(3) + NM2(2) + SIG(4) + RAND(4) + CHK(1)
  if (urlSafePmc.length !== 15) return null;
  
  const core = urlSafePmc.slice(0, 14);
  const role = urlSafePmc.slice(14, 15) as Role;
  
  return { core, role };
}

export function validatePMC(input: string): { ok: boolean; core?: string; role?: Role; reason?: "format" | "checksum" } {
  const match = input
    .toUpperCase()
    .trim()
    .match(/^([A-Z0-9]{2,3})([A-Z0-9]{2})([A-Z0-9]{4})([A-Z0-9]{4})[–-]([A-Z0-9])[-]([A-Z])$/);
  if (!match) return { ok: false, reason: "format" };
  const [, tier, nm2, sig, rand, chk, role] = match;
  try {
    const normalized = normalizeCrockford(`${tier}${nm2}${sig}${rand}${chk}`);
    const payload = normalized.slice(0, -1);
    const expect = mod3736Check(payload);
    if (expect !== normalized.slice(-1)) return { ok: false, reason: "checksum" };
    return { ok: true, core: normalized, role: role as Role };
  } catch {
    return { ok: false, reason: "format" };
  }
}


