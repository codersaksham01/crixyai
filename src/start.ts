import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const CANONICAL_HOST = "usecrixy.com";

// Keep every public URL on the HTTPS canonical host. Preview subdomains
// (id-preview--*, project--*-dev) are intentionally excluded so in-editor
// previews and dev URLs keep working.
const canonicalHostMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const isLovableApp = host.endsWith(".lovable.app");
    const isPreview = host.startsWith("id-preview--") || host.includes("-dev.lovable.app");
    const isPublicHost = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
    const shouldRedirect =
      (isPublicHost && (url.protocol !== "https:" || host !== CANONICAL_HOST)) ||
      (isLovableApp && !isPreview && host !== CANONICAL_HOST);

    if (shouldRedirect) {
      const target = `https://${CANONICAL_HOST}${url.pathname}${url.search}`;
      return new Response(null, {
        status: 301,
        headers: {
          location: target,
          "cache-control": "public, max-age=3600",
        },
      });
    }
  } catch {
    // fall through to normal handling
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [canonicalHostMiddleware, errorMiddleware],
}));
