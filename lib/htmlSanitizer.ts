// Very light sanitizer: strips <script> tags. (OK for assignment demo; for production use a robust sanitizer)
export function stripDangerous(html: string): string {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  }
  