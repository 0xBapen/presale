"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Dynamic import to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  return (
    <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !transition-all" />
  );
}

export function WalletInfo() {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500">
      <p className="text-green-200 text-sm">
        ✓ Wallet Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
      </p>
    </div>
  );
}

