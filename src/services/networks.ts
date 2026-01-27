import { Connection, PublicKey } from '@solana/web3.js';
import {
  type Chain,
  type Hash,
  type TransactionSerializable,
  createPublicClient,
  http,
  keccak256,
  recoverPublicKey,
  serializeTransaction,
} from 'viem';
import { base, mainnet, polygon } from 'viem/chains';

import { sha256B64Url } from './encoding';

export interface NetworkConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'evm' | 'solana';
  chain?: Chain;
  rpcUrl?: string;
  explorerApiUrl?: string;
}

export const NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '⟠',
    color: '#627EEA',
    type: 'evm',
    chain: mainnet,
    explorerApiUrl: 'https://api.etherscan.io/api',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '⬡',
    color: '#8247E5',
    type: 'evm',
    chain: polygon,
    explorerApiUrl: 'https://api.polygonscan.com/api',
  },
  {
    id: 'base',
    name: 'Base',
    icon: '🔵',
    color: '#0052FF',
    type: 'evm',
    chain: base,
    explorerApiUrl: 'https://api.basescan.org/api',
  },
  {
    id: 'solana',
    name: 'Solana',
    icon: '◎',
    color: '#14F195',
    type: 'solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  {
    id: 'solana-devnet',
    name: 'Solana Devnet',
    icon: '◎',
    color: '#9945FF',
    type: 'solana',
    rpcUrl: 'https://api.devnet.solana.com',
  },
];

export interface TransactionInfo {
  hash: string;
  from: string;
  publicKey: string;
  normalizedAddress: string;
  blockNumber?: number;
  timestamp?: number;
}

// Get the RPC URL for an EVM chain (uses proxy in dev to bypass CORS/rate limits)
function getEvmRpcUrl(chainId: number): string | undefined {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const origin = window.location.origin;
    switch (chainId) {
      case 1:
        return `${origin}/eth-rpc`;
      case 137:
        return `${origin}/polygon-rpc`;
      // Base uses public RPC directly (works fine without proxy)
    }
  }
  // In production, use default chain RPCs or set via env
  return undefined;
}

