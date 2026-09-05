import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Studio UGC",
  description: "Plataforma de criadoras de conteúdo",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var k='studio-ugc-theme';" +
              "var s=localStorage.getItem(k);var d=s||" +
              "(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');" +
              "document.documentElement.dataset.theme=d}catch(e){}})()",
          }}
        />
        {children}
      </body>
    </html>
  );
}
