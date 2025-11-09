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
    <nav className="glass-effect sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition">
                <img 
                  src="/images/logo-icon.jpg" 
                  alt="QuantumRaise"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text tracking-tight">
                Orbitalx402
                </div>
                <div className="text-xs text-gray-400 -mt-0.5">Secure Presale Platform</div>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/presales" 
              className="text-gray-300 hover:text-white transition font-medium relative group"
            >
              Browse Presales
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link 
              href="/create" 
              className="text-gray-300 hover:text-white transition font-medium relative group"
            >
              Launch Presale
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-300 hover:text-white transition font-medium relative group"
            >
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all"></span>
            </Link>
            <Link 
              href="/admin" 
              className="text-gray-300 hover:text-white transition font-medium relative group"
            >
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all"></span>
            </Link>
          </div>

          <div>
            <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !via-blue-600 !to-pink-600 hover:!opacity-90 !rounded-xl !h-12 !px-6 !font-semibold !transition-all !shadow-lg !shadow-purple-500/25" />
          </div>
        </div>
      </div>
    </nav>
  );
}

