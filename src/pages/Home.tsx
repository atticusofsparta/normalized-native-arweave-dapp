import { arrayify } from '@ethersproject/bytes';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NetworkCard } from '@src/components/NetworkCard';
import { spawn } from '@src/services/ao/signers';
import { fromB64Url, sha256B64Url } from '@src/services/encoding';
import { hashMessage } from 'ethers';
import { useState } from 'react';
import {
  FaArrowRight,
  FaExternalLinkAlt,
  FaGithub,
  FaKey,
  FaNetworkWired,
  FaRocket,
  FaWallet,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { recoverPublicKey } from 'viem';
import { useSignMessage } from 'wagmi';

declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}

function Home() {
  const { signMessageAsync } = useSignMessage();
  const [publicKey, setPublicKey] = useState('');
  const [normalizedAddress, setNormalizedAddress] = useState('');
  const [error, setError] = useState('');
  const [aosProcess, setAosProcess] = useState<string>('');
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);

  const normalizePublicKey = async (pk?: string) => {
    setIsNormalizing(true);
    setError('');
    try {
      let publicEncryptionKeyBuffer: Buffer | undefined;

      if (pk) {
        publicEncryptionKeyBuffer = fromB64Url(pk);
      }

      if (!publicEncryptionKeyBuffer) {
        const message = 'random message to sign';
        const signedMessage = await signMessageAsync({ message });
        const messageHash = await hashMessage(message);
        const recoveredKey = await recoverPublicKey({
          hash: arrayify(messageHash),
          signature: signedMessage,
        });
        publicEncryptionKeyBuffer = Buffer.from(recoveredKey.slice(2), 'hex');
      }

      if (!publicEncryptionKeyBuffer) {
        throw new Error('Invalid public key provided');
      }

      const normalized = sha256B64Url(publicEncryptionKeyBuffer);
      setNormalizedAddress(normalized);
    } catch (err: any) {
      console.error('Error fetching or normalizing public key:', err.message);
      setError(err.message);
    } finally {
      setIsNormalizing(false);
    }
  };

  async function handleSpawnAos() {
    setIsSpawning(true);
    try {
      const aos = await spawn();
      setAosProcess(aos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSpawning(false);
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Ambient background orbs */}
      <div className="orb -left-40 top-20 size-80 bg-primary/30" />
      <div className="orb -right-20 top-1/2 size-96 bg-primary/20" />
      <div className="orb bottom-20 left-1/3 size-64 bg-warning/10" />

      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 shadow-glow-sm">
              <HiSparkles className="size-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-wide text-white">
              <span className="text-gradient">Normalize</span>
              <span className="text-grey-400">.</span>
              <span className="text-grey-300">key</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton />
            <Link
              to="https://github.com/atticusofsparta/normalized-native-arweave-dapp"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface/50 px-4 py-2.5 text-sm text-grey-300 transition-all duration-300 hover:border-white/20 hover:bg-surface/70 hover:text-white"
            >
              <FaGithub className="size-4" />
              <span className="hidden sm:inline">Source</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <header className="mb-16 animate-fade-in text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Cross-Chain Key
            <span className="text-gradient"> Normalizer</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-grey-400">
            Transform Ethereum and Solana public keys into unified Arweave
            addresses. Bridge your identity across blockchains.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Normalize Section - Takes more space */}
          <section className="animate-slide-up [animation-delay:100ms] lg:col-span-3">
            <div className="card-glow h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <FaKey className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Normalize Address
                  </h3>
                  <p className="text-sm text-grey-500">
                    Convert your public key to Arweave format
                  </p>
                </div>
              </div>

              {/* Result Display */}
              {normalizedAddress && (
                <div className="mb-6 animate-slide-in-right">
                  <span className="mb-2 block text-sm font-medium text-grey-400">
                    Your Normalized Arweave Address
                  </span>
                  <div className="group relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <code className="flex-1 break-all text-sm text-primary-300">
                        {normalizedAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(normalizedAddress)}
                        className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary transition-all hover:bg-primary/20"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="absolute inset-0 -translate-x-full bg-shimmer group-hover:animate-shimmer" />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6 animate-slide-in-right rounded-xl border border-error/30 bg-error/10 p-4">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Wallet Button */}
              <button
                className="btn-warning mb-6 flex w-full items-center justify-center gap-3"
                onClick={() => normalizePublicKey()}
                disabled={isNormalizing}
              >
                <FaWallet className="size-4" />
                {isNormalizing
                  ? 'Signing...'
                  : 'Normalize from Connected Wallet'}
                <FaArrowRight className="size-3" />
              </button>

              <div className="divider mb-6" />

              {/* Manual Input */}
              <div className="space-y-4">
                <span className="block text-sm font-medium text-grey-400">
                  Or enter a base64url-encoded public key manually
                </span>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="input-glass flex-1 text-sm"
                    placeholder="Enter public key (not wallet address)"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value.trim())}
                  />
                  <button
                    className="btn-secondary shrink-0"
                    onClick={() => normalizePublicKey(publicKey)}
                    disabled={!publicKey || isNormalizing}
                  >
                    Normalize
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* AO Utils Section */}
          <section className="animate-slide-up [animation-delay:200ms] lg:col-span-2">
            <div className="card-glow h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                  <FaRocket className="size-4 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    AO Utilities
                  </h3>
                  <p className="text-sm text-grey-500">
                    Verify with an AO process
                  </p>
                </div>
              </div>

              <p className="mb-6 text-sm text-grey-400">
                Spawn an AOS process to verify your normalized address on-chain.
              </p>

              <button
                className="btn-primary mb-6 flex w-full items-center justify-center gap-3"
                onClick={handleSpawnAos}
                disabled={isSpawning}
              >
                <FaRocket className="size-4" />
                {isSpawning ? 'Spawning...' : 'Spawn AOS Process'}
              </button>

              {aosProcess && (
                <div className="animate-slide-in-right rounded-xl border border-success/30 bg-success/5 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-success">
                    Process Created
                  </p>
                  <code className="mb-3 block break-all text-xs text-grey-300">
                    {aosProcess}
                  </code>
                  <Link
                    to={`https://ao.link/#/entity/${aosProcess}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link-glow inline-flex items-center gap-2 text-sm"
                  >
                    View on ao.link
                    <FaExternalLinkAlt className="size-3" />
                  </Link>
                </div>
              )}

              {/* Info Card */}
              <div className="mt-6 rounded-xl border border-white/5 bg-surface-light/30 p-4">
                <h4 className="mb-2 text-sm font-medium text-grey-300">
                  How it works
                </h4>
                <ul className="space-y-2 text-xs text-grey-500">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                    Sign a message with your wallet
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                    Public key is recovered from signature
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" />
                    SHA-256 hash creates Arweave address
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Network Transaction Section */}
        <section className="mt-12 animate-slide-up [animation-delay:300ms]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FaNetworkWired className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Extract from Transaction
              </h3>
              <p className="text-sm text-grey-500">
                Paste a transaction hash to extract the sender&apos;s normalized
                Arweave address
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-2xl">
            <NetworkCard />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 animate-fade-in text-center [animation-delay:400ms]">
          <div className="divider mb-6" />
          <p className="text-sm text-grey-600">
            Built for the permaweb &middot; Open source &middot;{' '}
            <Link
              to="https://arweave.org"
              target="_blank"
              rel="noreferrer"
              className="link-glow"
            >
              Powered by Arweave
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Home;