// Get public client for EVM chain
function getEvmClient(chain: Chain) {
  const rpcUrl = getEvmRpcUrl(chain.id);
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

// Helper to extract recovery bit from v value based on transaction type
function getRecoveryBit(v: bigint, chainId: number): number {
  console.log('[getRecoveryBit] Input v:', v.toString(), 'chainId:', chainId);

  // EIP-1559 and EIP-2930 transactions: v is already 0 or 1
  if (v === 0n || v === 1n) {
    console.log(
      '[getRecoveryBit] EIP-1559/2930 detected, recoveryBit:',
      Number(v),
    );
    return Number(v);
  }

  // Pre-EIP-155 legacy transactions: v is 27 or 28
  if (v === 27n || v === 28n) {
    console.log(
      '[getRecoveryBit] Pre-EIP-155 detected, recoveryBit:',
      Number(v - 27n),
    );
    return Number(v - 27n);
  }

  // EIP-155 transactions: v = chainId * 2 + 35 + recoveryBit
  // recoveryBit = (v - 35 - chainId * 2) which simplifies to (v - 35) % 2
  const recoveryBit = (v - 35n) % 2n;
  const result = Number(recoveryBit < 0n ? recoveryBit + 2n : recoveryBit);
  console.log('[getRecoveryBit] EIP-155 detected, recoveryBit:', result);
  return result;
}

// Helper to recover public key from an EVM transaction
async function recoverPublicKeyFromEvmTx(
  tx: {
    to: `0x${string}` | null;
    value: bigint;
    gas: bigint;
    nonce: number;
    input: `0x${string}`;
    hash: `0x${string}`;
    from: `0x${string}`;
    blockNumber: bigint | null;
    v?: bigint;
    r?: `0x${string}`;
    s?: `0x${string}`;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasPrice?: bigint;
    type?: string;
    accessList?: readonly {
      address: `0x${string}`;
      storageKeys: readonly `0x${string}`[];
    }[];
  },
  chainId: number,
): Promise<TransactionInfo | null> {
  console.log('\n=== recoverPublicKeyFromEvmTx ===');
  console.log('[TX] Hash:', tx.hash);
  console.log('[TX] From:', tx.from);
  console.log('[TX] Type:', tx.type);
  console.log('[TX] Nonce:', tx.nonce);
  console.log('[TX] To:', tx.to);
  console.log('[TX] Value:', tx.value?.toString());
  console.log('[TX] Gas:', tx.gas?.toString());
  console.log('[TX] GasPrice:', tx.gasPrice?.toString());
  console.log('[TX] MaxFeePerGas:', tx.maxFeePerGas?.toString());
  console.log(
    '[TX] MaxPriorityFeePerGas:',
    tx.maxPriorityFeePerGas?.toString(),
  );
  console.log('[TX] Input (first 100 chars):', tx.input?.slice(0, 100));
  console.log('[TX] v:', tx.v?.toString());
  console.log('[TX] r:', tx.r);
  console.log('[TX] s:', tx.s);
  console.log('[TX] ChainId:', chainId);

  // Determine transaction type and build the appropriate object
  let txForSigning: TransactionSerializable;
  let detectedType: string;

  if (tx.type === 'eip1559' || tx.maxFeePerGas !== undefined) {
    detectedType = 'eip1559';
    txForSigning = {
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      nonce: tx.nonce,
      data: tx.input,
      chainId,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      accessList: tx.accessList,
      type: 'eip1559' as const,
    };
  } else if (tx.type === 'eip2930' || tx.accessList !== undefined) {
    detectedType = 'eip2930';
    txForSigning = {
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      nonce: tx.nonce,
      data: tx.input,
      chainId,
      gasPrice: tx.gasPrice,
      accessList: tx.accessList,
      type: 'eip2930' as const,
    };
  } else {
    detectedType = 'legacy';
    txForSigning = {
      to: tx.to,
      value: tx.value,
      gas: tx.gas,
      nonce: tx.nonce,
      data: tx.input,
      chainId,
      gasPrice: tx.gasPrice,
      type: 'legacy' as const,
    };
  }

  console.log('[DETECTED TYPE]:', detectedType);
  console.log(
    '[TX FOR SIGNING]:',
    JSON.stringify(
      txForSigning,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    ),
  );

  const serialized = serializeTransaction(txForSigning);
  console.log('[SERIALIZED TX (first 200 chars)]:', serialized.slice(0, 200));

  const hash = keccak256(serialized);
  console.log('[KECCAK256 HASH]:', hash);

  if (tx.v !== undefined && tx.r && tx.s) {
    // Get recovery bit (0 or 1) from v value
    const recoveryBit = getRecoveryBit(tx.v, chainId);
    // Convert to signature format: 0 -> '1b' (27), 1 -> '1c' (28)
    const vHex = recoveryBit === 0 ? '1b' : '1c';

    // Pad r and s to 64 hex characters each (32 bytes) - they may have leading zeros stripped
    const rHex = tx.r.slice(2).padStart(64, '0');
    const sHex = tx.s.slice(2).padStart(64, '0');
    console.log('[R HEX] (padded):', rHex, 'length:', rHex.length);
    console.log('[S HEX] (padded):', sHex, 'length:', sHex.length);

    const signature = `0x${rHex}${sHex}${vHex}` as Hash;
    console.log('[SIGNATURE]:', signature);
    console.log(
      '[SIGNATURE LENGTH]:',
      signature.length,
      '(should be 132: 0x + 64 + 64 + 2)',
    );
    console.log('[V HEX]:', vHex);

    const recoveredKey = await recoverPublicKey({
      hash,
      signature,
    });
    console.log('[RECOVERED PUBLIC KEY]:', recoveredKey);
    console.log(
      '[PUBLIC KEY LENGTH]:',
      recoveredKey.length,
      'chars (should be 132 for uncompressed)',
    );

    const publicKeyBuffer = Buffer.from(recoveredKey.slice(2), 'hex');
    console.log(
      '[PUBLIC KEY BUFFER LENGTH]:',
      publicKeyBuffer.length,
      'bytes (should be 65 for uncompressed)',
    );
    console.log('[PUBLIC KEY BUFFER HEX]:', publicKeyBuffer.toString('hex'));

    const normalizedAddress = sha256B64Url(publicKeyBuffer);
    console.log('[NORMALIZED ADDRESS]:', normalizedAddress);
    console.log('=================================\n');

    return {
      hash: tx.hash,
      from: tx.from,
      publicKey: recoveredKey,
      normalizedAddress,
      blockNumber: tx.blockNumber ? Number(tx.blockNumber) : undefined,
    };
  }

  return null;
}

// Fetch transaction by hash for EVM chains
export async function fetchEvmTransactionByHash(
  txHash: string,
  chain: Chain,
): Promise<TransactionInfo> {
  const client = getEvmClient(chain);

  try {
    const tx = await client.getTransaction({ hash: txHash as `0x${string}` });

    if (!tx) {
      throw new Error('Transaction not found');
    }

    const result = await recoverPublicKeyFromEvmTx(tx, chain.id);
    if (!result) {
      throw new Error('Could not recover public key from transaction');
    }

    return result;
  } catch (error: any) {
    console.error(`Error fetching ${chain.name} transaction by hash:`, error);
    throw error;
  }
}

// Fetch latest transaction using block explorer API (works for any age transaction)
async function fetchLatestTxHashFromExplorer(
  address: string,
  explorerApiUrl: string,
): Promise<string> {
  // Using the free tier of block explorer APIs (no API key needed for basic requests)
  const url = `${explorerApiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=desc`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== '1' || !data.result || data.result.length === 0) {
    // Try internal transactions if no regular transactions found
    const internalUrl = `${explorerApiUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=desc`;
    const internalResponse = await fetch(internalUrl);
    const internalData = await internalResponse.json();

    if (
      internalData.status !== '1' ||
      !internalData.result ||
      internalData.result.length === 0
    ) {
      throw new Error(
        'No transactions found for this address. The address may have no outgoing transactions.',
      );
    }

    // For internal transactions, we need to find the parent transaction
    return internalData.result[0].hash;
  }

  // Find the first transaction where this address is the sender (from)
  const outgoingTx = data.result.find(
    (tx: any) => tx.from.toLowerCase() === address.toLowerCase(),
  );

  if (!outgoingTx) {
    throw new Error(
      'No outgoing transactions found. The address may have only received funds but never sent any.',
    );
  }

  return outgoingTx.hash;
}

