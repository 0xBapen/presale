"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import wallet button to avoid hydration issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function NavBar() {
  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">
              x402 Presale
            </Link>
            <span className="ml-3 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Solana
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/presales" className="hover:text-purple-400 transition">
              Browse Presales
            </Link>
            <Link href="/create" className="hover:text-purple-400 transition">
              Launch Presale
            </Link>
            <Link href="/dashboard" className="hover:text-purple-400 transition">
              Dashboard
            </Link>
            <Link href="/admin" className="hover:text-purple-400 transition">
              Admin
            </Link>
            <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !h-10" />
          </div>
        </div>
      </div>
    </nav>
  );
}

