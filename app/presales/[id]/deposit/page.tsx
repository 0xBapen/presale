"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, CheckCircle, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '../../../components/Toast';

interface EscrowStatus {
  tokensDeposited: boolean;
  tokenBalance: number;
  requiredTokens: number;
  usdcRaised: number;
  readyToLaunch: boolean;
}

interface DepositInfo {
  address: string;
  requiredTokens: number;
  instructions: string;
}

export default function TokenDepositPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus | null>(null);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [presale, setPresale] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch presale details
      const presaleRes = await fetch(`/api/presales/${params.id}`);
      const presaleData = await presaleRes.json();
      setPresale(presaleData.presale);

      // Fetch deposit info
      const depositRes = await fetch(`/api/presales/${params.id}/escrow/deposit-info`, {
        method: 'POST',
      });
      const depositData = await depositRes.json();
      setDepositInfo(depositData);

      // Check escrow status
      await checkEscrowStatus();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load deposit information');
    } finally {
      setLoading(false);
    }
  };

  const checkEscrowStatus = async () => {
    try {
      setChecking(true);
      const res = await fetch(`/api/presales/${params.id}/escrow`);
      const data = await res.json();
      setEscrowStatus(data);

      if (data.tokensDeposited && data.readyToLaunch) {
        toast.success('Tokens detected! Your presale is now ACTIVE! 🎉');
        setTimeout(() => {
          router.push(`/presales/${params.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to check escrow:', error);
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const progress = escrowStatus
    ? (escrowStatus.tokenBalance / escrowStatus.requiredTokens) * 100
    : 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Deposit <span className="gradient-text">Tokens</span>
          </h1>
          <p className="text-gray-400">
            {presale?.projectName} - ${presale?.ticker}
          </p>
        </div>

        {/* Status Card */}
        <div className="mb-8 glass-effect rounded-2xl p-6 border-2 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Deposit Status</h2>
            <button
              onClick={checkEscrowStatus}
              disabled={checking}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          {escrowStatus ? (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Tokens Deposited</span>
                  <span className="font-semibold text-purple-400">
                    {escrowStatus.tokenBalance.toLocaleString()} / {escrowStatus.requiredTokens.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full progress-bar-animated rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {progress.toFixed(1)}% Complete
                </p>
              </div>

              {/* Status Message */}
              {escrowStatus.tokensDeposited ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-200 mb-1">
                      ✅ Tokens Received!
                    </h3>
                    <p className="text-sm text-green-100">
                      Your presale has been automatically approved and is now ACTIVE. Investors can start contributing!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-200 mb-1">
                      ⏳ Waiting for Token Deposit
                    </h3>
                    <p className="text-sm text-yellow-100">
                      Please send exactly {escrowStatus.requiredTokens.toLocaleString()} tokens to the address below.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Loading status...
            </div>
          )}
        </div>

        {/* Deposit Instructions */}
        {!escrowStatus?.tokensDeposited && depositInfo && (
          <div className="glass-effect rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">How to Deposit Tokens</h2>

            {/* Step 1 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Copy Deposit Address</h3>
              </div>
              <div className="ml-11">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800 border border-gray-700">
                  <code className="flex-1 text-sm text-purple-400 break-all">
                    {depositInfo.address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(depositInfo.address)}
                    className="p-2 hover:bg-gray-700 rounded transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Send Required Amount</h3>
              </div>
              <div className="ml-11">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-lg font-semibold text-purple-200">
                    {depositInfo.requiredTokens.toLocaleString()} {presale?.ticker} tokens
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Based on your hard cap of ${presale?.hardCap.toLocaleString()} and token price of ${presale?.tokenPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Use Your Solana Wallet</h3>
              </div>
              <div className="ml-11">
                <p className="text-gray-300 mb-3">
                  Open your Solana wallet (Phantom, Solflare, etc.) and send the tokens:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Open wallet → Select your token → Send</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Paste the deposit address above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Enter amount: {depositInfo.requiredTokens.toLocaleString()}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Confirm and send</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold">Automatic Verification</h3>
              </div>
              <div className="ml-11">
                <p className="text-gray-300 mb-2">
                  Once we detect your token deposit:
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>✅ Your presale status will automatically change to ACTIVE</li>
                  <li>✅ Investors can start contributing</li>
                  <li>✅ You'll be redirected to your presale page</li>
                </ul>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="font-semibold text-red-200 mb-2">⚠️ Important</h4>
              <ul className="text-sm text-red-100 space-y-1">
                <li>• Send EXACTLY the required amount</li>
                <li>• Send to the CORRECT address (verify carefully)</li>
                <li>• Use the correct token mint address</li>
                <li>• Transaction is irreversible - double check everything!</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success State */}
        {escrowStatus?.tokensDeposited && (
          <div className="text-center">
            <button
              onClick={() => router.push(`/presales/${params.id}`)}
              className="px-8 py-4 rounded-xl gradient-bg hover:opacity-90 transition font-semibold text-lg"
            >
              View Your Active Presale →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}







