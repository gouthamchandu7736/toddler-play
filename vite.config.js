import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-64.png"],

      manifest: {
        name: "Aditi's Playhouse",
        // short_name is what sits under the icon on the home screen, where
        // both iOS and Android truncate at roughly 12 characters.
        short_name: "Aditi",
        description:
          "A gentle offline tap-and-play app for Aditi. No ads, no links, no data collection.",
        start_url: "/",
        scope: "/",

        // fullscreen hides the status bar and navigation chrome entirely, which
        // is what keeps a child from reaching the URL bar or the back button.
        // Browsers that don't support it fall back down this list on their own.
        display: "fullscreen",
        display_override: ["fullscreen", "standalone", "minimal-ui"],

        // Portrait: the layout is designed 2x3 portrait, phones are held that
        // way by default, and locking it stops the screen re-flowing every time
        // a toddler tilts the device — which is startling mid-play.
        // (Landscape still works if you'd rather set this to "any" for a tablet.)
        orientation: "portrait",

        // Sampled from the icon's own yellow frame, so the launch splash
        // (background_color + the 512 icon) has no visible seam around it.
        theme_color: "#f6d216",
        background_color: "#f6d216",
        lang: "en",
        categories: ["education", "kids", "games"],

        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Precache the entire app. There is nothing to fetch at runtime — no
        // fonts, no audio files, no images beyond the icons — so once this is
        // installed the app genuinely works in airplane mode.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],

        // Any navigation resolves to the cached shell, so a deep link or a
        // refresh offline still lands in the app rather than on a dino.
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },

      devOptions: {
        // Lets you exercise the service worker with `npm run dev`.
        enabled: false,
      },
    }),
  ],
});
