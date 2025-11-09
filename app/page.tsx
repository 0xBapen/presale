"use client";

import Link from 'next/link';
import { Zap, Shield, Coins, TrendingUp, Users, Lock, Rocket, Globe, ChevronRight, Star, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Hero Section - Nexchain Style */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            {/* Logo Banner */}
            <div className="mb-8">
              <img 
                src="/images/logo-banner.png" 
                alt="QuantumRaise"
                className="mx-auto h-24 object-contain"
              />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Platform is Live</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Orbitalx402</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              The Ultimate Secure Presale Platform on Solana
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Launch your token presale with secure x402 escrow integration. Built on Solana for lightning-fast, transparent, and trustless fundraising.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/presales"
                className="group px-8 py-4 rounded-xl gradient-bg text-white font-semibold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 btn-glow"
              >
                Browse Presales
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/create"
                className="px-8 py-4 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition"
              >
                Launch Your Presale
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <StatCard
              icon={<TrendingUp className="w-8 h-8 text-green-400" />}
              value="$2.5M+"
              label="Total Raised"
            />
            <StatCard
              icon={<Users className="w-8 h-8 text-blue-400" />}
              value="15K+"
              label="Investors"
            />
            <StatCard
              icon={<Rocket className="w-8 h-8 text-purple-400" />}
              value="240+"
              label="Active Presales"
            />
            <StatCard
              icon={<Award className="w-8 h-8 text-orange-400" />}
              value="98%"
              label="Success Rate"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">Orbitalx402</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on Solana with cutting-edge quantum-inspired technology for the best presale experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-12 h-12" />}
              title="Lightning Fast"
              description="400,000 TPS on Solana network ensures instant transactions and zero delays"
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Secure Escrow"
              description="x402 protocol guarantees funds are safe until presale goals are met"
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Coins className="w-12 h-12" />}
              title="Low Fees"
              description="Pay only $0.001 per transaction with Solana's efficient infrastructure"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12" />}
              title="Smart Contracts"
              description="Automated fund release based on transparent milestone completion"
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Globe className="w-12 h-12" />}
              title="Global Access"
              description="Anyone, anywhere can participate with just a Solana wallet"
              gradient="from-indigo-500 to-blue-500"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title="Fair Distribution"
              description="Transparent automated distribution of tokens to all investors"
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-400">Simple, transparent, and secure</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Investors */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                For Investors
              </h3>
              <div className="space-y-4">
                <Step number="1" text="Connect your Solana wallet (Phantom, Solflare, etc.)" />
                <Step number="2" text="Browse active presales and research projects" />
                <Step number="3" text="Invest USDC with x402 secure payment" />
                <Step number="4" text="Receive tokens automatically when presale succeeds" />
              </div>
            </div>

            {/* For Developers */}
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Rocket className="w-8 h-8 text-purple-400" />
                For Developers
              </h3>
              <div className="space-y-4">
                <Step number="1" text="Connect wallet and create presale campaign" />
                <Step number="2" text="Define goals, tokenomics, and milestones" />
                <Step number="3" text="Pay creation fee ($10 USDC) via x402" />
                <Step number="4" text="Receive funds when milestones are achieved" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Launch Your <span className="gradient-text">Presale</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join hundreds of successful projects raising funds on the most secure presale platform on Solana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-10 py-5 rounded-xl gradient-bg text-white font-bold text-xl hover:opacity-90 transition btn-glow"
            >
              Create Presale Now
            </Link>
            <Link
              href="/presales"
              className="px-10 py-5 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass-effect rounded-2xl p-6 text-center card-hover">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="glass-effect rounded-2xl p-8 card-hover group">
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <p className="text-gray-300 pt-1">{text}</p>
    </div>
  );
}
