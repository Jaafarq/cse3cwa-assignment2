export function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Expires=${expires}; SameSite=Lax`;
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie.split("; ").reduce<string | null>((r, v) => {
    const parts = v.split("=");
    return parts[0] === encodeURIComponent(name) ? decodeURIComponent(parts.slice(1).join("=")) : r;
  }, null);
}
