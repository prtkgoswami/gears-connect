// app/robots.ts
import { MetadataRoute } from "next";
import { ROUTES } from "./constants/path";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [ROUTES.garage, ROUTES.onboarding, ROUTES.preferences],
      },
    ],
    sitemap: "https://your-domain.com/sitemap.xml", // update to your real domain
  };
}
