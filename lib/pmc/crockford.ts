// ASSUMPTION: Crockford Base32 helpers per spec; reject U, map I/L→1 and O→0 on input.

export const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // no I L O U
const MAP = new Map(CROCKFORD.split("").map((c, i) => [c, i] as const));

export function normalizeCrockford(input: string): string {
  let s = input.toUpperCase().replace(/[\s\-–·.]/g, "");
  s = s.replace(/I/g, "1").replace(/L/g, "1").replace(/O/g, "0");
  if (/[U]/.test(s)) throw new Error("Invalid character U");
  return s;
}

export function b32EncodeBits20(n: number): string {
  // n is 0..(2^20-1), emit 4 chars
  let v = n >>> 0;
  const out = Array<string>(4);
  for (let i = 3; i >= 0; i--) {
    out[i] = CROCKFORD[v & 31];
    v >>>= 5;
  }
  return out.join("");
}

export function mod3736Check(dataBase32: string): string {
  // Crockford mod 37,36 checksum across base32 digits
  const MOD = 37;
  let m = 0;
  for (const ch of dataBase32) {
    const v = MAP.get(ch);
    if (v === undefined) throw new Error("Bad base32 char");
    m = (m * 32 + v) % MOD;
  }
  const DIGITS = CROCKFORD; // length 32
  const EXTRA = ["I", "L", "O", "U"]; // used to fill 33..36 only
  const val = m % 36;
  return val < DIGITS.length ? DIGITS[val] : EXTRA[val - DIGITS.length];
}


