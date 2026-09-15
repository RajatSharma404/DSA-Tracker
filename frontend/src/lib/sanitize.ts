import DOMPurify from "dompurify";

/**
 * Sanitizes an HTML string to protect against Stored and Reflected XSS attacks.
 * Safe for client-side rendering via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";

  if (typeof window === "undefined") {
    // Basic server-side sanitization fallback
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
  }

  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
