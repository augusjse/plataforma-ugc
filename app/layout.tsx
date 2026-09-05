import "./globals.css";
export const metadata = {
  title: "Studio UGC",
  description: "Plataforma de criadoras de conteúdo",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
