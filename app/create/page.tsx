"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Calendar, DollarSign, Package, Users, Target, Rocket, AlertCircle } from 'lucide-react';
import { toast } from '../components/Toast';

// Dynamic import to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const PRESALE_CREATION_FEE = 100; // USD

export default function CreatePresalePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Project Info
    projectName: '',
    ticker: '',
    description: '',
    website: '',
    twitter: '',
    discord: '',
    telegram: '',
    pitchDeck: '',
    tags: '',
    
    // Team Info
    teamName: '',
    teamDescription: '',
    teamWallet: '',
    
    // Presale Details
    hardCap: '',
    softCap: '',
    minInvestment: '10',
    maxInvestment: '',
    startDate: '',
    endDate: '',
    
    // Token Information
    tokenAddress: '',
    tokenDecimals: '9',
    tokenPrice: '',
    
    // Tokenomics
    tokenomicsType: 'FAIR_LAUNCH',
    totalSupply: '',
    presaleAllocation: '',
    liquidityAllocation: '',
    teamAllocation: '',
    vestingPeriod: '',
    cliffPeriod: '',
    
    // Milestones
    milestones: [
      { title: '', description: '', percentage: '', order: 0 },
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        { title: '', description: '', percentage: '', order: formData.milestones.length },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
  };

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    const walletAddress = publicKey.toBase58();

    setCreating(true);

    try {
      // Prepare data
      const presaleData = {
        projectName: formData.projectName,
        ticker: formData.ticker,
        description: formData.description,
        website: formData.website || undefined,
        twitter: formData.twitter || undefined,
        discord: formData.discord || undefined,
        telegram: formData.telegram || undefined,
        pitchDeck: formData.pitchDeck || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        
        teamName: formData.teamName,
        teamDescription: formData.teamDescription || undefined,
        teamWallet: formData.teamWallet,
        
        targetAmount: parseFloat(formData.hardCap),
        hardCap: parseFloat(formData.hardCap),
        softCap: formData.softCap ? parseFloat(formData.softCap) : undefined,
        minInvestment: parseFloat(formData.minInvestment),
        maxInvestment: formData.maxInvestment ? parseFloat(formData.maxInvestment) : undefined,
        
        startDate: formData.startDate,
        endDate: formData.endDate,
        
        tokenomicsType: formData.tokenomicsType,
        totalSupply: formData.totalSupply,
        presaleAllocation: parseFloat(formData.presaleAllocation),
        liquidityAllocation: formData.liquidityAllocation ? parseFloat(formData.liquidityAllocation) : undefined,
        teamAllocation: formData.teamAllocation ? parseFloat(formData.teamAllocation) : undefined,
        vestingPeriod: formData.vestingPeriod ? parseInt(formData.vestingPeriod) : undefined,
        cliffPeriod: formData.cliffPeriod ? parseInt(formData.cliffPeriod) : undefined,
        
        tokenAddress: formData.tokenAddress || undefined,
        tokenDecimals: parseInt(formData.tokenDecimals),
        creatorWallet: walletAddress,
      };

      // Step 1: Request presale creation (will get 402)
      const response = await fetch('/api/presales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presaleData),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required
        setPaymentInstructions(data.paymentInstructions);
        
        toast.info(`Payment Required: ${data.creationFee} ${data.paymentInstructions.token}`);
        
        // Show payment modal (simulated with prompt for now)
        // In production, this would integrate with Solana wallet to request payment
        toast.warning('Please complete the payment in your Solana wallet');
        
        // In real implementation, wallet would handle this
        const txHash = prompt('Enter transaction hash after payment (for testing):');
        
        if (txHash) {
          // Step 2: Verify payment and create presale
          const verifyResponse = await fetch('/api/presales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...presaleData,
              transactionHash: txHash,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Presale created successfully! Awaiting admin approval.');
            setTimeout(() => {
              router.push(`/presales/${verifyData.presale.id}`);
            }, 1500);
          } else {
            throw new Error('Payment verification failed');
          }
        } else {
          throw new Error('Payment cancelled');
        }
      } else if (response.ok) {
        // Payment already verified
        toast.success('Presale created successfully!');
        setTimeout(() => {
          router.push(`/presales/${data.presale.id}`);
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to create presale');
      }
    } catch (error: any) {
      console.error('Failed to create presale:', error);
      toast.error(error.message || 'Failed to create presale');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Launch Your <span className="gradient-text">Presale</span>
          </h1>
          <p className="text-gray-400 mb-4">
            Create a token presale with secure x402 escrow on Orbitalx402
          </p>
          
          {/* Creation Fee Notice */}
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500 flex items-start gap-3">
            <AlertCircle className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-purple-200 font-semibold">
                Presale Creation Fee: ${PRESALE_CREATION_FEE} USDC
              </p>
              <p className="text-purple-300 text-sm mt-1">
                One-time fee to create your presale. Payment via x402 protocol.
              </p>
            </div>
          </div>

          {/* Wallet Connection */}
          {!connected && (
            <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500">
              <p className="text-orange-200 mb-3">Connect your Solana wallet to continue</p>
              <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg" />
            </div>
          )}

          {connected && publicKey && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500">
              <p className="text-green-200 text-sm">
                ✓ Solana Wallet Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between">
            {[
              { num: 1, label: 'Project Info' },
              { num: 2, label: 'Presale Details' },
              { num: 3, label: 'Tokenomics' },
              { num: 4, label: 'Review' },
            ].map(({ num, label }) => (
              <div key={num} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 ${
                    step >= num ? 'gradient-bg' : 'bg-gray-700'
                  }`}
                >
                  {num}
                </div>
                <span className={`text-sm ${step >= num ? 'text-white' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Rocket className="text-purple-400" />
                Project Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Project Name *</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ticker Symbol *</label>
                  <input
                    type="text"
                    name="ticker"
                    value={formData.ticker}
                    onChange={handleChange}
                    placeholder="e.g., TOKEN"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your project, its goals, and why people should invest..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourproject.com"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Twitter</label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourproject"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Discord</label>
                  <input
                    type="url"
                    name="discord"
                    value={formData.discord}
                    onChange={handleChange}
                    placeholder="https://discord.gg/yourproject"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pitch Deck URL</label>
                  <input
                    type="url"
                    name="pitchDeck"
                    value={formData.pitchDeck}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="DeFi, Gaming, NFT"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-xl font-bold mb-4">Team Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Team Name *</label>
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Team Description</label>
                    <textarea
                      name="teamDescription"
                      value={formData.teamDescription}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe your team's background and experience..."
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Team Wallet Address *</label>
                    <input
                      type="text"
                      name="teamWallet"
                      value={formData.teamWallet}
                      onChange={handleChange}
                      placeholder="Wallet address to receive funds after presale"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Presale Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hard Cap (USD) *</label>
                  <input
                    type="number"
                    name="hardCap"
                    value={formData.hardCap}
                    onChange={handleChange}
                    placeholder="Maximum to raise"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Soft Cap (USD)</label>
                  <input
                    type="number"
                    name="softCap"
                    value={formData.softCap}
                    onChange={handleChange}
                    placeholder="Minimum to succeed (optional)"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Min Investment *</label>
                  <input
                    type="number"
                    name="minInvestment"
                    value={formData.minInvestment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Investment per Wallet</label>
                  <input
                    type="number"
                    name="maxInvestment"
                    value={formData.maxInvestment}
                    onChange={handleChange}
                    placeholder="Optional cap per wallet"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date *</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date *</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Package className="text-purple-400" />
                Token & Tokenomics
              </h2>

              {/* Token Information Section */}
              <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/30 mb-6">
                <h3 className="text-lg font-bold mb-4 text-blue-200">📝 Token Information (Required)</h3>
                
                <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-100 mb-3">
                    <strong>Before creating your presale:</strong> Create your token on one of these platforms:
                  </p>
                  <ul className="text-sm text-blue-100 space-y-1 ml-4">
                    <li>• <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">pump.fun</a> - Easiest token creation</li>
                    <li>• <a href="https://raydium.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">raydium.io</a> - Create with liquidity pool</li>
                    <li>• Solana CLI - For advanced users</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Token Mint Address *</label>
                    <input
                      type="text"
                      name="tokenAddress"
                      value={formData.tokenAddress}
                      onChange={handleChange}
                      placeholder="e.g., ABC123...xyz"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Your SPL token mint address from Solana
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Token Decimals *</label>
                    <input
                      type="number"
                      name="tokenDecimals"
                      value={formData.tokenDecimals}
                      onChange={handleChange}
                      placeholder="9"
                      min="0"
                      max="18"
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Usually 9 for Solana tokens
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-300 mb-2">Token Price (USD) *</label>
                  <input
                    type="number"
                    name="tokenPrice"
                    value={formData.tokenPrice}
                    onChange={handleChange}
                    placeholder="0.10"
                    step="0.000001"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Price per token in USD (e.g., $0.10 = investors pay $10 for 100 tokens)
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm text-yellow-200">
                    ⚠️ <strong>Important:</strong> After creating this presale, you'll need to deposit your tokens to our escrow address before your presale goes live.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold mt-8 mb-4 text-gray-300">Tokenomics (Optional)</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Supply *</label>
                  <input
                    type="text"
                    name="totalSupply"
                    value={formData.totalSupply}
                    onChange={handleChange}
                    placeholder="e.g., 1000000000"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tokenomics Type *</label>
                  <select
                    name="tokenomicsType"
                    value={formData.tokenomicsType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="FAIR_LAUNCH">Fair Launch</option>
                    <option value="VESTED">Vested</option>
                    <option value="LINEAR_UNLOCK">Linear Unlock</option>
                    <option value="CLIFF_UNLOCK">Cliff Unlock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Presale Allocation (%) *</label>
                  <input
                    type="number"
                    name="presaleAllocation"
                    value={formData.presaleAllocation}
                    onChange={handleChange}
                    max="100"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Liquidity Allocation (%)</label>
                  <input
                    type="number"
                    name="liquidityAllocation"
                    value={formData.liquidityAllocation}
                    onChange={handleChange}
                    max="100"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Team Allocation (%)</label>
                  <input
                    type="number"
                    name="teamAllocation"
                    value={formData.teamAllocation}
                    onChange={handleChange}
                    max="100"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Token Decimals</label>
                  <input
                    type="number"
                    name="tokenDecimals"
                    value={formData.tokenDecimals}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {(formData.tokenomicsType !== 'FAIR_LAUNCH') && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Vesting Period (days)</label>
                      <input
                        type="number"
                        name="vestingPeriod"
                        value={formData.vestingPeriod}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Cliff Period (days)</label>
                      <input
                        type="number"
                        name="cliffPeriod"
                        value={formData.cliffPeriod}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-xl font-bold mb-4">Milestones (Optional)</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Define milestones to release funds in phases. Total must equal 100%.
                </p>

                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">Milestone {index + 1}</h4>
                      {formData.milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Title"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="% to release"
                        value={milestone.percentage}
                        onChange={(e) => updateMilestone(index, 'percentage', e.target.value)}
                        max="100"
                        className="px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-4 py-2 rounded-lg border border-purple-500 hover:bg-purple-500/10 transition"
                >
                  + Add Milestone
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold mb-2">Project</h3>
                  <p className="text-gray-300">{formData.projectName} (${formData.ticker})</p>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold mb-2">Funding Goal</h3>
                  <p className="text-gray-300">
                    ${formData.softCap && `${formData.softCap} (soft) / `}
                    ${formData.hardCap} (hard cap)
                  </p>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold mb-2">Investment Limits</h3>
                  <p className="text-gray-300">
                    Min: ${formData.minInvestment}
                    {formData.maxInvestment && ` / Max: $${formData.maxInvestment}`}
                  </p>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold mb-2">Duration</h3>
                  <p className="text-gray-300">
                    {formData.startDate && new Date(formData.startDate).toLocaleDateString()} to{' '}
                    {formData.endDate && new Date(formData.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ Your presale will be reviewed by our team before going live. 
                    This usually takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-600">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-lg border border-gray-600 hover:border-purple-500 transition"
              >
                ← Previous
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 rounded-lg gradient-bg hover:opacity-90 transition ml-auto"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={creating || !connected}
                className="px-8 py-3 rounded-lg gradient-bg hover:opacity-90 transition ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Processing Payment...' : `Pay ${PRESALE_CREATION_FEE} USDC & Create`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