// Fetch latest transaction and extract public key for EVM chains
export async function fetchEvmTransaction(
  address: string,
  chain: Chain,
  explorerApiUrl?: string,
): Promise<TransactionInfo> {
  const client = getEvmClient(chain);

  try {
    // First, try to find the latest transaction hash using the block explorer API
    if (explorerApiUrl) {
      try {
        const txHash = await fetchLatestTxHashFromExplorer(
          address,
          explorerApiUrl,
        );
        // Now fetch the full transaction data and recover the public key
        return await fetchEvmTransactionByHash(txHash, chain);
      } catch (explorerError: any) {
        console.warn(
          'Explorer API failed, falling back to block scanning:',
          explorerError.message,
        );
        // Fall through to block scanning
      }
    }

    // Fallback: scan recent blocks (limited to ~1000 blocks)
    const blockNumber = await client.getBlockNumber();
    const blocksToSearch = 1000n;
    const startBlock =
      blockNumber > blocksToSearch ? blockNumber - blocksToSearch : 0n;

    const txCount = await client.getTransactionCount({
      address: address as `0x${string}`,
    });

    if (txCount === 0) {
      throw new Error('No transactions found for this address');
    }

    for (let i = blockNumber; i >= startBlock; i--) {
      const block = await client.getBlock({
        blockNumber: i,
        includeTransactions: true,
      });

      const tx = block.transactions.find(
        (t) =>
          typeof t !== 'string' &&
          t.from.toLowerCase() === address.toLowerCase(),
      );

      if (tx && typeof tx !== 'string') {
        const result = await recoverPublicKeyFromEvmTx(tx, chain.id);
        if (result) return result;
      }
    }

    throw new Error(
      'No recent transactions found. Try using a transaction hash directly.',
    );
  } catch (error: any) {
    console.error(`Error fetching ${chain.name} transaction:`, error);
    throw error;
  }
}

