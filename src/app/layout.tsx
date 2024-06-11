import { TRPCProvider } from "./providers/TrpcProvider";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/Sonner";
import { ThemeProvider } from "./providers/ThemeProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster richColors />
        <ThemeProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
