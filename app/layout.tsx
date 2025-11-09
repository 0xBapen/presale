import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "./providers";
import { NavBar } from "./components/NavBar";
import { ToastContainer } from "./components/Toast";

export const metadata: Metadata = {
  title: "Orbitalx402 - Secure Token Presale Platform on Solana",
  description: "Launch and invest in token presales with secure x402 escrow integration. Built on Solana for fast, transparent, and safe fundraising.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletContextProvider>
          <NavBar />
          <ToastContainer />
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}

