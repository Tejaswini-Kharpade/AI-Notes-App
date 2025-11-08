import "./globals.css";

export const metadata = {
  title: "AI Note-Taking App",
  description: "Smart note-taking with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
