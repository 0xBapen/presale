"use client";

import { useEffect, useState } from 'react';
import { Rocket, Shield, Zap, TrendingUp, Users, Lock } from 'lucide-react';
import Link from 'next/link';

interface Presale {
  id: string;
  projectName: string;
  ticker: string;
  description: string;
  hardCap: number;
  currentRaised: number;
  endDate: string;
  status: string;
  featured: boolean;
}

export default function HomePage() {
  const [featuredPresales, setFeaturedPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPresales();
  }, []);

  const fetchFeaturedPresales = async () => {
    try {
      const response = await fetch('/api/presales?featured=true&limit=3');
      const data = await response.json();
      setFeaturedPresales(data.presales || []);
    } catch (error) {
      console.error('Failed to fetch featured presales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500">
              <span className="text-purple-400 font-semibold">⚡ Powered by Solana • x402 Protocol</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-bg bg-clip-text text-transparent">
                Launch Your Token Presale
              </span>
              <br />
              <span className="text-white">On Solana with x402 Escrow</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Secure, transparent, and decentralized token presales powered by the x402 payment protocol on Solana.
              Platform acts as escrow between investors and project teams.
            </p>
            <div className="flex gap-4 justify-center mb-6">
              <Link
                href="/presales"
                className="px-8 py-4 rounded-lg gradient-bg hover:opacity-90 transition text-lg font-semibold"
              >
                Browse Presales
              </Link>
              <Link
                href="/create"
                className="px-8 py-4 rounded-lg border-2 border-purple-500 hover:bg-purple-500/10 transition text-lg font-semibold"
              >
                Launch Your Presale
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              🔒 Instant USDC payments • Lightning-fast Solana network • No API keys required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose x402 Presale on Solana?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-12 h-12 text-purple-400" />}
              title="Secure Escrow"
              description="Funds held securely in platform escrow on Solana using x402 protocol. Released only when conditions are met."
            />
            <FeatureCard
              icon={<Zap className="w-12 h-12 text-yellow-400" />}
              title="Lightning Fast"
              description="Powered by Solana's high-speed blockchain. Instant confirmations, minimal fees (~$0.00025 per transaction)."
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12 text-green-400" />}
              title="Transparent"
              description="All transactions on-chain. Real-time tracking. Verify everything on Solscan explorer."
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-blue-400" />}
              title="Milestone-Based"
              description="Release funds in phases based on project milestones for added security and accountability."
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-pink-400" />}
              title="Fair Launch"
              description="Equal opportunity for all investors with customizable limits per wallet. No pre-sales or insider advantages."
            />
            <FeatureCard
              icon={<Rocket className="w-12 h-12 text-orange-400" />}
              title="Easy Launch"
              description="Launch your presale in minutes. Simple process, instant USDC payments via x402, no complex setup."
            />
          </div>
        </div>
      </section>

      {/* Solana Benefits */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Built on Solana</h2>
            <p className="text-xl text-gray-400">The fastest blockchain for your presale</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-gray-800/50 border border-purple-500/30 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">~400ms</div>
              <div className="text-gray-400">Block Time</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-gray-800/50 border border-blue-500/30 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">$0.00025</div>
              <div className="text-gray-400">Transaction Fee</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-gray-800/50 border border-green-500/30 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">65,000+</div>
              <div className="text-gray-400">TPS Capacity</div>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-900/30 to-gray-800/50 border border-orange-500/30 text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">Instant</div>
              <div className="text-gray-400">Settlement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Presales */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Presales</h2>
            <Link href="/presales" className="text-purple-400 hover:text-purple-300">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : featuredPresales.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPresales.map((presale) => (
                <PresaleCard key={presale.id} presale={presale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No featured presales at the moment</p>
              <Link
                href="/create"
                className="inline-block mt-4 text-purple-400 hover:text-purple-300"
              >
                Be the first to launch →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Create Presale"
              description="Define your project, tokenomics, and funding goals. Pay $100 USDC via x402."
            />
            <StepCard
              number="2"
              title="Get Approved"
              description="Quick review to ensure quality and legitimacy. Usually within 24 hours."
            />
            <StepCard
              number="3"
              title="Raise Funds"
              description="Investors contribute USDC via x402 payments directly to Solana escrow."
            />
            <StepCard
              number="4"
              title="Launch Token"
              description="Meet milestones to unlock escrowed funds. Fast, secure, transparent."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Launch on Solana?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the future of token presales with transparent, secure escrow and instant payments
          </p>
          <Link
            href="/create"
            className="inline-block px-12 py-4 rounded-lg gradient-bg hover:opacity-90 transition text-xl font-semibold"
          >
            Launch Your Presale Now
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            ⚡ Built on Solana • Secured by x402 • No API keys needed
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 card-hover">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function PresaleCard({ presale }: { presale: Presale }) {
  const progress = (presale.currentRaised / presale.hardCap) * 100;
  const daysLeft = Math.ceil(
    (new Date(presale.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Link href={`/presales/${presale.id}`}>
      <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 card-hover cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{presale.projectName}</h3>
            <p className="text-purple-400">${presale.ticker}</p>
          </div>
          {presale.featured && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
              Featured
            </span>
          )}
        </div>
        
        <p className="text-gray-400 mb-4 line-clamp-2">{presale.description}</p>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg progress-animated"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Raised</span>
            <span className="font-semibold">
              ${presale.currentRaised.toLocaleString()} / ${presale.hardCap.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Ends In</span>
            <span className="font-semibold text-orange-400">
              {daysLeft > 0 ? `${daysLeft} days` : 'Ended'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
