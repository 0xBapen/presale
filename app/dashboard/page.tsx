"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { DollarSign, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

// Dynamic import to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface Investment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  presale: {
    id: string;
    projectName: string;
    ticker: string;
  };
}

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    pendingInvestments: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchInvestments(publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const connectWallet = () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
    setWalletConnected(true);
    setWalletAddress(mockAddress);
    localStorage.setItem('walletAddress', mockAddress);
  };

  const fetchInvestments = async (wallet: string) => {
    setLoading(true);
    try {
      // Mock data for demonstration
      // In production, fetch from API
      const mockInvestments: Investment[] = [];
      setInvestments(mockInvestments);
      
      // Calculate stats
      const stats = mockInvestments.reduce(
        (acc, inv) => {
          acc.totalInvested += inv.amount;
          if (inv.status === 'CONFIRMED') acc.activeInvestments++;
          if (inv.status === 'COMPLETED') acc.completedInvestments++;
          if (inv.status === 'PENDING') acc.pendingInvestments++;
          return acc;
        },
        {
          totalInvested: 0,
          activeInvestments: 0,
          completedInvestments: 0,
          pendingInvestments: 0,
        }
      );
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="p-8 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-400 mb-6">
              Connect your Solana wallet to view your investments and manage your presales
            </p>
            <WalletMultiButtonDynamic className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !h-12 !text-base" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Solana Wallet: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign className="text-green-400" />}
            label="Total Invested"
            value={`$${stats.totalInvested.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="text-blue-400" />}
            label="Active Investments"
            value={stats.activeInvestments.toString()}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle className="text-purple-400" />}
            label="Completed"
            value={stats.completedInvestments.toString()}
            color="purple"
          />
          <StatCard
            icon={<Clock className="text-orange-400" />}
            label="Pending"
            value={stats.pendingInvestments.toString()}
            color="orange"
          />
        </div>

        {/* Investments */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Investments</h2>
            <Link
              href="/presales"
              className="px-4 py-2 rounded-lg gradient-bg hover:opacity-90 transition"
            >
              Browse Presales
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : investments.length > 0 ? (
            <div className="space-y-4">
              {investments.map((investment) => (
                <InvestmentCard key={investment.id} investment={investment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <XCircle className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-xl text-gray-400 mb-4">No investments yet</p>
              <Link
                href="/presales"
                className="inline-block px-6 py-3 rounded-lg gradient-bg hover:opacity-90 transition"
              >
                Explore Presales
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function InvestmentCard({ investment }: { investment: Investment }) {
  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    CONFIRMED: 'bg-green-500/20 text-green-400',
    REFUNDED: 'bg-red-500/20 text-red-400',
    CLAIMED: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600 hover:border-purple-500 transition">
      <div className="flex justify-between items-start">
        <div>
          <Link
            href={`/presales/${investment.presale.id}`}
            className="text-xl font-bold hover:text-purple-400 transition"
          >
            {investment.presale.projectName}
          </Link>
          <p className="text-gray-400 text-sm">${investment.presale.ticker}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[investment.status as keyof typeof statusColors]}`}>
          {investment.status}
        </span>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-400">Investment: </span>
          <span className="font-semibold">${investment.amount.toLocaleString()}</span>
        </div>
        <div className="text-gray-400">
          {new Date(investment.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

