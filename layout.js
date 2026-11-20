import "./globals.css";

export const metadata = {
  title: "MY CUSTOM WEBSITE — AI Prompt Builder",
  description: "Buat master prompt profesional untuk game, aplikasi Android, website, AI, desain, dan proyek digital.",
  keywords: ["AI prompt builder", "master prompt", "game prompt", "APK prompt", "website prompt"],
  applicationName: "MY CUSTOM WEBSITE",
  robots: { index: true, follow: true },
  openGraph: {
    title: "MY CUSTOM WEBSITE — AI Prompt Builder",
    description: "Create. Prompt. Build.",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
