import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <title>Stretch</title>

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/budgetnote-icon.png" />
        <link rel="apple-touch-icon" href="/budgetnote-icon.png" />

        <meta name="theme-color" content="#101820" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="BudgetNote" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <ScrollViewStyleReset />
      </head>

      <body style={{ backgroundColor: "#101820", margin: 0 }}>{children}</body>
    </html>
  );
}