// Fetch transaction by signature for Solana
// Use Vite proxy in development to bypass CORS, otherwise use public RPC
function getSolanaRpc(isDevnet: boolean = false): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return isDevnet
      ? `${window.location.origin}/solana-devnet-rpc`
      : `${window.location.origin}/solana-rpc`;
  }
  return isDevnet
    ? 'https://api.devnet.solana.com'
    : 'https://mainnet.helius-rpc.com/?api-key=592512f9-9576-477f-ab29-7cfc9ae7d55c';
}

export async function fetchSolanaTransactionBySignature(
  signature: string,
  isDevnet: boolean = false,
): Promise<TransactionInfo> {
  const rpcUrl = getSolanaRpc(isDevnet);
  console.log('Using Solana RPC:', rpcUrl);
  console.log('Looking up signature:', signature);

  try {
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
    });

    // Try with finalized commitment first for older transactions
    let tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'finalized',
    });

    // If not found with finalized, try confirmed
    if (!tx) {
      tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });
    }

    if (!tx || !tx.transaction.message) {
      throw new Error(
        `Transaction not found. The RPC node may not have this transaction in its history. Try using a full-history RPC like Helius or QuickNode.`,
      );
    }

    const message = tx.transaction.message;
    // Handle both legacy and versioned transaction message formats
    const accountKeys =
      'staticAccountKeys' in message
        ? message.staticAccountKeys
        : (message as { accountKeys: import('@solana/web3.js').PublicKey[] })
            .accountKeys;

    if (!accountKeys || accountKeys.length === 0) {
      throw new Error('No account keys found in transaction');
    }

    const signerPubkey = accountKeys[0];
    const publicKeyBytes = signerPubkey.toBytes();
    const normalizedAddress = sha256B64Url(Buffer.from(publicKeyBytes));

    return {
      hash: signature,
      from: signerPubkey.toBase58(),
      publicKey: signerPubkey.toBase58(),
      normalizedAddress,
      blockNumber: tx.slot,
    };
  } catch (error: any) {
    console.error('Error fetching Solana transaction by signature:', error);
    throw error;
  }
}

// Fetch latest transaction for Solana
export async function fetchSolanaTransaction(
  address: string,
): Promise<TransactionInfo | null> {
  try {
    const connection = new Connection(getSolanaRpc(), 'confirmed');
    const pubkey = new PublicKey(address);

    // Get recent signatures - Solana RPC can fetch historical signatures
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 1,
    });

    if (signatures.length === 0) {
      throw new Error('No transactions found for this address');
    }

    const sig = signatures[0];

    const publicKeyBytes = pubkey.toBytes();
    const normalizedAddress = sha256B64Url(Buffer.from(publicKeyBytes));

    return {
      hash: sig.signature,
      from: address,
      publicKey: pubkey.toBase58(),
      normalizedAddress,
      blockNumber: sig.slot,
    };
  } catch (error: any) {
    console.error('Error fetching Solana transaction:', error);
    throw error;
  }
}

// Main function to fetch transaction by address for any network
export async function fetchNetworkTransaction(
  network: NetworkConfig,
  address: string,
): Promise<TransactionInfo> {
  if (network.type === 'evm' && network.chain) {
    const result = await fetchEvmTransaction(
      address,
      network.chain,
      network.explorerApiUrl,
    );
    return result;
  } else if (network.type === 'solana') {
    const result = await fetchSolanaTransaction(address);
    if (!result) throw new Error('Failed to fetch transaction');
    return result;
  }

  throw new Error(`Unsupported network: ${network.name}`);
}

// Main function to fetch transaction by hash/signature for any network
export async function fetchNetworkTransactionByHash(
  network: NetworkConfig,
  txHash: string,
): Promise<TransactionInfo> {
  if (network.type === 'evm' && network.chain) {
    return await fetchEvmTransactionByHash(txHash, network.chain);
  } else if (network.type === 'solana') {
    return await fetchSolanaTransactionBySignature(txHash);
  }

  throw new Error(`Unsupported network: ${network.name}`);
}
