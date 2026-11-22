import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X. It's what's happening",
  description: "From breaking news and entertainment to sports and politics, get the full story with all the live commentary.",
};

const themeScript = `
try {
  var t = localStorage.getItem('xclone-theme');
  if (t === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');
} catch (e) { document.documentElement.classList.add('dark'); }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
        {children}
      </body>
    </html>
  );
}
