import AppShell from "@/components/common/AppShell";

import "../../public/scss/main.scss";
import "rc-slider/assets/index.css";
import { DM_Sans } from "next/font/google";

// const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jameenwallah.akoodedemo.com";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--body-font-family",
  display: "swap",
});

export async function generateMetadata() {
  return {
    title: "Home || JameenWallah - Real Estate",
    // alternates: {
    //   canonical: new URL(pathname || "/", siteUrl).toString(),
    // },
    icons: {
      icon: [
        { url: "/fav_icon.png", sizes: "16x16", type: "image/png" },
        { url: "/fav_icon.png", sizes: "32x32", type: "image/png" },
        { url: "/fav_icon.png", sizes: "48x48", type: "image/png" },
        { url: "/fav_icon.png", sizes: "192x192", type: "image/png" },
        { url: "/fav_icon.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: [{ url: "/fav_icon.png", type: "image/png" }],
      apple: [{ url: "/fav_icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`body ${dmSans.className} ${dmSans.variable}`}
        cz-shortcut-listen="false"
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
