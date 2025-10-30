"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../components/Toast';

interface Presale {
  id: string;
  projectName: string;
  ticker: string;
  status: string;
  hardCap: number;
  currentRaised: number;
  investorCount: number;
  createdAt: string;
  startDate: string;
  featured: boolean;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [presales, setPresales] = useState<Presale[]>([]);
  const [stats, setStats] = useState({
    totalPresales: 0,
    activePresales: 0,
    totalRaised: 0,
    totalInvestors: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
      setAuthenticated(true);
      fetchPresales();
    }
  }, [filter]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production use proper authentication
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      fetchPresales();
    } else {
      setPassword('');
      // Show error in UI instead of alert
      const errorEl = document.getElementById('login-error');
      if (errorEl) {
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 3000);
      }
    }
  };

  const fetchPresales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter.toUpperCase());
      }
      
      const response = await fetch(`/api/presales?${params.toString()}&limit=100`);
      const data = await response.json();
      
      setPresales(data.presales || []);
      
      // Calculate stats
      const stats = (data.presales || []).reduce(
        (acc: any, presale: Presale) => {
          acc.totalPresales++;
          if (presale.status === 'ACTIVE') acc.activePresales++;
          acc.totalRaised += presale.currentRaised;
          acc.totalInvestors += presale.investorCount;
          return acc;
        },
        {
          totalPresales: 0,
          activePresales: 0,
          totalRaised: 0,
          totalInvestors: 0,
        }
      );
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch presales:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePresaleStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/presales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Presale status updated to ${status}`);
        fetchPresales();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update presale:', error);
      toast.error('Failed to update presale');
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/presales/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        fetchPresales();
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="p-8 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <Shield className="text-purple-400" size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-center">Admin Panel</h1>
            <p className="text-gray-400 mb-6 text-center">
              Enter admin password to continue
            </p>
            <form onSubmit={handleLogin}>
              <div id="login-error" className="hidden mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500">
                <p className="text-red-400 text-sm text-center">Invalid password. Please try again.</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none mb-4"
                required
              />
              <button
                type="submit"
                className="w-full py-3 rounded-lg gradient-bg hover:opacity-90 transition font-semibold"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Shield className="text-purple-400" />
              Admin Panel
            </h1>
            <p className="text-gray-400">Manage presales and platform settings</p>
          </div>
          <button
            onClick={() => {
              setAuthenticated(false);
              sessionStorage.removeItem('adminAuth');
            }}
            className="px-4 py-2 rounded-lg border border-gray-600 hover:border-red-500 hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="text-purple-400" />}
            label="Total Presales"
            value={stats.totalPresales.toString()}
          />
          <StatCard
            icon={<CheckCircle className="text-green-400" />}
            label="Active Presales"
            value={stats.activePresales.toString()}
          />
          <StatCard
            icon={<DollarSign className="text-blue-400" />}
            label="Total Raised"
            value={`$${(stats.totalRaised / 1000).toFixed(1)}K`}
          />
          <StatCard
            icon={<Users className="text-orange-400" />}
            label="Total Investors"
            value={stats.totalInvestors.toString()}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'draft', 'active', 'funded', 'failed', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === f
                  ? 'gradient-bg'
                  : 'bg-gray-800 border border-gray-700 hover:border-purple-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Presales Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="spinner"></div>
              </div>
            ) : presales.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Raised</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Hard Cap</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Investors</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Featured</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {presales.map((presale) => (
                    <tr key={presale.id} className="hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/presales/${presale.id}`}
                          className="font-semibold hover:text-purple-400 transition"
                        >
                          {presale.projectName}
                        </Link>
                        <p className="text-sm text-gray-400">${presale.ticker}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={presale.status}
                          onChange={(e) => updatePresaleStatus(presale.id, e.target.value)}
                          className="px-3 py-1 rounded-lg bg-gray-700 border border-gray-600 text-sm focus:border-purple-500 focus:outline-none"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="ACTIVE">Active</option>
                          <option value="FUNDED">Funded</option>
                          <option value="FAILED">Failed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        ${(presale.currentRaised / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-right">
                        ${(presale.hardCap / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-4 text-right">{presale.investorCount}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(presale.id, presale.featured)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            presale.featured
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {presale.featured ? '⭐ Yes' : 'No'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/presales/${presale.id}`}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>No presales found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
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

