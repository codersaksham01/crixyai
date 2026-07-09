import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://usecrixy.com";

interface PageImages {
  path: string;
  images: { loc: string; title?: string; caption?: string }[];
}

const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4e8309b0-9a6e-4c31-b7dc-b75a8b823000/id-preview-eccd6fbc--0dc9ffa4-b04c-4c98-829d-525f3f82b446.lovable.app-1783503047428.png";

export const Route = createFileRoute("/image-sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const pages: PageImages[] = [
          {
            path: "/",
            images: [
              {
                loc: OG_IMAGE,
                title: "Crixy AI — The All-in-One AI Business Workspace",
                caption:
                  "Launch, market and grow your business with one AI workspace — websites, chatbots, content, CRM, outreach and analytics.",
              },
              {
                loc: `${BASE_URL}/favicon.ico`,
                title: "Crixy AI logo",
              },
            ],
          },
          {
            path: "/pricing",
            images: [
              {
                loc: OG_IMAGE,
                title: "Crixy AI pricing — one subscription, eight tools quieter",
              },
            ],
          },
        ];

        const xmlEscape = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

        const urls = pages
          .map((p) => {
            const imgs = p.images
              .map((i) =>
                [
                  `    <image:image>`,
                  `      <image:loc>${xmlEscape(i.loc)}</image:loc>`,
                  i.title ? `      <image:title>${xmlEscape(i.title)}</image:title>` : null,
                  i.caption ? `      <image:caption>${xmlEscape(i.caption)}</image:caption>` : null,
                  `    </image:image>`,
                ]
                  .filter(Boolean)
                  .join("\n"),
              )
              .join("\n");
            return [
              `  <url>`,
              `    <loc>${BASE_URL}${p.path}</loc>`,
              imgs,
              `  </url>`,
            ].join("\n");
          })
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
