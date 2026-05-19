import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />

        <title>Stretch</title>

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/stretch-icon.png" />
        <link rel="apple-touch-icon" href="/stretch-icon.png" />

        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Stretch" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <ScrollViewStyleReset />
      </head>

      <body>{children}</body>
    </html>
  );
}
