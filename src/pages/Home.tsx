import { arrayify } from '@ethersproject/bytes';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { spawn } from '@src/services/ao/signers';
import { sha256B64Url } from '@src/services/encoding';
import { hashMessage } from 'ethers';
import { useState } from 'react';
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
  const [normalizedAddress, setNormalizedAddress] = useState('');
  const [error, setError] = useState('');
  const [aosProcess, setAosProcess] = useState<string>('');

  const normalizePublicKey = async () => {
    try {
      const message = 'sign this message to connect to Bundlr.Network';

      // Request the user to sign a message
      const signedMessage = await signMessageAsync({
        message,
      });
      console.log(signedMessage);
      // Hash the message
      const messageHash = await hashMessage(message);

      // Recover the public key using the viem's recoverPublicKey method
      const recoveredKey = await recoverPublicKey({
        hash: arrayify(messageHash),
        signature: signedMessage,
      });
      console.log('Recovered Public Key:', recoveredKey);

      // Normalize the public key using your custom logic (sha256B64Url)
      const publicKeyBuffer = Buffer.from(recoveredKey.slice(2), 'hex'); // Strip the "0x"
      const normalized = sha256B64Url(publicKeyBuffer);

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
        <h1 className="text-xl font-bold">The Normalizer 3000</h1>
        <ConnectButton />
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
            Get Normalized Address
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
            Spawn aos
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
