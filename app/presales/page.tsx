"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Sparkles } from 'lucide-react';
import { PresaleCard } from '../components/PresaleCard';

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
  tags: string[];
}

export default function PresalesPage() {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPresales();
  }, [filter]);

  const fetchPresales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
      }
      
      const response = await fetch(`/api/presales?${params.toString()}`);
      const data = await response.json();
      setPresales(data.presales || []);
    } catch (error) {
      console.error('Failed to fetch presales:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPresales = presales.filter(presale =>
    presale.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presale.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presale.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black relative">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Upcoming Presales</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Discover <span className="gradient-text">Top Presales</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Invest early in promising projects with secure x402 escrow on Solana
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Filters and Search */}
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, ticker, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl glass-effect focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-4 rounded-xl font-semibold transition ${
                filter === 'all'
                  ? 'gradient-bg text-white'
                  : 'glass-effect hover:border-purple-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-4 rounded-xl font-semibold transition ${
                filter === 'active'
                  ? 'gradient-bg text-white'
                  : 'glass-effect hover:border-purple-500'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('funded')}
              className={`px-6 py-4 rounded-xl font-semibold transition ${
                filter === 'funded'
                  ? 'gradient-bg text-white'
                  : 'glass-effect hover:border-purple-500'
              }`}
            >
              Funded
            </button>
          </div>
        </div>

        {/* Presales Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : filteredPresales.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPresales.map((presale, index) => (
              <div key={presale.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <PresaleCard
                  presale={{
                    ...presale,
                    targetAmount: presale.hardCap,
                    deadline: presale.endDate
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="glass-effect rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {searchTerm ? 'No Results Found' : 'No Presales Yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to launch a presale on the platform'}
              </p>
              <Link
                href="/create"
                className="inline-block px-8 py-4 rounded-xl gradient-bg hover:opacity-90 transition font-semibold"
              >
                Launch First Presale
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

