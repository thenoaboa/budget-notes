import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <title>Stretch</title>

        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/stretch-icon.png" />
        <link rel="apple-touch-icon" href="/stretch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/stretch-icon.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/stretch-icon.png" />

        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Stretch" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <ScrollViewStyleReset />
      </head>

      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
