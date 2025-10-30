"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Presales</h1>
          <p className="text-gray-400">
            Discover and invest in upcoming token presales
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search presales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg transition ${
                filter === 'all'
                  ? 'gradient-bg'
                  : 'bg-gray-800 border border-gray-700 hover:border-purple-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-3 rounded-lg transition ${
                filter === 'active'
                  ? 'gradient-bg'
                  : 'bg-gray-800 border border-gray-700 hover:border-purple-500'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('funded')}
              className={`px-6 py-3 rounded-lg transition ${
                filter === 'funded'
                  ? 'gradient-bg'
                  : 'bg-gray-800 border border-gray-700 hover:border-purple-500'
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresales.map((presale) => (
              <PresaleCard key={presale.id} presale={presale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400 mb-4">
              {searchTerm ? 'No presales match your search' : 'No presales found'}
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 rounded-lg gradient-bg hover:opacity-90 transition"
            >
              Launch First Presale
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function PresaleCard({ presale }: { presale: Presale }) {
  const progress = (presale.currentRaised / presale.hardCap) * 100;
  const daysLeft = Math.ceil(
    (new Date(presale.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    FUNDED: 'bg-blue-500/20 text-blue-400',
    FAILED: 'bg-red-500/20 text-red-400',
    COMPLETED: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <Link href={`/presales/${presale.id}`}>
      <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 card-hover cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{presale.projectName}</h3>
            <p className="text-purple-400">${presale.ticker}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {presale.featured && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                ⭐ Featured
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${statusColors[presale.status as keyof typeof statusColors] || ''}`}>
              {presale.status}
            </span>
          </div>
        </div>
        
        <p className="text-gray-400 mb-4 line-clamp-3 flex-grow">{presale.description}</p>
        
        {presale.tags && presale.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {presale.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded bg-gray-700 text-gray-300 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="space-y-3 mt-auto">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg-green progress-animated"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">Raised</span>
              <span className="font-semibold text-lg">
                ${(presale.currentRaised / 1000).toFixed(1)}K
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Hard Cap</span>
              <span className="font-semibold text-lg">
                ${(presale.hardCap / 1000).toFixed(1)}K
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-700">
            <span className="text-gray-400 text-sm">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
            </span>
            <span className="text-purple-400 font-semibold">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

