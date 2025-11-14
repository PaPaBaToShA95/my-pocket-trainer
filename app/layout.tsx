// app/layout.tsx (фрагмент)
import { Inter } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/context/AppDataProvider"; // Імпортуємо провайдер

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <AppDataProvider> {/* Використовуємо провайдер */}
          {children}
        </AppDataProvider>
      </body>
    </html>
  );
}