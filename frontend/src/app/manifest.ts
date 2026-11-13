import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DSA Tracker Pro",
    short_name: "DSA Tracker",
    description:
      "Precision Technical Interview & Data Structures Mastery Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#050811",
    theme_color: "#090d16",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

