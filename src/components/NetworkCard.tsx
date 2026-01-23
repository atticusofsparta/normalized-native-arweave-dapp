import {
  NETWORKS,
  type NetworkConfig,
  type TransactionInfo,
  fetchNetworkTransactionByHash,
} from '@src/services/networks';
import { useState } from 'react';
import {
  FaCheck,
  FaChevronDown,
  FaCopy,
  FaExternalLinkAlt,
  FaSearch,
  FaSync,
} from 'react-icons/fa';

export function NetworkCard() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(
    NETWORKS[0],
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txInfo, setTxInfo] = useState<TransactionInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');

  const canFetch = !!txHash.trim();

  const handleFetch = async () => {
    if (!txHash.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNetworkTransactionByHash(
        selectedNetwork,
        txHash.trim(),
      );
      setTxInfo(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canFetch && !isLoading) {
      handleFetch();
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = (hash: string) => {
    switch (selectedNetwork.id) {
      case 'ethereum':
        return `https://etherscan.io/tx/${hash}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${hash}`;
      case 'base':
        return `https://basescan.org/tx/${hash}`;
      case 'solana':
        return `https://solscan.io/tx/${hash}`;
      default:
        return '#';
    }
  };

  const clearAll = () => {
    setTxInfo(null);
    setTxHash('');
    setError(null);
  };

  const selectNetwork = (network: NetworkConfig) => {
    setSelectedNetwork(network);
    setIsDropdownOpen(false);
    // Clear previous results when switching networks
    setTxInfo(null);
    setError(null);
  };

  return (
    <div className="card-glow relative overflow-hidden">
      {/* Network color accent */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-colors duration-300"
        style={{ backgroundColor: selectedNetwork.color }}
      />

      {/* Network selector */}
      <div className="mb-6">
        <span className="mb-2 block text-xs text-grey-500">Select Network</span>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-surface-light/50 px-4 py-3 text-left transition-all hover:border-white/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{selectedNetwork.icon}</span>
              <div>
                <span className="font-medium text-white">
                  {selectedNetwork.name}
                </span>
                <span className="ml-2 text-xs uppercase text-grey-500">
                  {selectedNetwork.type === 'evm' ? 'EVM' : 'SVM'}
                </span>
              </div>
            </div>
            <FaChevronDown
              className={`size-3 text-grey-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-lg">
              {NETWORKS.map((network) => (
                <button
                  key={network.id}
                  onClick={() => selectNetwork(network)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-light ${
                    selectedNetwork.id === network.id ? 'bg-surface-light' : ''
                  }`}
                >
                  <span className="text-xl">{network.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-white">
                      {network.name}
                    </span>
                    <span className="ml-2 text-xs uppercase text-grey-500">
                      {network.type === 'evm' ? 'EVM' : 'SVM'}
                    </span>
                  </div>
                  {selectedNetwork.id === network.id && (
                    <FaCheck className="size-3 text-success" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction hash input */}
      <div className="mb-6">
        <span className="mb-2 block text-xs text-grey-500">
          {selectedNetwork.type === 'solana'
            ? 'Transaction Signature'
            : 'Transaction Hash'}
        </span>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 size-3 -translate-y-1/2 text-grey-600" />
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedNetwork.type === 'solana'
                ? 'Enter transaction signature...'
                : 'Enter transaction hash (0x...)...'
            }
            className="input-glass w-full py-3 pl-10 pr-4 text-sm"
          />
        </div>
      </div>

      {/* Fetch button */}
      <button
        onClick={handleFetch}
        disabled={!canFetch || isLoading}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          backgroundColor: canFetch ? selectedNetwork.color : undefined,
          color: canFetch ? '#0a0a0b' : undefined,
          boxShadow: canFetch
            ? `0 0 20px ${selectedNetwork.color}40`
            : undefined,
        }}
      >
        <FaSync className={`size-3 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Fetching...' : 'Extract Normalized Address'}
      </button>

      {/* Error display */}
      {error && (
        <div className="mb-6 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Result display */}
      {txInfo && (
        <div className="animate-slide-in-right space-y-4">
          {/* From address */}
          <div className="rounded-xl border border-white/5 bg-surface-light/30 p-4">
            <div className="mb-1 text-xs text-grey-500">Sender Address</div>
            <code className="block break-all text-sm text-grey-300">
              {txInfo.from}
            </code>
          </div>

          {/* Transaction hash */}
          <div className="rounded-xl border border-white/5 bg-surface-light/30 p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-grey-500">Transaction</span>
              <a
                href={getExplorerUrl(txInfo.hash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary-300"
              >
                View on Explorer <FaExternalLinkAlt className="size-2" />
              </a>
            </div>
            <code className="block break-all text-sm text-grey-300">
              {txInfo.hash}
            </code>
          </div>

          {/* Normalized Address - Highlighted */}
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: `${selectedNetwork.color}40`,
              backgroundColor: `${selectedNetwork.color}10`,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: selectedNetwork.color }}
              >
                Normalized Arweave Address
              </span>
              <button
                onClick={() => copyToClipboard(txInfo.normalizedAddress)}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs text-white transition-colors hover:bg-white/20"
              >
                {copied ? (
                  <FaCheck className="size-3" />
                ) : (
                  <FaCopy className="size-3" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <code className="block break-all text-base font-medium text-white">
              {txInfo.normalizedAddress}
            </code>
          </div>

          {/* Block info */}
          {txInfo.blockNumber && (
            <div className="text-center text-xs text-grey-600">
              Block #{txInfo.blockNumber.toLocaleString()}
            </div>
          )}

          {/* Clear results */}
          <button
            onClick={clearAll}
            className="w-full rounded-lg py-2 text-center text-xs text-grey-500 transition-colors hover:bg-surface-light hover:text-grey-300"
          >
            Clear & Start Over
          </button>
        </div>
      )}

      {/* Empty state hint */}
      {!txInfo && !error && (
        <p className="text-center text-sm text-grey-500">
          Paste a transaction{' '}
          {selectedNetwork.type === 'solana' ? 'signature' : 'hash'} to extract
          the sender&apos;s normalized Arweave address
        </p>
      )}
    </div>
  );
}
