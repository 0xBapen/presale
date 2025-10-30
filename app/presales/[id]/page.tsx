"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import {
  Calendar,
  TrendingUp,
  Users,
  Target,
  Lock,
  ExternalLink,
  Twitter,
  Globe,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from '../../components/Toast';

// Dynamic import to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface Presale {
  id: string;
  projectName: string;
  ticker: string;
  description: string;
  pitchDeck?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  teamName: string;
  teamDescription?: string;
  teamWallet: string;
  targetAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  softCap?: number;
  hardCap: number;
  tokenomicsType: string;
  totalSupply: string;
  presaleAllocation: number;
  liquidityAllocation?: number;
  teamAllocation?: number;
  vestingPeriod?: number;
  cliffPeriod?: number;
  startDate: string;
  endDate: string;
  tokenAddress?: string;
  tokenDecimals: number;
  currentRaised: number;
  investorCount: number;
  status: string;
  featured: boolean;
  tags: string[];
  milestones: Milestone[];
  progress: number;
  daysRemaining: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  completed: boolean;
  order: number;
}

export default function PresaleDetailPage() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const [presale, setPresale] = useState<Presale | null>(null);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState('');
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPresale(params.id as string);
    }
  }, [params.id]);

  const fetchPresale = async (id: string) => {
    try {
      const response = await fetch(`/api/presales/${id}`);
      const data = await response.json();
      setPresale(data);
    } catch (error) {
      console.error('Failed to fetch presale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!connected || !publicKey || !investAmount) {
      toast.error('Please connect your Solana wallet and enter amount');
      return;
    }

    const walletAddress = publicKey.toBase58();

    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setInvesting(true);

    try {
      // Step 1: Request payment instructions
      const response = await fetch(`/api/presales/${params.id}/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorWallet: walletAddress,
          amount,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required - show instructions
        toast.info(`Payment Required: ${data.paymentInstructions.amount} ${data.paymentInstructions.token}`);
        toast.warning('Please complete the payment in your Solana wallet');

        // In a real implementation, this would integrate with wallet
        const txHash = prompt('Enter transaction hash after payment (for testing):');
        
        if (txHash) {
          // Step 2: Verify payment
          const verifyResponse = await fetch(`/api/presales/${params.id}/invest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              investorWallet: walletAddress,
              transactionHash: txHash,
              amount: amount.toString(),
              network: data.paymentInstructions.network,
              token: data.paymentInstructions.token,
              timestamp: Date.now(),
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Investment successful! Funds are now in escrow.');
            fetchPresale(params.id as string);
            setInvestAmount('');
          } else {
            toast.error('Payment verification failed');
          }
        }
      }
    } catch (error) {
      console.error('Investment failed:', error);
      toast.error('Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!presale) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Presale not found</h1>
          <a href="/presales" className="text-purple-400 hover:text-purple-300">
            ← Back to presales
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <a href="/presales" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
            ← Back to presales
          </a>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-2">{presale.projectName}</h1>
              <p className="text-2xl text-purple-400">${presale.ticker}</p>
            </div>
            <div className="flex gap-2">
              {presale.featured && (
                <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400">
                  ⭐ Featured
                </span>
              )}
              <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-400">
                {presale.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress */}
            <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-2xl font-bold">{presale.progress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-bg-green progress-animated"
                    style={{ width: `${Math.min(presale.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Raised</span>
                  <span className="text-2xl font-bold">
                    ${(presale.currentRaised / 1000).toFixed(1)}K
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Hard Cap</span>
                  <span className="text-2xl font-bold">
                    ${(presale.hardCap / 1000).toFixed(1)}K
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Investors</span>
                  <span className="text-2xl font-bold">{presale.investorCount}</span>
                </div>
              </div>

              {presale.daysRemaining > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Calendar size={20} />
                    <span className="font-semibold">
                      {presale.daysRemaining} days remaining
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">About {presale.projectName}</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{presale.description}</p>

              {/* Links */}
              <div className="flex flex-wrap gap-3 mt-6">
                {presale.website && (
                  <a
                    href={presale.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    <Globe size={18} />
                    Website
                  </a>
                )}
                {presale.twitter && (
                  <a
                    href={presale.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    <Twitter size={18} />
                    Twitter
                  </a>
                )}
                {presale.discord && (
                  <a
                    href={presale.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    <MessageCircle size={18} />
                    Discord
                  </a>
                )}
                {presale.pitchDeck && (
                  <a
                    href={presale.pitchDeck}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
                  >
                    <ExternalLink size={18} />
                    Pitch Deck
                  </a>
                )}
              </div>
            </div>

            {/* Tokenomics */}
            <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Tokenomics</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-400 block mb-1">Total Supply</span>
                  <span className="text-xl font-semibold">{presale.totalSupply}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Token Type</span>
                  <span className="text-xl font-semibold">
                    {presale.tokenomicsType.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <AllocationBar
                  label="Presale"
                  percentage={presale.presaleAllocation}
                  color="bg-purple-500"
                />
                {presale.liquidityAllocation && presale.liquidityAllocation > 0 && (
                  <AllocationBar
                    label="Liquidity"
                    percentage={presale.liquidityAllocation}
                    color="bg-blue-500"
                  />
                )}
                {presale.teamAllocation && presale.teamAllocation > 0 && (
                  <AllocationBar
                    label="Team"
                    percentage={presale.teamAllocation}
                    color="bg-green-500"
                  />
                )}
              </div>

              {(presale.vestingPeriod || presale.cliffPeriod) && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-semibold mb-3">Vesting Schedule</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {presale.cliffPeriod && (
                      <div>
                        <span className="text-gray-400 block">Cliff Period</span>
                        <span className="font-semibold">{presale.cliffPeriod} days</span>
                      </div>
                    )}
                    {presale.vestingPeriod && (
                      <div>
                        <span className="text-gray-400 block">Vesting Period</span>
                        <span className="font-semibold">{presale.vestingPeriod} days</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Milestones */}
            {presale.milestones && presale.milestones.length > 0 && (
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Target size={24} />
                  Project Milestones
                </h2>
                <p className="text-gray-400 mb-6">
                  Funds will be released in phases as milestones are completed
                </p>
                <div className="space-y-4">
                  {presale.milestones
                    .sort((a, b) => a.order - b.order)
                    .map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-lg border ${
                          milestone.completed
                            ? 'bg-green-500/10 border-green-500'
                            : 'bg-gray-700/50 border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {milestone.completed && <CheckCircle size={20} className="text-green-400" />}
                              <h3 className="font-semibold">{milestone.title}</h3>
                            </div>
                            <p className="text-sm text-gray-400">{milestone.description}</p>
                          </div>
                          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                            {milestone.percentage}% release
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Team */}
            <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Team</h2>
              <h3 className="text-xl font-semibold mb-2">{presale.teamName}</h3>
              {presale.teamDescription && (
                <p className="text-gray-300">{presale.teamDescription}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Investment Card */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/50 to-gray-800/50 border border-purple-500">
                <h3 className="text-2xl font-bold mb-6">Invest Now</h3>

                {!connected ? (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm text-center mb-3">
                      Connect your Solana wallet to invest
                    </p>
                    <WalletMultiButtonDynamic className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !h-12 !text-base" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Amount (USDC)
                      </label>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder={`Min: ${presale.minInvestment}`}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>Min: ${presale.minInvestment}</span>
                        {presale.maxInvestment && <span>Max: ${presale.maxInvestment}</span>}
                      </div>
                    </div>

                    <button
                      onClick={handleInvest}
                      disabled={investing || presale.status !== 'ACTIVE'}
                      className="w-full py-4 rounded-lg gradient-bg hover:opacity-90 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {investing ? 'Processing...' : 'Invest with x402'}
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                      Powered by x402 escrow protocol
                    </p>
                  </div>
                )}
              </div>

              {/* Key Details */}
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Key Details</h3>
                <div className="space-y-4">
                  <DetailRow icon={<Calendar />} label="Start Date" value={new Date(presale.startDate).toLocaleDateString()} />
                  <DetailRow icon={<Calendar />} label="End Date" value={new Date(presale.endDate).toLocaleDateString()} />
                  <DetailRow icon={<Target />} label="Soft Cap" value={presale.softCap ? `$${presale.softCap.toLocaleString()}` : 'None'} />
                  <DetailRow icon={<Lock />} label="Escrow" value="x402 Protocol" />
                  <DetailRow icon={<Users />} label="Min Investment" value={`$${presale.minInvestment}`} />
                  {presale.maxInvestment && (
                    <DetailRow icon={<Users />} label="Max Investment" value={`$${presale.maxInvestment}`} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocationBar({ label, percentage, color }: { label: string; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold">{percentage}%</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-5">{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

