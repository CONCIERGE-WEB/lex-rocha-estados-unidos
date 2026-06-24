const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 8-character tracking code (no ambiguous 0/O/1/I). */
export function generateTrackingCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}
