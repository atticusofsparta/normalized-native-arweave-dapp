import { arrayify } from '@ethersproject/bytes';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { spawn } from '@src/services/ao/signers';
import { fromB64Url, sha256B64Url } from '@src/services/encoding';
import { hashMessage } from 'ethers';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
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

  const normalizePublicKey = async (pk?: string) => {
    try {
      let publicEncryptionKeyBuffer: Buffer | undefined;

      if (pk) {
        publicEncryptionKeyBuffer = fromB64Url(pk);
      }

      // Request the user to sign a message
      if (!publicEncryptionKeyBuffer) {
        const message = 'sign this message to connect to Bundlr.Network';

        const signedMessage = await signMessageAsync({
          message,
        });
        console.log('signed message', signedMessage);
        // Hash the message
        const messageHash = await hashMessage(message);

        // Recover the public key using the viem's recoverPublicKey method
        const recoveredKey = await recoverPublicKey({
          hash: arrayify(messageHash),
          signature: signedMessage,
        });
        console.log('Recovered Public Key:', recoveredKey);

        // Normalize the public key using your custom logic (sha256B64Url)
        publicEncryptionKeyBuffer = Buffer.from(recoveredKey.slice(2), 'hex'); // Strip the "0x"
      }
      if (!publicEncryptionKeyBuffer) {
        throw new Error('Invalid public key provided');
      }
      const normalized = sha256B64Url(publicEncryptionKeyBuffer);

      // Set the normalized address
      setNormalizedAddress(normalized);
      setError('');
    } catch (err: any) {
      console.error('Error fetching or normalizing public key:', err.message);
      setError(err.message);
    }
  };

  async function handleSpawnAos() {
    const aos = await spawn();
    setAosProcess(aos);
  }

  return (
    <div className="flex h-screen w-full flex-col items-center">
      <div className="flex w-full justify-between bg-foreground px-[100px] py-2">
        <h1 className="text-xl font-bold">Cross Chain Normalizer 3000</h1>
        <div className="flex flex-row gap-5">
          <ConnectButton />
          <Link
            to={`https://github.com/atticusofsparta/normalized-native-arweave-dapp`}
            target={'_blank'}
            rel={'noreferrer'}
            className="flex flex-row items-center justify-center gap-2 text-xl"
          >
            Github <FaGithub />
          </Link>
        </div>
      </div>
      <h1 className="mt-4 text-2xl">
        Normalize Ethereum and Solana public keys to an Arweave address.
      </h1>
      <div className="flex h-full w-full flex-col items-start gap-4 p-[100px]">
        <h1 className="text-2xl">Normalized Address: {normalizedAddress}</h1>

        <div className="flex w-full gap-4">
          <button
            className="w-full rounded bg-warning p-2 text-xl text-dark-grey"
            onClick={() => normalizePublicKey()}
          >
            Get Normalized Address from wallet provider
          </button>
        </div>
        <div className="flex w-full flex-row gap-3">
          {' '}
          <input
            className="w-full border-b-2 border-primary bg-background p-2 outline-none"
            placeholder="Enter public key"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value.trim())}
          />
          <button
            className="rounded border border-primary bg-dark-grey px-3 py-2 text-primary"
            onClick={() => normalizePublicKey(publicKey)}
          >
            Normalize
          </button>
        </div>
        {error && <p className="text-error">{error}</p>}
        <div className="flex w-full flex-col gap-3 border-t-2 border-dark-grey">
          <h1 className="p-4 text-xl">
            AO utils for verifying normalized address
          </h1>
          <button
            className="rounded bg-primary p-2 text-dark-grey"
            onClick={handleSpawnAos}
          >
            Spawn aos process
          </button>
          {aosProcess.length ? (
            <Link
              to={`https://ao.link/#/entity/${aosProcess}`}
              className="animate-pulse p-4 text-primary"
            >
              View aos process on ao.link {aosProcess}
            </Link>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
