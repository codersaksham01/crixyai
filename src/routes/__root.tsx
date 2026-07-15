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
      { name: "theme-color", content: "#000000" },
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "alternate", href: "https://usecrixy.com/", hrefLang: "en" },
      { rel: "alternate", href: "https://usecrixy.com/", hrefLang: "x-default" },
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
          "@id": "https://usecrixy.com/#organization",
          name: "Crixy AI",
          url: "https://usecrixy.com",
          logo: "https://usecrixy.com/favicon.ico",
          image: "https://usecrixy.com/og-crixy.jpg",
          description:
            "The all-in-one AI workspace to launch, market and grow your business.",
          telephone: "+91-89628-90425",
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
          },
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              telephone: "+91-89628-90425",
              areaServed: "Worldwide",
              availableLanguage: ["en"],
            },
          ],
          // sameAs helps Google connect the brand across platforms.
          // Update these URLs to the real profiles as they go live.
          sameAs: [
            "https://x.com/crixyai",
            "https://www.facebook.com/crixyai",
            "https://www.instagram.com/crixy.ai",
            "https://www.youtube.com/@crixyai",
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
          "@id": "https://usecrixy.com/#website",
          name: "Crixy AI",
          url: "https://usecrixy.com",
          publisher: { "@id": "https://usecrixy.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://usecrixy.com/blog?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://usecrixy.com/#localbusiness",
          name: "Crixy AI",
          url: "https://usecrixy.com",
          image: "https://usecrixy.com/og-crixy.jpg",
          telephone: "+91-89628-90425",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
          },
          areaServed: ["India", "United States", "United Kingdom", "Worldwide"],
          sameAs: [
            "https://x.com/crixyai",
            "https://www.facebook.com/crixyai",
            "https://www.instagram.com/crixy.ai",
            "https://www.youtube.com/@crixyai",
            "https://www.linkedin.com/company/crixy-ai",
          ],
        }),
      },
      // Google Analytics 4 (gtag.js) — async loader
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-PV4WWDB3CB",
        async: true,
      },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-PV4WWDB3CB');",
      },
      // Meta (Facebook) Pixel
      {
        children:
          "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2485142598654275');fbq('track','PageView');",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{const remove=()=>document.querySelectorAll('a[href*="lovable.dev"],[id*="lovable" i],[class*="lovable" i],[data-lovable]').forEach((el)=>el.remove());remove();new MutationObserver(remove).observe(document.documentElement,{childList:true,subtree:true});})();`,
          }}
        />
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            alt=""
            src="https://www.facebook.com/tr?id=2485142598654275&ev=PageView&noscript=1"
          />
        </noscript>
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
