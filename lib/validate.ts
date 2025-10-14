export function requireNonEmptyString(s: unknown, name: string): string {
    if (typeof s !== "string" || !s.trim()) throw new Error(`${name} required`);
    return s.trim();
  }
  