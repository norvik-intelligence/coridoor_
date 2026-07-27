import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coridoor",
    short_name: "Coridoor",
    description: "Buyer-side Transaction Intelligence",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f3ee",
    theme_color: "#081426",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
