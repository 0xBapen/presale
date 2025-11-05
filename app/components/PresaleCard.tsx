"use client";

import Link from 'next/link';
import { TrendingUp, Users, Clock, Target, CheckCircle } from 'lucide-react';

interface PresaleCardProps {
  presale: {
    id: string;
    projectName: string;
    ticker: string;
    description: string;
    targetAmount: number;
    currentRaised: number;
    deadline: string;
    status: string;
    category?: string;
    teamWallet?: string;
  };
}

export function PresaleCard({ presale }: PresaleCardProps) {
  const progress = (presale.currentRaised / presale.targetAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(presale.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    FUNDED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    COMPLETED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <Link href={`/presales/${presale.id}`}>
      <div className="glass-effect rounded-2xl p-6 card-hover h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1 hover:text-purple-400 transition">
              {presale.projectName}
            </h3>
            <p className="text-purple-400 font-semibold">${presale.ticker}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[presale.status as keyof typeof statusColors]}`}>
            {presale.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-grow">
          {presale.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold text-purple-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-animated rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Target className="w-3 h-3" />
              <span>Raised</span>
            </div>
            <div className="font-bold text-lg">
              ${presale.currentRaised.toLocaleString()}
            </div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Goal</span>
            </div>
            <div className="font-bold text-lg">
              ${presale.targetAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold text-sm transition">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}







