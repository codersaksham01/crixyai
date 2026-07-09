import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";

import { IntroOverlay } from "@/components/landing/IntroOverlay";
import { WaitlistProvider } from "@/components/landing/WaitlistDialog";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { StickyMiniCTA } from "@/components/landing/StickyMiniCTA";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Crixy AI" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Crixy AI" },
      { property: "og:image", content: "https://usecrixy.com/og-crixy.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Crixy AI — one AI workspace to launch, market and grow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@crixyai" },
      { name: "twitter:creator", content: "@crixyai" },
      { name: "twitter:image", content: "https://usecrixy.com/og-crixy.jpg" },
      { name: "twitter:image:alt", content: "Crixy AI — one AI workspace to launch, market and grow" },
      { name: "google-site-verification", content: "bFdtpaZ9j5XXnejaM6SWJWCAHGAuZ1vzkhZMmLq-DVE" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
      // Preconnect to the API origin so the first waitlist / stats call
      // skips DNS + TLS handshake time (measurable TTFB win on 4G).
      { rel: "preconnect", href: "https://fmbgxswdkmfdfjilcrol.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fmbgxswdkmfdfjilcrol.supabase.co" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter+Tight:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Crixy AI",
          url: "https://usecrixy.com",
          logo: "https://usecrixy.com/favicon.jpg",
          description:
            "The all-in-one AI workspace to launch, market and grow your business.",
          // sameAs helps Google connect the brand across platforms.
          // Update these URLs to the real profiles as they go live.
          sameAs: [
            "https://twitter.com/crixyai",
            "https://www.linkedin.com/company/crixy-ai",
            "https://www.linkedin.com/in/saksham-singh-ba591638a",
            "https://www.producthunt.com/products/crixy-ai",
          ],

        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Crixy AI",
          url: "https://usecrixy.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://usecrixy.com/blog?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        {/* Prevent theme flash: read saved theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('crixy-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WaitlistProvider>
          <IntroOverlay />
          
          <ScrollProgress />
          <Outlet />
          <StickyMiniCTA />
        </WaitlistProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
